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
    if (user && user.isDataClerk) {
        // makes sure user is authorized
        ProductModel.findOne({
            _id: id
        }).lean().exec()
            .then(product => {
                if (product) {
                    // logic to use pre selected category on handlebars
                    product[product.category] = true;
                    res.render("product/manage-product", {
                        loggedUser: user,
                        product: product
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
    if (user && user.isDataClerk) {
        // makes sure user is still authorized
        ProductModel.updateOne({
            _id: _id
        }, {
            $set: {
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
            // this will rename every file to be named as the id and replace extension to jpg 
            if (req.files) {
                req.files.picture.name = `${_id}.jpg`;
                req.files.picture.mv(`public/imgs/products/${req.files.picture.name}`);
            }
            console.log("Product saved in Database");
            res.redirect("/data-clerk");
        }).catch((err) => {
            console.error(`Error inserting the product in the database.  ${err}`);
            res.redirect("/");
        });
    } else {
        res.redirect('/');
    }
});

// render new product page
router.get("/insert-product", (req, res) => {
    let user = req.session.user;
    if (user && user.isDataClerk) {
        res.render('product/insert-product',
            {});
    } else {
        res.redirect('/');
    }
});

//Insert new product
router.post("/insert-product", (req, res) => {
    let user = req.session.user;
    if (user && user.isDataClerk) {
        const { title, description, available, featured, ingredients, category, price, cookingTime, calories } = req.body;

        const newProduct = new ProductModel({
            title: title,
            description: description,
            available: available,
            featured: featured,
            ingredients: ingredients,
            category: category,
            price: price,
            cookingTime: cookingTime,
            calories: calories
        });

        newProduct.save().then((productSaved) => {
            // this will rename every file to be named as the id and replace extension to jpg 
            if (req.files) {
                req.files.picture.name = `${productSaved._id}.jpg`;
                req.files.picture.mv(`public/imgs/products/${req.files.picture.name}`);
            }
            console.log("Product saved in Database");
            res.redirect("/data-clerk");
        }).catch((err) => {
            console.error(`Error inserting the product in the database.  ${err}`);
            res.redirect("/");
        });
    } else {
        res.redirect('/');
    }
})

router.get("/delete-product/:id", (req, res) => {
    let user = req.session.user;
    if (user && user.isDataClerk) {
        ProductModel.deleteOne({
            _id: req.params.id
        }).exec()
        .then(() => {
            console.log(`${req.params.id} removed from product database.`);
            res.redirect("/data-clerk");
        });
    } else {
        res.redirect('/');
    }
})

module.exports = router;