// src/modules/message/message.validator.js

const validator = require("validator");

const sendMessageValidator = (req, res, next) => {

    let { message, model, attachments } = req.body;

    message = message?.trim() || "";
    model = model?.trim();

    if (!message && (!attachments || attachments.length === 0)) {
        return res.status(400).json({
            success: false,
            message: "Message or attachment is required.",
        });
    }

    if (!model) {
        return res.status(400).json({
            success: false,
            message: "Model is required.",
        });
    }

    req.body.message = message;
    req.body.model = model;

    next();
};

module.exports = {
    sendMessageValidator,
};