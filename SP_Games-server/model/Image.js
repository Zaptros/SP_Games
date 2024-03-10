// model to deal with images
// reference: https://www.npmjs.com/package/express-fileupload
// https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback 

const path = require('path');
const fs = require('fs');

// const maxSize = 1000000 // limit 1 mb
const fileType = 'image/jpeg' // only jpg allowed
const folder = "./gameImage/"

var Image = {
    createPath: (filename) => {
        // in case extension is not jpg
        var filename = filename.split('.');
        filename[filename.length - 1] = 'jpg';
        filename = filename.join(".");

        filename = filename.replaceAll(' ','_'); // replace blanks in file name with underscore
        return path.join(folder, filename);
    },
    checkValid: (img) => { // returns string if something is not ok 
        console.log(img.size)
        console.log(img.mimetype)
        if (img.mimetype != fileType) {
            return 415;
        } else if (fs.existsSync(Image.createPath(img.name))) {
            return 422;
        }
        return null;
    },
    deleteImage: (oldPath) => {
        fs.unlink(oldPath, (err) => {
            if (err) throw err;
            console.log("Removed " + oldPath);
        })
    }
}

module.exports = Image;