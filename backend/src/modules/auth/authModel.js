const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: function() {
                return this.provider === 'local';
            },
            select: false,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        // OAuth fields
        provider: {
            type: String,
            enum: ['local', 'google', 'github'],
            default: 'local',
        },

        providerId: {
            type: String,
            sparse: true,
        },

        providerData: {
            type: Object,
            default: {},
        },

        // Subscription fields
        currentSubscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subscription',
            default: null,
        },

        subscriptionPlan: {
            type: String,
            enum: ['free', 'pro', 'enterprise'],
            default: 'free',
        },

        messageCount: {
            daily: { type: Number, default: 0 },
            lastResetDate: { type: Date, default: Date.now },
        },

        razorpayCustomerId: {
            type: String,
            sparse: true,
        },

        refreshToken: {
            type: String,
            default: null,
        },

        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

// userSchema.index({ email: 1 });  

module.exports = mongoose.model("User", userSchema);
