// a model to primarily interact with the category table

const db = require('./databaseConfig.js');

var Category = {
    addCat: (category, callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            
            var query = "INSERT INTO category(catname, description) VALUES(?,?);";
            conn.query(query, [category.catname, category.description], (err, result) => {
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
    getAllCategories: (callback) => {
        var conn = db.getConnection();
        conn.connect((err) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            
            var query = "SELECT * FROM category;";
            conn.query(query, [], (err, result) => {
                conn.end();
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                console.log(result);
                return callback(null, result);
            })
        })
    }
}

module.exports = Category;