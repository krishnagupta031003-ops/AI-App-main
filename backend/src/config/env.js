require("dotenv").config();

module.exports = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    CLIENT_URL: process.env.CLIENT_URL,
    REDIS_URL: process.env.REDIS_URL,
};
