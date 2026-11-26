
// backend/services/embeddingService.js
// Generates 768-dimensional embeddings using Gemini.

const { GoogleGenerativeAI } = require('@google/generative-ai');

let embeddingModel = null;

function getEmbeddingModel() {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('Missing GEMINI_API_KEY in environment variables.');
    }

    if (!embeddingModel) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        embeddingModel = genAI.getGenerativeModel({
            model: 'gemini-embedding-001'
        });
    }

    return embeddingModel;
}

async function generateEmbedding(text) {
    if (typeof text !== 'string' || !text.trim()) {
        throw new Error('Embedding text must be a non-empty string.');
    }

    const model = getEmbeddingModel();

    let timeoutId;

    try {
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
                reject(new Error('Gemini embedding request timed out after 30 seconds.'));
            }, 30000);
        });

        const result = await Promise.race([
            model.embedContent({
                content: {
                    parts: [{ text: text.trim() }]
                },
                outputDimensionality: 768
            }),
            timeoutPromise
        ]);

        const values = result?.embedding?.values;

        if (
            !Array.isArray(values) ||
            values.length !== 768 ||
            !values.every(value => Number.isFinite(value))
        ) {
            throw new Error('Gemini returned an invalid 768-dimensional embedding.');
        }

        return values;

    } finally {
        clearTimeout(timeoutId);
    }
}

module.exports = { generateEmbedding };
