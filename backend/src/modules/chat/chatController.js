// src/modules/chat/chat.controller.js

const chatService = require("./chatService");

const getUserChats = async (req, res, next) => {

    try {

        const chats = await chatService.getUserChats(
            req.user.id
        );

        return res.status(200).json({
            success: true,
            data: chats,
        });

    } catch (error) {
        next(error);
    }

};

const renameChat = async (req, res, next) => {

    try {

        const chat = await chatService.renameChat(
            req.params.id,
            req.body.title
        );

        return res.status(200).json({
            success: true,
            message: "Chat renamed successfully.",
            data: chat,
        });

    } catch (error) {
        next(error);
    }

};

const deleteChat = async (req, res, next) => {

    try {

        await chatService.deleteChat(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Chat deleted successfully.",
        });

    } catch (error) {
        next(error);
    }

};

const getChatById = async (req, res, next) => {
    try {
        const chat = await chatService.getChatById(req.params.id, req.user.id);
        
        return res.status(200).json({
            success: true,
            data: chat,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserChats,
    getChatById,
    renameChat,
    deleteChat,
};