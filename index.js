// https://murmuring-brook-93964.herokuapp.com/ | https://git.heroku.com/murmuring-brook-93964.git

let express = require("express");
let HTTP_PORT = process.env.PORT || 8085;
let path = require("path");
let app = express();

var expressHandleBars = require('express-handlebars');
const e = require("express");
app.engine('.hbs', expressHandleBars({
    extname : '.hbs',
    defaultLayout : 'main'
}));
app.set('view engine', '.hbs');

function onHttpStart(){
    console.log("Express http server listening on : " + HTTP_PORT + "http://localhost:8085");
}
app.use(express.static(__dirname + '/public/'));

app.get("/", (req, res) =>  {
    let prod = require("./products.js").products;
    res.render('home',
     { data: prod} );
});

app.get("/on-the-menu", (req, res) =>  {
    let prod = require("./products.js");
    let breakfast = prod.products.filter( (product) => { if(product.category == "Breakfast") return product});
    let dinner = prod.products.filter( (product) => { if(product.category == "Dinner") return product});
    let salads = prod.products.filter( (product) => { if(product.category == "Salads") return product});
    let sandwiches = prod.products.filter( (product) => { if(product.category == "Burgers and Sandwiches")  return product});
    let soups = prod.products.filter( (product) => { if(product.category == "Soups") return product});
    
    res.render('on-the-menu',
     { 
         breakfastData: breakfast,
         dinnerData: dinner,
         saladsData: salads,
         sandwichesData: sandwiches,
         soupsData: soups,
    } );
});

// app.get("/cart", (req, res) => res.sendFile(path.join(__dirname, "/views/cart.html")));
app.listen(HTTP_PORT, onHttpStart);