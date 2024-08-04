const express = require("express");
const bodyParser = require("body-parser");
const app = express();
let items=["buy food","make food","eat food"];
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
    let today = new Date();
    let option ={
        weekday:"long",
        day:"numeric",
        month:"long"

    }
    let day= today.toLocaleDateString("en-US", option);
    res.render("list", { kindOfDay: day, newListItems: items });
});

app.post("/", function(req,res){
    let item=req.body.addItem;
    items.push(item)
    res.redirect("/");
});

app.listen(5050, function () {
    console.log("Server is running on port 5050");
});
