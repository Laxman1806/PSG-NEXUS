
require("dotenv").config();

const { connectDB, getDB } = require("./src/config/database");

async function testDatabase() {
    try {
        console.log("Connecting to MongoDB...");

        await connectDB();

        const db = getDB();

        await db.command({ ping: 1 });

        console.log("MongoDB connected successfully!");
        console.log("Database:", db.databaseName);
        console.log("Test collection is ready!");

        process.exitCode = 0;

    } catch (error) {
        console.error("MongoDB test failed:");
        console.error(error.message);

        process.exitCode = 1;
    }
}

testDatabase();
