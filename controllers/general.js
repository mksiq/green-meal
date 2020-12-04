const express = require('express')
const router = express.Router();

router.get("/", (req, res) => {
    const productModel = require("../models/products.js");
    productModel.find().lean().exec()
        .then(products => {
            let user = req.session.user;
            if (products) {
                res.render('general/home',
                    { 
                        data: products,
                        user: user
                    });
            } else {
                console.log("Error loading database");
            }
        })
});

module.exports = router;