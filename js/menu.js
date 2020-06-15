/**
 Create a file called data.csv in the same location as index.html containing something like the following
 The number and ~ (e.g. 2~) are to indicate what order the items should be gathered in the supermarket, isle number maybe.

 Name,category,item1,item2,item3,item4,item5,item6,item 7
 Spag Bol,redmeat,2~Beef mince,6~spaghetti,3~parmesan cheese,6~Pasata
 Tandoori Chicken,spicy,2~chicken thighs 650g,3~Pilau Rice,4~Yogurt,1~Onion,1~Garlic,1~Fresh ginger,5~Tomato Soup
 */

/**
 * This is the main function called from index.html
 */
let main = function () {
    main = d3.select('body').append("container").attr('id', 'toplevel');
    // 3 jumbotrons for the display of the buttons, menu output and shopping list
    inputdiv = main.append('div').attr('id', 'inputdiv').attr('class', 'jumbotron').attr('style', 'margin:60px');
    menutable = inputdiv.append('table').attr('id', 'menutable').append('tr');
    subinputdiv1 = menutable.append('td').append('div').attr('id', 'subinputdiv1').attr('class', 'div').attr('style', 'margin:10px');
    subinputdiv2 = menutable.append('td').append('div').attr('id', 'subinputdiv2').attr('class', 'div').attr('style', 'margin:10px');


    outputdiv = main.append('div').attr('id', 'outputdiv').attr('class', 'jumbotron').attr('style', 'margin:60px');
    listdiv = main.append('div').attr('id', 'listdiv').attr('class', 'continer').attr('style', 'margin:120px; width:300px; ');
    // initialise the shopping list array
    shopping_list = [];
    // reads in the contents of the csv file into d
    d3.csv('data.csv', function (d) {
        // Create the buttons and the number input box.
        inputform = subinputdiv1.append('form').attr('class', 'form');
        inputform.append('input')
            .attr('class', 'btn btn-secondary')
            .attr('type', 'number')
            .attr('id', 'count')
            .attr('value', 1);

        inputform.append('input')
            .attr('type', 'button')
            .attr('class', 'btn btn-primary')
            .attr('value', 'Add')
            .on('click', () => {
                d = add_to_menu(d, "");
            }); // end on click
        inputform.append('input')
            .attr('type', 'button')
            .attr('class', 'btn btn-success')
            .attr('value', 'Shopping List')
            .on('click', () => {
                create_shopping_list(shopping_list);
            });
        inputform.append('input')
            .attr('type', 'button')
            .attr('class', 'btn btn-success')
            .attr('value', 'Clear All')
            .on('click', () => {
                // Remove the menu table, clear the shopping list & re-read the csv file.
                d3.select('#main_table').remove();
                outputdiv.append('table').attr("class", "table").attr('id', 'main_table');
                first=true; // This is so the table is recreated with headers (first line in csv)
                shopping_list=[];
                d3.csv('data.csv', function (x) { d = x;});
            });

        /* This bit provides a table of the categories so you can add a meal from a single category */
        // first get a list of categories
        categories = [];
        d.forEach(x => {
            if (!categories.includes(x.category))
                categories.push(x.category);
        });
        let categorytable = subinputdiv2.append('table').attr("class", "table").attr('id', 'categorytable').attr("style", "font-size:14px");
        // Appends a new row and cell for each item in the list
        var rows = categorytable.selectAll('tr')
            .data(x => categories)
            .enter()
            .append('tr');
        // appends a new cell to the rows
        rows.selectAll('td')
            .data(x => [x])
            .enter()
            .append('td')
            .text(x => x)
        ;

        rows.selectAll('td.button')
            .data(x => [x])
            .enter()
            .append("td")
            .append('button')
            .attr('class', 'btn btn-primary')
            .attr('value', 'Add')
            .text(x => "Add")
            .on('click', x => add_to_menu(d, x));

    }); // end csv input
} // end main function

