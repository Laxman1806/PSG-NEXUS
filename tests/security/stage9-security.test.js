// tests/security/stage9-security.test.js - Security, Rate Limiting & Data Isolation Tests
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const { createLimiter } = require('../../backend/middleware/rateLimiter');
const { fetchApprovedUrl } = require('../../db/ingestion/extractors');
const app = require('../../backend/app');

describe('Stage 9: Security Hardening, SSRF Prevention & Rate Limiting', () => {
    let server;
    let baseUrl;

    before(async () => {
        server = http.createServer(app);
        await new Promise((r) => server.listen(0, '127.0.0.1', r));
        baseUrl = `http://127.0.0.1:${server.address().port}`;
    });

    after(async () => {
        if (server) await new Promise((r) => server.close(r));
    });

    it('blocks SSRF / unapproved external URL fetches in ingestion extractor', async () => {
        await assert.rejects(
            () => fetchApprovedUrl('http://169.254.169.254/latest/meta-data/'),
            /not in the approved institutional URL allowlist/
        );
        await assert.rejects(
            () => fetchApprovedUrl('file:///etc/passwd'),
            /Unsupported URL protocol/
        );
    });

    it('enforces strict rate limiting with HTTP 429 JSON error response', async () => {
        const limitedApp = express();
        limitedApp.use(createLimiter({ windowMs: 60000, max: 2, message: 'Rate limit hit' }));
        limitedApp.get('/ping', (_req, res) => res.json({ ok: true }));

        const srv = http.createServer(limitedApp);
        await new Promise((r) => srv.listen(0, '127.0.0.1', r));
        const url = `http://127.0.0.1:${srv.address().port}/ping`;

        try {
            const r1 = await fetch(url);
            const r2 = await fetch(url);
            const r3 = await fetch(url);
            assert.equal(r1.status, 200);
            assert.equal(r2.status, 200);
            assert.equal(r3.status, 429);
            const b3 = await r3.json();
            assert.equal(b3.error.code, 'RATE_LIMIT_EXCEEDED');
        } finally {
            await new Promise((r) => srv.close(r));
        }
    });

    it('rejects oversized JSON bodies and malformed JSON safely without stack leaks', async () => {
        const badJson = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{bad json'
        });
        assert.equal(badJson.status, 400);
        const badBody = await badJson.json();
        assert.equal(badBody.error.code, 'INVALID_JSON');

        const huge = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'x'.repeat(120 * 1024) })
        });
        assert.equal(huge.status, 413);
    });

    it('blocks MongoDB operator injection attempts inside chat request body', async () => {
        const res = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: { $ne: null } })
        });
        assert.equal(res.status, 400);
    });
});
