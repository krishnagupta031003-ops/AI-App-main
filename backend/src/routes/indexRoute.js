const express = require("express");

const authRoute = require("../modules/auth/authRoute");
const chatRoute = require("../modules/chat/chatRoute");
const messageRoute = require("../modules/message/messageRoute");
const uploadRoute = require("../modules/upload/uploadRoute");
const subscriptionRoute = require("../modules/subscription/subscriptionRoute");

const router = express.Router();

router.use("/auth", authRoute);
router.use("/chats", chatRoute);
router.use("/messages", messageRoute);
router.use("/upload", uploadRoute);
router.use("/subscriptions", subscriptionRoute);

module.exports = router;
