function checkAdmin(req, res, next) {
    var userData = req.decodedToken;
    console.log(userData)
    if (userData.role != "Admin") {
        res.status(403).send({message:"Must be an admin"});
        return;
    }
    next();
} 

module.exports = checkAdmin;