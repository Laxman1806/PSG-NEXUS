// tests/security/stage7-frontend-xss.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const http = require('node:http');
const app = require('../../backend/app');

describe('Stage 7: Frontend XSS Safety, Clean Embedding & CORS', () => {
    it('eliminates inline onclick handlers and unsafe innerHTML model rendering in chatbot.js', () => {
        const js = fs.readFileSync(path.resolve(__dirname, '../../frontend/js/chatbot.js'), 'utf8');
        assert.ok(!js.includes('onclick='));
        // innerHTML is only allowed for static trusted SVG icon literals and DOM resets.
        // Model/API text must NEVER be passed to innerHTML — it must use safe DOM node creation.
        // Verify no innerHTML call receives a model text variable directly.
        const dangerousInnerHtml = /(?:msg\.text|data\.answer|data\.reply|rawText|\.text)\s*[^=\n]*\.innerHTML\s*=|\.innerHTML\s*=\s*(?:msg\.text|data\.answer|data\.reply|rawText)/.test(js);
        assert.ok(!dangerousInnerHtml, 'Model output must never be assigned to innerHTML');
        const innerHtmlMatches = js.match(/\.innerHTML\s*=/g) || [];
        assert.ok(innerHtmlMatches.length <= 10, `Too many innerHTML usages (${innerHtmlMatches.length}); only static SVG/icon literals and DOM resets allowed`);
        assert.ok(js.includes('ALLOWED_ROUTES'));
        assert.ok(js.includes('aria-live'));
    });

    it('serves clean modular chatbot assets across homepage and subpages without duplicate JS', async () => {
        assert.equal(fs.existsSync(path.resolve(__dirname, '../../frontend/js/script.js')), false);
        assert.equal(fs.existsSync(path.resolve(__dirname, '../../frontend/js/chat-api.js')), true);
        assert.equal(fs.existsSync(path.resolve(__dirname, '../../frontend/js/conversation-manager.js')), true);

        const server = http.createServer(app);
        await new Promise((r) => server.listen(0, '127.0.0.1', r));
        const baseUrl = `http://127.0.0.1:${server.address().port}`;
        try {
            for (const p of ['/', '/hostel', '/sports', '/library']) {
                const res = await fetch(`${baseUrl}${p}`);
                assert.equal(res.status, 200);
                const html = await res.text();
                assert.ok(html.includes('/css/chatbot.css'), `${p} missing css`);
                assert.ok(html.includes('/js/chat-api.js'), `${p} missing chat-api.js`);
                assert.ok(html.includes('/js/conversation-manager.js'), `${p} missing conversation-manager.js`);
                assert.ok(html.includes('/js/chatbot.js'), `${p} missing chatbot.js`);
            }

            // Reject disallowed CORS origin with 403
            const badCors = await fetch(`${baseUrl}/api/health`, {
                headers: { Origin: 'https://evil-attacker.example' }
            });
            assert.equal(badCors.status, 403);
        } finally {
            await new Promise((r) => server.close(r));
        }
    });
});
