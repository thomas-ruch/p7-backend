const sharp = require("sharp");
const path = require("path");

module.exports = (req, res, next) => {
  if (!req.file || !req.file.buffer) {
    return next();
  }

  let userId = "guest";
  try {
    if (req.body.book) {
      const book = JSON.parse(req.body.book);
      userId = book.userId ? book.userId.slice(0, 10) : "guest";
    }
  } catch (error) {
    res.status(500).json({ error });
  }

  const timestamp = Date.now();
  const outputFilename = `${userId}_${timestamp}.webp`;
  const outputPath = path.join(__dirname, "../images", outputFilename);

  sharp(req.file.buffer)
    .webp({ quality: 80 })
    .toFile(outputPath)
    .then(() => {
      req.file.filename = outputFilename;
      req.file.path = outputPath;
      next();
    })
    .catch(() => {
      res
        .status(500)
        .json({ error: "Erreur lors de la normalisation de l'image" });
    });
};
