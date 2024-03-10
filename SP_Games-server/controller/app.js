// importing modules needed
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");
const cors = require("cors");


// importing script from ../model/ folder
const User = require('../model/User');
const Category = require('../model/Category');
const Platform = require('../model/Platform');
const Game = require('../model/Game');
const Review = require('../model/Review');
const Cart = require('../model/Cart');
const Preference = require('../model/Preference');
const Purchase = require('../model/Purchase');

const SECRET_KEY = require('../config.js');
const Image = require('../model/Image'); // for image processing

const verifyToken = require('../auth/verifyToken');
const verifyAdmin = require('../auth/verifyAdmin');


// making middlewware
// https://www.npmjs.com/package/express-fileupload
var app = express();
app.use(fileUpload({ // allow express to handle file uploads
    limits: { fileSize: 1000000 }, // 1 mb limit
    limitHandler: (req, res) => {
        res.status(413).send({"message":"File size too large (must be less than 1 mb)"})
        return
    }
})); 
var urlencoderParser = bodyParser.urlencoded({extended:false});
app.use(bodyParser.json()); // parse application/json
app.use(urlencoderParser); // parse application/x-www-form-urlencoded
app.use(cors()) // allow cross origin requests

app.use((req, res, next) => {
    console.log(req.url)
    next()
})

// login
app.post("/login", (req, res) => {
    User.login(req.body.email, req.body.password, (err, result) => {
        if (err) {
            res.status(500).send({"message":"Server error"});
            return
        }
        console.log(result);
        if (result == null) {
            res.status(401).send({message:"Incorrect email or password"});
            return;
        }
        
        var payload = {
            userid: result[0].userid,
            username: result[0].username,
            role: result[0].type,
        }
        var token = jwt.sign(payload, SECRET_KEY, {
            algorithm: 'HS512',
            expiresIn: "2 days",
        })
        res.status(200).send({
            token: token,
            // userData: payload
        })
    })
})

app.get("/verify/token", verifyToken, (req, res) => {
    console.log("Logged in")
    res.status(200).send("Logged in")
})

app.get("/verify/admin", verifyToken, verifyAdmin, (req, res) => {
    console.log("is admin")
    res.status(200).send("Is admin")
})

// new ca2 api: get detailed info of a game on a platform
app.get('/game/:gid/platform/:platform', (req, res) => {
    Game.getGameDetails(req.params.gid, req.params.platform, (err, result) => {
        if (err) {
            if (err == 404) {
                res.status(404).send({"message":"Game cannot be found"});
                return;
            }
            res.status(500).send({"message":"Server error"});
            return;
        }
        res.status(200).send(result);
    })
})

// API 1
app.get('/users/', (req, res) => { 
    User.getAllUsers((err,result) => {
        if (err) {
            res.status(500).send({"message":"Server error"});
            return
        } else {
            res.status(200).send(result);
        }
    })
})

// API 2
// expected body: username, email, password, type, profile_pic_url
app.post('/users/', (req, res) => { 
    User.addUser(req.body, (err,result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") { // duplicate email
                res.status(422).send({"message":"Email is already in used"});
                return
            }
            res.status(500).send({"message":"Server error"});
            return
        } else {
            res.status(201).send(result);
        }
    })
})

// API 3
// ca2 edited: uses token to get user data
app.get('/user/', verifyToken, (req, res) => { 
    User.getUserbyID(req.decodedToken.userid, (err,result) => {
        if (err) {
            if (err === 404) {
                res.status(404).send({"message":"No user found"});
                return
            }
            res.status(500).send({"message":"Server error"});
            return
        } 
        res.status(200).send(result);
        
    })
})

// API 4
// expected body: catname, description
app.post("/category", (req, res) => {
    Category.addCat(req.body, (err) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") { // name used
                res.status(422).send({"message":"Category already exist"});
                return
            }
            res.status(500).send({"message":"Server error"});
            return
        } else {
            res.status(201).end(); // properly finish the response without sending anything
        }
    })
})

