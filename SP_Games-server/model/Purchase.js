// ca2 added: table to store games users have bought

const db = require('./databaseConfig.js');

var Purchase = {
    // adds games to purchased and remove from cart
    getAllUserGames: (userid, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            var query = 'SELECT p.*,g.title FROM purchase AS p, platform, game AS g WHERE p.userid=? AND g.gameid=p.gameid AND p.platformname=platform.platformname;';
            conn.query(query, [userid], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err);
                    return callback(err,null);
                }
                console.log(result);
                return callback(null, result)
            })
        })
    }
}

module.exports = Purchase;
