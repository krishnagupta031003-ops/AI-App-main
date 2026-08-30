const { createClient } = require("redis");
const { REDIS_URL } = require("./env");

const redisClient = createClient({
    url: REDIS_URL,
});

redisClient.on("connect", () => {
    console.log("Redis Connected");
});

redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
});

async function connectRedis() {
    await redisClient.connect();
}

module.exports = {
    redisClient,
    connectRedis,
};
