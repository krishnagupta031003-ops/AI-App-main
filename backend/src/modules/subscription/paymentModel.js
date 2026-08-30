const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        subscriptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscription",
            default: null,
        },

        razorpayOrderId: {
            type: String,
            required: true,
        },

        razorpayPaymentId: {
            type: String,
        },

        razorpaySignature: {
            type: String,
        },

        amount: {
            type: Number,
            required: true,
        },

        currency: {
            type: String,
            default: "INR",
        },

        status: {
            type: String,
            enum: ["pending", "success", "failed"],
            default: "pending",
        },

        paidAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ razorpayPaymentId: 1 }, { sparse: true });

module.exports = mongoose.model("Payment", paymentSchema);
