// db/searchService.js - Vector Search & Knowledge Retrieval
const fs = require("fs");
const path = require("path");
const { getDB } = require("./connection");
const { generateEmbedding } = require("../backend/services/embeddingService");

// Vector math helpers
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
    if (!Array.isArray(a) || !Array.isArray(b)) return 0;
    const magA = magnitude(a);
    const magB = magnitude(b);
    if (magA === 0 || magB === 0) return 0;
    return dotProduct(a, b) / (magA * magB);
}

// Load cached knowledge chunks from db/data/knowledge_chunks.json
let localChunksCache = null;
function getLocalChunks() {
    if (!localChunksCache) {
        const cacheFile = path.resolve(__dirname, "./data/knowledge_chunks.json");
        if (fs.existsSync(cacheFile)) {
            try {
                localChunksCache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
                console.log(`📚 Loaded ${localChunksCache.length} knowledge chunks from local cache.`);
            } catch (err) {
                console.warn("⚠️ Failed reading knowledge cache:", err.message);
            }
        }
    }
    return localChunksCache || [];
}

// Smart keyword & semantic fallback
function searchByKeywords(question, chunks, limit = 3) {
    const stopWords = new Set(["what", "when", "where", "which", "who", "whom", "how", "the", "and", "for", "with", "about", "are", "is", "can", "tell"]);
    const cleanQ = question.toLowerCase();
    const words = cleanQ
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));

    if (words.length === 0) return chunks.slice(0, limit);

    const scored = chunks.map(chunk => {
        const titleText = (chunk.title || "").toLowerCase();
        const contentText = (chunk.content || "").toLowerCase();
        let score = 0;

        for (const word of words) {
            if (titleText.includes(word)) score += 3.0; // Higher weight for title matches
            if (contentText.includes(word)) score += 1.0;
        }

        // Domain-specific synonym boosting
        if (cleanQ.includes("hostel") && titleText.includes("hostel")) score += 5.0;
        if (cleanQ.includes("placement") && titleText.includes("placement")) score += 5.0;
        if (cleanQ.includes("attendance") && titleText.includes("attendance")) score += 5.0;
        if (cleanQ.includes("admission") && titleText.includes("admission")) score += 5.0;
        if ((cleanQ.includes("syllab") || cleanQ.includes("syllub") || cleanQ.includes("curriculum") || cleanQ.includes("programme") || cleanQ.includes("course")) && (titleText.includes("programme") || titleText.includes("syllabus") || (chunk.url || "").includes("programme"))) score += 5.0;
        if ((cleanQ.includes("staff") || cleanQ.includes("faculty") || cleanQ.includes("hod")) && (titleText.includes("faculty") || titleText.includes("head") || (chunk.url || "").includes("faculty"))) score += 5.0;
        if ((cleanQ.includes("mca") || cleanQ.includes("mba")) && (titleText.includes("admission") || contentText.includes("mca"))) score += 5.0;
        if (cleanQ.includes("principal") && (titleText.includes("principal") || contentText.includes("principal"))) score += 5.0;

        return {
            title: chunk.title,
            url: chunk.url,
            content: chunk.content,
            score: score
        };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.filter(s => s.score > 0).slice(0, limit);
}

// Main search orchestrator
async function searchWebsite(question) {
    const chunks = getLocalChunks();
    let queryEmbedding = null;

    // 1. Generate 768-dim embedding vector
    try {
        queryEmbedding = await generateEmbedding(question);
    } catch (embedError) {
        console.warn("⚠️ Embedding call note (using keyword fallback if needed):", embedError.message);
    }

    // 2. Query MongoDB Atlas Vector Search if DB connected and vector ready
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
        console.log("ℹ️ Vector Search via Atlas note:", dbError.message);
    }

    // 3. Fallback to Local Semantic Search (Cosine Similarity on 768d vectors)
    if (queryEmbedding && chunks.length > 0) {
        const ranked = chunks.map(chunk => ({
            title: chunk.title,
            url: chunk.url,
            content: chunk.content,
            score: cosineSimilarity(queryEmbedding, chunk.embedding)
        }));

        ranked.sort((a, b) => b.score - a.score);
        const topResults = ranked.filter(r => r.score >= 0.35).slice(0, 3);

        if (topResults.length > 0) {
            console.log(`🔍 Retrieved ${topResults.length} chunks via local Semantic Engine (score: ${topResults[0].score.toFixed(3)})`);
            return topResults;
        }
    }

    // 4. Keyword Fallback
    console.log("🔍 Falling back to keyword relevance matching...");
    return searchByKeywords(question, chunks, 3);
}

module.exports = { searchWebsite };
