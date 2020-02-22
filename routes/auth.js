const express = require("express");
const authController = require("../controllers/auth");
const {check} = require("express-validator");

const router = express.Router();
router.post("/signup", [
    check('email').trim().isEmail().isLength({min: 4, max: 25}),
    check('name').trim().isLength({min: 6, max: 25}),
    check('companyType').trim().isLength({min: 7, max: 9}).custom(val => val === 'pharmacy' || val === 'supplier' ? Promise.resolve() : Promise.reject("Type is either pharamcy or supplier")),
    check('password').trim().isLength({min: 6, max: 25}),
    check('companyName').trim().isLength({min: 6, max: 25}),
    check('companyAddress').trim().isLength({min: 6, max: 25}),
    check('companyNumber').trim().isLength({min: 4, max: 25})
], authController.signup);

router.post("/login", [
    check('email').trim().isEmail().isLength({min: 4, max: 25}),
    check('password').trim().isLength({min: 6, max: 25})
], authController.login);

module.exports = router;