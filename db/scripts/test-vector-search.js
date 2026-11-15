// db/scripts/test-vector-search.js
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { generateEmbedding } = require('../../backend/services/embeddingService');

async function testAtlasVectorSearch() {
    console.log("=== Testing Atlas Vector Search & Retrieval ===");
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db('psg_chatbot');
    const col = db.collection('website_chunks');

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
        const queryEmbedding = await generateEmbedding(q);
        console.log(`Generated embedding: ${queryEmbedding.length} dimensions`);

        try {
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
        } catch (err) {
            console.error(`❌ Atlas Vector Search failed for query:`, err.message);
        }
    }

    await client.close();
}

testAtlasVectorSearch().catch(console.error);
