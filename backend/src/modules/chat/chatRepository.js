// src/modules/chat/chat.repository.js

const Chat = require("./chatModel");

const createChat = async (chatData) => {
    return await Chat.create(chatData);
};

const findChatById = async (chatId) => {
    return await Chat.findById(chatId);
};

const findUserChats = async (userId) => {
    return await Chat.find({ userId })
        .sort({ lastMessageAt: -1 });
};

const updateChat = async (chatId, updateData) => {
    return await Chat.findByIdAndUpdate(
        chatId,
        updateData,
        { new: true }
    );
};

const deleteChat = async (chatId) => {
    return await Chat.findByIdAndDelete(chatId);
};

module.exports = {
    createChat,
    findChatById,
    findUserChats,
    updateChat,
    deleteChat,
};