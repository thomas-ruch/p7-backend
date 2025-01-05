const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const extension = MIME_TYPES[file.mimetype];

    let userId = "guest";
    try {
      if (req.body.book) {
        const book = JSON.parse(req.body.book);
        userId = book.userId ? book.userId.slice(0, 10) : "image";
      }
    } catch (error) {
      console.error("Erreur lors du parsing de req.body.book :", error);
    }
    const timestamp = Date.now();
    const filename = `${userId}_${timestamp}.${extension}`;

    callback(null, filename);
  },
});

module.exports = multer({ storage: storage }).single("image");
