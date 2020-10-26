const express = require('express')
const router = express.Router();


router.get("/", (req, res) => {   
    let prod = require("../models/products.js"); 
    let breakfast = prod.products.filter((product) => { if (product.category == "Breakfast") return product });
    let dinner = prod.products.filter((product) => { if (product.category == "Dinner") return product });
    let salads = prod.products.filter((product) => { if (product.category == "Salads") return product });
    let sandwiches = prod.products.filter((product) => { if (product.category == "Sandwiches") return product });
    let soups = prod.products.filter((product) => { if (product.category == "Soups") return product });

    res.render('general/on-the-menu',
        {
            data: prod.products,
            breakfastData: breakfast,
            dinnerData: dinner,
            saladsData: salads,
            sandwichesData: sandwiches,
            soupsData: soups,
        });
});

module.exports = router;