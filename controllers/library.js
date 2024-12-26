const Book = require("../models/Book");
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._userId;
  delete bookObject._id;

  normalizeImage_GPT(req.file.filename)
    .then((normalizedFilename) => {
      console.log(normalizedFilename);
      const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get(
          "host"
        )}/images/${normalizedFilename}`,
      });
      console.log("Livre :", book);
      book
        .save()
        .then(() => {
          res.status(201).json({ message: "Livre enregistré !" });
        })
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(518).json({ error }));
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )

          .then(() => res.status(200).json({ message: "Objet modifié !" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Objet supprimé !" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.rateBook = (req, res, next) => {
  console.log("Request for rating : ", req.body);
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const newRatings = book.ratings.filter(
        (rating) => rating.userId !== req.body.userId
      );
      newRatings.push({ userId: req.body.userId, grade: req.body.rating });

      book.ratings = newRatings;

      Book.updateOne({ _id: req.params.id }, { ratings: book.ratings })
        .then(() => res.status(200).json({ message: "Note mise à jour." }))
        .catch((error) => {
          console.error("Erreur lors de la mise à jour :", error);
          res.status(500).json({ error });
        });
    })
    .catch((error) => res.status(404).json({ error }));
};

// Fonction de mise en forme d'une image

function normalizeImage_Thomas(filename) {
  const inputPath = path.join(__dirname, "../images", filename);
  console.log("inputPath :", inputPath);
  const outputPath = path.join(
    __dirname,
    "../images",
    `${path.parse(filename).name}.webp`
  );
  console.log("outpath", outputPath);

  sharp(inputPath)
    .webp({ quality: 80 })
    .toFile(outputPath)
    .then(() => {
      console.log("Conversion réussie :", outputPath);

      fs.unlink(inputPath, (error) => {
        if (error) {
          console.error("Erreur lors de la suppression de l'image :", error);
        } else {
          console.log("Image originale supprimée :", inputPath);
        }

        return `${path.parse(filename).name}.webp`;
      });
    })
    .catch((error) => console.error("Erreur de normalisation :", error));
}

function normalizeImage_GPT(filename) {
  const inputPath = path.join(__dirname, "../images", filename);
  console.log("inputPath :", inputPath);
  const outputPath = path.join(
    __dirname,
    "../images",
    `${path.parse(filename).name}.webp`
  );
  console.log("outpath", outputPath);

  return sharp(inputPath) // Retour de la promesse
    .webp({ quality: 80 })
    .toFile(outputPath)
    .then(() => {
      console.log("Conversion réussie :", outputPath);

      // Supprime l'image d'origine
      return new Promise((resolve, reject) => {
        fs.unlink(inputPath, (error) => {
          if (error) {
            console.error("Erreur lors de la suppression de l'image :", error);
            return reject(error); // Rejet en cas d'erreur
          }
          console.log("Image originale supprimée :", inputPath);
          resolve(`${path.parse(filename).name}.webp`); // Résolution avec le nom de fichier WebP
        });
      });
    });
}
