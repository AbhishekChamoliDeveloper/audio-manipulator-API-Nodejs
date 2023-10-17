const multer = require("multer");

const multerStorage = multer.memoryStorage();

const uploader = multer({ storage: multerStorage });

module.exports = uploader;