// Add the items to the menu
// if cat is a category then add from that category only.
let add_to_menu = (d, cat) => {
    let columns = Object.keys(d[0]);

    // Filters the list of available items if a category button is pressed
    if (cat != "") {
        var new_d = d.filter(function (x) {
            return x.category == cat
        });
        // Makes sure that there are no more items added than are in the list.
        requested = $('#count').val();
        if (requested > new_d.length) {
            requested = new_d.length;
        }
        // $('#count').val(requested);

        // Gets 'requested' number of random numbers from the number in the list
        rnd = getRandom(requested, new_d.length);

        // Add the random selection to the table and shopping list
        rnd.forEach(x => {
            tabulate(Array(new_d[x]), columns)
            // pushes the meal onto the shopping list
            shopping_list.push(new_d[x]);
        });
    } else {

        // Makes sure that there are no more items added than are in the list.
        requested = $('#count').val();
        if (requested > d.length) {
            requested = d.length;
        }
        $('#count').val(requested);

        // Gets 'requested' number of random numbers from the number in the list
        rnd = getRandom(requested, d.length);

        // Add the random selection to the table and shopping list
        rnd.forEach(x => {
            tabulate(Array(d[x]), columns)
            // pushes the meal onto the shopping list
            shopping_list.push(d[x]);
        });
    }
    // loop through the items in the shopping list and remove them from the array of choices
    shopping_list.forEach(x => {
        for (let i = 0; i < d.length; i++) {
            if (x.Name == d[i].Name) {
                // removing it from available selection.
                d.splice(i, 1);
                break;
            }
        }
    });


    if (document.getElementById('menubutton') == null) {
        subinputdiv1.append('input')
            .attr('type', 'button')
            .attr('class', 'btn btn-warning')
            .attr('value', 'Print Menu')
            .attr('id', 'menubutton')
            .on('click', () => {
                PrintElem('outputdiv');
            });
    }

    return d;

}

// Generates the shopping list from the list that is passed in
let create_shopping_list = list => {

    let table = listdiv.append('table').attr("class", "table").attr('id', 'list_table').attr("style", "font-size:9px");
    let thead = table.append('thead');

    list_vals = [];
    list.forEach(x => {
        let keys = Object.keys(x);
        keys.forEach(k => {
            if (typeof x[k] !== 'undefined' && k !== 'Name' && k !== 'category') {
                list_vals.push(x[k]);
            }
        });
    });

    // Sort the list in order of the location - the number before each item is the relative location in shop
    list_vals.sort((a, b) => {
        return a.split("~")[0] - b.split("~")[0];
    });

    // Appends a new row and cell for each item in the list
    var rows = table.selectAll('tr')
        .data(list_vals)
        .enter()
        .append('tr')
        .append('td').attr("style", "padding:3px")
        .text(d => {
            // Doesn't print the location number of the item.
            return d.split("~")[1]
        });

    // Adds the print buttons to the divs when the shopping list is created

    subinputdiv1.append('input')
        .attr('type', 'button')
        .attr('class', 'btn btn-warning')
        .attr('value', 'Print Shopping List')
        .on('click', () => {
            PrintElem('listdiv');
        });

};

// Generates a array of random numbers from the number of the elements available in the array of meals.
let getRandom = (number_to_create, out_of) => {
    var arr = [];
    while (arr.length < number_to_create) {
        var r = Math.floor(Math.random() * out_of);
        if (arr.indexOf(r) === -1) {
            arr.push(r);
        }
    }
    return arr;
}

// Creates the menu
first = true;
var tabulate = function (data, columns) {

    // This is an array of meals after they have been pre-processed
    var result = [];
    try {
        // puts the json object into an array format for the values
        var keys = Object.keys(data[0]);
        keys.forEach(function (key) {
            result.push(data[0][key]);
        });

        // Only does this once for the table headings
        if (first) {
            let table = outputdiv.append('table').attr("class", "table").attr('id', 'main_table');
            let thead = d3.select('#main_table').append('thead');
            d3.select('#main_table').append('tbody').attr('id', 'tbody');
            thead.append('tr')
                .selectAll('th')
                .data(columns)
                .enter()
                .append('th')
                .text(function (d) {
                    return d
                });
            first = false;
        }

        var tbody = d3.select("#tbody");

        var rows = tbody.append("tr");

        rows.selectAll("td")
            .data(result)
            .enter()
            .append("td")
            .text(d => {
                // Removes the location number from the beginning of the item description text.
                if (typeof d !== 'undefined') {
                    if (d.includes("~")) {
                        return d.split("~")[1]
                    } else {
                        return d;
                    }
                }
            });
    } catch (err) {
        d3.select('#subinputdiv1')
            .append('p')
            .text("No more meals in dataabse");
    }

}

// Pops a widow up to print the contents of a div
function PrintElem(elem) {
    var mywindow = window.open('', 'PRINT', 'height=400,width=600');

    mywindow.document.write('<html><head><title>' + document.title + '</title>');
    mywindow.document.write('<style>tr {border-bottom:1px #808080 solid}</style>');
    mywindow.document.write('</head><body >');
    mywindow.document.write('<h1>' + document.title + '</h1>');
    mywindow.document.write(document.getElementById(elem).innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    mywindow.close();

    return true;
}