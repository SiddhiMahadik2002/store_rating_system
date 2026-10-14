const jwt = require("jsonwebtoken");

function verifyToken(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            message: "Token is required.Access denied"
        })
    }

    const token =authHeader.split(" ")[1];

    try{
        const decoded =jwt.verify(token, process.env.JWT_SECRET);
        req.user =decoded;
        next();
    }
    catch(error){
        return res.status(401).json({
            message: "Invalid token.Access denied"
        })
    }
}

function allowRoles(...roles){
    return(req,res,next)=>{
        if(!req.user || !roles.includes(req.user.role)){
            return res.status(403).json({
                message:"Acces denied. You do not have access"
            })
        }
        next();
    }
}

module.exports = {verifyToken, allowRoles};