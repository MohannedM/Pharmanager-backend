const Order = require("../modules/order");
const User = require("../modules/user");
const Cart = require("../modules/cart");

exports.createOrder = async function(req, res, next){
    try{
        const user = await User.findById(req.userId);
        const cart = await Cart.findById(req.body.cartId).populate('medicines.medicine');
        if(!user || !cart || cart.user.toString() !== req.userId){
            const error = new Error("User error!");
            error.statusCode = 400;
            throw error;
        } 
        const obj = {};
        let currentSupplier = '';
        let totalPrice = 0;
        cart.medicines.forEach((medicine, index)=>{
            currentSupplier = medicine.medicine.user.toString();
            if(!obj[currentSupplier]){
                obj[currentSupplier] = [];
            }
            obj[currentSupplier].push({medicine:  medicine.medicine._id.toString(), quantity: medicine.quantity, totalPrice: medicine.quantity * medicine.medicine.price});
            totalPrice += medicine.quantity * medicine._doc.price;
        });
        for(let supId in obj){ 
            const medicines = [];   
            let orderPrice = 0;        
            const order = new Order({
                supplier: supId,
                pharmacy: req.userId
            });
            for(let i = 0; obj[supId].length > i; i++){
                medicines.push({medicine: obj[supId][i].medicine, quantity: obj[supId][i].quantity});
                orderPrice += obj[supId][i].totalPrice
            }
            order.medicines = medicines;
            order.orderPrice = orderPrice;
            await order.save();
        }
        return res.status(201).json({success: 'Ok'});
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}