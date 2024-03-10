// a model to primarily interact with the game table (and the intermedite tables)

const db = require('./databaseConfig.js');
const Image = require('./Image'); // for image processing
const path = require('path');
const imgFolder = "./gameImage/";

var Games = {
    // API 6
    addGame: (game, platformIDs, prices, categoryIDs, callback) => {
    // platformIDs and categoryIDs are arrays
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            // check if all IDs needed exist
            var query = "SELECT p.platformid,c.categoryid FROM sp_games.platform AS p, category AS c WHERE p.platformid IN (?) AND c.categoryid IN (?);";
            conn.query(query, [platformIDs, categoryIDs], (err, result) => {
                if (err) {
                    conn.end();
                    console.log(err);
                    return callback(err, null);
                }
                if (result.length != platformIDs.length * categoryIDs.length) {
                    conn.end();
                    return callback("At least one platformid or categoryid does not exist", null);
                }
                query = "INSERT INTO game (title,description,year) VALUES(?,?,?);";
                conn.query(query, [game.title, game.description, game.year], (err, result) => {
                    if (err) {
                        conn.end();
                        console.log(err);
                        return callback(err, null);
                    } 
                    var gameid = result.insertId;

                    query = "INSERT INTO price(gameid, platformid, price) VALUES ?;"
                    // insert many values at once in the same table
                    var valuesP = []
                    for (let i=0; i < platformIDs.length; i++) {
                        valuesP.push([gameid, platformIDs[i], prices[i]]);
                    }
                    conn.query(query, [valuesP], (err, result2) => {
                        if (err) {
                            conn.end();
                            console.log(err);
                            return callback(err, null);
                        } 
                        console.log(result2);

                        query = "INSERT INTO gamesByCategory(gameid, categoryid) VALUES ?;";
                        var valuesC = []
                        for (let i=0; i < categoryIDs.length; i++) {
                            valuesC.push([gameid, categoryIDs[i]]);
                        }
                        conn.query(query, [valuesC], (err, result3) => {
                            conn.end();
                            if (err) {
                                console.log(err);
                                return callback(err, null);
                            } 
                            console.log(result3);
                            return callback(null, {"gameid":gameid});
                        })
                    })
                })          
            })
        })
    }, 
    // ca2 added: add game with image
    // using rollbacks
    // https://knowledgeacademy.io/node-js-mysql-transaction/
    addGameWithImage: (game, platformIDs, prices, categoryIDs, image, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            conn.beginTransaction((err) => {
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                var query = "INSERT INTO game (title,description,year) VALUES(?,?,?);";
                conn.query(query, [game.title, game.description, game.year], (err, result) => {
                    if (err) {
                        conn.rollback();
                        console.log(err);
                        return callback(err, null);
                    } 
                    var gameid = result.insertId;

                    query = "INSERT INTO price(gameid, platformid, price) VALUES ?;"
                    // insert many values at once in the same table
                    var valuesP = []
                    for (let i=0; i < platformIDs.length; i++) {
                        valuesP.push([gameid, platformIDs[i], prices[i]]);
                    }
                    conn.query(query, [valuesP], (err, result2) => {
                        if (err) {
                            conn.rollback();
                            console.log(err);
                            return callback("platform", null);
                        } 
                        console.log(result2);

                        query = "INSERT INTO gamesByCategory(gameid, categoryid) VALUES ?;";
                        var valuesC = []
                        for (let i=0; i < categoryIDs.length; i++) {
                            valuesC.push([gameid, categoryIDs[i]]);
                        }
                        conn.query(query, [valuesC], (err, result3) => {
                            if (err) {
                                conn.rollback();
                                console.log(err);
                                return callback("category", null);
                            } 
                            console.log(result3);
                            if (image == null) {
                                // commit to actually write the transactions into database
                                conn.commit((err) => {
                                    if (err) {
                                        console.log(err);
                                        return callback(err, null);
                                    }
                                    return callback(null, {"gameid":gameid});
                                })
                            } else {
                                // adding image
                                var imgName = image.name
                                var filePath = path.join(imgFolder, imgName)
                                image.mv(filePath, (err) => {
                                    if (err) {
                                        conn.rollback();
                                        return callback(err)
                                    }
                                    console.log(filePath);
                                    var query = "UPDATE game SET img_name=? WHERE gameid=?;";
                                    conn.query(query, [imgName, gameid], (err) => {
                                        if (err) {
                                            conn.rollback();
                                            return callback(err);
                                        }
                                        // commit to actually write the transactions into database
                                        conn.commit((err) => {
                                            if (err) {
                                                console.log(err);
                                                return callback(err, null);
                                            }
                                            return callback(null, {"gameid":gameid});
                                        })
                                    })
                                })
                            }
                        })
                    })
                })          
            })
        })
    }, 
    // API 7
    getGamesByPlatform: (platform, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            var query = 'SELECT g.gameid, g.title, g.description, gp.price, p.platformname AS platform, "" AS catid, "" AS catname, g.year, g.created_at FROM game AS g, platform AS p, price AS gp WHERE p.platformname=? AND p.platformid = gp.platformid AND gp.gameid = g.gameid;';
            conn.query(query, [platform], (err, result) => {
                if (err) {
                    conn.end();
                    console.log(err);
                    return callback(err,null);
                }
                console.log(result)
                if (result.length === 0) {
                    conn.end();
                    return callback("No games found on platform or plaform does not exist", null); // empty in IN clause is an issue so we end it here if no games were found
                }
                // order is out sometimes, make it nicer
                query = "SELECT gc.gameid, c.categoryid, c.catname FROM gamesByCategory AS gc, category AS c WHERE gc.gameid IN (?) AND c.categoryid=gc.categoryid ORDER BY c.categoryid;";
                conn.query(query, [result.map(x => x.gameid)], (err, result) => {
                    conn.end();
                    if (err) {
                        console.log(err);
                        return callback(err,null);
                    }
                    console.log(result)
                    for (i of result) {
                        i.catid = [];
                        i.catname = [];
                        for (let j=0; j < result.length; j++) {
                            if (result[j].gameid === i.gameid) {
                                i.catid.push(result[j].categoryid);
                                i.catname.push(result[j].catname);
                            }
                        }
                        i.catid = i.catid.join(', ');
                        i.catname = i.catname.join(', ');
                        i.price = i.price.toFixed(2);
                    }
                    return callback(null, result);
                })
            })
        })
    },
    // API 8
    deleteGame: (gameid, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            var query = "DELETE FROM game WHERE gameid=?;";
            conn.query(query, [gameid], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err);
                    return callback(err,null);
                }
                console.log(result);
                return callback(null);
            })
        })
    },
    // API 9
    updateGame: (gameid, game, platformIDs, prices, categoryIDs, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            // same as API 6, check if new categories and platforms exist before doing anything
            var query = "SELECT p.platformid,c.categoryid FROM sp_games.platform AS p, category AS c WHERE p.platformid IN (?) AND c.categoryid IN (?);";
            conn.query(query, [platformIDs, categoryIDs], (err, result) => {
                if (err) {
                    conn.end();
                    console.log(err);
                    return callback(err);
                }
                if (result.length != platformIDs.length * categoryIDs.length) {
                    conn.end();
                    return callback("At least one platformid or categoryid does not exist");
                }
                var query = "UPDATE game SET title=?, description=?, year=? WHERE gameid=?;";
                conn.query(query, [game.title , game.description , game.year , gameid], (err) => {
                    if (err) {
                        conn.end();
                        console.log(err);
                        return callback(err, null);
                    } 
                    // remove existing category and platforms first
                    // delete from both in one statement using inner join
                    query = "DELETE gc,p FROM gamesByCategory AS gc INNER JOIN price AS p WHERE gc.gameid=p.gameid AND p.gameid=?;";
                    conn.query(query, [gameid], (err) => {
                        if (err) {
                            conn.end();
                            console.log(err);
                            return callback(err);
                        }
                        
                        // next 2 queries same as API 6
                        query = "INSERT INTO price(gameid, platformid, price) VALUES ?;"
                        // insert many values at once in the same table
                        var valuesP = []
                        for (let i=0; i < platformIDs.length; i++) {
                            valuesP.push([gameid, platformIDs[i], prices[i]]);
                        }
                        conn.query(query, [valuesP], (err, result2) => {
                            if (err) {
                                conn.end();
                                console.log(err);
                                return callback(err);
                            } 
                            console.log(result2);

                            query = "INSERT INTO gamesByCategory(gameid, categoryid) VALUES ?;";
                            var valuesC = []
                            for (let i=0; i < categoryIDs.length; i++) {
                                valuesC.push([gameid, categoryIDs[i]]);
                            }
                            conn.query(query, [valuesC], (err, result3) => {
                                conn.end();
                                if (err) {
                                    console.log(err);
                                    return callback(err);
                                } 
                                console.log(result3);
                                return callback(null);
                            })
                        })
                    })
                })
            })
        })
    },
    // advanced feature 1.2: get game image
    getGameImage: (gameid, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            var query = "SELECT gameid,img_name FROM game WHERE gameid=?;";
            conn.query(query, [gameid], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err);
                    return callback(err,null);
                }
                console.log(result);
                if (result.length == 0) {
                    return callback("gameid does not exist")
                }
                return callback(null, result[0]);
            })
        })
    },
    // for searching games
    getGames: (platform, title, sort, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            var query = 'SELECT g.gameid, g.title, g.description, gp.price, p.platformname AS platform, "" AS catid, "" AS catname, g.year, g.created_at FROM game AS g, platform AS p, price AS gp WHERE p.platformid = gp.platformid AND gp.gameid = g.gameid';
            var searchByTitle = ' AND g.title like ?'
            var searchByPlatform = ' AND p.platformname=?'
            var queryParams = [];
            // if (!(platform || title)) {
            //     return callback(400, null)
            // }
            if (platform) {
                query += searchByPlatform;
                queryParams.push(platform);
            }
            if (title) {
                query += searchByTitle;
                queryParams.push(`%${title}%`);
            }
            if (sort) {
                switch(sort.split(' ')[0]) {
                    case 'Price':
                        query += ' ORDER BY gp.price';
                        break;
                    case 'Platform':
                        query += ' ORDER BY p.platformname';
                        break;
                    default: 
                        query += ' ORDER BY g.title';
                }
                if (sort.split(' ')[1] == 'Desc') {
                    query += ' DESC'
                } 
            } else {
                query += ' ORDER BY g.title';
            }
            query += ';';

            console.log(query)
            conn.query(query, queryParams, (err, result) => {
                if (err) {
                    conn.end();
                    console.log(err);
                    return callback(err,null);
                }
                console.log(result)
                if (result.length === 0) {
                    conn.end();
                    return callback(404, null); // empty in IN clause is an issue so we end it here if no games were found
                }
                // order is out sometimes, make it nicer
                query = "SELECT gc.gameid, c.categoryid, c.catname FROM gamesByCategory AS gc, category AS c WHERE gc.gameid IN (?) AND c.categoryid=gc.categoryid ORDER BY c.categoryid;";
                conn.query(query, [result.map(x => x.gameid)], (err, result2) => {
                    conn.end();
                    if (err) {
                        console.log(err);
                        return callback(err,null);
                    }
                    console.log(result2)
                    for (i of result) {
                        i.catid = [];
                        i.catname = [];
                        for (let j=0; j < result2.length; j++) {
                            if (result2[j].gameid === i.gameid) {
                                i.catid.push(result2[j].categoryid);
                                i.catname.push(result2[j].catname);
                            }
                        }
                        i.catid = i.catid.join(', ');
                        i.catname = i.catname.join(', ');
                        i.price = i.price.toFixed(2);
                    }
                    return callback(null, result);
                })
            })
        })
    },
    getGameDetails: (gameid, platform, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            // brief specified profile pic url before type
            var query = "SELECT g.*,price.*,p.platformname FROM game AS g, price, platform AS p WHERE g.gameid=? AND p.platformname=? AND price.gameid=g.gameid AND price.platformid=p.platformid;";
            conn.query(query, [gameid, platform], (err, result) => {
                if (err) {
                    conn.end();
                    console.log(err);
                    return callback(err,null);
                }
                if (result.length == 0) {
                    return callback(404, null)
                }
                console.log(result);
                query = "SELECT p.platformname FROM platform AS p, price WHERE p.platformid=price.platformid AND price.gameid=?;"
                conn.query(query, [gameid, platform], (err, result2) => {
                    if (err) {
                        conn.end();
                        console.log(err);
                        return callback(err,null);
                    }
                    result[0].allplatforms = result2;
                    // console.log(result)
                    query = "SELECT c.* FROM gamesByCategory AS gc, category AS c WHERE gc.gameid=? AND c.categoryid=gc.categoryid ORDER BY c.categoryid;";
                    conn.query(query, gameid, (err, result3) => {
                        conn.end();
                        if (err) {
                            console.log(err);
                            return callback(err,null);
                        }
                        var catname = [];
                        var catdescription = []
                        result3.forEach(cat => {
                            catname.push(cat.catname)
                            catdescription.push(cat.description)

                        });
                        result[0].catname = catname;
                        result[0].catdescription = catdescription;
                        return callback(null, result[0]);
                    })
                    
                })
            })
        })
    }
}

module.exports = Games;
