
require("dotenv").config();

const { connectDB } = require("../src/config/database");
const { searchWebsite } = require("../src/services/searchService");
const { generateAnswer } = require("../src/services/geminiService");

async function runRAGDemo() {
    try {
        // Connect to MongoDB Atlas
        console.log("\nConnecting to MongoDB...");
        await connectDB();

        console.log("MongoDB connected successfully!");

        // Ask a sample question
        const question = "who is the founder of PSG Tech?";

        console.log("\n==================================");
        console.log("       PSG NEXUS - RAG DEMO");
        console.log("==================================");

        console.log("\nSTUDENT QUESTION:");
        console.log(question);

        // STEP 1: Convert question into embedding
        // This happens internally inside searchWebsite().
        console.log("\nSTEP 1: Generating question embedding...");

        // STEP 2: Search MongoDB Atlas Vector Search
        console.log("\nSTEP 2: Retrieving relevant information...");

        const results = await searchWebsite(question);

        if (!results || results.length === 0) {
            console.log("\nNo relevant website information found.");
            return;
        }

        console.log(`\nRetrieved ${results.length} relevant chunks.`);

        // Display retrieved website information
        console.log("\nRETRIEVED CONTEXT:");

        results.forEach((item, index) => {
            console.log(`\n--- Result ${index + 1} ---`);
            console.log("Title:", item.title || "Untitled");
            console.log("Source:", item.url || "Unknown");
            console.log("Similarity Score:", item.score);
            console.log("Content:", item.content);
        });

        // STEP 3: Combine retrieved chunks into context
        const context = results.map((item, index) => {
            return `
Source ${index + 1}
Title: ${item.title || "Untitled"}
URL: ${item.url || "Unknown"}
Content: ${item.content}
`;
        }).join("\n");

        // STEP 4: Send question and context to Gemini
        console.log("\nSTEP 3: Generating answer using Gemini...");

        const answer = await generateAnswer(question, context);

        // STEP 5: Display final answer
        console.log("\n==================================");
        console.log("          FINAL ANSWER");
        console.log("==================================");

        console.log(answer);

        console.log("\n==================================");
        console.log("       RAG DEMO COMPLETED");
        console.log("==================================");

    } catch (error) {
        console.error("\nRAG DEMO FAILED:");
        console.error(error.message);
        process.exitCode = 1;

    } finally {
        // Close the MongoDB connection after demonstration
        const { getDB } = require("../src/config/database");

        try {
            // The MongoDB client is managed by database.js.
            // The main server uses a separate process.
            // This script exits after completing its work.
        } catch (error) {
            console.error(error.message);
        }
    }
}

runRAGDemo();
