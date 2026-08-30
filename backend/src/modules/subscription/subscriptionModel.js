const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        planId: {
            type: String,
            enum: ["free", "pro", "enterprise"],
            required: true,
        },

        status: {
            type: String,
            enum: ["active", "cancelled", "expired", "pending"],
            default: "pending",
        },

        amount: {
            type: Number,
            required: true,
        },

        currency: {
            type: String,
            default: "INR",
        },

        razorpayOrderId: {
            type: String,
        },

        razorpayPaymentId: {
            type: String,
        },

        razorpaySubscriptionId: {
            type: String,
        },

        startDate: {
            type: Date,
            default: Date.now,
        },

        endDate: {
            type: Date,
        },

        autoRenew: {
            type: Boolean,
            default: false,
        },

        cancelledAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ razorpayOrderId: 1 }, { sparse: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);
