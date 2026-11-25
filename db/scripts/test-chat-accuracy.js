// db/scripts/test-chat-accuracy.js
require('dotenv').config();
const http = require('http');
const PORT = process.env.PORT || 5000;

const queries = [
    "What are the placement packages and top recruiting companies at PSG Tech?",
    "What is the minimum attendance requirement for semester exams at PSG Tech?",
    "What are the hostel facilities, mess options, and gate timings for boys and girls?",
    "How can I apply for MCA or MBA admissions at PSG Tech and what entrance exams are required?",
    "Who is the Principal of PSG College of Technology and when was the institution founded?"
];

function sendChat(query) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({ message: query });
        const req = http.request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve({ raw: data });
                }
            });
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function run() {
    console.log("=== Testing PSG Nexus Chatbot API Accuracy ===");
    for (const q of queries) {
        console.log(`\n======================================================`);
        console.log(`Q: "${q}"`);
        const start = Date.now();
        const res = await sendChat(q);
        const duration = ((Date.now() - start) / 1000).toFixed(2);
        console.log(`⏱️ Latency: ${duration}s`);
        console.log(`📍 Sources:`, res.sources ? res.sources.map(s => `${s.title} (${s.score})`).join(', ') : 'none');
        console.log(`🤖 Answer:\n${res.reply || res.response}`);
    }
}

run().catch(console.error);
