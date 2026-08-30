const { redisClient } = require("../../config/redis");

const getCache = async (key) => {

    const data = await redisClient.get(key);

    if (!data) {
        return null;
    }

    return JSON.parse(data);
};

const setCache = async (key, value, ttl = 300) => {

    await redisClient.set(
        key,
        JSON.stringify(value),
        'EX',
        ttl
    );

};

const deleteCache = async (key) => {

    await redisClient.del(key);

};

const deleteCachePattern = async (pattern) => {
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
        await redisClient.del(...keys);
    }
};

module.exports = {
    getCache,
    setCache,
    deleteCache,
    deleteCachePattern
};
