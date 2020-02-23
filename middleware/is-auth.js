const jwt = require("jsonwebtoken");
const errorThrower = () => {
    const error = new Error("Authorization Failed!");
    error.statusCode = 401;
    throw error;
}
module.exports = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if(!authHeader){
        errorThrower();
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.decode(token);
    if(!decodedToken){
        errorThrower();
    }
    const tokenExpiration = new Date(decodedToken.exp * 1000).getTime(); 
    const currentDate = new Date().getTime();
    if(currentDate > tokenExpiration){
        errorThrower();
    }
    req.userId = decodedToken.userId;
    req.companyType = decodedToken.companyType;

    next();
}