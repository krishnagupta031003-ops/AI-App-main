const authService = require("./authService");

const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);

        res.cookie("token", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: result.userDetails,
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);

        res.cookie("token", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: result.userDetails,
        });
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.user.id);

        return res.status(200).json({
            success: true,

            data: user,
        });
    } catch (error) {
        next(error);
    }
};

const logout = (req, res) => {
    res.clearCookie("token");

    return res.json({
        success: true,

        message: "Logout Successful",
    });
};

const oauthCallback = async (req, res, next) => {
    try {
        const { generateToken } = require("../../utils/jwt");

        const token = generateToken({ id: req.user._id });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
        return res.redirect(`${clientUrl}/`);
    } catch (error) {
        next(error);
    }
};

const requestOTP = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { purpose } = req.body;

        const result = await authService.requestOTP(userId, purpose);

        return res.status(200).json({
            success: true,
            message: result.message,
            expiresIn: result.expiresIn,
        });
    } catch (error) {
        next(error);
    }
};

const verifyOTP = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { purpose, otp } = req.body;

        const result = await authService.verifyOTP(userId, purpose, otp);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        const result = await authService.updateProfile(userId, updates);

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        await authService.changePassword(userId, currentPassword, newPassword);

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        next(error);
    }
};

const deleteAccount = async (req, res, next) => {
    try {
        const userId = req.user.id;

        await authService.deleteAccount(userId);

        res.clearCookie("token");

        return res.status(200).json({
            success: true,
            message: 'Account deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getProfile,
    logout,
    oauthCallback,
    requestOTP,
    verifyOTP,
    updateProfile,
    changePassword,
    deleteAccount,
};
