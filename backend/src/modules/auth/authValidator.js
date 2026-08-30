const validator = require("validator");

const registerValidator = (req, res, next) => {
    let { name, email, password } = req.body;

    name = name?.trim();
    email = email?.trim().toLowerCase();
    password = password?.trim();

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required.",
        });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email.",
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password should be at least 6 characters.",
        });
    }

    req.body = {
        name,
        email,
        password,
    };

    next();
};

const loginValidator = (req, res, next) => {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();
    password = password?.trim();

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and Password are required.",
        });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email.",
        });
    }

    req.body = {
        email,
        password,
    };

    next();
};

module.exports = {
    registerValidator,
    loginValidator,
};