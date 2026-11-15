// db/scripts/test-recommended-models.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const candidates = [
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite-preview',
    'gemini-3-flash-preview'
];

async function testModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    for (const name of candidates) {
        console.log(`\nTesting model: ${name}...`);
        const start = Date.now();
        try {
            const model = genAI.getGenerativeModel({ model: name });
            const res = await model.generateContent("Say 'PSG Tech AI Online' in one phrase.");
            const latency = ((Date.now() - start) / 1000).toFixed(2);
            console.log(`✅ Success in ${latency}s:`, res.response.text().trim());
        } catch (err) {
            const latency = ((Date.now() - start) / 1000).toFixed(2);
            console.log(`❌ Failed in ${latency}s:`, err.message);
        }
    }
}

testModels().catch(console.error);
