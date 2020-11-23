// https://murmuring-brook-93964.herokuapp.com/ | https://git.heroku.com/green-meal.git 
const dotenv = require('dotenv');
let express = require("express");
let expressHandleBars = require('express-handlebars');
const bodyParser = require('body-parser');
const generalController = require("./controllers/general");
const userController = require("./controllers/user");
const onTheMenu = require("./controllers/on-the-menu");
const productController = require("./controllers/products")

// TODO file upload
// const fileUpload = require('express-fileupload');

const session = require('express-session');

dotenv.config({path:"./config/keys.env"});

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('.hbs', expressHandleBars({
    extname: '.hbs',
    defaultLayout: 'main'
}));
app.set('view engine', '.hbs');

let HTTP_PORT = process.env.PORT;


app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
}))

app.use((req, res ,next)=>{
    res.locals.user = req.session.user;
    next();
});

function onHttpStart() {
    console.log("Express http server listening on : " + HTTP_PORT);
    if (HTTP_PORT == 8085)
        console.log("click here to open browser: " + "http://localhost:8085");
}

app.use(express.static(__dirname + '/public/'));


app.use("/", generalController);

app.use("/on-the-menu", onTheMenu);

app.use("/", userController);

app.use("/", productController);

app.use((req, res) => {
    if (res.status(404))
        res.render("general/error");
});

app.listen(HTTP_PORT, onHttpStart);
