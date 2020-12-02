const express = require("express");
const router = express.Router();

router.get("/cart", (req, res) => {
    res.render("cart/cart",{});
});


module.exports = router;