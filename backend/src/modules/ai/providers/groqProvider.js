const Groq = require("groq-sdk");

const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

const sendMessage = async ({ model, messages, checkAborted }) => {
    // Check if aborted before starting
    if (checkAborted && checkAborted()) {
        throw new Error('Request aborted by client');
    }

    const formattedMessages = messages.map((msg) => {
        let contentStr = typeof msg.content === "string" ? msg.content : String(msg.content || "");

        if (!contentStr.trim() && msg.attachments && msg.attachments.length > 0) {
            contentStr = "[File attachments are currently not supported by this model. Please use Gemini for file analysis.]";
        } else if (!contentStr.trim()) {
            contentStr = " ";
        }

        return {
            role: msg.role === "assistant" ? "assistant" : "user",
            content: contentStr,
        };
    });

    // Check again before API call
    if (checkAborted && checkAborted()) {
        throw new Error('Request aborted by client');
    }

    const stream = await groqClient.chat.completions.create({
        model: model,
        messages: formattedMessages,
        stream: true,
    });

    let fullContent = '';
    let promptTokens = 0;
    let completionTokens = 0;
    let totalTokens = 0;

    // Process stream chunks and check for abortion
    for await (const chunk of stream) {
        // Check abortion every chunk
        if (checkAborted && checkAborted()) {
            throw new Error('Request aborted by client');
        }

        const content = chunk.choices[0]?.delta?.content;
        if (content) {
            fullContent += content;
        }

        if (chunk.usage) {
            promptTokens = chunk.usage.prompt_tokens || 0;
            completionTokens = chunk.usage.completion_tokens || 0;
            totalTokens = chunk.usage.total_tokens || 0;
        }

        if (chunk.x_groq?.usage) {
            promptTokens = chunk.x_groq.usage.prompt_tokens || 0;
            completionTokens = chunk.x_groq.usage.completion_tokens || 0;
            totalTokens = chunk.x_groq.usage.total_tokens || 0;
        }
    }

    // Final check after completion
    if (checkAborted && checkAborted()) {
        throw new Error('Request aborted by client');
    }

    return {
        content: fullContent,
        promptTokens,
        completionTokens,
        totalTokens,
        responseTime: 0,
    };
};

module.exports = {
    sendMessage,
};

module.exports = {
    sendMessage,
};

module.exports = {
    sendMessage,
};

module.exports = {
    sendMessage,
};