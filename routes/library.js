const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer-config");
const normalize = require("../middlewares/normalize-image.js");

const libraryCtrl = require("../controllers/library");

router.get("/", libraryCtrl.getAllBooks);
router.get("/bestrating", libraryCtrl.getBestRated);
router.get("/:id", libraryCtrl.getOneBook);
router.post("/", auth, multer, normalize, libraryCtrl.createBook);
router.put("/:id", auth, multer, normalize, libraryCtrl.modifyBook);
router.delete("/:id", auth, libraryCtrl.deleteBook);
router.post("/:id/rating", auth, libraryCtrl.rateBook);

module.exports = router;
