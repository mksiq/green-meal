// https://murmuring-brook-93964.herokuapp.com/ | https://git.heroku.com/murmuring-brook-93964.git

let express = require("express");
let HTTP_PORT = process.env.PORT || 8085;
let path = require("path");
let app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));


var expressHandleBars = require('express-handlebars');
const e = require("express");
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

app.get("/sign-up", (req, res) => {
    let prod = require("./products.js").products;
    res.render('temp',
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
            breakfastData: breakfast,
            dinnerData: dinner,
            saladsData: salads,
            sandwichesData: sandwiches,
            soupsData: soups,
        });
});

function printUser(user){
    console.log(user);
}

app.post("/register-user", (req, res) => {
    const user = req.body;
 //   const jsonData = JSON.stringify(formData);
    printUser(user);

    console.log("Inside validate function" + user)


    let errorList = [];
    if (user.firstName == "" || user.firstName.length < 1) {
        errorList.push("First Name is mandatory\n");
    };

    if (user.lastName == "" || user.lastName.length < 1) {
        errorList.push("Last Name is mandatory\n");
    };

    if(user.email == "" || 
        !((user.email + "").match(/^[a-z0-9.!#$%&'*+\-\/=?^_`{|}~]+@(?=[a-z0-9])(?:[a-z0-9]|(?<![.-])\.|(?<!\.)-)*[a-z0-9]$/))){
            // regex copied from https://rgxdb.com/r/5TT0B86O
            errorList.push("Invalid E-mail\n");    
        }
    if (user.password == "" ||
            !((user.password + "").match(/[a-zA-Z0-9]{6,12}/)) ||
            !((user.password + "").match(/[0-9]/) != null) ||
            !((user.password + "").match(/[a-zA-Z]/) != null) ||
            !((user.password.length <= 12))) {
        errorList.push("Invalid password\n");
    }

    if (user.password != user.confirmPassword){
        errorList.push("Passwords do not match\n");
    }
    console.log(errorList)
});


// app.get("/cart", (req, res) => res.sendFile(path.join(__dirname, "/views/cart.html")));

app.use((req, res) => {
    if (res.status(404))
        res.render("error");
});

app.listen(HTTP_PORT, onHttpStart);

function validateFields(user) {

}