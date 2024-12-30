const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer-config");
const normalizeImage = require("../middlewares/normalize-image.js");

const libraryCtrl = require("../controllers/library");

router.get("/", libraryCtrl.getAllBooks);
router.post("/", auth, multer, normalizeImage, libraryCtrl.createBook);
router.get("/:id", libraryCtrl.getOneBook);
router.put("/:id", auth, multer, normalizeImage, libraryCtrl.modifyBook);
router.delete("/:id", auth, libraryCtrl.deleteBook);
router.post("/:id/rating", auth, libraryCtrl.rateBook);

module.exports = router;
