const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const authRoutes = require("./routes/auth");
const medicinesRoutes = require("./routes/medicines");
const cartRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");

app.use(bodyparser.json());

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return next();
});

app.use(authRoutes);
app.use(medicinesRoutes);
app.use(cartRoutes);
app.use(ordersRoutes);

app.use((error, req, res, next)=>{
    const status = error.statusCode || 500;
    const message = error.message;
    return res.status(status).json({message});
});

mongoose.connect("mongodb+srv://mohannedm:zip123@cluster0-usvsi.mongodb.net/pharmanager?retryWrites=true&w=majority")
.then(()=>{
    app.listen(8080);
}).catch(err=>{
    console.log(err);
});