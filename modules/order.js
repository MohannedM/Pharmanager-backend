const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    pharmacy: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    supplier: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, 
    medicines:[
        {
            medicine: {
                type: mongoose.Types.ObjectId,
                ref: 'Medicine',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    orderPrice:{
        type: Number,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Order', orderSchema);