// API 5
// expected body: platform_name, description
app.post("/platform", verifyToken, verifyAdmin, (req, res) => {
    Platform.addPlatform(req.body, (err) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") { // name used
                res.status(422).send({"message":"Platform already exist"});
                return
            }
            res.status(500).send({"message":"Server error"});
            return
        } else {
            res.status(201).end();
        }
    })
})

// API 6
// expected body: title, description, price (comma seperated), platformid (comma seperated), categoryid (comma seperated), year
// ca2 edited: optional image
app.post("/game/", verifyToken, verifyAdmin, (req, res) => {
    try {
        var prices = req.body.price.split(",").map((x) => {
            if (isNaN(x)) { 
                throw "price should be numbers (up to 2 dp)"
            } else {
                return parseFloat(x) }
        });
    } catch (err) {
        console.log(err)
        res.status(422).send({"message":"price should be numbers (up to 2 dp)"});
        return;
    }
    try {
        var platformIDs = req.body.platformid.split(",").map((x) => {
            if (isNaN(x)) { 
                throw "platformid must be integers"
            } else {
                return parseInt(x) }
        });
        var categoryIDs = req.body.categoryid.split(",").map((x) => {
            if (isNaN(x)) { 
                throw "categoryid must be integers" 
            } else {
                return parseInt(x) }
        });
        // ensure all platform has a corresponding price and vice versa
        if (platformIDs.length != prices.length) throw "Number of platforms and number of prices must be same";
    } catch (err) {
        console.log(err)
        res.status(422).send({"message":"Number of platforms and number of prices must be same"});
        return;
    }
    try {
        var image = req.files.image;
        console.log(image);
        var fileIssue = Image.checkValid(image);
        if (fileIssue == 415) {
            res.status(415).send({"message":"File type not supported (must be jpg)"});
            return;
        } else if (fileIssue == 422) {
            res.status(422).send({"message":"File with same name exists on server"});
            return;
        }
    } catch { // in case they did not send a file 
        var image = null;
    }
    console.log(req.body)
    Game.addGameWithImage(req.body, platformIDs, prices, categoryIDs, image, (err, result) => {
        if (err) {
            console.log(err)
            if (err === "category") {
                res.status(422).send({"message":"One or more category does not exist"});
            return
            } else if (err === "platform") {
                res.status(422).send({"message":"One or more platform does not exist"});
            return
            }
            res.status(500).send({"message":"Server error"});
            return
        }
        res.status(201).send(result)
    })
})

// API 7 modified
// expected body - platform, title
// ca2 changed - parameters to search by platform, part of title, and sorting
app.get('/search/game/', (req, res) => { 
    Game.getGames(req.query.platform, req.query.title, req.query.sort, (err,result) => {
        if (err) {
            console.log(err)
            if (err == 404) {
                res.status(404).send({"message":"No games found"});
                return
            }
            if (err == 400) {
                res.status(400).send({"message":"Search by title and/or platform"});
                return
            }
            res.status(500).send({"message":"Server error"});
            return;
        } 
        res.status(200).send(result);
    })
})

// API 8
app.delete("/game/:id", (req, res) => {
    Game.deleteGame(req.params.id, (err) => {
        if (err) {
            res.status(500).send({"message":"Server error"});
            return;
        } 
        res.status(204).end();
    })
})

// API 9
// on app.js mostly same as API 6
// expected body: title, description, price (comma seperated), platformid (comma seperated), categoryid (comma seperated), year
app.put("/game/:id", (req, res) => {
    try {
        var prices = req.body.price.split(",").map((x) => {
            if (isNaN(parseFloat(x))) { 
                throw "price should be numbers (up to 2 dp)"
            } else {
                return parseFloat(x) }
        });
    } catch (err) {
        res.status(422).send({"message":err});
        return;
    }
    try {
        var platformIDs = req.body.platformid.split(",").map((x) => {
            if (isNaN(x)) { 
                throw "platformid must be integers"
            } else {
                return parseInt(x) }
        });
        var categoryIDs = req.body.categoryid.split(",").map((x) => {
            if (isNaN(x)) { 
                throw "categoryid must be integers" 
            } else {
                return parseInt(x) }
        });
        // ensure all platform has a corresponding price and vice versa
        if (platformIDs.length != prices.length) throw "Number of platforms and number of prices must be same";
    } catch (err) {
        res.status(422).send({"message":err});
        return;
    }
    Game.updateGame(req.params.id, req.body, platformIDs, prices, categoryIDs, (err) => {
        if (err) {
            if (err === "At least one platformid or categoryid does not exist") {
                res.status(500).send({"message":err});
            return
            }
            res.status(500).send({"message":"Server error"});
            return
        }
        res.status(204).end();
    })
})

