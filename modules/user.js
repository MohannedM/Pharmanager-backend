const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    companyType:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    companyName:{
        type: String,
        required: true
    },
    companyAddress:{
        type: String,
        required: true
    },
    companyNumber: {
        type: String,
        required: true
    },
    medicines: [{
        type: Schema.Types.ObjectId,
        ref: 'Medicine'
    }]
});


module.exports = mongoose.model('User', userSchema);