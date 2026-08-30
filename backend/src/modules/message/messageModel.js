const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
            index: true,
        },

        role: {
            type: String,
            enum: ["user", "assistant", "system"],
            required: true,
        },

        content: {
            type: String,
            required: false, // Make content optional since we can have just an attachment
            trim: true,
        },

        attachments: [
            {
                name: String,
                type: { type: String }, // e.g., 'image/png'
                data: String, // Base64 string (legacy)
                url: String,  // URL for static files
                size: Number  // File size in bytes
            }
        ],

        provider: {
            type: String,
            enum: ["gemini", "groq", "openai"],
            required: true,
        },

        model: {
            type: String,
            required: true,
        },

        promptTokens: {
            type: Number,
            default: 0,
        },

        completionTokens: {
            type: Number,
            default: 0,
        },

        totalTokens: {
            type: Number,
            default: 0,
        },

        responseTime: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("Message", messageSchema);
