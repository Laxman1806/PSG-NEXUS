// backend/middleware/requestId.js - Correlation Request ID Middleware
const crypto = require('crypto');

const SAFE_REQUEST_ID_REGEX = /^[A-Za-z0-9_-]{8,64}$/;

function requestIdMiddleware(req, res, next) {
    const incoming = req.get('X-Request-Id');
    const requestId = incoming && SAFE_REQUEST_ID_REGEX.test(incoming)
        ? incoming
        : crypto.randomUUID();

    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
}

module.exports = requestIdMiddleware;
