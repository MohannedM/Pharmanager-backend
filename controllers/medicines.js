const User = require("../modules/user");
const Medicine = require("../modules/medicine");
const {validationResult} = require("express-validator");

exports.createMedicine = async function(req, res, next){
    if(!validationResult(req).isEmpty()){
        const error = new Error("Validation Failed! Entered data is incorrect.");
        error.statusCode = 400;
        next(error);
        return;
    }
    const name = req.body.name;
    const description = req.body.description;
    const expirationDate = new Date(req.body.expirationDate).getTime(); 
    const price = +req.body.price; 
    let quantity = +req.body.quantity;
    quantity = Math.floor(quantity); 

    try{
        const user = await User.findById(req.userId);
        if(!user){
            const error  = new Error("User not found!");
            error.statusCode = 401;
            throw error;
        }
        const medicineByName = await Medicine.findOne({name});
        if(medicineByName){
            const error  = new Error("You have already added a medicine with the same name.");
            error.statusCode = 400;
            throw error;
        }
        const currentDate = new Date().getTime();
        if(expirationDate < currentDate){
            const error  = new Error("Please add a future expiration date.");
            error.statusCode = 400;
            throw error;
        }
        if(req.companyType !== 'supplier'){
            const error  = new Error("Unauthorized");
            error.statusCode = 401;
            throw error;
        }
    
        const medicine = new Medicine({
            name,
            description,
            expirationDate,
            price,
            quantity,
            user: user._id
        });
    
        const savedMedicine = await medicine.save();
        user.medicines.push(savedMedicine._id);
        await user.save();
        return res.status(201).json({message: "Medicine created successfully.", medicine: {
            ...savedMedicine._doc,
            _id: savedMedicine._id.toString(),
            createdAt: savedMedicine.createdAt.toISOString(),
            updatedAt: savedMedicine.updatedAt.toISOString()
        }});
    }catch(error){
        console.log(error)
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getMedicines = async function(req, res, next){
    // let page = req.query.page || 1;
    // const perPage = 9;
    try{
        // const medicines = await Medicine.find().skip((page - 1) * perPage).limit(perPage);
        // const user = {medicines};
        const user = await User.findById(req.userId).populate('medicines');
        if(!user){
            const error  = new Error("User not found!");
            error.statusCode = 401;
            throw error;
        }
        return res.status(200).json({medicines: user.medicines});

    }catch(error){
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.updateMedicine = async function(req, res, next){
    if(!validationResult(req).isEmpty()){
        const error = new Error("Validation Failed! Entered data is incorrect.");
        error.statusCode = 400;
        next(error);
        return;
    }
    const name = req.body.name;
    const description = req.body.description;
    const expirationDate = new Date(req.body.expirationDate).getTime(); 
    const price = +req.body.price; 
    let quantity = +req.body.quantity;
    quantity = Math.floor(quantity); 
    const medicineId = req.params.medicine_id;
    try{
        const fetchedMedicine = await Medicine.findById(medicineId);
        if(!fetchedMedicine){
            const error  = new Error("Medicine not found!");
            error.statusCode = 400;
            throw error;
        }
        if(fetchedMedicine.user.toString() !== req.userId){
            const error  = new Error("Unauthorized!");
            error.statusCode = 401;
            throw error;
        }
        const medicineByName = await Medicine.findOne({name});
        if(medicineByName && name !== fetchedMedicine.name){
            const error  = new Error("You have already added a medicine with the same name.");
            error.statusCode = 400;
            throw error;
        }
        const currentDate = new Date().getTime();
        if(expirationDate < currentDate){
            const error  = new Error("Please add a future expiration date.");
            error.statusCode = 400;
            throw error;
        }
        if(req.companyType !== 'supplier'){
            const error  = new Error("Unauthorized");
            error.statusCode = 401;
            throw error;
        }

        fetchedMedicine.name = name;
        fetchedMedicine.description = description;
        fetchedMedicine.price = price;
        fetchedMedicine.expirationDate = expirationDate;
        fetchedMedicine.quantity = quantity;
        await fetchedMedicine.save();
        return res.status(200).json({message: "Medicine updated successfully"});

    }catch(error){
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.deleteMedicine = async function(req, res, next){
    const medicineId = req.params.medicine_id;
    try{
        const fetchedMedicine = await Medicine.findById(medicineId);
        if(!fetchedMedicine){
            const error  = new Error("Medicine not found!");
            error.statusCode = 400;
            throw error;
        }
        if(fetchedMedicine.user.toString() !== req.userId){
            const error  = new Error("Unauthorized!");
            error.statusCode = 401;
            throw error;
        }
        if(req.companyType !== 'supplier'){
            const error  = new Error("Unauthorized");
            error.statusCode = 401;
            throw error;
        }
        const user = await User.findById(req.userId);
        user.medicines.pull(medicineId);
        await user.save();
        await Medicine.findByIdAndRemove(medicineId);
        return res.status(200).json({message: "Medicine Deleted Successfully"});
    }catch(error){
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getMedicinesMarket = async function(req, res, next){
    const page = req.query.page || 1;
    const perPage = 9;

    try{
        if(req.companyType !== "pharmacy"){
            const error = new Error("Unauthorized!");
            error.statusCode = 401;
            throw error;
        }
        const fetchedMedicines = await Medicine.find().populate('user').sort([['createdAt','desc']]).skip((page - 1) * perPage).limit(perPage);
        const totalMedicinesCount = await Medicine.find().countDocuments();
        return res.status(200).json({medicines:fetchedMedicines, totalMedicinesCount})

    }catch(error){
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    }
    
}