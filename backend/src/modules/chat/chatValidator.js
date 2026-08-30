// src/modules/chat/chat.validator.js

const renameChatValidator = (req, res, next) => {

    let { title } = req.body;

    title = title?.trim();

    if (!title) {
        return res.status(400).json({
            success: false,
            message: "Title is required.",
        });
    }

    req.body.title = title;

    next();

};

module.exports = {
    renameChatValidator,
};