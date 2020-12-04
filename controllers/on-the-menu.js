const express = require('express')
const router = express.Router();

router.get("/", (req, res) => {   
    const productModel = require("../models/products.js");
    productModel.find().lean().exec()
        .then( products => {
            if(products){
                let breakfast = products.filter((product) => { if (product.category.toLowerCase() == "breakfast") return product });
                let dinner = products.filter((product) => { if (product.category.toLowerCase() == "dinner") return product });
                let salads = products.filter((product) => { if (product.category.toLowerCase() == "salads") return product });
                let sandwiches = products.filter((product) => { if (product.category.toLowerCase() == "sandwiches") return product });
                let soups = products.filter((product) => { if (product.category.toLowerCase() == "soups") return product });
                let user = req.session.user;
                res.render('general/on-the-menu',
                    {
                        //data is for the details modals
                        data: products,
                        breakfastData: breakfast,
                        dinnerData: dinner,
                        saladsData: salads,
                        sandwichesData: sandwiches,
                        soupsData: soups,
                        user: user
                    });
            } else {
                console.log("Error loading database");
            }
        }) 
});

module.exports = router;