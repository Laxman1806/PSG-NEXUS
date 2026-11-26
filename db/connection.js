// db/connection.js
// Production and development: MongoDB Atlas ONLY

require("dotenv").config();

const { MongoClient } = require("mongodb");

let client = null;
let db = null;
let connectionPromise = null;

const DATABASE_NAME = "psg_chatbot";

async function connectDB() {
    if (db) {
        return db;
    }

    // Prevent multiple simultaneous connection attempts
    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = (async () => {
        const atlasUri =
            process.env.MONGO_URI || process.env.MONGODB_URI;

        if (!atlasUri) {
            throw new Error(
                "MongoDB Atlas connection URI is missing. Configure MONGO_URI."
            );
        }

        // Reject local MongoDB addresses
        let parsedUri;

        try {
            parsedUri = new URL(atlasUri);
        } catch {
            throw new Error("MongoDB connection URI is invalid.");
        }

        if (
            !["mongodb:", "mongodb+srv:"].includes(parsedUri.protocol) ||
            ["localhost", "127.0.0.1", "::1"].includes(parsedUri.hostname)
        ) {
            throw new Error(
                "Only a remote MongoDB Atlas connection is permitted."
            );
        }

        const newClient = new MongoClient(atlasUri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            maxPoolSize: 10
        });

        try {
            console.log("Connecting to MongoDB Atlas...");

            await newClient.connect();

            const atlasDB = newClient.db(DATABASE_NAME);

            // Verify that the database connection actually works
            await atlasDB.command({ ping: 1 });

            client = newClient;
            db = atlasDB;

            console.log(
                "MongoDB Atlas connected successfully."
            );

            return db;

        } catch (error) {
            await newClient.close().catch(() => {});

            client = null;
            db = null;

            console.error(
                "MongoDB Atlas connection failed:",
                error.message
            );

            throw new Error(
                "MongoDB Atlas is unavailable. Local database fallback is disabled."
            );
        }
    })();

    try {
        return await connectionPromise;
    } finally {
        connectionPromise = null;
    }
}

function getDB() {
    if (!db) {
        throw new Error(
            "MongoDB Atlas is not connected."
        );
    }

    return db;
}

async function closeDB() {
    if (client) {
        await client.close();
        client = null;
        db = null;

        console.log("MongoDB Atlas connection closed.");
    }
}

module.exports = {
    connectDB,
    getDB,
    closeDB
};