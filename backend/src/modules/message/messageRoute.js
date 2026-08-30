// src/modules/message/message.routes.js

const express = require("express");

const router = express.Router();

const {
    sendMessage,
    sendGuestMessage,
    getMessages,
} = require("./messageController");

const {
    sendMessageValidator,
} = require("./messageValidator");

const authMiddleware = require("../auth/authMiddleware");
const { checkMessageLimit } = require("../subscription/subscriptionMiddleware");


router.get(
    "/:chatId",
    authMiddleware,
    getMessages
);
// Authenticated route — saves to DB
router.post(
    "/",
    authMiddleware,
    checkMessageLimit,
    sendMessageValidator,
    sendMessage
);

// Guest route — calls AI only, no DB save, no auth required
router.post(
    "/guest",
    sendGuestMessage
);

module.exports = router;