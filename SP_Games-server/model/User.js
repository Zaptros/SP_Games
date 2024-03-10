// a model to primarily interact with the user table

const db = require('./databaseConfig.js');

var User = {
    // login
    login: (email, password, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            console.log(email, password)
            var query = "SELECT userid, username, email, type, profile_pic_url FROM user WHERE email=? AND password=?;";
            conn.query(query, [email, password], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err);
                    return callback(err,null);
                }
                console.log(result);
                if (result.length == 0) {
                    return callback(null, null)
                }
                return callback(null, result);
            })
        })
    },
    // API 1
    getAllUsers: (callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            var query = "SELECT * FROM user;";
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
    // API 2
    addUser: (user, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            if (!user.type) user.type = "Customer";
            var query = "INSERT INTO user(username, email, password, type, profile_pic_url) VALUES(?,?,?,?,?);";
            conn.query(query, [user.username, user.email, user.password, user.type, user.profile_pic_url], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err);
                    return callback(err,null);
                }
                console.log(result);
                return callback(null, {"userid":result.insertId});
            })
        })
    },
    // API 3
    getUserbyID: (userid, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err,null);
            }
            // brief specified profile pic url before type
            var query = "SELECT userid,username,email,profile_pic_url,type,created_at FROM user WHERE userid=?;";
            conn.query(query, [userid], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err);
                    return callback(err,null);
                }
                if (result.length == 0) {
                    return callback(404,null);
                }
                console.log(result);
                return callback(null, result[0]);
            })
        })
    }
}

module.exports = User;