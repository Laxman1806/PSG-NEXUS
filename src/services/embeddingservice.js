// src/services/embeddingservice.js - Official SDK Vector Generator
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
    const result = await model.embedContent({
        content: { parts: [{ text }] },
        outputDimensionality: 768
    });
    return result.embedding.values;
}

module.exports = { generateEmbedding };
