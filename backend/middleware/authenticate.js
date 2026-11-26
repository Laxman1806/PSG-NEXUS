// backend/middleware/authenticate.js - Admin & Session Token Authentication
const crypto = require('crypto');
const { config } = require('../config/env');
const { AuthenticationError, AppError } = require('../utils/errors');

function safeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

function extractAdminCredential(req) {
    const headerKey = req.get('X-Admin-Key');
    if (headerKey) return headerKey.trim();

    const auth = req.get('Authorization');
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
        return auth.slice(7).trim();
    }
    return '';
}

function authenticateAdmin(req, _res, next) {
    const adminKey = config.security.adminApiKey;
    const reviewerKey = config.security.reviewerApiKey;

    if (!adminKey && !reviewerKey) {
        return next(
            new AppError(
                'Admin API authentication is not configured (set ADMIN_API_KEY in environment).',
                503,
                'ADMIN_AUTH_UNCONFIGURED'
            )
        );
    }

    const provided = extractAdminCredential(req);
    if (!provided) {
        return next(new AuthenticationError('Missing admin authentication credentials.'));
    }

    if (adminKey && safeEqual(provided, adminKey)) {
        req.actor = { id: 'admin-key', role: 'admin' };
        return next();
    }

    if (reviewerKey && safeEqual(provided, reviewerKey)) {
        req.actor = { id: 'reviewer-key', role: 'reviewer' };
        return next();
    }

    return next(new AuthenticationError('Invalid admin authentication credentials.'));
}

// HMAC-signed anonymous session tokens prevent cross-user conversation enumeration
function signSessionId(sessionId) {
    const secret = config.security.sessionSecret;
    if (!secret) {
        throw new Error('SESSION_SECRET is required to sign anonymous sessions.');
    }
    const sig = crypto.createHmac('sha256', secret).update(sessionId).digest('hex');
    return `${sessionId}.${sig}`;
}

function verifySessionToken(token) {
    if (!token || typeof token !== 'string') return null;
    const dotIdx = token.lastIndexOf('.');
    if (dotIdx <= 0) return null;

    const sessionId = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);
    if (!/^[A-Za-z0-9_-]{8,80}$/.test(sessionId) || !/^[a-f0-9]{64}$/i.test(sig)) {
        return null;
    }

    const secret = config.security.sessionSecret;
    if (!secret) return null;
    const expected = crypto.createHmac('sha256', secret).update(sessionId).digest('hex');
    return safeEqual(sig.toLowerCase(), expected) ? sessionId : null;
}

function resolvePublicSession(req, res, next) {
    const headerToken = req.get('X-Session-Token');
    const verifiedSessionId = verifySessionToken(headerToken);

    if (verifiedSessionId) {
        req.sessionId = verifiedSessionId;
        req.sessionToken = headerToken;
        return next();
    }

    // Issue a fresh signed anonymous session token when none/invalid is provided
    const freshId = crypto.randomUUID();
    const signed = signSessionId(freshId);
    req.sessionId = freshId;
    req.sessionToken = signed;
    res.setHeader('X-Session-Token', signed);
    return next();
}

module.exports = {
    authenticateAdmin,
    resolvePublicSession,
    signSessionId,
    verifySessionToken,
    safeEqual
};
