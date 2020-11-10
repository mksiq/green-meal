const express = require('express')
const router = express.Router();

router.get("/", (req, res) => {
    let prod = require("../models/products.js").products;
    res.render('general/home',
        { data: prod });
});

module.exports = router;