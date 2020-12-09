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

router.get("/cart/order", (req, res) => {
    const user = req.session.user;
    console.log(user);
    if (user && !user.isDataClerk) {
        // Send email to user after ordering
        const cart = req.session.cart;

        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

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
                const message = buildMessage(meals, user);
                const msg = {
                    to: user.email,
                    from: 'greenmealburner@gmail.com',
                    subject: 'Welcome to greenMeal',
                    html: message
                };
                sgMail.send(msg)
                    // Remove all items from cart        
                    .then(() => {
                        req.session.cart = [];
                        res.redirect("/");
                    })
                    .catch(err => {
                        console.log(`Error ${err}`);
                        res.redirect("/");
                    });
            });
    } else {
        res.redirect('/');
    }
});

function buildMessage(meals, user) {
    //Designed email message in bootstrap and converted to pure html css. Not the ideal solution. Conversion by https://editor.bootstrapemail.com
    let totalPrice = meals.reduce((acc, cur) => acc + cur.total, 0)
    let message =
        `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">    
                <style type="text/css">
                .ExternalClass{width:100%}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div{line-height:150%}a{text-decoration:none}body,td,input,textarea,select{margin:unset;font-family:unset}input,textarea,select{font-size:unset}@media screen and (max-width: 600px){table.row th.col-lg-1,table.row th.col-lg-2,table.row th.col-lg-3,table.row th.col-lg-4,table.row th.col-lg-5,table.row th.col-lg-6,table.row th.col-lg-7,table.row th.col-lg-8,table.row th.col-lg-9,table.row th.col-lg-10,table.row th.col-lg-11,table.row th.col-lg-12{display:block;width:100% !important}.d-mobile{display:block !important}.d-desktop{display:none !important}.w-lg-25{width:auto !important}.w-lg-25>tbody>tr>td{width:auto !important}.w-lg-50{width:auto !important}.w-lg-50>tbody>tr>td{width:auto !important}.w-lg-75{width:auto !important}.w-lg-75>tbody>tr>td{width:auto !important}.w-lg-100{width:auto !important}.w-lg-100>tbody>tr>td{width:auto !important}.w-lg-auto{width:auto !important}.w-lg-auto>tbody>tr>td{width:auto !important}.w-25{width:25% !important}.w-25>tbody>tr>td{width:25% !important}.w-50{width:50% !important}.w-50>tbody>tr>td{width:50% !important}.w-75{width:75% !important}.w-75>tbody>tr>td{width:75% !important}.w-100{width:100% !important}.w-100>tbody>tr>td{width:100% !important}.w-auto{width:auto !important}.w-auto>tbody>tr>td{width:auto !important}.p-lg-0>tbody>tr>td{padding:0 !important}.pt-lg-0>tbody>tr>td,.py-lg-0>tbody>tr>td{padding-top:0 !important}.pr-lg-0>tbody>tr>td,.px-lg-0>tbody>tr>td{padding-right:0 !important}.pb-lg-0>tbody>tr>td,.py-lg-0>tbody>tr>td{padding-bottom:0 !important}.pl-lg-0>tbody>tr>td,.px-lg-0>tbody>tr>td{padding-left:0 !important}.p-lg-1>tbody>tr>td{padding:0 !important}.pt-lg-1>tbody>tr>td,.py-lg-1>tbody>tr>td{padding-top:0 !important}.pr-lg-1>tbody>tr>td,.px-lg-1>tbody>tr>td{padding-right:0 !important}.pb-lg-1>tbody>tr>td,.py-lg-1>tbody>tr>td{padding-bottom:0 !important}.pl-lg-1>tbody>tr>td,.px-lg-1>tbody>tr>td{padding-left:0 !important}.p-lg-2>tbody>tr>td{padding:0 !important}.pt-lg-2>tbody>tr>td,.py-lg-2>tbody>tr>td{padding-top:0 !important}.pr-lg-2>tbody>tr>td,.px-lg-2>tbody>tr>td{padding-right:0 !important}.pb-lg-2>tbody>tr>td,.py-lg-2>tbody>tr>td{padding-bottom:0 !important}.pl-lg-2>tbody>tr>td,.px-lg-2>tbody>tr>td{padding-left:0 !important}.p-lg-3>tbody>tr>td{padding:0 !important}.pt-lg-3>tbody>tr>td,.py-lg-3>tbody>tr>td{padding-top:0 !important}.pr-lg-3>tbody>tr>td,.px-lg-3>tbody>tr>td{padding-right:0 !important}.pb-lg-3>tbody>tr>td,.py-lg-3>tbody>tr>td{padding-bottom:0 !important}.pl-lg-3>tbody>tr>td,.px-lg-3>tbody>tr>td{padding-left:0 !important}.p-lg-4>tbody>tr>td{padding:0 !important}.pt-lg-4>tbody>tr>td,.py-lg-4>tbody>tr>td{padding-top:0 !important}.pr-lg-4>tbody>tr>td,.px-lg-4>tbody>tr>td{padding-right:0 !important}.pb-lg-4>tbody>tr>td,.py-lg-4>tbody>tr>td{padding-bottom:0 !important}.pl-lg-4>tbody>tr>td,.px-lg-4>tbody>tr>td{padding-left:0 !important}.p-lg-5>tbody>tr>td{padding:0 !important}.pt-lg-5>tbody>tr>td,.py-lg-5>tbody>tr>td{padding-top:0 !important}.pr-lg-5>tbody>tr>td,.px-lg-5>tbody>tr>td{padding-right:0 !important}.pb-lg-5>tbody>tr>td,.py-lg-5>tbody>tr>td{padding-bottom:0 !important}.pl-lg-5>tbody>tr>td,.px-lg-5>tbody>tr>td{padding-left:0 !important}.p-0>tbody>tr>td{padding:0 !important}.pt-0>tbody>tr>td,.py-0>tbody>tr>td{padding-top:0 !important}.pr-0>tbody>tr>td,.px-0>tbody>tr>td{padding-right:0 !important}.pb-0>tbody>tr>td,.py-0>tbody>tr>td{padding-bottom:0 !important}.pl-0>tbody>tr>td,.px-0>tbody>tr>td{padding-left:0 !important}.p-1>tbody>tr>td{padding:4px !important}.pt-1>tbody>tr>td,.py-1>tbody>tr>td{padding-top:4px !important}.pr-1>tbody>tr>td,.px-1>tbody>tr>td{padding-right:4px !important}.pb-1>tbody>tr>td,.py-1>tbody>tr>td{padding-bottom:4px !important}.pl-1>tbody>tr>td,.px-1>tbody>tr>td{padding-left:4px !important}.p-2>tbody>tr>td{padding:8px !important}.pt-2>tbody>tr>td,.py-2>tbody>tr>td{padding-top:8px !important}.pr-2>tbody>tr>td,.px-2>tbody>tr>td{padding-right:8px !important}.pb-2>tbody>tr>td,.py-2>tbody>tr>td{padding-bottom:8px !important}.pl-2>tbody>tr>td,.px-2>tbody>tr>td{padding-left:8px !important}.p-3>tbody>tr>td{padding:16px !important}.pt-3>tbody>tr>td,.py-3>tbody>tr>td{padding-top:16px !important}.pr-3>tbody>tr>td,.px-3>tbody>tr>td{padding-right:16px !important}.pb-3>tbody>tr>td,.py-3>tbody>tr>td{padding-bottom:16px !important}.pl-3>tbody>tr>td,.px-3>tbody>tr>td{padding-left:16px !important}.p-4>tbody>tr>td{padding:24px !important}.pt-4>tbody>tr>td,.py-4>tbody>tr>td{padding-top:24px !important}.pr-4>tbody>tr>td,.px-4>tbody>tr>td{padding-right:24px !important}.pb-4>tbody>tr>td,.py-4>tbody>tr>td{padding-bottom:24px !important}.pl-4>tbody>tr>td,.px-4>tbody>tr>td{padding-left:24px !important}.p-5>tbody>tr>td{padding:48px !important}.pt-5>tbody>tr>td,.py-5>tbody>tr>td{padding-top:48px !important}.pr-5>tbody>tr>td,.px-5>tbody>tr>td{padding-right:48px !important}.pb-5>tbody>tr>td,.py-5>tbody>tr>td{padding-bottom:48px !important}.pl-5>tbody>tr>td,.px-5>tbody>tr>td{padding-left:48px !important}.s-lg-1>tbody>tr>td,.s-lg-2>tbody>tr>td,.s-lg-3>tbody>tr>td,.s-lg-4>tbody>tr>td,.s-lg-5>tbody>tr>td{font-size:0 !important;line-height:0 !important;height:0 !important}.s-0>tbody>tr>td{font-size:0 !important;line-height:0 !important;height:0 !important}.s-1>tbody>tr>td{font-size:4px !important;line-height:4px !important;height:4px !important}.s-2>tbody>tr>td{font-size:8px !important;line-height:8px !important;height:8px !important}.s-3>tbody>tr>td{font-size:16px !important;line-height:16px !important;height:16px !important}.s-4>tbody>tr>td{font-size:24px !important;line-height:24px !important;height:24px !important}.s-5>tbody>tr>td{font-size:48px !important;line-height:48px !important;height:48px !important}}@media yahoo{.d-mobile{display:none !important}.d-desktop{display:block !important}.w-lg-25{width:25% !important}.w-lg-25>tbody>tr>td{width:25% !important}.w-lg-50{width:50% !important}.w-lg-50>tbody>tr>td{width:50% !important}.w-lg-75{width:75% !important}.w-lg-75>tbody>tr>td{width:75% !important}.w-lg-100{width:100% !important}.w-lg-100>tbody>tr>td{width:100% !important}.w-lg-auto{width:auto !important}.w-lg-auto>tbody>tr>td{width:auto !important}.p-lg-0>tbody>tr>td{padding:0 !important}.pt-lg-0>tbody>tr>td,.py-lg-0>tbody>tr>td{padding-top:0 !important}.pr-lg-0>tbody>tr>td,.px-lg-0>tbody>tr>td{padding-right:0 !important}.pb-lg-0>tbody>tr>td,.py-lg-0>tbody>tr>td{padding-bottom:0 !important}.pl-lg-0>tbody>tr>td,.px-lg-0>tbody>tr>td{padding-left:0 !important}.p-lg-1>tbody>tr>td{padding:4px !important}.pt-lg-1>tbody>tr>td,.py-lg-1>tbody>tr>td{padding-top:4px !important}.pr-lg-1>tbody>tr>td,.px-lg-1>tbody>tr>td{padding-right:4px !important}.pb-lg-1>tbody>tr>td,.py-lg-1>tbody>tr>td{padding-bottom:4px !important}.pl-lg-1>tbody>tr>td,.px-lg-1>tbody>tr>td{padding-left:4px !important}.p-lg-2>tbody>tr>td{padding:8px !important}.pt-lg-2>tbody>tr>td,.py-lg-2>tbody>tr>td{padding-top:8px !important}.pr-lg-2>tbody>tr>td,.px-lg-2>tbody>tr>td{padding-right:8px !important}.pb-lg-2>tbody>tr>td,.py-lg-2>tbody>tr>td{padding-bottom:8px !important}.pl-lg-2>tbody>tr>td,.px-lg-2>tbody>tr>td{padding-left:8px !important}.p-lg-3>tbody>tr>td{padding:16px !important}.pt-lg-3>tbody>tr>td,.py-lg-3>tbody>tr>td{padding-top:16px !important}.pr-lg-3>tbody>tr>td,.px-lg-3>tbody>tr>td{padding-right:16px !important}.pb-lg-3>tbody>tr>td,.py-lg-3>tbody>tr>td{padding-bottom:16px !important}.pl-lg-3>tbody>tr>td,.px-lg-3>tbody>tr>td{padding-left:16px !important}.p-lg-4>tbody>tr>td{padding:24px !important}.pt-lg-4>tbody>tr>td,.py-lg-4>tbody>tr>td{padding-top:24px !important}.pr-lg-4>tbody>tr>td,.px-lg-4>tbody>tr>td{padding-right:24px !important}.pb-lg-4>tbody>tr>td,.py-lg-4>tbody>tr>td{padding-bottom:24px !important}.pl-lg-4>tbody>tr>td,.px-lg-4>tbody>tr>td{padding-left:24px !important}.p-lg-5>tbody>tr>td{padding:48px !important}.pt-lg-5>tbody>tr>td,.py-lg-5>tbody>tr>td{padding-top:48px !important}.pr-lg-5>tbody>tr>td,.px-lg-5>tbody>tr>td{padding-right:48px !important}.pb-lg-5>tbody>tr>td,.py-lg-5>tbody>tr>td{padding-bottom:48px !important}.pl-lg-5>tbody>tr>td,.px-lg-5>tbody>tr>td{padding-left:48px !important}.s-lg-0>tbody>tr>td{font-size:0 !important;line-height:0 !important;height:0 !important}.s-lg-1>tbody>tr>td{font-size:4px !important;line-height:4px !important;height:4px !important}.s-lg-2>tbody>tr>td{font-size:8px !important;line-height:8px !important;height:8px !important}.s-lg-3>tbody>tr>td{font-size:16px !important;line-height:16px !important;height:16px !important}.s-lg-4>tbody>tr>td{font-size:24px !important;line-height:24px !important;height:24px !important}.s-lg-5>tbody>tr>td{font-size:48px !important;line-height:48px !important;height:48px !important}}
                </style>
        </head>
        <body style="outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border: 0;" bgcolor="#ffffff">
        <table valign="top" class="bg-light body" style="outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: collapse; margin: 0; padding: 0; border: 0;" bgcolor="#f8f9fa">
        <tbody>
            <tr>
            <td valign="top" style="border-spacing: 0px; border-collapse: collapse; line-height: 24px; font-size: 16px; margin: 0;" align="left" bgcolor="#f8f9fa">  
            <table class="container" border="0" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: collapse; width: 100%;">
        <tbody>
            <tr>
            <td align="center" style="border-spacing: 0px; border-collapse: collapse; line-height: 24px; font-size: 16px; margin: 0; padding: 0 16px;">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center">
                    <tbody>
                    <tr>
                        <td width="600">
                <![endif]-->
                <table align="center" border="0" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: collapse; width: 100%; max-width: 600px; margin: 0 auto;">
                <tbody>
                    <tr>
                    <td style="border-spacing: 0px; border-collapse: collapse; line-height: 24px; font-size: 16px; margin: 0;" align="left">            
                <table class="s-5 w-100" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tbody>
            <tr>
            <td height="48" style="border-spacing: 0px; border-collapse: collapse; line-height: 48px; font-size: 48px; width: 100%; height: 48px; margin: 0;" align="left">    
            </td>
            </tr>
        </tbody>
        </table>
        <table class="card " border="0" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: separate !important; border-radius: 4px; width: 100%; overflow: hidden; border: 1px solid #dee2e6;" bgcolor="#ffffff">
        <tbody>
            <tr>
            <td style="border-spacing: 0px; border-collapse: collapse; line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">
                <div>
                    <table class="card-body" border="0" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: collapse; width: 100%;">
        <tbody>
            <tr>
            <td style="border-spacing: 0px; border-collapse: collapse; line-height: 24px; font-size: 16px; width: 100%; margin: 0; padding: 20px;" align="left">
                <div>
                        <br>
                        <h3 class="text-muted" style="margin-top: 0; margin-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 28px; line-height: 33.6px; color: #636c72;" align="left">${user.firstName}, this is your</h3>
                        <h1 class="text-center" style="color: #31887e; margin-top: 0; margin-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 36px; line-height: 43.2px;" align="center">Order Receipt.</h1>
                        <h5 class="text-right text-muted " style="margin-top: 0; margin-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 20px; line-height: 24px; color: #636c72;" align="right">Thank you for ordering with greenMeal</h5>
        <table class="s-2 w-100" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tbody>
            <tr>
            <td height="8" style="border-spacing: 0px; border-collapse: collapse; line-height: 8px; font-size: 8px; width: 100%; height: 8px; margin: 0;" align="left">         
            </td>
            </tr>
        </tbody>
        </table>
        <br>
        <h4 class=" text-muted" style="margin-top: 0; margin-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 24px; line-height: 28.8px; color: #636c72;" align="left">Order details:</h4>
        <table class="s-2 w-100" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tbody>
            <tr>
            <td height="8" style="border-spacing: 0px; border-collapse: collapse; line-height: 8px; font-size: 8px; width: 100%; height: 8px; margin: 0;" align="left">
                
            </td>
            </tr>
        </tbody>
        </table>
                        <table class="container" border="0" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: collapse; width: 100%;">
        <tbody>
            <tr>
            <td align="center" style="border-spacing: 0px; border-collapse: collapse; line-height: 24px; font-size: 16px; margin: 0; padding: 0 16px;">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center">
                    <tbody>
                    <tr>
                        <td width="600">
                <![endif]-->
                <table align="center" border="0" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: collapse; width: 100%; max-width: 600px; margin: 0 auto;">
                <tbody>
                    <tr>
                    <td style="border-spacing: 0px; border-collapse: collapse; line-height: 24px; font-size: 16px; margin: 0;" align="left">
                        
                            <table class="table" border="0" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: collapse; width: 100%; max-width: 100%;">
                                <table class="row border border-bottom-1 border-left-0 border-right-0 border-top-0" border="0" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: collapse; margin-right: -15px; margin-left: -15px; table-layout: fixed; width: 100%; border-color: #dee2e6; border-style: solid; border-width: 0 0 1px;">
        <thead>
            <tr> 
                                    <th class="col-6" align="left" valign="top" style="line-height: 24px; font-size: 16px; min-height: 1px; padding-right: 15px; padding-left: 15px; font-weight: normal; width: 50%; margin: 0;">
        <b>Product</b>
        </th>
                                    <th class="col-2" align="left" valign="top" style="line-height: 24px; font-size: 16px; min-height: 1px; padding-right: 15px; padding-left: 15px; font-weight: normal; width: 16.666667%; margin: 0;">
        <b>Quantity</b>
        </th>
                                    <th class="col-2" align="left" valign="top" style="line-height: 24px; font-size: 16px; min-height: 1px; padding-right: 15px; padding-left: 15px; font-weight: normal; width: 16.666667%; margin: 0;">
        <b>Price</b>
        </th>
                                    <th class="col-2" align="left" valign="top" style="line-height: 24px; font-size: 16px; min-height: 1px; padding-right: 15px; padding-left: 15px; font-weight: normal; width: 16.666667%; margin: 0;">
        <b>Total</b>
        </th>                        
            </tr>
        </thead>
        </table>

                                <table class="row" border="0" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: collapse; margin-right: -15px; margin-left: -15px; table-layout: fixed; width: 100%;">
        <thead>`;

    meals.forEach(meal => {
        const price = parseFloat(meal.price).toFixed(2);
        const total = parseFloat(meal.total).toFixed(2);
        message += `<tr>
            <th class="col-6" align="left" valign="top" style="line-height: 24px; font-size: 16px; min-height: 1px; padding-right: 15px; padding-left: 15px; font-weight: normal; width: 50%; margin: 0;">
        ${meal.title}
        </th>
            <th class="col-2" align="left" valign="top" style="line-height: 24px; font-size: 16px; min-height: 1px; padding-right: 15px; padding-left: 15px; font-weight: normal; width: 16.666667%; margin: 0;">
        ${meal.quantity}
        </th>
            <th class="col-2" align="left" valign="top" style="line-height: 24px; font-size: 16px; min-height: 1px; padding-right: 15px; padding-left: 15px; font-weight: normal; width: 16.666667%; margin: 0;">
        ${price}
        </th>
            <th class="col-2" align="left" valign="top" style="line-height: 24px; font-size: 16px; min-height: 1px; padding-right: 15px; padding-left: 15px; font-weight: normal; width: 16.666667%; margin: 0;">
        ${total}
        </th>
        </tr>`
    });

    message += `    
        </thead>
        </table>
                            </table>
                            <br>
                            <br>
                            <table class="card" border="0" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: separate !important; border-radius: 4px; width: 100%; overflow: hidden; border: 1px solid #dee2e6;" bgcolor="#ffffff">
        <tbody>
            <tr>
            <td style="border-spacing: 0px; border-collapse: collapse; line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">
                <div>
                                <div class="text-center" style="" align="center">
                                    Cart Total
                                </div>
                                <table class="card-body" border="0" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: collapse; width: 100%;">
        <tbody>
            <tr>
            <td style="border-spacing: 0px; border-collapse: collapse; line-height: 24px; font-size: 16px; width: 100%; margin: 0; padding: 20px;" align="left">
                <div>
                                    <h5 class="card-title text-center" style="margin-top: 0; margin-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 20px; line-height: 24px;" align="center">CAD$ ${totalPrice}</h5>
                                </div>
            </td>
            </tr>
        </tbody>
        </table>
                            </div>
            </td>
            </tr>
        </tbody>
        </table>    
                    </td>
                    </tr>
                </tbody>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <![endif]-->
            </td>
            </tr>
        </tbody>
        </table>
                    </div>
            </td>
            </tr>
        </tbody>
        </table>
                    <br>
                    <p class="text-center" style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="center">For more information: <a href="https://green-meal.herokuapp.com/"> greenMeal</a>
                    </p>
                    <br>
                </div>
            </td>
            </tr>
        </tbody>
        </table>
        <table class="s-5 w-100" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tbody>
            <tr>
            <td height="48" style="border-spacing: 0px; border-collapse: collapse; line-height: 48px; font-size: 48px; width: 100%; height: 48px; margin: 0;" align="left">  
            </td>
            </tr>
        </tbody>
        </table>
                    </td>
                    </tr>
                </tbody>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <![endif]-->
            </td>
            </tr>
        </tbody>
        </table>
            </td>
            </tr>
        </tbody>
        </table>
        </body>
        </html>`;
    return message;
}

module.exports = router;