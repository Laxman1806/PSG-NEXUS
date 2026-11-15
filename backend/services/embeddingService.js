// backend/services/embeddingService.js - Official SDK 768d Vector Generator
const { GoogleGenerativeAI } = require('@google/generative-ai');

let embeddingModel = null;

function getEmbeddingModel() {
    if (!embeddingModel) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY in environment variables.");
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    }
    return embeddingModel;
}

async function generateEmbedding(text) {
    const model = getEmbeddingModel();
    const embedPromise = model.embedContent({
        content: { parts: [{ text }] },
        outputDimensionality: 768
    });

    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Embedding request timed out after 7s")), 7000)
    );

    const result = await Promise.race([embedPromise, timeoutPromise]);
    return result.embedding.values;
}

module.exports = { generateEmbedding };
