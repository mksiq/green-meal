const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    ingredients: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number
    },
    servings: {
        type: Number,
        default: 1
    },
    cookingTime: {
        type: Number
    },
    calories: {
        type: Number
    },
    featured: {
        type: Boolean,
        default: false
    },
    available: {
        type: Boolean,
        default: true
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    },
    createdBy: {
        type: Number,
        default: 1
    }
});

const productModel = mongoose.model("Products", productSchema);

// Initial data on database
let products = [
    {
        id: 1,
        title: "Pumpkin Soup",
        ingredients: "pumpkin, spices, coconut milk",
        description: "Super creamy gently spiced pumpkin soup. Includes coconut milk, making a perfect meal for chill nights.",
        category: "Soups",
        price: 7.99,
        cookingTime: 40,
        calories: 700,
        featured: true,
        available: true
    },
    {
        id: 2,
        title: "Beans Salad",
        ingredients: "green beans, chick peas, figs, mediterranean bread, cucumber, sour cream, green olives, red pepper",
        description: "A delicious salad containing green beans, chick peas, figs, mediterranean bread, cucumber, sour cream, green olives, red pepper.",
        category: "Salads",
        price: 9.99,
        cookingTime: 15,
        calories: 700,
        featured: false,
        available: true
    },
    {
        id: 3,
        title: "Low cal Salad",
        ingredients: "Nuts, red onion, green and black olives, carrots, lettuce, and radish",
        description: "Very nutritive salad with nuts, red onion, green and black olives, carrots, lettuce, and radish.",
        category: "Salads",
        price: 6.55,
        cookingTime: 15,
        calories: 300,
        featured: false,
        available: true
    },
    {
        id: 4,
        title: "Veggie Pasta",
        ingredients: "Pasta, sliced spinach, parmesan cheese, mushrooms ",
        description: "Pasta covered in sliced spinach, parmesan cheese, and mushrooms.",
        category: "Dinner",
        price: 10.42,
        cookingTime: 30,
        calories: 1100,
        featured: true,
        available: true
    },
    {
        id: 5,
        title: "No carb Breakfast",
        ingredients: "Avocado, eggs, carrots, tomatoes, spinach, zucchini, spinach ",
        description: "A delicious breakfast with avocado, eggs, carrots, tomatoes, spinach, zucchini, and spinach.",
        category: "Breakfast",
        price: 6.81,
        cookingTime: 10,
        calories: 700,
        featured: false,
        available: true
    },
    {
        id: 6,
        title: "Black Sandwich",
        ingredients: "Black bread, tomatoes, carrots, beets, mushrooms, cabbage, white onion, red pepper ",
        description: "Sandwich with black bread, tomatoes, carrots, beets, mushrooms, cabbage, white onion, and red pepper.",
        category: "Sandwiches",
        price: 8.58,
        cookingTime: 10,
        calories: 6.0,
        featured: true,
        available: true
    },
    {
        id: 7,
        title: "Tofu Burger",
        ingredients: "Bread, pickles, red onion, fried tofu, jalapeño",
        description: "Plant-base burger with bread, pickles, red onion, fried tofu, and jalapeño.",
        category: "Sandwiches",
        price: 10.93,
        cookingTime: 15,
        calories: 900,
        featured: true,
        available: true
    },
    {
        id: 8,
        title: "Meatballs ",
        ingredients: "Plant-based meat balls, spaghetti, cheese",
        description: "Spaghetti with Plant-based meat balls, spaghetti, cheese",
        category: "Dinner",
        price: 13.92,
        cookingTime: 30,
        calories: 1200,
        featured: true,
        available: true
    },
    {
        id: 9,
        title: "Family Breakfast",
        ingredients: "Oatmeal, waffles, seasonal fruits, ",
        description: "Oatmeal, waffles, and seasonal fruits.",
        category: "Breakfast",
        price: 18.94,
        cookingTime: 40,
        calories: 1600,
        featured: false,
        available: true
    },
    {
        id: 10,
        title: "Veggie Curry",
        ingredients: "Carrot, eggplant, mushrooms, zucchini, bean pods, spices, white onion ",
        description: "Curry with carrot, eggplant, mushrooms, zucchini, bean pods, spices, and white onion.",
        category: "Dinner",
        price: 10.28,
        cookingTime: 40,
        calories: 700,
        featured: true,
        available: true
    },
    {
        id: 11,
        title: "Bagel Breakfast ",
        ingredients: "Bagel, avocado, bread, eggs, lettuce, tomato, olives, mushroom, cheese",
        description: "Bagel, avocado, bread, eggs, lettuce, tomato, olives, mushroom, and real cheddar cheese.",
        category: "Breakfast",
        price: 8.89,
        cookingTime: 40,
        calories: 1200,
        featured: true,
        available: true
    },
    {
        id: 12,
        title: "French Toast",
        ingredients: "Bread, bananas, berries, maple syrup ",
        description: "Delicious French Toast containing bread, bananas, berries, maple syrup .",
        category: "Breakfast",
        price: 7.59,
        cookingTime: 40,
        calories: 700,
        featured: true,
        available: true
    },
];


//Script to be run once:

const dotenv = require('dotenv');
dotenv.config({ path: "./config/keys.env" });

mongoose.connect(
    process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

//Insert all script. Do not uncomment
//saveProducts(products);
function saveProducts(productList){
    productList.forEach( product => {
        const newProduct = new productModel({
            title: product.title,
            ingredients: product.ingredients,
            description: product.description,
            category: product.category,
            price: product.price,
            cookingTime: product.cookingTime,
            calories: product.calories,
            featured: product.featured,
            available: product.available
        });
        newProduct.save( (err) => {
            if(err)
                console.log(err)
            else
                console.log(`${newProduct.title} Added to db`);
        })
    });
}

module.exports = productModel;