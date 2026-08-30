const express = require("express");
const uploadController = require("./uploadController");
const upload = require("../../middleware/uploadMiddleware");

const router = express.Router();

// Allow uploading up to 10 files at once
router.post("/", upload.array("files", 10), uploadController.uploadFiles);

module.exports = router;
