const express = require("express");
const router = express.Router();

router.get("/cart", (req, res) => {
    //Only regular logged users may use this route
    let user = req.session.user;
    if (user && !user.isDataClerk) {
        let cart = req.session.cart;
        if (cart && cart.length > 0) {
            const productModel = require("../models/products.js");
            // use only the id of the array to look for 
            productModel.find({ _id: { $in: cart.map((meal) => meal._id) } })
                .lean()
                .exec()
                .then(meals => {
                    // Add quantity property to meals
                    meals.map(meal => {
                        return cart.map(cartMeal => {
                            if (meal._id.toString() == cartMeal._id) {

                                meal.quantity = cartMeal.quantity;
                                meal.total = meal.quantity * meal.price;
                            }
                        })
                    });
                    let totalPrice = meals.reduce((acc, cur) => acc + cur.total, 0)
                    const cartSize = meals.length;

                    res.render("cart/cart", {
                        meals: meals,
                        totalPrice: totalPrice,
                        size: cartSize
                    });
                });
        } else {
            res.render("cart/cart", {
                emptyCart: true,
                totalPrice: 0,
                size: 0
            });
        }
    } else {
        res.redirect('/');
    }
});

router.put("/cart/:id", (req, res) => {
    // Add item into Cart
    let user = req.session.user;
    if (user && !user.isDataClerk) {
        let cart = req.session.cart;
        if (!cart)
            cart = [];

        let index = cart.findIndex((meal) =>
            meal._id == req.params.id
        );

        if (index == -1) {
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
            message: "Meal",
            meal: req.params.id
        });
    } else {
        res.redirect('/');
    }
});

router.get("/cart/increase/:id", (req, res) => {
    // increase quantity in cart
    let user = req.session.user;
    if (user && !user.isDataClerk) {
        let cart = req.session.cart;
        const index = cart.findIndex((mealKit) => { return mealKit._id.toString() === req.params.id });
        console.log("Ok clicked on up.");
        if (index >= 0) {
            console.log("Found on index." + index);
            cart[index].quantity++;
        }
        req.session.cart = cart;
        res.redirect('/cart');

    } else {
        res.redirect('/');
    }
});

router.get("/cart/decrease/:id", (req, res) => {
    // decrease quantity in cart
    let user = req.session.user;
    if (user && !user.isDataClerk) {
        let cart = req.session.cart;
        const index = cart.findIndex((mealKit) => { return mealKit._id.toString() === req.params.id });
        if (index >= 0) {
            cart[index].quantity--;
            // if quantity is 0 remove from cart
            if (cart[index].quantity <= 0)
                cart.splice(index, 1);
        }
        req.session.cart = cart;
        res.redirect('/cart');

    } else {
        res.redirect('/');
    }
});

router.get("/cart/clear", (req, res) => {
    // Remove all items from cart
    let user = req.session.user;
    if (user && !user.isDataClerk) {
        req.session.cart = [];
        res.redirect('/cart');
    } else {
        res.redirect('/');
    }
});

module.exports = router;