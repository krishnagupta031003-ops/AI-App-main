const providers = require("./providers");

const sendMessage = async ({ provider, model, messages, checkAborted }) => {
    const aiProvider = providers[provider];

    if (!aiProvider) {
        throw new Error("Unsupported provider");
    }

    // Check if aborted before starting
    if (checkAborted && checkAborted()) {
        throw new Error('Request aborted');
    }

    return aiProvider.sendMessage({
        model,
        messages,
        checkAborted, // Pass callback to provider for mid-stream checks
    });
};

module.exports = {
    sendMessage,
};