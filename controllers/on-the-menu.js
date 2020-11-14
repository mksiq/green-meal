const express = require('express')
const router = express.Router();

router.get("/", (req, res) => {   
    const productModel = require("../models/products.js");
    productModel.find().lean().exec()
        .then( products => {
            if(products){
                let breakfast = products.filter((product) => { if (product.category == "Breakfast") return product });
                let dinner = products.filter((product) => { if (product.category == "Dinner") return product });
                let salads = products.filter((product) => { if (product.category == "Salads") return product });
                let sandwiches = products.filter((product) => { if (product.category == "Sandwiches") return product });
                let soups = products.filter((product) => { if (product.category == "Soups") return product });
            
                res.render('general/on-the-menu',
                    {
                        //data is for the details modals
                        data: products,
                        breakfastData: breakfast,
                        dinnerData: dinner,
                        saladsData: salads,
                        sandwichesData: sandwiches,
                        soupsData: soups,
                    });
            } else {
                console.log("Error loading database");
            }
        }) 
});

module.exports = router;