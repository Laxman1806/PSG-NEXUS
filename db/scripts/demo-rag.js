// db/scripts/demo-rag.js
require("dotenv").config();
const { connectDB, getDB } = require("../connection");
const { searchWebsite } = require("../searchService");
const { generateAnswer } = require("../../backend/services/geminiService");

async function runDemo() {
    console.log("---------------------------------------");
    console.log("PSG Tech RAG Chatbot – Demo / Test Run");
    console.log("---------------------------------------");

    try {
        await connectDB();

        const questions = [
            "What programmes are offered at PSG Tech?",
            "Tell me about placements in PSG Tech",
            "What are the hostel rules?"
        ];

        for (const q of questions) {
            console.log(`\n========================================`);
            console.log(`User Question: ${q}`);
            console.log(`========================================`);

            const chunks = await searchWebsite(q);
            const context = chunks.map(c => `[Source: ${c.title}]\n${c.content}`).join("\n\n");
            const answer = await generateAnswer(q, context);

            console.log(`\nAI Answer:\n${answer}\n`);
        }

        process.exit(0);
    } catch (err) {
        console.error("Demo failed:", err.message);
        process.exit(1);
    }
}

runDemo();
