const express = require("express");
const router = express.Router();
const {check} = require("express-validator");
const medicinesController = require("../controllers/medicines");
const isAuth = require("../middleware/is-auth");

router.post('/medicines', [
    check("name").trim().isLength({min: 4, max: 25}),
    check("description").trim().isLength({min: 10, max: 120}),
    check("expirationDate").trim().isLength({min: 4, max: 25}),
    check("price").trim().isLength({min: 1, max: 10}),
    check("quantity").trim().isLength({min: 1, max: 10})
], isAuth, medicinesController.createMedicine);

router.put('/medicines/:medicine_id', [
    check("name").trim().isLength({min: 4, max: 25}),
    check("description").trim().isLength({min: 10, max: 120}),
    check("expirationDate").trim().isLength({min: 4, max: 25}),
    check("price").trim().isLength({min: 1, max: 10}),
    check("quantity").trim().isLength({min: 1, max: 10})
], isAuth, medicinesController.updateMedicine);

router.delete("/medicines/:medicine_id", isAuth, medicinesController.deleteMedicine);

router.get("/medicines", isAuth, medicinesController.getMedicines);

router.get("/order/medicines", isAuth, medicinesController.getMedicinesMarket);

module.exports = router;