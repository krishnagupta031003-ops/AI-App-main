const crypto = require("crypto");
const { redisClient } = require("../../config/redis");
const { sendOTPEmail } = require("../../utils/email");

const OTP_EXPIRATION = 600;

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const getOTPKey = (userId, purpose) => {
    return `otp:${userId}:${purpose}`;
};

// Request OTP
const requestOTP = async (userId, email, purpose) => {
    try {
        const otp = generateOTP();
        const key = getOTPKey(userId, purpose);

        await redisClient.set(key, otp, {
            EX: OTP_EXPIRATION,
        });

        await sendOTPEmail(email, otp, purpose);

        return {
            success: true,
            message: "OTP sent successfully",
            expiresIn: OTP_EXPIRATION,
        };
    } catch (error) {
        console.error(error);
        throw new Error("Failed to send OTP");
    }
};

// Verify OTP
const verifyOTP = async (userId, purpose, otp) => {
    try {
        const key = getOTPKey(userId, purpose);

        const storedOTP = await redisClient.get(key);

        if (!storedOTP) {
            return {
                success: false,
                message: "OTP expired or not found.",
            };
        }

        if (storedOTP !== otp) {
            return {
                success: false,
                message: "Invalid OTP.",
            };
        }

        await redisClient.del(key);

        return {
            success: true,
            message: "OTP verified successfully",
        };
    } catch (error) {
        console.error(error);
        throw new Error("Failed to verify OTP");
    }
};

const deleteOTP = async (userId, purpose) => {
    try {
        const key = getOTPKey(userId, purpose);
        await redisClient.del(key);
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    requestOTP,
    verifyOTP,
    deleteOTP,
};