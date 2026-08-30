const authRepository = require("./authRepository");

const { hashPassword, comparePassword } = require("../../utils/hash");

const { generateToken } = require("../../utils/jwt");
const { getCache, setCache, deleteCache } = require("../../shared/cache/cache");
const otpService = require("../otp/otpService");

const register = async ({ name, email, password }) => {
    // Check Existing User
    const existingUser = await authRepository.findUserByEmail(email);

    if (existingUser) {
        throw new Error("User already exists");
    }

    // Hash Password
    const hashedPassword = await hashPassword(password);

    // Create User
    const user = await authRepository.createUser({
        name,
        email,
        password: hashedPassword,
    });

    // Generate JWT
    const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
    });

    const userDetails = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    return {
        userDetails,
        token,
    };
};

const login = async ({ email, password }) => {
    // Find User
    const user = await authRepository.findUserByEmail(email, true);

    if (!user) {
        throw new Error("Invalid Credentials");
    }

    // Compare Password
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid Credentials");
    }

    // Generate JWT
    const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
    });

    const userDetails = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    return {
        userDetails,
        token,
    };
};

const getProfile = async (userId) => {
    const cacheKey = `user:${userId}:profile`;

    // ===========================
    // Check Redis
    // ===========================
    const cachedUser = await getCache(cacheKey);

    if (cachedUser) {
        console.log("✅ Profile From Redis");
        return cachedUser;
    }

    // ===========================
    // MongoDB
    // ===========================
    console.log("📦 Profile From MongoDB");

    const user = await authRepository.findUserById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    // ===========================
    // Save to Redis
    // ===========================
    await setCache(cacheKey, user, 300); // 5 minutes

    return user;
};

const requestOTP = async (userId, purpose) => {
    const user = await authRepository.findUserById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    return await otpService.requestOTP(userId, user.email, purpose);
};

const verifyOTP = async (userId, purpose, otp) => {
    return await otpService.verifyOTP(userId, purpose, otp);
};

const updateProfile = async (userId, updates) => {
    const { name, email } = updates;

    if (!name && !email) {
        throw new Error("No updates provided");
    }

    const updateData = {};
    if (name) updateData.name = name;

    if (email) {
        const existingUser = await authRepository.findUserByEmail(email);
        if (existingUser && existingUser._id.toString() !== userId.toString()) {
            throw new Error("Email already in use");
        }
        updateData.email = email;
    }

    const updatedUser = await authRepository.updateUserById(userId, updateData);

    if (!updatedUser) {
        throw new Error("Failed to update profile");
    }

    const cacheKey = `user:${userId}:profile`;
    await deleteCache(cacheKey);

    return {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
    };
};

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await authRepository.findUserById(userId, true);

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.password) {
        throw new Error("Cannot change password for OAuth accounts");
    }

    const isMatch = await comparePassword(currentPassword, user.password);

    if (!isMatch) {
        throw new Error("Current password is incorrect");
    }

    if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters");
    }

    const hashedPassword = await hashPassword(newPassword);

    await authRepository.updateUserById(userId, { password: hashedPassword });

    const cacheKey = `user:${userId}:profile`;
    await deleteCache(cacheKey);
};

const deleteAccount = async (userId) => {
    const user = await authRepository.findUserById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    await authRepository.deleteUserById(userId);

    const cacheKey = `user:${userId}:profile`;
    await deleteCache(cacheKey);
};

module.exports = {
    register,
    login,
    getProfile,
    requestOTP,
    verifyOTP,
    updateProfile,
    changePassword,
    deleteAccount,
};
