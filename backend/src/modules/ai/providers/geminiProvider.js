const path = require("path");
const fs = require("fs");

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI,
});

const sendMessage = async ({ model, messages, checkAborted }) => {
  // Check if aborted before starting
  if (checkAborted && checkAborted()) {
    throw new Error('Request aborted by client');
  }

  const contents = messages.map(msg => {
    const parts = [];

    if (msg.content) {
      parts.push({ text: msg.content });
    }

    if (msg.attachments && msg.attachments.length > 0) {
      msg.attachments.forEach(file => {
        let base64Data = "";

        if (file.url) {
          try {
            const relativePath = file.url.replace(/^\//, '');
            const filePath = path.join(__dirname, '../../../../public', relativePath);

            if (!fs.existsSync(filePath)) {
              return;
            }

            const fileBuffer = fs.readFileSync(filePath);
            base64Data = fileBuffer.toString('base64');
          } catch (err) {
            return;
          }
        } else if (file.data) {
          base64Data = file.data.includes(',') ? file.data.split(",")[1] : file.data;
        }

        if (base64Data) {
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: file.type || "application/octet-stream",
            }
          });
        }
      });
    }

    if (parts.length === 0) {
      parts.push({ text: " " });
    }

    return {
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts
    };
  });

  // Check again before API call
  if (checkAborted && checkAborted()) {
    throw new Error('Request aborted by client');
  }

  const stream = await ai.models.generateContentStream({
    model: model || "gemini-2.5-flash",
    contents: contents,
  });

  let fullText = '';
  let promptTokens = 0;
  let completionTokens = 0;
  let totalTokens = 0;

  // Process stream chunks and check for abortion
  for await (const chunk of stream) {
    // Check if request was aborted during streaming
    if (checkAborted && checkAborted()) {
      throw new Error('Request aborted by client');
    }

    if (chunk.text) {
      fullText += chunk.text;
    }

    if (chunk.usageMetadata) {
      promptTokens = chunk.usageMetadata.promptTokenCount || 0;
      completionTokens = chunk.usageMetadata.candidatesTokenCount || 0;
      totalTokens = chunk.usageMetadata.totalTokenCount || 0;
    }
  }

  // Final check after completion
  if (checkAborted && checkAborted()) {
    throw new Error('Request aborted by client');
  }

  return {
    content: fullText,
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