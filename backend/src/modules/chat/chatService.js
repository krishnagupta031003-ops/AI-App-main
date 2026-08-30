// src/modules/chat/chat.service.js
const { getCache, setCache, deleteCache } = require("../../shared/cache/cache");
const chatRepository = require("./chatRepository");
const messageRepository = require("../message/messageRepository");

const getUserChats = async (userId) => {
    const cacheKey = `user:${userId}:chats`;

    // ==========================
    // Check Redis
    // ==========================

    const cachedChats = await getCache(cacheKey);

    if (cachedChats) {
        console.log("Chats From Redis");

        return cachedChats;
    }
    console.log("Chats From MongoDB");

    const chats = await chatRepository.findUserChats(userId);

    await setCache(cacheKey, chats, 300);

    return chats;
};

const renameChat = async (chatId, title) => {
    const chat = await chatRepository.findChatById(chatId);

    if (!chat) {
        throw new Error("Chat not found");
    }

    await deleteCache(`user:${chat.userId}:chats`);

    return await chatRepository.updateChat(chatId, {
        title,
    });
};

const deleteChat = async (chatId) => {
    const chat = await chatRepository.findChatById(chatId);

    if (!chat) {
        throw new Error("Chat not found");
    }

    await messageRepository.deleteMessagesByChatId(chatId);

    await chatRepository.deleteChat(chatId);

    await deleteCache(`user:${chat.userId}:chats`);

    return;
};

const getChatById = async (chatId, userId) => {
    const chat = await chatRepository.findChatById(chatId);

    if (!chat) {
        throw new Error("Chat not found");
    }

    if (chat.userId.toString() !== userId.toString()) {
        throw new Error("Unauthorized access to chat");
    }

    const messages = await messageRepository.findMessagesByChatId(chatId);

    return {
        ...chat.toObject(),
        id: chat._id, // Add string id for frontend mapping
        messages,
    };
};

module.exports = {
    getUserChats,
    getChatById,
    renameChat,
    deleteChat,
};