// API 10
// expected body: content, rating
app.post("/game/:gid/review/", verifyToken, (req, res) => {
    if (isNaN(req.body.rating) || req.body.rating < 1 || req.body.rating > 5) {
        res.status(400).send({"message":"Rating should be an int between 1 and 5"});
        return;
    }
    Review.addNewReview(req.decodedToken.userid, req.params.gid, req.body, (err, result) => {
        if (err) {
            res.status(500).send({"message":"Server error"});
            return;
        } else {
            res.status(201).send(result);
        }
    })
})

// API 11
app.get('/game/:id/review', (req, res) => {
    Review.getReviewByGame(req.params.id, (err,result) => {
        if (err) {
            res.status(500).send({"message":"Server error"});
            return
        } else {
            res.status(200).send(result);
        }
    })
})

// ca2: get review by reviewID
app.get('/game/review/:reviewid', (req, res) => {
    Review.getReviewbyId(req.params.reviewid, (err, result) => {
        if (err) {
            res.status(500).send({"message":"Server error"});
            return
        } else {
            res.status(200).send(result);
        }
    })
})

// for reference
app.get('/platform', (req, res) => { 
    Platform.getPlatforms((err,result) => {
        if (err) {
            res.status(500).send({"message":"Server error"});
            return
        } else {
            res.status(200).send(result);
        }
    })
})

// advanced feature 1.1: upload game image
// expected body: image (contains file)
app.put("/game/:gid/image", (req, res) => {
    try {
        var image = req.files.image;
        console.log(image);
    } catch (err) { // in case they did not send a file or something happen
        console.log(err)
        res.status(500).send({"message":"Server error"});
        return;
    }
    var fileIssue = Image.checkValid(image);
    if (fileIssue == 415) {
        res.status(415).send({"message":"File type not supported (must be jpg)"});
        return;
    } else if (fileIssue == 422) {
        res.status(422).send({"message":"File with same name exists on server"});
        return;
    }

    Game.uploadGameImage(req.params.gid, image, (err) => {
        if (err) {
            if (err == "gameid does not exist") {
                res.status(422).send({"message":err});
                return;
            }
            res.status(500).send({"message":"Server error"});
            return;
        } 
        res.status(204).end();
    })
})

// advanced feature 1.2: get game image
app.get("/game/:gid/image", (req, res) => {
    Game.getGameImage(req.params.gid, (err,result) => {
        if (err) {
            if (err == "gameid does not exist") {
                res.status(422).send({"message":err});
                return;
            }
            res.status(500).send({"message":"Server error"});
            return
        }
        if (result.img_name == null) { // game does not have image
            res.status(404).send({"message":"Image for game does not exist"});
            return
        }
        // https://expressjs.com/en/api.html#res.sendFile
        res.sendFile(result.img_name, {root: "./gameImage/"}, (err) => {
            if (err) { // something goes wrong
                console.log(err)
                res.status(500).send({"message":"Server error"});
                return
            }
            // must be inside here
            res.status(200).end();
        })
    })
})

// advanced feature 3.1: add game to cart
// expected body: gameid, platformname
// ca2: modified to use authentication middleware to get userid instead of params, and platform name instead of id
app.post("/cart/game", verifyToken, (req, res) => {
    Cart.addToCart(req.decodedToken.userid, req.body, (err,result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") { 
                res.status(422).send({"message":"Item already in user's cart"});
                return
            }
            if (err == "Game not on specified platform") {
                res.status(404).send({"message":err});
                return
            }
            res.status(500).send({"message":"Server error"});
            return
        } else {
            res.status(201).send({"price":result});
        }
    })
})

