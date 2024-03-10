// a model to primarily interact with the review table 

const db = require('./databaseConfig.js');

var Review = {
    // API 10
    addNewReview: (userid, gameid, review, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            var query = "INSERT INTO review(userid, gameid, content, rating) VALUES(?,?,?,?);";
            conn.query(query, [userid, gameid, review.content, review.rating], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                console.log(result);
                return callback(null,{"reviewid":result.insertId});
            })
        })
    },
    // API 11
    getReviewByGame: (gameid, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            var query = "SELECT r.gameid, r.content, r.rating, u.username, u.profile_pic_url, r.created_at FROM review AS r, user AS u WHERE r.userid=u.userid AND r.gameid=?;";
            conn.query(query, [gameid], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                for (x of result) {
                    x.gameid = String(x.gameid);
                }
                console.log(result);
                return callback(null,result);
            })
        })
    },
    getReviewbyId: (reviewid, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            var query = "SELECT r.gameid, r.content, r.rating, u.username, u.profile_pic_url, r.created_at FROM review AS r, user AS u WHERE r.userid=u.userid AND r.reviewid=?;";
            conn.query(query, [reviewid], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                console.log(result);
                return callback(null,result[0]);
            })
        })
    }
}

module.exports = Review;