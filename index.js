// https://murmuring-brook-93964.herokuapp.com/ | https://git.heroku.com/green-meal.git | https://git.heroku.com/murmuring-brook-93964.git
let express = require("express");
let HTTP_PORT = process.env.PORT || 8085;

let app = express();

const dotenv = require('dotenv');
dotenv.config({path:"./config/keys.env"});



const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

let expressHandleBars = require('express-handlebars');

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

const generalController = require("./controllers/general");
const onTheMenu = require("./controllers/on-the-menu");

app.use("/", generalController);

app.use("/on-the-menu", onTheMenu);


// app.get("/cart", (req, res) => res.sendFile(path.join(__dirname, "/views/cart.html")));

app.use((req, res) => {
    if (res.status(404))
        res.render("general/error");
});

app.listen(HTTP_PORT, onHttpStart);