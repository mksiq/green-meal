const express = require("express");
const router = express.Router();

router.get("/cart", (req, res) => {
    //Only regular logged users may use this route
    let user = req.session.user;
    if (user && !user.isDataClerk) {
        let cart = req.session.cart;

        if(cart){
            const productModel = require("../models/products.js");
            console.log(cart);

        

       

            // use only the id of the array to look for 
            productModel.find( {_id: {$in:  cart.map( (meal) => meal._id) }} )
                .lean()
                .exec()
                .then( meals  => {
                    // Add quantity property to meals
                    meals.map( meal => { return cart.map( cartMeal => {
                        if(meal._id.toString() == cartMeal._id){
                            
                            meal.quantity = cartMeal.quantity;
                            meal.total = meal.quantity * meal.price;
                        }
                })});    

                    let totalPrice = meals.reduce( (acc, cur) =>  acc + cur.total , 0)
                    const cartSize = meals.length;


                    console.log("TOtal prices is " + totalPrice)

                    res.render("cart/cart",{
                        meals : meals,
                        totalPrice : totalPrice,
                        size: cartSize
                    });
                });
            
        } else {
            res.render("cart/cart",{
                emptyCart : true
            });
        }
        
        // res.render("cart/cart",{
        // });

        
    } else {
        res.redirect('/');
    }
});

router.put("/cart/:id", (req,res) =>{
    let cart = req.session.cart;
    if(!cart)
        cart = [];

    let index = cart.findIndex((meal)=> 
         meal._id == req.params.id
    );

    if(index == -1){
        let item = {
            _id: req.params.id,
            quantity: 1
        }
        cart.push(item);
    } else {
        cart[index].quantity++;
    }
    req.session.cart = cart;

    res.json({
        message: "Meal " + req.params.id + " Added",
        htmlMessage: "send info about <b>meal</b> with id <b>" + req.params.id + "</b>",
        meal: req.params.id
    });
});

module.exports = router;