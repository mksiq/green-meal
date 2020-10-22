// https://murmuring-brook-93964.herokuapp.com/ | https://git.heroku.com/murmuring-brook-93964.git


// add models folder and put products in
let express = require("express");
let HTTP_PORT = process.env.PORT || 8085;
var nodemailer = require("nodemailer");
let app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'greenmealburner@gmail.com',
        pass: 'greenmeal' // 
    }
});

var expressHandleBars = require('express-handlebars');

app.engine('.hbs', expressHandleBars({
    extname: '.hbs',
    defaultLayout: 'main'
}));
app.set('view engine', '.hbs');

function onHttpStart() {
    console.log("Express http server listening on : " + HTTP_PORT);
    if (HTTP_PORT == 8085)
        console.log("click here to open browser: " + "http://localhost:8085");
}
app.use(express.static(__dirname + '/public/'));

app.get("/", (req, res) => {
    let prod = require("./products.js").products;
    res.render('home',
        { data: prod });
});

app.get("/on-the-menu", (req, res) => {
    let prod = require("./products.js");
    let breakfast = prod.products.filter((product) => { if (product.category == "Breakfast") return product });
    let dinner = prod.products.filter((product) => { if (product.category == "Dinner") return product });
    let salads = prod.products.filter((product) => { if (product.category == "Salads") return product });
    let sandwiches = prod.products.filter((product) => { if (product.category == "Sandwiches") return product });
    let soups = prod.products.filter((product) => { if (product.category == "Soups") return product });

    res.render('on-the-menu',
        {
            data: prod.products,
            breakfastData: breakfast,
            dinnerData: dinner,
            saladsData: salads,
            sandwichesData: sandwiches,
            soupsData: soups,
        });
});


app.post("/register-user", (req, res) => {
    let validationSign = {};
    validationSign.error = false;
    let valid = true;
    const { firstName, lastName, email, password, confirmPassword } = req.body;


    if (!firstName) {
        validationSign.firstName = "First Name is mandatory.";
        valid = false;
        validationSign.error = true;
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
    } else if(!password.match(/^[a-zA-Z0-9]{6,12}$/) || !password.match(/[0-9]/)  || !password.match(/[a-zA-Z]/)){
        validationSign.password = "Must have between 6 and 12 chars. Only letters and numbers, at least one of each.";
        valid = false;
        validationSign.error = true;
    }
    if (!confirmPassword) {
        validationSign.confirmPassword = "Please confirm password.";
        valid = false;
        validationSign.error = true;
    } else if (password != confirmPassword){
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



        res.render("home");
    } else {
            res.render("home", {
            validationSign: validationSign,
            signUpValues: req.body
        });
    }
});



app.post("/user-login", (req, res) => {
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
    if (valid) {
        res.render("home");
    } else {
        res.render("home", {
            validation: validation,
            loginValues: req.body
        });
    }
});




// app.get("/cart", (req, res) => res.sendFile(path.join(__dirname, "/views/cart.html")));

app.use((req, res) => {
    if (res.status(404))
        res.render("error");
});

app.listen(HTTP_PORT, onHttpStart);