const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const cartController = require("../controllers/cart");


router.post("/cart", isAuth, cartController.createPurchase);

router.get("/cart", isAuth, cartController.getCart);

router.delete("/cart/:cart_item_id", isAuth, cartController.deleteCartItem);

router.delete("/cart", isAuth, cartController.deleteCart);


module.exports = router;