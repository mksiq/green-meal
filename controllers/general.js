const express = require('express')
const router = express.Router();

router.get("/", (req, res) => {
    let prod = require("../models/products.js").products;
    res.render('home',
        { data: prod });
});


router.post("/user-login", (req, res) => {
    let validation = {};
    validation.error = false;
    const { userEmail, password } = req.body;
    let valid = true;
    if (!userEmail) {
        validation.userEmail = "You must specify your e-mail.";
        valid = false;
        validation.error = true;
    } else if (!userEmail.match(/^[a-z0-9.!#$%&'*+\-\/=?^_`{|}~]+@(?=[a-z0-9])(?:[a-z0-9]|(?<![.-])\.|(?<!\.)-)*[a-z0-9]$/)) {
        // regex copied from https://rgxdb.com/r/5TT0B86O
        validation.userEmail = "Invalid email.";
        validation.error = true;
        valid = false;
    }

    if (!password) {
        validation.password = "You must specify your password.";
        valid = false;
        validation.error = true;
    } else if (password.length < 6 || password.length > 12) {
        validation.password = "Invalid password.";
        valid = false;
        validation.error = true;
    }
    console.log(validation)
    if (valid) {
        res.render("home");
    } else {
        res.render("home", {
            validation: validation,
            loginValues: req.body
        });
    }
});

var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'greenmealburner@gmail.com',
        pass: process.env.EMAIL_PW // 
    }
});

router.post("/register-user", (req, res) => {
    let validationSign = {};
    validationSign.error = false;
    let valid = true;
    const { firstName, lastName, email, password, confirmPassword } = req.body;


    if (!firstName) {
        validationSign.firstName = "First Name is mandatory.";
        valid = false;
        validationSign.signUpError = true;
    }

    if (!lastName) {
        validationSign.lastName = "Last Name is mandatory.";
        valid = false;
        validationSign.error = true;
    };

    if (!email) {
        validationSign.email = "Email is mandatory.";
        valid = false;
        validationSign.error = true;
    } else if (!email.match(/^[a-z0-9.!#$%&'*+\-\/=?^_`{|}~]+@(?=[a-z0-9])(?:[a-z0-9]|(?<![.-])\.|(?<!\.)-)*[a-z0-9]$/)) {
        // regex copied from https://rgxdb.com/r/5TT0B86O
        validationSign.email = "Email is invalid.";
        valid = false;
        validationSign.error = true;
    }
    if (!password) {
        validationSign.password = "Please type a password"
        valid = false;
        validationSign.error = true;
    } else if (!password.match(/^[a-zA-Z0-9]{6,12}$/) || !password.match(/[0-9]/) || !password.match(/[a-zA-Z]/)) {
        validationSign.password = "Must have between 6 and 12 chars. Only letters and numbers, at least one of each.";
        valid = false;
        validationSign.error = true;
    }
    if (!confirmPassword) {
        validationSign.confirmPassword = "Please confirm password.";
        valid = false;
        validationSign.error = true;
    } else if (password != confirmPassword) {
        validationSign.confirmPassword = "Passwords do not match.";
        valid = false;
        validationSign.error = true;
    }
    if (valid) {

        var emailOptions = {
            from: 'greenmealburner@gmail.com',
            to: email,
            subject: 'Welcome to greenMeal',
            html: `<h3 style="color: #31887e">Hello, ${firstName} </h3><p>Thank-you for signing up on our website.</p><br><p>Please access this link: <a href="https://murmuring-brook-93964.herokuapp.com/">to make your orders.</a></p>`
        };

        transporter.sendMail(emailOptions, (error, info) => {
            if (error) {
                console.log("ERROR: " + error);
            } else {
                console.log("SUCCESS: " + info.response);
            }
        });

        res.render("general/sign-up-success", {
            user: req.body});
    } else {
        res.render("home", {
            validationSign: validationSign,
            signUpValues: req.body
        });
    }
});


module.exports = router;