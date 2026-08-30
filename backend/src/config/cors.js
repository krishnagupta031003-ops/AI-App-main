const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:3000",

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],

    allowedHeaders: ["Content-Type", "Authorization"],
};

module.exports = corsOptions;