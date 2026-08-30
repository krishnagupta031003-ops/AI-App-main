// src/modules/chat/chat.routes.js

const express = require("express");

const router = express.Router();

const authMiddleware = require("../auth/authMiddleware");

const {
    getUserChats,
    getChatById,
    renameChat,
    deleteChat,
} = require("./chatController");

const {
    renameChatValidator,
} = require("./chatValidator");

router.get(
    "/",
    authMiddleware,
    getUserChats
);

router.get(
    "/:id",
    authMiddleware,
    getChatById
);

router.patch(
    "/:id/rename",
    authMiddleware,
    renameChatValidator,
    renameChat
);

router.delete(
    "/:id",
    authMiddleware,
    deleteChat
);

module.exports = router;