const chatRepository = require("../chat/chatRepository");
const messageRepository = require("../message/messageRepository");
const aiService = require("../ai/aiService");

const {
    getCache,
    setCache,
    deleteCachePattern,
} = require("../../shared/cache/cache");
const mongoose = require("mongoose");

// ---------------------------
// Get Chat History
// ---------------------------
const getMessages = async (userId, chatId, page = null, limit = null) => {
    const cacheKey = `chat:${chatId}:messages:${page}:${limit}`;

    // console.log("🔑 Cache Key:", cacheKey);

    const cachedMessages = await getCache(cacheKey);

    // console.log("📥 Cached Value:", cachedMessages);

    if (cachedMessages) {
        // console.log("⚡ Messages From Redis");
        return cachedMessages;
    }

    // console.log("📦 Messages From MongoDB");

    let messages;

    if (page && limit) {
        messages = await messageRepository.findMessagesByChatId(
            chatId,
            Number(page),
            Number(limit),
        );
    } else {
        messages = await messageRepository.findMessagesByChatId(chatId);
    }

    // console.log("💾 Storing in Redis...");

    await setCache(cacheKey, messages, 300);

    // console.log("✅ Stored in Redis");

    return messages;
};

const sendMessage = async (
    { userId, chatId, message, provider, model, attachments = [] },
    checkAborted,
) => {
    let chat;

    // Default message to empty string if missing but attachments are present
    const messageContent = message?.trim() || "";

    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
        chat = await chatRepository.createChat({
            userId,
            title:
                messageContent.substring(0, 40) +
                    (messageContent.length > 40 ? "..." : "") || "New Chat",
            model,
        });

        chatId = chat._id;
    } else {
        chat = await chatRepository.findChatById(chatId);

        if (!chat) {
            throw new Error("Chat not found");
        }
    }

    //-----------------------------------
    // Save User Message
    //-----------------------------------

    const savedUserMessage = await messageRepository.createMessage({
        chatId,
        role: "user",
        content: messageContent,
        model,
        provider,
        attachments,
    });

    // console.log("Saved User Message:", savedUserMessage);
    // console.log("Current chatId:", chatId);

    // Delete old history cache
    await deleteCachePattern(`chat:${chatId}:messages:*`);

    // ---------------------------
    // Latest History
    // ---------------------------
    const history = await getMessages(userId, chatId);

    // console.log(
    //     history.map((m) => ({
    //         role: m.role,
    //         content: m.content,
    //     }))
    // );

    // ---------------------------
    // AI Response
    // ---------------------------

    // console.log("History:", history);

    console.log(
        "Messages being sent:",
        history.map((msg) => ({
            role: msg.role,
            content: msg.content,
        })),
    );

    const aiResponse = await aiService.sendMessage({
        provider,
        model,
        messages: history.map((msg) => ({
            role: msg.role,
            content: msg.content,
        })),
        checkAborted, // Pass abort checker to AI service
    });

    // console.log("AI Response:", aiResponse);

    // Check if the request was aborted during AI generation
    if (checkAborted && checkAborted()) {
        return {
            chat,
            userMessage: savedUserMessage,
            assistantMessage: null,
            aborted: true,
        };
    }

    //-----------------------------------
    // Save Assistant Message
    //-----------------------------------

    const assistantMessage = await messageRepository.createMessage({
        chatId,
        role: "assistant",
        content: aiResponse.content,
        model,
        provider,
        promptTokens: aiResponse.promptTokens,
        completionTokens: aiResponse.completionTokens,
        totalTokens: aiResponse.totalTokens,
        responseTime: aiResponse.responseTime,
    });

    // Delete cache again so next request gets latest history
    await deleteCachePattern(`chat:${chatId}:messages:*`);

    return {
        chat,
        userMessage: savedUserMessage,
        assistantMessage,
    };
};

module.exports = {
    sendMessage,
    getMessages,
};
