// db/scripts/test-model-latency.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const candidates = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite'
];

async function testModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    for (const name of candidates) {
        console.log(`\nTesting model: ${name}...`);
        const start = Date.now();
        try {
            const model = genAI.getGenerativeModel({ model: name });
            const res = await model.generateContent("Give a one-line greeting from PSG Tech AI assistant.");
            const latency = ((Date.now() - start) / 1000).toFixed(2);
            console.log(`✅ Success in ${latency}s:`, res.response.text().trim());
        } catch (err) {
            const latency = ((Date.now() - start) / 1000).toFixed(2);
            console.log(`❌ Failed in ${latency}s:`, err.message);
        }
    }
}

testModels().catch(console.error);
