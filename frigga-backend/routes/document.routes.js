const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/document.controller");

router.post("/", auth, controller.createDocument);
router.get("/", auth, controller.listDocuments);
router.put("/:id", auth, controller.updateDocument);
router.get("/search", auth, controller.searchDocuments);

module.exports = router;
