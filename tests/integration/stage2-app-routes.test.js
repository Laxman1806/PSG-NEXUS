// tests/integration/stage2-app-routes.test.js
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../../backend/app');

describe('Stage 2: Express Security, Asset Serving & Subdomain Injection', () => {
    let server;
    let baseUrl;

    before(async () => {
        server = http.createServer(app);
        await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
        baseUrl = `http://127.0.0.1:${server.address().port}`;
    });

    after(async () => {
        if (server) await new Promise((resolve) => server.close(resolve));
    });

    it('serves security headers and correlation X-Request-Id', async () => {
        const res = await fetch(`${baseUrl}/api/health`);
        assert.equal(res.status, 200);
        assert.ok(res.headers.get('x-request-id'));
        assert.ok(res.headers.get('x-content-type-options'));
        const body = await res.json();
        assert.equal(body.status, 'alive');
        assert.ok('databaseMode' in body);
    });

    it('serves /api/ready with real dependency diagnostics', async () => {
        const res = await fetch(`${baseUrl}/api/ready`);
        assert.ok(res.status === 200 || res.status === 503);
        const body = await res.json();
        assert.ok(body.checks?.database);
        assert.ok(body.checks?.knowledgeBase);
        assert.ok(body.checks?.gemini);
    });

    it('injects chatbot assets into subdomain routes /sports and /library', async () => {
        for (const route of ['/sports', '/sports/', '/library', '/library/', '/facultyDetails.php', '/placements']) {
            const res = await fetch(`${baseUrl}${route}`);
            assert.equal(res.status, 200, `${route} should return 200`);
            const html = await res.text();
            assert.ok(html.includes('chatbot.css'), `${route} missing chatbot.css`);
            assert.ok(html.includes('/js/chatbot.js') || html.includes('/js/script.js'), `${route} missing chatbot script`);
        }
    });

    it('serves canonical chatbot JS & CSS and preserves /js/script.js compatibility', async () => {
        const js1 = await fetch(`${baseUrl}/js/chatbot.js`);
        const js2 = await fetch(`${baseUrl}/js/script.js`);
        const css = await fetch(`${baseUrl}/css/chatbot.css`);
        assert.equal(js1.status, 200);
        assert.equal(js2.status, 200);
        assert.equal(css.status, 200);
        assert.equal(await js1.text(), await js2.text());
    });

    it('rejects path traversal and empty / oversized /api/chat payloads', async () => {
        const trav = await fetch(`${baseUrl}/..%2fpackage.json`);
        assert.ok(trav.status === 400 || trav.status === 404);

        const emptyChat = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: '   ' })
        });
        assert.equal(emptyChat.status, 400);

        const oversizedChat = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'a'.repeat(1600) })
        });
        assert.equal(oversizedChat.status, 400);
    });

    it('handles greeting on POST /api/chat and issues signed X-Session-Token', async () => {
        const res = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'hello' })
        });
        assert.equal(res.status, 200);
        assert.ok(res.headers.get('x-session-token'));
        const body = await res.json();
        assert.ok(body.reply.includes('PSG NEXUS'));
    });

    it('returns structured 404 for unknown /api/* routes', async () => {
        const res = await fetch(`${baseUrl}/api/nonexistent`);
        assert.equal(res.status, 404);
        const body = await res.json();
        assert.equal(body.error.code, 'NOT_FOUND');
    });
});
