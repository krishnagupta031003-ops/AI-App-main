
const Message = require("./messageModel");

const createMessage = async (messageData) => {
    return await Message.create(messageData);
};

const createManyMessages = async (messages) => {
    return await Message.insertMany(messages);
};

const findMessagesByChatId = async ( chatId, page, limit) => {

      console.log("Repository received chatId:", chatId);
    let query = Message.find({  chatId })
        .sort({ createdAt: 1 });

    if (page && limit) {
        query = query
            .skip((page - 1) * limit)
            .limit(limit);
    }

    return query;
};

const findMessageById = async (messageId) => {
    return await Message.findById(messageId);
};

const deleteMessagesByChatId = async (chatId) => {
    return await Message.deleteMany({ chatId });
};

module.exports = {
    createMessage,
    createManyMessages,
    findMessagesByChatId,
    findMessageById,
    deleteMessagesByChatId,
};