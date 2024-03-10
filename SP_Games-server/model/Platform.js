// a model to primarily interact with the platform table

const db = require('./databaseConfig.js');

var Platform = {
    // API 5
    addPlatform: (platform, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            var query = "INSERT INTO platform(platformname, description) VALUES(?,?);";
            conn.query(query, [platform.platform_name, platform.description], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                console.log("id:" + result.insertId);
                return callback(null);
            })
        })
    },
    // get platforms
    getPlatforms: (callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            var query = "SELECT platformid,platformname FROM platform ORDER BY platformid;";
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
}

module.exports = Platform;