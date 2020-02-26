const bcrypt = require("bcryptjs");
const User = require("../modules/user");
const {validationResult} = require("express-validator");
const jwt = require("jsonwebtoken");

exports.signup = async function (req, res, next){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error("Validation Failed! Entered data is incorrect.");
        error.statusCode = 422;
        next(error);
        return;
    }
    const email = req.body.email;
    try{
        const userEmail = await User.findOne({email});
        if(userEmail){
            const error = new Error("Email already exists");
            error.statusCode = 400;
           throw error;
        }

        const companyNumber = req.body.companyNumber;
        const userNumber = await User.findOne({companyNumber});
        if(userNumber){
            const error = new Error("Company Number already exists");
            error.statusCode = 400;
           throw error;
        }
        const name = req.body.name;
        const companyType = req.body.companyType;
        const password = req.body.password;
        const companyName = req.body.companyName;
        const companyAddress = req.body.companyAddress;
        const encryptedPassword = await bcrypt.hash(password, 12);
    
        const newUser = new User({
            name,
            email,
            companyType,
            password: encryptedPassword,
            companyName,
            companyAddress,
            companyNumber
        });
        const savedUser = await newUser.save();
        const token = jwt.sign({userId: savedUser._id.toString(), email: savedUser.email, companyType: savedUser.companyType}, 'thesupersecret', {expiresIn: '1h'});
        return res.status(201).json({message: "User created successfully", userData: {
            name: savedUser.name, 
            email: savedUser.email,
            companyName: savedUser.companyName,
            companyType: savedUser.companyType,
            companyAddress: savedUser.companyAddress,
            companyNumber: savedUser.companyNumber,
            token
        }});
    }catch(error){
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.login = async function (req, res, next){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error("Validation Failed! Entered data is incorrect.");
        error.statusCode = 422;
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    try{
        const user = await User.findOne({email});
        if(!user){
            const error = new Error("Incorrect email or password.");
            error.statusCode = 401;
            throw error;
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual){
            const error = new Error("Incorrect email or password.");
            error.statusCode = 401;
            throw error;
        } 

        const token = jwt.sign({userId: user._id.toString(), email: user.email, companyType: user.companyType}, 'thesupersecret', {expiresIn: '1h'});
        return res.status(200).json({message: "Login Success", userData: {
            name: user.name, 
            email: user.email,
            companyType: user.companyType,
            companyAddress: user.companyAddress,
            companyNumber: user.companyNumber,
            companyName: user.companyName,
            token
        }});

    }catch(error){
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    }
};