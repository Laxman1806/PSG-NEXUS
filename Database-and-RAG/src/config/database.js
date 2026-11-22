const { MongoClient } = require("mongodb");

let client;
let db;

async function connectDB() {
    try {
        client = new MongoClient(process.env.MONGODB_URI);

        await client.connect();

        db = client.db("psg_chatbot");

        console.log("MongoDB connected successfully!");

        return db;

    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
}

function getDB() {
    if (!db) {
        throw new Error("Database is not connected");
    }

    return db;
}

module.exports = { connectDB, getDB };