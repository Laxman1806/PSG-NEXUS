const { MongoClient } = require("mongodb");

let client = null;
let db = null;
let connectionPromise = null;

async function connectDB() {
    if (db) return db;
    if (connectionPromise) return connectionPromise;

    connectionPromise = (async () => {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            throw new Error("MONGODB_URI is missing from the .env file.");
        }

        const maxAttempts = 3;
        let lastError;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const currentClient = new MongoClient(uri, {
                // Atlas SRV connections can resolve to IPv6 on some networks.
                // IPv4 is often more reliable on Windows networks.
                family: 4,
                tls: true,
                serverSelectionTimeoutMS: 15000,
                connectTimeoutMS: 15000,
                socketTimeoutMS: 45000,
                maxPoolSize: 10,
                retryReads: true,
                retryWrites: true
            });

            try {
                console.log(`Connecting to MongoDB Atlas (attempt ${attempt}/${maxAttempts})...`);
                await currentClient.connect();
                await currentClient.db(process.env.MONGODB_DATABASE || "psg_chatbot")
                    .command({ ping: 1 });

                client = currentClient;
                db = currentClient.db(process.env.MONGODB_DATABASE || "psg_chatbot");

                console.log(`MongoDB connected successfully! Database: ${db.databaseName}`);
                return db;
            } catch (error) {
                lastError = error;
                await currentClient.close().catch(() => {});

                console.error(`MongoDB connection attempt ${attempt} failed: ${error.message}`);

                if (attempt < maxAttempts) {
                    const delay = attempt * 2000;
                    console.log(`Retrying MongoDB connection in ${delay / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw new Error(
            `Could not connect to MongoDB Atlas after ${maxAttempts} attempts. ` +
            `Last error: ${lastError?.message || "Unknown connection error"}`
        );
    })();

    try {
        return await connectionPromise;
    } finally {
        connectionPromise = null;
    }
}

function getDB() {
    if (!db) {
        throw new Error("MongoDB is not connected. Check the /health endpoint and Atlas connection.");
    }
    return db;
}

function getClient() {
    if (!client) {
        throw new Error("MongoDB client is not connected.");
    }
    return client;
}

function isDBConnected() {
    return Boolean(db && client);
}

async function closeDB() {
    if (client) {
        await client.close();
    }
    client = null;
    db = null;
}

module.exports = {
    connectDB,
    getDB,
    getClient,
    isDBConnected,
    closeDB
};
