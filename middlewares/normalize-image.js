const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

module.exports = function normalizeImage(req, res, next) {
  if (!req.file || !req.file.filename) {
    return res.status(400).json({ error: "Aucun fichier fourni" });
  }

  const filename = req.file.filename;

  const inputPath = path.join(__dirname, "../images", filename);
  const outputFilename = `${path.parse(filename).name}.webp`;
  const outputPath = path.join(__dirname, "../images", outputFilename);

  console.log("inputPath :", inputPath);
  console.log("outputPath :", outputPath);

  sharp(inputPath)
    .webp({ quality: 80 })
    .toFile(outputPath)
    .then(() => {
      fs.unlink(inputPath, (error) => {
        if (error) {
          return res.status(500).json({});
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
