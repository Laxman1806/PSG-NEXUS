// db/scripts/test-edge-cases.js
const http = require('http');

const testCases = [
    { query: "Hi", expected: "Greeting" },
    { query: "Hello there, who are you?", expected: "Greeting" },
    { query: "How to bake chocolate cake at home?", expected: "Out of scope / redirect to PSG" },
    { query: "   ", expected: "Validation error" }
];

function sendChat(query) {
    return new Promise((resolve) => {
        const payload = JSON.stringify({ message: query });
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
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
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (err) => resolve({ error: err.message }));
        req.write(payload);
        req.end();
    });
}

async function run() {
    console.log("=== Testing Edge Cases & Guardrails ===");
    for (const tc of testCases) {
        console.log(`\n-----------------------------------------`);
        console.log(`Input: "${tc.query}" [Expected: ${tc.expected}]`);
        const res = await sendChat(tc.query);
        console.log(`HTTP Status:`, res.status);
        console.log(`Reply:`, res.body?.reply || res.body?.response || res.body);
    }
}

run();
