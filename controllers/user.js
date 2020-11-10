const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config({path:"./config/keys.env"});
// const UserModel = require("../models/user"); //Check MVC


//MongoDB Resources - Rep
mongoose.connect(
    process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    "email": {
        "type": String,
        "unique": true,
        "required": true
    },
    "password": {
        "type": String,
        "required": true
    },
    "firstName": {
        "type": String,
        "required": true
    },
    "lastName": {
        "type": String,
        "required": true
    }
});

let UserModel = mongoose.model("users", UserSchema);

let bcrypt = require('bcryptjs');

router.post("/user-login", (req, res) => {
    let validation = {};
    validation.error = false;
    const { userEmail, password } = req.body;
    let valid = true;

    validateEmail(userEmail, validation, valid);
    validatePassword(password, validation, valid);

    if (valid) {
        UserModel.find({
            email: userEmail
        })
            .exec()
            .then((data) => {
                if (data[0]) {
                    if (bcrypt.compareSync(password, data[0].password)) {
                        console.log("Password matches");
                        res.render("general/home");
                    } else {
                        // wrong password
                        console.log("Password DOES NOT match");
                        validation.password = "Wrong password. Please try again.";
                        validation.error = true;
                        res.render("general/home", {
                            validation: validation,
                            loginValues: req.body
                        });
                    }
                } else {
                    //Didn't find the email
                    validation.userEmail = "User not found.";
                    validation.error = true;

                    res.render("general/home", {
                        validation: validation,
                        loginValues: req.body
                    });
                }
            });

    } else {
        res.render("general/home", {
            // invalid data
            validation: validation,
            loginValues: req.body
        });
    }
});



function validateEmail(userEmail, validation, valid){
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
}

function validatePassword(password, validation, valid){
    if (!password) {
        validation.password = "You must specify your password.";
        valid = false;
        validation.error = true;
    } else if (password.length < 6 || password.length > 12) {
        validation.password = "Invalid password.";
        valid = false;
        validation.error = true;
    }
}

router.post("/register-user", (req, res) => {
    console.log("Values" + req.body)

    let validationSign = {};
    validationSign.error = false;
    let valid = true;
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    confirmUserData(firstName, lastName, email, password, confirmPassword, validationSign, valid);

    if (valid) {
        // salt password
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(password, salt);
        //save user #TODO break into functions
        let newUser = new UserModel({
            firstName: firstName,
            lastName: lastName,
            password: hash,
            email: email
        });

        newUser.save((err) => {
            if (err) {
                console.log(err.code);
                if(err.code == 11000){
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
                //sendEmail  #TODO break into functions
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


function confirmUserData(firstName, lastName, email, password, confirmPassword, validationSign, valid){
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
}

module.exports = router;