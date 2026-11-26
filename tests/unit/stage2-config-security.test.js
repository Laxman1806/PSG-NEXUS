// tests/unit/stage2-config-security.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { config, validateConfig, buildCorsOrigins } = require('../../backend/config/env');
const { CHAT_MODEL_PRIORITY, EMBEDDING_CONFIG } = require('../../backend/config/modelConfig');
const { redactString } = require('../../backend/utils/logger');
const { ValidationError, AuthenticationError } = require('../../backend/utils/errors');
const { formatErrorResponse } = require('../../backend/utils/responseFormatter');
const { signSessionId, verifySessionToken, authenticateAdmin } = require('../../backend/middleware/authenticate');
const { requireRole } = require('../../backend/middleware/authorize');
const { sanitizeNavigation, resolveExplicitNavigationIntent } = require('../../backend/controllers/chatController');

describe('Stage 2: Configuration, Logging, Auth & Validation', () => {
    it('deduplicates CHAT_MODEL_PRIORITY and validates embedding dimension consistency', () => {
        const unique = new Set(CHAT_MODEL_PRIORITY);
        assert.equal(unique.size, CHAT_MODEL_PRIORITY.length);
        assert.ok(CHAT_MODEL_PRIORITY.length >= 2);
        assert.equal(EMBEDDING_CONFIG.dimensions, config.gemini.embeddingDimensions);
        assert.equal(EMBEDDING_CONFIG.model, 'gemini-embedding-001');
    });

    it('redacts API keys, MongoDB credentials, and Bearer tokens in logger', () => {
        const raw = 'Error calling https://api.example.com?key=AIzaSyAbcDef1234567890xyz mongodb+srv://admin:supersecret@cluster.mongodb.net/db Bearer tok_12345';
        const clean = redactString(raw);
        assert.ok(!clean.includes('AIzaSyAbcDef1234567890xyz'));
        assert.ok(!clean.includes('supersecret'));
        assert.ok(!clean.includes('tok_12345'));
        assert.ok(clean.includes('[REDACTED]'));
    });

    it('signs and verifies anonymous session tokens without tampering', () => {
        const signed = signSessionId('conv-session-12345678');
        assert.equal(verifySessionToken(signed), 'conv-session-12345678');
        assert.equal(verifySessionToken(`${signed}a`), null);
        assert.equal(verifySessionToken('unsigned-token'), null);
    });

    it('fails closed on admin auth when ADMIN_API_KEY is unset or invalid', () => {
        const mockReq = { get: () => '' };
        let capturedErr = null;
        authenticateAdmin(mockReq, {}, (err) => { capturedErr = err; });
        assert.ok(capturedErr);
        assert.ok(capturedErr instanceof AuthenticationError || capturedErr.statusCode === 503);
    });

    it('enforces role-based authorization cleanly', () => {
        const mw = requireRole('admin');
        let err1 = null;
        mw({ actor: { role: 'reviewer' } }, {}, (e) => { err1 = e; });
        assert.equal(err1.statusCode, 403);

        let err2 = null;
        mw({ actor: { role: 'admin' } }, {}, (e) => { err2 = e; });
        assert.equal(err2, undefined);
    });

    it('only allows whitelisted internal navigation URLs and requires explicit nav intent', () => {
        assert.equal(sanitizeNavigation({ url: 'https://evil.example/phish', label: 'Bad' }), null);
        assert.equal(sanitizeNavigation({ url: 'javascript:alert(1)', label: 'XSS' }), null);
        assert.deepEqual(sanitizeNavigation({ url: '/hostel', label: 'X' }), {
            url: '/hostel',
            label: 'Hostels & Residential Life'
        });

        // Informational query should not auto-trigger navigation redirect
        assert.equal(resolveExplicitNavigationIntent('What is the hostel curfew timing?'), null);
        // Explicit navigation request should match
        const nav = resolveExplicitNavigationIntent('Take me to the hostel page');
        assert.equal(nav?.url, '/hostel');
    });

    it('formats operational errors without leaking internal details for 500s', () => {
        const vErr = new ValidationError('Invalid message');
        const vRes = formatErrorResponse(vErr, 'req-123');
        assert.equal(vRes.statusCode, 400);
        assert.equal(vRes.body.error.message, 'Invalid message');

        const rawErr = new Error('mongodb+srv://user:pass@host crashed');
        const rRes = formatErrorResponse(rawErr, 'req-456');
        assert.equal(rRes.statusCode, 500);
        assert.ok(!rRes.body.error.message.includes('pass'));
    });

    it('validateConfig returns structured diagnostics', () => {
        const res = validateConfig();
        assert.equal(typeof res.valid, 'boolean');
        assert.ok(Array.isArray(res.errors));
        assert.ok(Array.isArray(res.warnings));
    });

    it('buildCorsOrigins automatically includes Render external origin alongside allowlist', () => {
        const origins = buildCorsOrigins(
            'https://www.psgtech.edu',
            ['http://localhost:5000'],
            {
                RENDER_EXTERNAL_URL: 'https://psg-nexus.onrender.com/',
                RENDER_EXTERNAL_HOSTNAME: 'psg-nexus.onrender.com'
            }
        );
        assert.deepEqual(origins, [
            'https://www.psgtech.edu',
            'https://psg-nexus.onrender.com'
        ]);
    });
});
