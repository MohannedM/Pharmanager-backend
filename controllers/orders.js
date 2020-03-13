const Order = require("../modules/order");
const User = require("../modules/user");
const Cart = require("../modules/cart");
const Medicine = require("../modules/medicine");

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
                const fetchedMedicine = await Medicine.findById(obj[supId][i].medicine);
                fetchedMedicine.quantity -= obj[supId][i].quantity;
                if(fetchedMedicine.quantity < obj[supId][i].quantity){
                    const error = new Error("Quantity ordered is more than the quantity available!")
                    error.statusCode(400);
                    throw error;
                }
                // user.medicines.push()
                await fetchedMedicine.save();
            }
            order.medicines = medicines;
            order.orderPrice = orderPrice;
            await order.save();
            await Cart.findByIdAndDelete(req.body.cartId);
        }
        return res.status(201).json({success: 'Ok'});
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.getOrders = async function(req, res, next){
    try{
        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error("Unauthorized");
            error.statusCode = 404;
            throw error;
        }
        let condition = user.companyType === "pharmacy" ? {pharmacy: req.userId} : {supplier: req.userId};
        let populating = user.companyType === "supplier" ? "pharmacy" : "supplier";
        let orders = await Order.find(condition).populate(populating, "companyName").populate("medicines.medicine");
        return res.status(200).json({orders})
    }catch(error){
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    }
}