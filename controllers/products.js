const dotenv = require('dotenv');
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

dotenv.config({ path: "./config/keys.env" });
const ProductModel = require('../models/products');

//MongoDB Resources - Rep
mongoose.connect(
    process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});


router.post("/update-product-view", (req, res) => {
    const id = req.body.product;
    let user = req.session.user;
    if(user && user.isDataClerk){    
        // makes sure user is authorized
        ProductModel.findOne({
            _id: id
        }).lean().exec()
            .then( product => {
                if (product) {
                    res.render("product/manage-product", {
                        loggedUser : user,
                        product : product
                    }); 
                } else {
                    console.log("Product not found");
                }
            }); 
    } else {
        res.redirect('/');
    }
});

router.post("/update-product", (req, res) => {
    const { _id, title, description, available, featured, ingredients, category, price, cookingTime, calories } = req.body;
    let user = req.session.user;
    console.log(req.body);
    if(user && user.isDataClerk){    
        // makes sure user is still authorized      
        ProductModel.updateOne({
            _id: _id
        }, {
            $set:{
                title: title,
                description: description,
                available: available,
                featured: featured,
                ingredients: ingredients,
                category: category,
                price: price,
                cookingTime: cookingTime,
                calories: calories
            }
        }).then(() => {
            console.log("Product saved in Database");
            res.redirect("/data-clerk");
        }).catch((err) => {
            console.error(`Error inserting the product in the database.  ${err}`);
            res.redirect("/");
        });


        //TODO NEW PRODUCT
        // const newProduct = new ProductModel({
        //     _id: _id,
        //     title: title,
        //     description: description,
        //     available: available,
        //     featured: featured,
        //     ingredients: ingredients,
        //     category: category,
        //     price: price,
        //     cookingTime: cookingTime,
        //     calories: calories
        // });
        // console.log("");
        // console.log("Available: "+ available);
        // console.log("Title: "+ title);
        // console.log("Description: "+ description);
        // console.log("category: "+ category);
        // console.log("id: "+ _id);
        // console.log(newProduct);
        // res.redirect('/');
        // newProduct.save().then((productSaved) => {
        //     console.log("Product saved in Database");
        //     res.redirect("/update-product-view");
        // }).catch((err) => {
        //     console.error(`Error inserting the product in the database.  ${err}`);
        //     res.redirect("/");
        // });;

    } else {
        res.redirect('/');
    }
});
module.exports = router;