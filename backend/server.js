// Load environment variables FIRST before any other imports
require("./src/config/env");

const app = require("./src/app");
const connectDB = require("./src/config/db");
const { connectRedis, redisClient } = require("./src/config/redis");

const PORT = process.env.PORT;

const port = PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        await connectRedis();

        app.listen(port, "0.0.0.0", () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to start server");
        console.error(error);

        process.exit(1);
    }
};

startServer();
