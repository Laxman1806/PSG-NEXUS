const { MongoClient } = require("mongodb");

let client = null;
let db = null;

async function connectDB() {
    const atlasUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    const localUri = "mongodb://127.0.0.1:27017/psg_chatbot";

    // 1. Try Atlas first if URI provided
    if (atlasUri) {
        try {
            console.log("☁️ Attempting MongoDB Atlas connection...");
            client = new MongoClient(atlasUri, { serverSelectionTimeoutMS: 3000 });
            await client.connect();
            db = client.db("psg_chatbot");
            console.log("✅ MongoDB Atlas connected successfully (database: psg_chatbot)");
            return db;
        } catch (atlasErr) {
            console.warn("⚠️ MongoDB Atlas connection note:", atlasErr.message);
        }
    }

    // 2. Fall back to local MongoDB
    try {
        console.log("📦 Connecting to local MongoDB (mongodb://127.0.0.1:27017/psg_chatbot)...");
        client = new MongoClient(localUri, { serverSelectionTimeoutMS: 3000 });
        await client.connect();
        db = client.db("psg_chatbot");
        console.log("✅ Local MongoDB connected successfully (database: psg_chatbot)");
        return db;
    } catch (localErr) {
        console.warn("⚠️ Local MongoDB note:", localErr.message);
        console.log("💡 The application will run using in-memory semantic search from data/knowledge_chunks.json.");
        return null;
    }
}

function getDB() {
    return db;
}

module.exports = { connectDB, getDB };
