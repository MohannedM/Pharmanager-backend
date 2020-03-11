const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const cartSchema = new Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    medicines: [
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
    ]
}, {timestamps: true});

module.exports = mongoose.model('Cart', cartSchema);