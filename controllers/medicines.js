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
    const quantity = +req.body.quantity; 

    try{
        const user = await User.findById(req.userId).populate("medicines");
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
    try{
        const user = await User.findById(req.userId).populate('medicines');
        if(!user){
            const error  = new Error("User not found!");
            error.statusCode = 401;
            throw error;
        }


        return res.status(200).json({medicines: user.medicines});

    }catch(error){
        console.log(error)
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    }
}