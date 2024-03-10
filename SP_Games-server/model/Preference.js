// a model to primarily interact with the preference table

const Category = require('./Category.js');
const db = require('./databaseConfig.js');

var Preference = {
    updateUserpreference: (userid, category, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            // check if categories exist first
            var query = "SELECT * FROM category WHERE categoryid IN (?);";
            conn.query(query, [category], (err, result) => {
                if (err) {
                    conn.end();
                    console.log(err);
                    return callback(err);
                }
                console.log(result);
                if (result.length != category.length) {
                    conn.end();
                    return callback("Not all categories exist");
                }
                // delete
                query = "DELETE FROM preference WHERE userid=?;";
                conn.query(query, [userid], (err) => {
                    if (err) {
                        conn.end();
                        console.log(err);
                        return callback(err);
                    }
                    // insert
                    query = "INSERT INTO preference (userid, categoryid) VALUES ?;";
                    var preferenceArr = []
                    for (i of category) {
                        preferenceArr.push([userid,i]);
                    }
                    conn.query(query, [preferenceArr], (err, result) => {
                        conn.end();
                        if (err) {
                            console.log(err);
                            return callback(err);
                        }
                        console.log(result);
                        return callback(null);
                    })
                })
            })
        })
    },
    getAllPreference: (callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            var query = "SELECT p.*, c.catname FROM preference AS p, category AS c WHERE p.categoryid=c.categoryid ORDER BY p.userid;";
            conn.query(query, (err, result) => {
                conn.end();
                if (err) {
                    console.log(err);
                    return callback(err,null);
                }
                console.log(result);
                return callback(null, result);
            })
        })
    },
    // ca2 adjusted: top 5 instead of 3, simplified
    recommendTopGames: (userid, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            // get prefered platforms
            var query = "SELECT categoryid FROM preference WHERE userid=?;";
            conn.query(query, [userid], (err, result) => {
                if (err) {
                    conn.end();
                    console.log(err);
                    return callback(err,null);
                }
                console.log(result);
                if (result.length == 0) {
                    return callback(404,null)
                }
                let catIds = []
                result.forEach(category => {
                    catIds.push(category.categoryid)
                });
                console.log(catIds)

                query = "SELECT g.gameid, g.title, g.description, AVG(r.rating) AS avgrating FROM review AS r, game AS g, gamesbycategory AS gc WHERE gc.categoryid IN (?) AND gc.gameid=g.gameid AND g.gameid=r.gameid GROUP BY r.gameid ORDER BY avgrating DESC LIMIT 5;";
                conn.query(query, [catIds], (err, result2) => {
                    if (err) {
                        conn.end();
                        console.log(err);
                        return callback(err,null);
                    }
                    console.log(result2);
                    let gameIds = []
                    result2.forEach(game => {
                        gameIds.push(game.gameid)
                        game.platforms = []
                        game.categories = []
                    });
                    console.log(gameIds)

                    query = "SELECT g.gameid, p.platformname FROM game AS g, price, platform AS p WHERE g.gameid IN (?) AND g.gameid=price.gameid AND price.platformid=p.platformid;";
                    conn.query(query, [gameIds], (err, result3) => {
                        if (err) {
                            conn.end();
                            console.log(err);
                            return callback(err,null);
                        }
                        console.log(result3)
                        result3.forEach(plat => {
                            result2.forEach(game => {
                                if (game.gameid == plat.gameid) {
                                    game.platforms.push(plat.platformname)
                                }
                            });
                        });
                        console.log(result2)
                        query = "SELECT g.gameid, c.catname FROM game AS g, gamesbycategory AS gc, category AS c WHERE g.gameid IN (?) AND g.gameid=gc.gameid AND c.categoryid=gc.categoryid;";
                        conn.query(query, [gameIds], (err, result4) => {
                            conn.end();
                            if (err) {
                                console.log(err);
                                return callback(err,null);
                            }
                            console.log(result4)
                            result4.forEach(cat => {
                                result2.forEach(game => {
                                    if (game.gameid == cat.gameid) {
                                        game.categories.push(cat.catname)
                                    }
                                });
                            });
                            console.log(result2)  
                            return callback(null, result2);
                        })
                    })
                })
            })
        })
    },
    getUserPreference: (userid, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            var query = "SELECT p.categoryid, c.catname FROM preference AS p, category AS c WHERE p.userid=? AND c.categoryid=p.categoryid;";
            conn.query(query, [userid], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err);
                    return callback(err,null);
                }
                console.log(result);
                return callback(null, result);
            })
        })
    },
}

module.exports = Preference;