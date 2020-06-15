# Random Menu
This will create a random menu from a list of meals in a csv file.
Individual categories can be added so that you weekly meal list doesn't 
consist of, say, red meat dishes.

The menu then generates a shopping list from the required items.

Edit the csv data file in the root of the file structure and add you meals 
along with their ingredients. Each ingredient includes its location in your 
favorite supermarket.

## data.csv
This has the following format:

    Name,category,item1,item2,item3,item4,item5,item6,item7

The Name and category headings are required, the items are optional and you
can create as many as necessary.

Each item must have a number in from it separated by a ~, e.g. 2~rice.
This number represents the relative position in your supermarket so that the 
shopping list is printed out in the right order.