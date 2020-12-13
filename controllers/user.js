const bcrypt = require("bcryptjs");
const dotenv = require('dotenv');
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

dotenv.config({ path: "./config/keys.env" });
const userModel = require('../models/user');

//MongoDB Resources - Rep
mongoose.connect(
    process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

//Login
router.post("/user-login", (req, res) => {
    let validation = {};
    validation.error = false;
    const { userEmail, password } = req.body;
    let validEmail = validateEmail(userEmail, validation);
    let validPassword = validatePassword(password, validation);

    if (validEmail && validPassword) {
        userModel.findOne({
            email: userEmail
        }).lean().exec()
            .then((user) => {
                if (user) {
                    bcrypt.compare(password, user.password)
                        .then((matches) => {
                            if (matches) {
                                // Password matches
                                // Remove hash from user object
                                user.password = "";
                                // Establish Session
                                req.session.user = user;
                                if (user && user.isDataClerk) {
                                    console.log("Logged as data clerk user");
                                    res.redirect("/data-clerk");
                                } else {
                                    console.log("Logged as regular user");
                                    res.redirect("/profile");
                                }
                            }
                            else {
                                // wrong password
                                console.log("Password DOES NOT match");
                                validation.password = "Wrong password. Please try again.";
                                validation.error = true;
                                res.render("general/home", {
                                    validation: validation,
                                    loginValues: req.body
                                });
                            }
                        }).catch((err) => {
                            // Couldn't compare the passwords.
                            console.log`Error comparing passwords: ${err}.`;
                            validation.password = "Something went wrong. Please try again";
                            res.render("general/home", {
                                validation: validation,
                                loginValues: req.body
                            });
                        })
                } else {
                    //Didn't find the email
                    if (!validation.userEmail) // this if deals with the change the email was empty
                        validation.userEmail = "User not found.";
                    validation.error = true;
                    res.render("general/home", {
                        validation: validation,
                        loginValues: req.body
                    });
                }
            });
    }
    else {
        // invalid data
        res.render("general/home", {
            validation: validation,
            loginValues: req.body
        });
    }
});

//Logout
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

// Regular User Profile Page
router.get("/profile", (req, res) => {
    //TODO check requirements, not necessary to update user data
    const user = req.session.user;
    if (user && !(user.isDataClerk)) {
        const cart = req.session.cart;
        let totalItems = undefined;
        if (cart) {
            totalItems = cart.reduce((acc, cur) => {
                return acc + cur.quantity;
            }, 0);
        }
        res.render("User/profile-page", {
            loggedUser: user,
            totalItems: totalItems
        });
    } else {
        res.redirect('/');
    }
})

// Data Clerk 
router.get("/data-clerk", (req, res) => {
    const user = req.session.user;
    if (user && user.isDataClerk) {
        const productModel = require("../models/products.js");
        productModel.find().lean().exec()
            .then(products => {
                if (products) {
                    let user = req.session.user;
                    if (user && user.isDataClerk) {
                        res.render("User/data-clerk", {
                            user: user,
                            data: products
                        });
                    } else {
                        console.log("Error loading database");
                    }
                }
            });
    } else {
        res.redirect('/');
    }
})

// Sign up
router.post("/register-user", (req, res) => {
    let validationSign = {};
    validationSign.error = false;
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    let valid = confirmUserData(firstName, lastName, email, password, confirmPassword, validationSign);
    if (valid) {
        const newUser = new userModel({
            firstName: firstName,
            lastName: lastName,
            password: password,
            email: email
        });
        newUser.save((err) => {
            if (err) {
                if (err.code == 11000) {
                    // err is: MongoError: E11000 duplicate key error collection: green-meal.users index: email_1 dup key: { email: "kiwi@gmail.com" }
                    // Code 11000 is duplicated key
                    validationSign.email = "Email is already registered.";
                    valid = false;
                    validationSign.error = true;
                    res.render("general/home", {
                        validationSign: validationSign,
                        signUpValues: req.body
                    });
                }
            } else {
                console.log("Successfully created a new user: " + newUser);
                req.session.user = newUser;
                req.session.user.password = "";
                //sendEmail 
                const sgMail = require("@sendgrid/mail");
                sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

                const msg = {
                    to: email,
                    from: 'greenmealburner@gmail.com',
                    subject: 'Welcome to greenMeal',
                    html:
                        `<h3 style="color: #31887e">Hello, ${firstName} </h3>
                        <br>
                        <p>Thank you for signing up on our website.</p>
                        <br>
                        <p>Please access this link to make your orders.: <a href="https://green-meal.herokuapp.com/"> greenMeal</a></p>
                        <br>
                        <h2 style="color: #31887e">greenMeal</h2>
                        `
                };

                sgMail.send(msg)
                    .then(() => {
                        res.render("general/sign-up-success", {
                            user: req.body
                        });
                    })
                    .catch(err => {
                        console.log(`Error ${err}`);

                        res.render("general/home", {
                            validationSign: validationSign,
                            signUpValues: req.body
                        });
                    });
            }

        })
    } else {
        res.render("general/home", {
            validationSign: validationSign,
            signUpValues: req.body
        });
    }
});

//update user data
router.get("/user-update", (req, res) => {
    const user = req.session.user;
    let validationSign = {};
    if (user && !(user.isDataClerk)) {
        const cart = req.session.cart;
        let totalItems = undefined;
        if (cart) {
            totalItems = cart.reduce((acc, cur) => {
                return acc + cur.quantity;
            }, 0);
        }
        res.render("User/user-update", {
            loggedUser: user,
            totalItems: totalItems,
            validationSign: validationSign
        });
    } else {
        res.redirect('/');
    }
})

//delete user
router.get("/delete-user/:id", (req, res) => {
    const user = req.session.user;
    // makes sure that only regular that have same id as request can delete themselves
    if (user && !user.isDataClerk && user._id === req.params.id) {
        userModel.deleteOne({
            _id: req.params.id
        }).exec()
        .then(() => {
            // delete image from server 
            req.session.destroy();
            console.log(`${req.params.id} removed from user database.`);
            res.redirect("/");
        });
    } else {
        res.redirect('/');
    }
})

router.post("/user-update", (req, res) => {
    const user = req.session.user;
    let validationUpdate = {};
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    const valid = confirmUserData(firstName, lastName, email, password, confirmPassword, validationUpdate);
    if (user && !(user.isDataClerk)) {

        const cart = req.session.cart;
        let totalItems = undefined;
        if (cart) {
            totalItems = cart.reduce((acc, cur) => {
                return acc + cur.quantity;
            }, 0);
        }
        if (valid) {
            userModel.updateOne({ _id: user._id },
                {
                    $set: {
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                    }
                }).then(() => {
                    userModel.findOne({ _id: user._id })
                        .lean()
                        .exec().then(updatedUser => {
                            updatedUser.password = "";
                            req.session.user = updatedUser;
                            res.redirect("/profile");
                        });

                }).catch((err) => {
                    console.error(`Error updating the product in the database:  ${err}`);
                    res.redirect("/");
                })
        } else {
            res.render("User/user-update", {
                loggedUser: user,
                totalItems: totalItems,
                validationUpdate: validationUpdate
            });
        }
    } else {
        res.redirect('/');
    }
})

// Validations functions
function validateEmail(userEmail, validation) {
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
    return valid;
}

function validatePassword(password, validation) {
    let valid = true;
    if (!password) {
        validation.password = "You must specify your password.";
        valid = false;
        validation.error = true;
    } else if (password.length < 6 || password.length > 12) {
        validation.password = "Invalid password.";
        valid = false;
        validation.error = true;
    }
    return valid;
}

function confirmUserData(firstName, lastName, email, password, confirmPassword, validationSign) {
    let valid = true;
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
    return valid;
}

module.exports = router;