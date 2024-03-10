// a model to primarily interact with the cart table

const db = require('./databaseConfig.js');

var Cart = {
    // advanced featre 3.1: add game to cart
    // added: dont allow if they already have item in cart
    addToCart: (userid, game, callback) => {
        
        var conn = db.getConnection();
        console.log(game.platformname)
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            var query = "SELECT price.* FROM price, platform AS p WHERE price.gameid=? AND p.platformname=? AND price.platformid=p.platformid;";
            conn.query(query, [game.gameid, game.platformname], (err, result) => {
                if (err) {
                    conn.end();
                    console.log(err);
                    return callback(err);
                }
                console.log(result);
                if (result.length == 0) {
                    conn.end();
                    return callback("Game not on specified platform");
                }
                query = "SELECT * FROM purchase WHERE userid=? AND gameid=? AND platformname=?;";
                conn.query(query, [userid, game.gameid, game.platformname], (err, result2) => {
                    if (err) {
                        conn.end();
                        console.log(err);
                        return callback(err);
                    }
                    console.log(result);
                    if (result2.length == 1) {
                        conn.end();
                        return callback("Already own game");
                    }
                    query = "INSERT INTO cart(userid, gameid, platformname) VALUES(?,?,?);";
                    conn.query(query, [userid, game.gameid, game.platformname], (err, result3) => {
                        conn.end();
                        if (err) {
                            console.log(err);
                            return callback(err,null);
                        }
                        console.log(result3);
                        return callback(null, result[0].price);
                    })
                })
            })
        })
    },
    // advanced featre 3.2: get user's cart
    getUserCart: (userid, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            var query = 'SELECT c.gameid, c.platformname, g.title, g.description, p.platformid, price.price, c.created_at AS "added time" FROM cart AS c, game AS g, platform AS p, price WHERE c.userid=? AND c.gameid=g.gameid AND c.platformname=p.platformname AND price.platformid=p.platformid AND price.gameid=g.gameid ORDER BY c.created_at;';
            conn.query(query, [userid], (err, result) => {
                if (err) {
                    conn.end();
                    console.log(err);
                    return callback(err,null);
                }
                console.log(result);
                // get username 
                query = "SELECT username FROM user WHERE userid=?;";
                conn.query(query, [userid], (err, result2) => {
                    conn.end();
                    if (err) {
                        console.log(err);
                        return callback(err,null);
                    }
                    if (result2.length == 0) {
                        return callback("No user found",null);
                    }
                    var total = 0
                    for (i of result) {
                        total += i.price;
                        i.price = i.price.toFixed(2);
                    }
                    return callback(null, {
                        "username": result2[0].username,
                        "cart": result.length ? result : null,
                        "total": total.toFixed(2)
                    });
                })
            })
        })
    },
    // advanced featre 3.3: remove game from cart
    removeGameFromCart: (userid, gameid, platformname, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            var query = "DELETE FROM cart WHERE userid=? AND gameid=? AND platformname=?;";
            conn.query(query, [userid, gameid, platformname], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                console.log(result);
                return callback(null);
            })
        })
    },
    // ca2 extra: query if item is in cart or purchased
    isItemInCart: (userid, gameid, platformname, callback) => {
        var conn = db.getConnection();
        console.log(userid, gameid, platformname)
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            let gameStatus = { own: false, cart: false }
            var query = "SELECT * FROM purchase WHERE userid=? AND gameid=? AND platformname=?;";
            conn.query(query, [userid, gameid, platformname], (err, result) => {
                if (err) {
                    conn.end();
                    console.log(err);
                    return callback(err, null);
                }
                console.log(result);
                if (result.length == 1) {
                    gameStatus.own = true
                    return callback(null, gameStatus);
                } 
                var query = "SELECT * FROM cart WHERE userid=? AND gameid=? AND platformname=?;";
                conn.query(query, [userid, gameid, platformname], (err, result) => {
                    conn.end();
                    if (err) {
                        console.log(err);
                        return callback(err, null);
                    }
                    console.log(result);
                    if (result.length == 1) {
                        gameStatus.cart = true
                    } 
                    return callback(null, gameStatus)
                })
            })
        })
    },
    // ca2 extra: put games on purchase table and remove from cart
    buyGames: (userid, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(er);
            }
            var query = 'SELECT * FROM cart WHERE userid=?;';
            conn.query(query, [userid], (err, result) => {
                if (err) {
                    conn.end();
                    console.log(err);
                    return callback(err);
                }
                console.log(result);
                if (result.length == 0) {
                    return callback(404)
                } 
                conn.beginTransaction((err) => {
                    if (err) {
                        conn.end();
                        console.log(err);
                        return callback(err);
                    }
                    query = "INSERT INTO purchase SELECT userid,gameid,platformname,NOW() FROM cart where userid=?;";
                    conn.query(query, [userid], (err, result2) => {
                        if (err) {
                            console.log(err);
                            conn.rollback();
                            return callback(err);
                        } 
                        query = "DELETE FROM cart WHERE userid=?;";
                        conn.query(query, [userid], (err, result3) => {
                            if (err) {
                                console.log(err);
                                conn.rollback();
                                return callback(err);
                            } 
                            conn.commit((err) => {
                                if (err) {
                                    console.log(err);
                                    return callback(err);
                                }
                                return callback(null);
                            })
                        })
                    })
                })
            })
        })
    }
}

module.exports = Cart;