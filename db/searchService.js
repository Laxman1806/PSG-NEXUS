
// db/searchService.js
// MongoDB Atlas Vector Search ONLY
// No local JSON, cosine similarity, or keyword fallback.

const { getDB } = require("./connection");
const { generateEmbedding } = require("../backend/services/embeddingService");

const COLLECTION_NAME = process.env.MONGODB_COLLECTION || "website_chunks";
const VECTOR_INDEX_NAME = process.env.VECTOR_INDEX_NAME || "vector_index";
const EMBEDDING_DIMENSIONS = 768;
const RESULT_LIMIT = 3;

async function searchWebsite(question) {
    if (typeof question !== "string" || !question.trim()) {
        throw new Error("A valid search question is required.");
    }

    // 1. Require an active MongoDB Atlas connection.
    const db = getDB();

    // 2. Generate the query embedding.
    const queryEmbedding = await generateEmbedding(question.trim());

    if (
        !Array.isArray(queryEmbedding) ||
        queryEmbedding.length !== EMBEDDING_DIMENSIONS ||
        !queryEmbedding.every(
            value => typeof value === "number" && Number.isFinite(value)
        )
    ) {
        throw new Error(
            `Invalid embedding. Expected ${EMBEDDING_DIMENSIONS} numeric dimensions.`
        );
    }

    // 3. Perform retrieval exclusively through Atlas Vector Search.
    const collection = db.collection(COLLECTION_NAME);

    const results = await collection.aggregate([
        {
            $vectorSearch: {
                index: VECTOR_INDEX_NAME,
                path: "embedding",
                queryVector: queryEmbedding,
                numCandidates: 100,
                limit: RESULT_LIMIT
            }
        },
        {
            $project: {
                _id: 0,
                title: 1,
                content: 1,
                url: 1,
                score: {
                    $meta: "vectorSearchScore"
                }
            }
        }
    ]).toArray();

    console.log(
        `Atlas Vector Search: ${results.length} result(s) retrieved.`
    );

    // An empty array means Atlas returned no matching documents.
    // It does NOT trigger a local fallback.
    return results;
}

module.exports = {
    searchWebsite
};
