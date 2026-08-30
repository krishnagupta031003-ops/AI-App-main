const jwt = require("jsonwebtoken");
const env = require("../config/env");

const generateToken = (payload) => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

const verifyToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken,
};
