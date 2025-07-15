const express = require("express");
const router = express.Router();
const shareController = require("../controllers/share.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);

// View all users shared on a doc
router.get("/:documentId", shareController.getSharedUsers);

// Share a doc with a user (author only)
router.post("/:documentId", shareController.shareDocument);

// Remove access
router.delete("/:documentId", shareController.revokeAccess);

module.exports = router;
