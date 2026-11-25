// db/connection.js - MongoDB Connection Manager
require('dotenv').config();
const { MongoClient } = require("mongodb");

let client = null;
let db = null;

async function connectDB() {
    if (db) return db;

    const atlasUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    const localUri = "mongodb://127.0.0.1:27017/psg_chatbot";

    // 1. Try Atlas first if URI provided
    if (atlasUri) {
        try {
            console.log("☁️  Connecting to MongoDB Atlas (database: psg_chatbot)...");
            client = new MongoClient(atlasUri, { serverSelectionTimeoutMS: 4000 });
            await client.connect();
            db = client.db("psg_chatbot");
            console.log("✅ MongoDB Atlas connected successfully (database: psg_chatbot)");
            return db;
        } catch (atlasErr) {
            console.warn("⚠️  MongoDB Atlas connection note:", atlasErr.message);
        }
    }

    // 2. Fall back to local MongoDB
    try {
        console.log("📦 Connecting to local MongoDB...");
        client = new MongoClient(localUri, { serverSelectionTimeoutMS: 3000 });
        await client.connect();
        db = client.db("psg_chatbot");
        console.log("✅ Local MongoDB connected successfully (database: psg_chatbot)");
        return db;
    } catch (localErr) {
        console.warn("⚠️  Local MongoDB note:", localErr.message);
        console.log("💡 Running with local semantic search cache (db/data/knowledge_chunks.json).");
        return null;
    }
}

function getDB() {
    return db;
}

/**
 * Closes the active MongoDB client connection cleanly during server shutdown.
 */
async function closeDB() {
    if (client) {
        await client.close().catch(() => {});
        client = null;
        db = null;
    }
}

module.exports = { connectDB, getDB, closeDB };
