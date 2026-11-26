// tests/e2e/stage9-e2e.test.js - End-to-End API Flow & Live RAG Verification
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../../backend/app');
const { connectDB, closeDB } = require('../../db/connection');
const { config } = require('../../backend/config/env');

describe('Stage 9: End-to-End Chatbot & Website Integration Flows', () => {
    let server;
    let baseUrl;

    before(async () => {
        await connectDB();
        server = http.createServer(app);
        await new Promise((r) => server.listen(0, '127.0.0.1', r));
        baseUrl = `http://127.0.0.1:${server.address().port}`;
    });

    after(async () => {
        if (server) await new Promise((r) => server.close(r));
        await closeDB();
    });

    it('loads website homepage, verifies /admin UI removal, and loads canonical frontend modules', async () => {
        const home = await fetch(`${baseUrl}/`);
        assert.equal(home.status, 200);
        const homeHtml = await home.text();
        assert.ok(homeHtml.includes('/js/chatbot.js'));

        for (const removedPath of ['/admin', '/admin.html', '/js/admin.js']) {
            const removed = await fetch(`${baseUrl}${removedPath}`);
            assert.equal(removed.status, 404, `Expected ${removedPath} to return 404`);
        }

        const ready = await fetch(`${baseUrl}/api/ready`);
        assert.equal(ready.status, 200);
        const readyBody = await ready.json();
        assert.equal(readyBody.status, 'ready');
    });

    it('completes multi-turn grounded conversation with citations, follow-up, feedback & navigation', async () => {
        if (!config.gemini.apiKey) return;

        // Turn 1: Hostel inquiry
        const t1 = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'What are the hostel facilities and mess options at PSG Tech?' })
        });
        assert.equal(t1.status, 200);
        const sessionToken = t1.headers.get('x-session-token');
        const b1 = await t1.json();
        assert.ok(b1.conversationId);
        assert.ok(b1.answer.length > 40);
        assert.ok(Array.isArray(b1.citations) && b1.citations.length > 0);
        assert.equal(b1.navigation, null); // Q&A should not force redirect card

        // Turn 2: Follow-up question using same conversationId & X-Session-Token
        const t2 = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': sessionToken
            },
            body: JSON.stringify({
                conversationId: b1.conversationId,
                message: 'Are there separate facilities for girls?'
            })
        });
        assert.equal(t2.status, 200);
        const b2 = await t2.json();
        assert.equal(b2.conversationId, b1.conversationId);
        assert.ok(b2.answer.length > 30);

        // Turn 3: Explicit navigation intent
        const t3 = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': sessionToken
            },
            body: JSON.stringify({
                conversationId: b1.conversationId,
                message: 'Open the hostel page'
            })
        });
        assert.equal(t3.status, 200);
        const b3 = await t3.json();
        assert.equal(b3.navigation?.url, '/hostel');

        // Turn 4: Submit feedback on conversation
        const fb = await fetch(`${baseUrl}/api/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': sessionToken
            },
            body: JSON.stringify({
                conversationId: b1.conversationId,
                rating: 'up',
                query: 'What are the hostel facilities?'
            })
        });
        assert.equal(fb.status, 201);
    });

    it('handles Tamil and Tanglish queries and abstains on ungrounded topics', async () => {
        if (!config.gemini.apiKey) return;

        const taRes = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'தேர்வு எழுத குறைந்தபட்ச வருகைப்பதிவு எவ்வளவு வேண்டும்?' })
        });
        assert.equal(taRes.status, 200);
        const taBody = await taRes.json();
        assert.equal(taBody.language, 'ta');
        assert.ok(taBody.citations.length > 0);

        const tangRes = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Admission epdi apply pannanum?' })
        });
        assert.equal(tangRes.status, 200);
        const tangBody = await tangRes.json();
        assert.equal(tangBody.language, 'tanglish');
        assert.ok(tangBody.citations.length > 0);

        const oosRes = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'How to bake chocolate cake at home?' })
        });
        assert.equal(oosRes.status, 200);
        const oosBody = await oosRes.json();
        assert.equal(oosBody.status, 'INSUFFICIENT');
        assert.equal(oosBody.citations.length, 0);
    });
});
