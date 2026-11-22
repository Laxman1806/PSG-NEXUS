
const { getDB } = require("../config/database");
const { generateEmbedding } = require("./embeddingService");

async function searchWebsite(question) {
    try {
        // Step 1: Generate embedding for the question
        const queryEmbedding = await generateEmbedding(question);

        // Step 2: Access MongoDB collection
        const db = getDB();
        const collection = db.collection("website_chunks");

        // Step 3: Search for relevant content
        const results = await collection.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "embedding",
                    queryVector: queryEmbedding,
                    numCandidates: 768,
                    limit: 3
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

        return results;

    } catch (error) {
        console.error("Search service error:", error.message);
        throw error;
    }
}

module.exports = { searchWebsite };
