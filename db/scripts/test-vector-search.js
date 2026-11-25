// db/scripts/test-vector-search.js
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { generateEmbedding } = require('../../backend/services/embeddingService');
const { searchWebsite } = require('../searchService');

async function testAtlasVectorSearch() {
    console.log("=== Testing Vector Search & Retrieval ===");
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    let client = null;
    let col = null;

    if (mongoUri) {
        client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });
        try {
            await client.connect();
            const db = client.db('psg_chatbot');
            col = db.collection(process.env.MONGODB_COLLECTION || 'website_chunks');
            console.log("✅ Connected to MongoDB Atlas.");
        } catch (err) {
            console.warn(`⚠️ MongoDB Atlas unavailable (${err.message}). Falling back to local semantic vector search.`);
            await client.close().catch(() => {});
            client = null;
            col = null;
        }
    }

    const queries = [
        "What are the placement packages and top recruiting companies at PSG Tech?",
        "What is the attendance requirement and criteria for semester exam?",
        "Tell me about hostel facilities, mess and gate timings for boys and girls",
        "How can I apply for MCA or MBA admissions at PSG Tech?",
        "Who is the Principal of PSG College of Technology?",
        "Who are the Heads of Departments (HoDs)?"
    ];

    for (const q of queries) {
        console.log(`\n🔍 Query: "${q}"`);

        if (col) {
            try {
                const queryEmbedding = await generateEmbedding(q);
                console.log(`Generated embedding: ${queryEmbedding.length} dimensions`);
                const results = await col.aggregate([
                    {
                        $vectorSearch: {
                            index: process.env.VECTOR_INDEX_NAME || "vector_index",
                            path: "embedding",
                            queryVector: queryEmbedding,
                            numCandidates: 39,
                            limit: 3
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            title: 1,
                            url: 1,
                            score: { $meta: "vectorSearchScore" },
                            contentPreview: { $substrCP: ["$content", 0, 150] }
                        }
                    }
                ]).toArray();

                console.log(`✅ Atlas Vector Search retrieved ${results.length} matches:`);
                results.forEach((r, idx) => {
                    console.log(`   [${idx + 1}] Score: ${r.score.toFixed(4)} | Title: ${r.title} (${r.url})`);
                    console.log(`       Preview: ${r.contentPreview.replace(/\n/g, ' ')}...`);
                });
                continue;
            } catch (err) {
                console.warn(`⚠️ Atlas Vector Search failed (${err.message}), using local search fallback...`);
            }
        }

        const localResults = await searchWebsite(q);
        console.log(`✅ Local Semantic Search retrieved ${localResults.length} matches:`);
        localResults.forEach((r, idx) => {
            console.log(`   [${idx + 1}] Score: ${(r.score || 0).toFixed(4)} | Title: ${r.title} (${r.url})`);
            console.log(`       Preview: ${(r.content || '').slice(0, 150).replace(/\n/g, ' ')}...`);
        });
    }

    if (client) {
        await client.close().catch(() => {});
    }
}

testAtlasVectorSearch().catch((err) => {
    console.error("Vector search test error:", err.message);
    process.exit(1);
});
