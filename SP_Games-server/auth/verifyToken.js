const jwt = require('jsonwebtoken');
var SECRET_KEY = require('../config.js');

function check(req, res, next) {
    var authHeader = req.headers.authorization;
    console.log(authHeader)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).send({Message:"Must be logged in"});
        return;
    }
    var token = authHeader.replace("Bearer ","");
    jwt.verify(token, SECRET_KEY, {algorithms: "HS512"}, (err, decoded) => {
        if (err) {
            console.log(err)
            res.status(401).send({message:"Must be logged in"});
            // res.status(401).send(err);
            return;
        }
        req.decodedToken = decoded;
        next();
    })
} 

module.exports = check;