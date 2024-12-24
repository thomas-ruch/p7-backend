const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");

const libraryCtrl = require("../controllers/library");

router.get("/", auth, libraryCtrl.getAllBooks);
router.post("/", auth, libraryCtrl.createBook);
router.get("/:id", auth, libraryCtrl.getOneBook);
router.put("/:id", auth, libraryCtrl.modifyBook);
router.delete("/:id", auth, libraryCtrl.deleteBook);

module.exports = router;
