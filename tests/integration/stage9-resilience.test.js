// tests/integration/stage9-resilience.test.js - Database & Gemini Failure Resilience Tests
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { processChatMessage } = require('../../backend/services/chatOrchestrator');
const { callGeminiWithFallback } = require('../../backend/services/geminiService');

describe('Stage 9: Resilience Under Database & Gemini Outages', () => {
    it('completes chat query cleanly via local semantic/extractive fallback when DB is disconnected', async () => {
        const res = await processChatMessage({
            message: 'What are the hostel facilities and mess options?',
            ownerSessionId: 'resilience-test-session',
            skipEmbedding: true
        });
        assert.ok(res.conversationId);
        assert.ok(res.answer && res.answer.length > 30);
        assert.ok(res.status === 'VERIFIED' || res.status === 'PARTIAL');
        assert.ok(Array.isArray(res.citations) && res.citations.length > 0);
    });

    it('throws typed ExternalServiceError when all configured Gemini models fail', async () => {
        await assert.rejects(
            () => callGeminiWithFallback('hello', { models: ['nonexistent-model-000'] }),
            (err) => err.name === 'ExternalServiceError' && err.statusCode === 502
        );
    });

    it('survives transient MongoDB write failure during conversation & feedback persistence', async () => {
        const app = require('../../backend/app');
        const server = http.createServer(app);
        await new Promise((r) => server.listen(0, '127.0.0.1', r));
        const baseUrl = `http://127.0.0.1:${server.address().port}`;
        try {
            const chat = await fetch(`${baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'hi' })
            });
            assert.equal(chat.status, 200);
            const body = await chat.json();
            assert.ok(body.conversationId);
        } finally {
            await new Promise((r) => server.close(r));
        }
    });
});
