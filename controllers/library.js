const Book = require("../models/Book");
const fs = require("fs");
const average = require("../utils/average");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);

  delete bookObject._id;

  console.log("BookObject : ", bookObject);

  if (
    bookObject.ratings.some(
      (element) => element.userId === bookObject.userId && element.grade === 0
    )
  ) {
    bookObject.ratings = [];
    bookObject.averageRating = 0;
  }

  const book = new Book({
    ...bookObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré" });
    })
    .catch((error) => res.status(400).json({ error }));
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

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "Requête non autorisée" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié" }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "Requête non autorisée" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Objet supprimé" }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
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
    .catch((error) => res.status(404).json({ error }));
};

exports.rateBook = (req, res, next) => {
  if (req.body.rating < 0 || req.body.rating > 5) {
    return res
      .status(400)
      .json({ message: "La note doit être comprise entre 0 et 5." });
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const newRatings = book.ratings.filter(
        (rating) => rating.userId !== req.body.userId
      );
      newRatings.push({ userId: req.body.userId, grade: req.body.rating });

      book.ratings = newRatings;
      book.averageRating = average(newRatings.map((rating) => rating.grade));

      Book.updateOne(
        { _id: req.params.id },
        {
          ratings: book.ratings,
          averageRating: book.averageRating,
        }
      )
        .then(() => res.status(200).json(book))
        .catch((error) => {
          res.status(400).json({ error });
        });
    })
    .catch((error) => res.status(404).json({ error }));
};

exports.getBestRated = (req, res, next) => {
  Book.find()
    .then((books) => {
      const bestRated = books
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 3);
      res.status(200).json(bestRated);
    })
    .catch((error) => {
      res.status(404).json({ error });
    });
};
