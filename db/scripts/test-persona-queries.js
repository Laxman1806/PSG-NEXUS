// db/scripts/test-persona-queries.js
const http = require('http');

const queries = [
    {
        persona: "👨‍👩‍👧 PARENT",
        q: "As a parent, how can I monitor my child's attendance and marks, and what medical and safety precautions exist if my child falls sick in the hostel?"
    },
    {
        persona: "🎓 PROSPECTIVE STUDENT",
        q: "What makes the 5-year B.E. Sandwich programme special at PSG Tech, and what is the TNEA counselling code and cutoff?"
    },
    {
        persona: "📍 VISITOR / RECRUITER",
        q: "We are visiting PSG Tech from Bangalore. How far is the campus from Coimbatore airport and railway station, do you have an on-campus guest house, and who should we contact for placement drives?"
    }
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
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve({ raw: data });
                }
            });
        });

        req.on('error', (err) => resolve({ error: err.message }));
        req.write(payload);
        req.end();
    });
}

async function run() {
    console.log("=== Testing Persona-Targeted Answers ===");
    for (const item of queries) {
        console.log(`\n======================================================`);
        console.log(`Persona: ${item.persona}`);
        console.log(`Query: "${item.q}"`);
        const start = Date.now();
        const res = await sendChat(item.q);
        const duration = ((Date.now() - start) / 1000).toFixed(2);
        console.log(`⏱️ Latency: ${duration}s`);
        console.log(`📍 Sources:`, res.sources ? res.sources.map(s => `${s.title} (${s.score})`).join(', ') : 'none');
        console.log(`🤖 Answer:\n${res.reply || res.response}`);
    }
}

run();
