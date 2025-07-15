const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/version.controller");

// ✅ Route to get version history
router.get("/:docId", auth, controller.getVersions);

// ✅ Route to compare specific version
router.get("/:docId/compare/:versionNumber", auth, controller.compareVersion);

module.exports = router;
