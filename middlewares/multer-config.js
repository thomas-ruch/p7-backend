const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.memoryStorage();

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const isValid = MIME_TYPES[file.mimetype];
    if (isValid) {
      callback(null, true);
    } else {
      callback(new Error("Type de fichier non supporté"), false);
    }
  },
}).single("image");