// advanced feature 3.2: get user's cart
app.get("/cart/user/", verifyToken, (req, res) => {
    Cart.getUserCart(req.decodedToken.userid, (err,result) => {
        if (err) {
            if (err == "No user found") {
                res.status(404).send({"message":err});
                return
            }
            res.status(500).send({"message":"Server error"});
            return
        } 
        res.status(200).send(result);
    })
})

// advanced feature 3.3: remove game from cart
app.delete("/cart/game/", verifyToken,  (req, res) => {
    console.log(req.body)
    Cart.removeGameFromCart(req.decodedToken.userid, req.body.gameid, req.body.platformname, (err) => {
        if (err) {
            res.status(500).send({"message":"Server error"});
            return;
        } 
        res.status(204).end();
    })
})

// new feature: check if item is in cart or owned
app.get('/cart/game/:gameid/:platformname', verifyToken, (req, res) => {
    Cart.isItemInCart(req.decodedToken.userid, req.params.gameid, req.params.platformname, (err, result) => {
        if (err) {
            res.status(500).send({"message":"Server error"});
            return;
        } 
        res.status(200).send(result);
    })
})

// advanced feature 4.1: update user's preferences   
// expected body: categoryid (comma seperated ints)
app.put("/preference/user", verifyToken, (req, res) => {
    try {
        var category = req.body.categoryid.split(",").map((x) => {
            if (isNaN(x)) { 
                throw "categoryid should be integers"
            } else {
                return parseFloat(x) }
        });
    } catch (err) {
        console.log(err)
        res.status(422).send({"message":err});
        return;
    }
    Preference.updateUserpreference(req.decodedToken.userid, category, (err) => {
        if (err) {
            if (err == "Not all categories exist") {
                res.status(422).send({"message":err});
                return;
            }
            res.status(500).send({"message":"Server error"});
            return;
        }
        res.status(204).end();
    })
})

// advanced feature 4.2: view all users preferences  
app.get('/preference/', (req, res) => { 
    Preference.getAllPreference((err,result) => {
        if (err) {
            res.status(500).send({"message":"Server error"});
            return
        } else {
            res.status(200).send(result);
        }
    })
})

// advanced feature 4.3: recommend users top games in preference
app.get('/recommend/game/user/', verifyToken, (req, res) => { 
    Preference.recommendTopGames(req.decodedToken.userid, (err,result) => {
        if (err) {
            if (err == 404) {
                res.status(404).send({"message":"User has no preference"});
                return
            }
            res.status(500).send({"message":"Server error"});
            return
        } else {
            res.status(200).send(result);
        }
    })
})

//ca2 added: get a user's preferences categories
app.get('/preference/user/', verifyToken, (req, res) => {
    Preference.getUserPreference(req.decodedToken.userid, (err,result) => {
        if (err) {
            res.status(500).send({"message":"Server error"});
            return
        } else {
            res.status(200).send(result);
        }
    })
})

// ca2 added: get categories
app.get('/category', (req, res) => {
    Category.getAllCategories((err, result) => {
        if (err) {
            res.status(500).send({"message":"Server error"});
            return
        }
        res.status(200).send(result);
    })
})

// ca2 added: checkout
app.post('/checkout', verifyToken, (req, res) => {
    console.log(req.body)
    console.log(req.decodedToken)
    Cart.buyGames(req.decodedToken.userid, (err) => {
        if (err) {
            res.status(500).send({"message":"Server error"});
            return
        }
        res.status(201).send();
    })
})

// ca2 added: get purchased games
app.get('/purchased/user/', verifyToken, (req, res) => {
    Purchase.getAllUserGames(req.decodedToken.userid, (err, result) => {
        if (err) {
            res.status(500).send({"message":"Server error"});
            return
        }
        if (result.length == 0) {
            res.status(404).send({"message":"No games purchased"});
            return
        }
        res.status(200).send(result);
    })
})

module.exports = app;