const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

module.exports = (req, res, next) => {
  if (!req.file || !req.file.filename) {
    return next();
  }

  const filename = req.file.filename;
  const inputPath = path.join(__dirname, "../images", filename);
  const outputFilename = `${path.parse(filename).name}.webp`;
  const outputPath = path.join(__dirname, "../images", outputFilename);

  sharp(inputPath)
    .webp({ quality: 80 })
    .toFile(outputPath)
    .then(() => {
      fs.unlink(inputPath, (error) => {
        if (error) {
          console.error("Erreur lors de la suppression du fichier : ", error);
        }

        // Mise à jour de req.file pour l'image normalisée
        req.file.filename = outputFilename;
        req.file.path = outputPath;

        next();
      });
    })
    .catch(() => {
      res
        .status(500)
        .json({ error: "Erreur lors de la normalisation de l'image" });
    });
};
