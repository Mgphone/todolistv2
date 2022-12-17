//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _= require("lodash");
const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: false
  // type: function() {return false;}
}));
app.use(express.static("public"));
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://mgphone:mgphone@cluster0.ccftyls.mongodb.net/todolistDB");
// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");



const itemSchema = {
  name: String
};
const Item = mongoose.model("Item", itemSchema);
const buyFood = new Item({
  name: "Buy Food"
});
const cookFood = new Item({
  name: "Cook Food"
});
const eatFood = new Item({
  name: "Eat Food"
})

const defaultItems = [buyFood, cookFood, eatFood];


const pageSchema={
  name:String,
  items:[itemSchema]
};
const Page=mongoose.model("Page",pageSchema);
// const day=date.getDate();
app.get("/", function(req, res) {



  Item.find({}, function(err,result) {
    if (result.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("insert complete");
        }
      });
        res.render("/");
    } else {
      // console.log("your find number",foundItems);
      res.render("list", {
        listTitle: "Today",
        newListItems: result
      });
    }
  });
});
// creating new page in todolist
app.get("/:pageId",function(req,res){
  const customePage=_.capitalize(req.params.pageId);
  // console.log(customePage);


  Page.findOne({name:customePage},function (err,result) {
    if(!err){
     
     if(!result){
        //create a new list
        const page=new Page({
                name: customePage,
                items: defaultItems
              });
              page.save();
              res.redirect("/"+customePage);
            }
      else{
        res.render("list",{
              listTitle:result.name,
              newListItems:result.items
            });
      }
      }
    });
    
  });
 

  // app.get("/:pageId",function(req,res){
  //   const customePage=_.capitalize(req.params.pageId);
  //     Page.findOne({name:customePage},function (err,result) {

  //   if (!err){
  //     if(result){
  //       //show existing list
  //     res.render("list",{
  //       listTitle:result.name,
  //       newListItems:result.items
  //     });
  //     }
  //     // if(!result) if we use it .. database created with favicon.ico
  //     else{
  //       //create new page
  //       const page=new Page({
  //         name: customePage,
  //         items: defaultItems
  //       });
  //       page.save();
  //       res.redirect("/"+customePage);
        
  //     }
  //   }
      
  //   });
  // });




app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listPage=req.body.list;
 
  const item=new Item({
    name: itemName
  });
  if(listPage==="Today"){
item.save();
res.redirect("/");

}
else{
  Page.findOne({name:listPage},function(err,result){
  
      result.items.push(item);
      result.save();
      res.redirect("/"+listPage);    
  });
  
}
});

app.post("/delete",function(req,res){
const checkedItemId=req.body.checkBox;
const listName=req.body.listName;
console.log(checkedItemId);
console.log(listName);
if (listName==="Today"){
  Item.findByIdAndRemove(checkedItemId,function(err){
    if (!err){
      console.log("Successfuly deleted");
      res.redirect("/");
    }
  });
}
else{
  
  Page.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,result){
    if (!err){
      res.redirect("/"+listName);
    }
  });
}


});





app.listen(3000, function() {
  console.log("Server started on port 3000");
});
