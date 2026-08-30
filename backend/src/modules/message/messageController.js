const messageService = require("./messageService");
const aiService = require("../ai/aiService");
const mongoose = require("mongoose");

const getMessages = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.chatId)) {
            return res.status(200).json({
                success: true,
                data: [],
            });
        }

        const messages = await messageService.getMessages(
            req.user.id,
            req.params.chatId,
            req.query.page,
            req.query.limit,
        );

        return res.status(200).json({
            success: true,
            data: messages,
        });
    } catch (error) {
        next(error);
    }
};
const sendMessage = async (req, res, next) => {
    try {
        let isAborted = false;
        let responseStarted = false;

        // Only set abort flag if connection actually closes unexpectedly
        const abortHandler = () => {
            // Only abort if we haven't started sending the response yet
            if (!responseStarted && !res.headersSent) {
                isAborted = true;
            }
        };

        // Monitor the response socket for actual disconnects
        res.on("close", abortHandler);
        res.on("finish", () => {
            responseStarted = true;
        });

        const result = await messageService.sendMessage(
            {
                userId: req.user.id,
                ...req.body,
            },
            () => isAborted,
        );

        // Mark response as started once we have the result
        responseStarted = true;

        if (isAborted || (result && result.aborted)) {
            if (!res.headersSent) {
                return res.status(499).json({
                    success: false,
                    message: "Request aborted by client.",
                });
            }
            return;
        }

        return res.status(201).json({
            success: true,
            message: "Message sent successfully.",
            data: result,
        });
    } catch (error) {
        if (
            error.message === "Request aborted by client" ||
            error.message === "Request aborted"
        ) {
            if (!res.headersSent) {
                return res.status(499).json({
                    success: false,
                    message: "Request aborted by client.",
                });
            }
            return;
        }
        next(error);
    }
};

const sendGuestMessage = async (req, res, next) => {
    try {
        let isAborted = false;
        let responseStarted = false;

        // Only set abort flag if connection actually closes unexpectedly
        // Use res.socket instead of req.socket for more reliable connection monitoring
        const abortHandler = () => {
            // Only abort if we haven't started sending the response yet
            if (!responseStarted && !res.headersSent) {
                isAborted = true;
            }
        };

        // Monitor the response socket, not the request
        res.on("close", abortHandler);
        res.on("finish", () => {
            responseStarted = true; // Response completed successfully
        });

        const {
            message,
            model = "gemini-2.5-flash",
            provider = "gemini",
            history = [],
            attachments = [],
        } = req.body;

        if ((!message || !message.trim()) && attachments.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Message is required.",
            });
        }

        const messages = [
            ...history.map((msg) => ({
                role: msg.role,
                content: msg.content,
                attachments: msg.attachments,
            })),
            { role: "user", content: message?.trim() || "", attachments },
        ];

        const checkAborted = () => isAborted;

        const aiResponse = await aiService.sendMessage({
            provider,
            model,
            messages,
            checkAborted,
        });

        // If we got here, request is NOT aborted - mark response as started
        responseStarted = true;

        if (isAborted) {
            if (!res.headersSent) {
                return res.status(499).json({
                    success: false,
                    message: "Request aborted by client.",
                });
            }
            return;
        }

        return res.status(200).json({
            success: true,
            message: "Guest message processed.",
            data: {
                assistantMessage: {
                    role: "assistant",
                    content: aiResponse.content,
                    model: model, // Add model info
                    provider: provider, // Add provider info
                },
            },
        });
    } catch (error) {
        if (
            error.message === "Request aborted by client" ||
            error.message === "Request aborted"
        ) {
            if (!res.headersSent) {
                return res.status(499).json({
                    success: false,
                    message: "Request aborted by client.",
                });
            }
            return;
        }
        next(error);
    }
};

module.exports = {
    sendMessage,
    sendGuestMessage,
    getMessages,
};
