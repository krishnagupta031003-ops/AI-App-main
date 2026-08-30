const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const passport = require("./config/passport");

const app = express();

const corsOptions = require("./config/cors");
const errorMiddleware = require("./middleware/error");
const indexRoutes = require("./routes/indexRoute");

const path = require("path");

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

app.use(cookieParser());

// Initialize passport for OAuth
app.use(passport.initialize());

app.use("/api/v1", indexRoutes);

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Route Not Found",
    });
});

app.use(errorMiddleware);

module.exports = app;
