const express = require("express");

const { register, login, getProfile, logout, oauthCallback, requestOTP, verifyOTP, updateProfile, changePassword, deleteAccount } = require("./authController");

const { registerValidator, loginValidator } = require("./authValidator");
const authMiddleware = require("./authMiddleware");
const passport = require("../../config/passport");

const router = express.Router();

router.post("/register", registerValidator, register);

router.post("/login", loginValidator, login);
router.get("/me", authMiddleware, getProfile);
router.post("/logout", logout);

// OTP and profile management
router.post("/request-otp", authMiddleware, requestOTP);
router.post("/verify-otp", authMiddleware, verifyOTP);
router.put("/profile", authMiddleware, updateProfile);
router.put("/password", authMiddleware, changePassword);
router.delete("/account", authMiddleware, deleteAccount);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }), oauthCallback);

// GitHub OAuth
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
router.get("/github/callback", passport.authenticate("github", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }), oauthCallback);

module.exports = router;