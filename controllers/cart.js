const Cart = require("../modules/cart");
const Medicine = require("../modules/medicine");
const User = require("../modules/user");

exports.createPurchase = async function(req, res, next){
    const quantity = req.body.quantity;
    const medicineId = req.body.medicineId;
    try{
        const currentUser = await User.findById(req.userId);
        if(req.companyType !== 'pharmacy' || !currentUser || currentUser.companyType !== 'pharmacy'){
            const error = new Error("Unauthorized");
            error.statusCode = 401;
            throw(error);
        }
        const fetchedMedicine = await Medicine.findById(medicineId);
        if(!fetchedMedicine){
            const error = new Error("Medicine was not found!");
            error.statusCode = 403;
            throw error;
        }
        if(fetchedMedicine.quantity < quantity){
            const error = new Error("Required quantity is larger than the stock available. Please try again!");
            error.statusCode = 403;
            throw error;
        }
        let cart = await Cart.findOne({user: req.userId});
        if(!cart){
            cart = new Cart({
                user: req.userId
            });
        }
        cart.medicines.push({medicine: medicineId, quantity});
        const savedCart = await cart.save();
        res.status(201).json({message: "Medicine(s) added to cart successfully!",
        medicine:{
            ...fetchedMedicine._doc,
            _id: fetchedMedicine._id.toString(),
            createdAt: fetchedMedicine.createdAt.toISOString(),
            updatedAt: fetchedMedicine.updatedAt.toISOString(),
            purchasedQuantity: quantity   
        },
        _id: savedCart.medicines[savedCart.medicines.length - 1]._id.toString()
    }); 
    }catch(error){
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    }

}

exports.getCart = async function(req, res, next){
    try{
        const user = await User.findById(req.userId);
        if(!user || req.companyType !== 'pharmacy' || user.companyType !== 'pharmacy'){
            const error = new Error("Unauthorized!");
            error.statusCode = 401;
            throw error;
        }
        const cart = await Cart.findOne({user: req.userId}).populate('medicines.medicine');
        res.status(200).json({cart});
    }catch(error){
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.deleteCartItem = async function(req, res, next){
    try{
        const user = await User.findById(req.userId);
        const cart = await Cart.findOne({user: req.userId});
        if(!user || req.companyType !== 'pharmacy' || user.companyType !== 'pharmacy' || !cart){
            const error = new Error("Unauthorized!");
            error.statusCode = 401;
            throw error;
        }
        cart.medicines.pull(req.params.cart_item_id);
        await cart.save();
        return res.status(200).json({success: "Ok", message: "Cart item deleted successfully!"});
    }catch(error){
        console.log(error)
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    }
}