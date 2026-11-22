const { getDB } = require("../config/database");
const { generateEmbedding } = require("./embeddingservice");

async function searchWebsite(question) {
    if (!question || !question.trim()) {
        throw new Error("Please provide a question to search.");
    }

    const queryEmbedding = await generateEmbedding(question);
    const db = getDB();
    const collection = db.collection(process.env.MONGODB_COLLECTION || "website_chunks");
    const limit = Math.max(1, Number(process.env.TOP_K || 4));

    return collection.aggregate([
        {
            $vectorSearch: {
                index: process.env.VECTOR_INDEX_NAME || "vector_index",
                path: "embedding",
                queryVector: queryEmbedding,
                numCandidates: Math.max(limit * 20, 100),
                limit
            }
        },
        {
            $project: {
                _id: 0,
                title: 1,
                content: 1,
                url: 1,
                score: { $meta: "vectorSearchScore" }
            }
        }
    ]).toArray();
}

module.exports = { searchWebsite };
