const express = require('express')
const router = express.Router();

router.get("/", (req, res) => {
    const productModel = require("../models/products.js");

    productModel.find().lean().exec()
        .then(products => {
            if (products) {
                res.render('general/home',
                    { data: products });
            } else {
                console.log("Error loading database");
            }
        })
});

module.exports = router;