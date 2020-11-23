const dotenv = require('dotenv');
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

dotenv.config({ path: "./config/keys.env" });
const productModel = require('../models/products');

//MongoDB Resources - Rep
mongoose.connect(
    process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});


router.post("/update-product", (req, res) => {
    const id = req.body.product;
    let user = req.session.user;
    if(user && user.isDataClerk){    
        // makes sure user is authorized
        const productModel = require("../models/products.js");
        productModel.findOne({
            _id: id
        }).lean().exec()
            .then( product => {
                if (product) {
                    console.log("Found a product");
                    console.log(product)
                } else {
                    console.log("Product not found");
                }
            }); 
    } else {
        res.redirect('/');
    }
});

module.exports = router;