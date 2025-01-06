const multer = require("multer");

// Définir les types MIME acceptés
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Configurer Multer avec memoryStorage
const storage = multer.memoryStorage();

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5 Mo
  fileFilter: (req, file, callback) => {
    const isValid = MIME_TYPES[file.mimetype];
    if (isValid) {
      callback(null, true);
    } else {
      callback(new Error("Type de fichier non supporté"), false);
    }
  },
}).single("image");
