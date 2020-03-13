const express = require("express");
const ordersController = require("../controllers/orders");
const isAuth = require("../middleware/is-auth");
const router = express.Router();

router.post('/orders', isAuth, ordersController.createOrder);
router.get("/orders", isAuth, ordersController.getOrders)

module.exports = router;