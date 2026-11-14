const fs = require("fs");
const path = require("path");
const { getDB } = require("../config/database");
const { generateEmbedding } = require("./embeddingservice");

// Math helpers for vector similarity
function dotProduct(a, b) {
    let sum = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) sum += a[i] * b[i];
    return sum;
}

function magnitude(a) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += a[i] * a[i];
    return Math.sqrt(sum);
}

function cosineSimilarity(a, b) {
    const magA = magnitude(a);
    const magB = magnitude(b);
    if (magA === 0 || magB === 0) return 0;
    return dotProduct(a, b) / (magA * magB);
}

// Load cached knowledge chunks from data/knowledge_chunks.json
let localChunksCache = null;
function getLocalChunks() {
    if (!localChunksCache) {
        const cacheFile = path.resolve(__dirname, "../../data/knowledge_chunks.json");
        if (fs.existsSync(cacheFile)) {
            try {
                localChunksCache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
                console.log(`📚 Loaded ${localChunksCache.length} knowledge chunks from cache.`);
            } catch (err) {
                console.warn("⚠️ Failed reading knowledge cache:", err.message);
            }
        }
    }
    return localChunksCache || [];
}

// Fallback keyword-based search in case embedding API is temporarily unavailable
function searchByKeywords(question, chunks, limit = 3) {
    const words = question
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 2 && !["what", "when", "where", "which", "who", "whom", "how", "the", "and", "for", "with", "about"].includes(w));

    if (words.length === 0) return chunks.slice(0, limit);

    const scored = chunks.map(chunk => {
        const text = (chunk.title + " " + chunk.content).toLowerCase();
        let matches = 0;
        for (const word of words) {
            if (text.includes(word)) matches += 1;
        }
        return {
            title: chunk.title,
            url: chunk.url,
            content: chunk.content,
            score: matches / words.length
        };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.filter(s => s.score > 0).slice(0, limit);
}

async function searchWebsite(question) {
    const chunks = getLocalChunks();
    let queryEmbedding = null;

    // Step 1: Generate embedding vector (with retry)
    try {
        queryEmbedding = await generateEmbedding(question);
    } catch (embedError) {
        console.warn("⚠️ Embedding call note (will use keyword fallback if needed):", embedError.message);
        try {
            await new Promise(r => setTimeout(r, 600));
            queryEmbedding = await generateEmbedding(question);
        } catch (retryErr) {
            console.warn("⚠️ Second embedding attempt also failed:", retryErr.message);
        }
    }

    // Step 2: Try MongoDB Atlas Vector Search first if connected
    try {
        const db = getDB();
        if (db && queryEmbedding) {
            const collection = db.collection(process.env.MONGODB_COLLECTION || "website_chunks");
            const atlasResults = await collection.aggregate([
                {
                    $vectorSearch: {
                        index: process.env.VECTOR_INDEX_NAME || "vector_index",
                        path: "embedding",
                        queryVector: queryEmbedding,
                        numCandidates: 100,
                        limit: 3
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

            if (atlasResults && atlasResults.length > 0) {
                console.log(`🌐 Retrieved ${atlasResults.length} chunks via Atlas Vector Search.`);
                return atlasResults;
            }
        }
    } catch (dbError) {
        // Normal fallback if Atlas Search index is not yet built or DB is local
        console.log("ℹ️ Vector Search via DB unavailable, using local semantic engine:", dbError.message);
    }

    // Step 3: Local Semantic Search (Cosine Similarity across 768d vectors)
    if (queryEmbedding && chunks.length > 0) {
        const ranked = chunks.map(chunk => ({
            title: chunk.title,
            url: chunk.url,
            content: chunk.content,
            score: cosineSimilarity(queryEmbedding, chunk.embedding)
        }));

        ranked.sort((a, b) => b.score - a.score);
        const topResults = ranked.filter(r => r.score >= 0.55).slice(0, 3);

        if (topResults.length > 0) {
            console.log(`🔍 Retrieved ${topResults.length} chunks via local Semantic Vector Engine (top score: ${topResults[0].score.toFixed(3)})`);
            return topResults;
        }
    }

    // Step 4: Fallback to keyword relevance matching
    console.log("🔍 Falling back to keyword search across knowledge chunks...");
    return searchByKeywords(question, chunks, 3);
}

module.exports = { searchWebsite };
