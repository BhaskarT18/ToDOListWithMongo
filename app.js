const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ =require("lodash");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


//db connection
mongoose.connect("mongodb+srv://generalpurouse:vishal2001@cluster0.eyywv.mongodb.net/todolistDB");

//schema
const itemSchema = {
    name: String
};

//model
const Item = mongoose.model("Item", itemSchema);

//list of data
const item1 = new Item({
    name: "Welcome to your ToDo List."
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get('/', function (req, res) {
    Item.find({})
        .then((foundItems) => {
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems)
                    .then(() => console.log('Default items added successfully'))
                    .catch(err => console.error('Error inserting default items', err));
                res.redirect("/");
            } else {
                res.render("list", { kindOfDay: "Today", newListItems: foundItems });
            }
        })
        .catch(err => {
            console.error(err);
        });
});

app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    
    List.findOne({ name: customListName })
        .then((foundList) => {
            if (foundList) { // if list exists, render it
                res.render("list", { kindOfDay: foundList.name, newListItems: foundList.items });
            } else { // if not, create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }
        })
        .catch((err) => {
            console.error("Error:", err);
        });
});

app.post("/", function (req, res) {
    const itemName = req.body.addItem;
    const listName = req.body.addList;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName })
            .then((foundList) => {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            })
            .catch(err => {
                console.error("Error:", err);
            });
    }
});

app.post("/delete", function (req, res) {
    const checkItemId = req.body.checkbox;
    const listName = req.body.listName;  

    if (listName === "Today") {
        Item.findByIdAndDelete(checkItemId)
            .then(() => {
                console.log("Successfully deleted checked item");
                res.redirect("/");  
            })
            .catch(err => {
                console.error(err);
            });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkItemId } } })
            .then((foundList) => {
                if (foundList) {
                    res.redirect("/" + listName);
                } else {
                    console.error("List or item not found");
                }
            })
            .catch((err) => {
                console.error("Error removing item:", err);
            });
    }
});

app.listen(5050, function () {
    console.log("Server is running on port 5050");
});
