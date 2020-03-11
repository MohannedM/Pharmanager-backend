const express = require("express");
const ordersController = require("../controllers/orders");
const isAuth = require("../middleware/is-auth");
const router = express.Router();

router.post('/orders', isAuth, ordersController.createOrder);

module.exports = router;