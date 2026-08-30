// src/modules/chat/chat.model.js

const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        title: {
            type: String,
            default: "New Chat",
            trim: true,
        },

        model: {
            type: String,
            default: "gemini-2.5-flash",
        },

        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("Chat", chatSchema);
