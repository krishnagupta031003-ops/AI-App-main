const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        otp: {
            type: String,
            required: true,
        },
        purpose: {
            type: String,
            required: true,
            enum: ['email_update', 'password_change', 'account_delete', 'profile_update'],
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for automatic cleanup of expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for finding OTPs by user and purpose
otpSchema.index({ userId: 1, purpose: 1, isVerified: 1 });

module.exports = mongoose.model('OTP', otpSchema);
