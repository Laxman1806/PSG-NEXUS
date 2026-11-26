// backend/middleware/rateLimiter.js - Express Rate Limiting Middleware
const rateLimit = require('express-rate-limit');
const { config } = require('../config/env');

function createLimiter({ windowMs, max, message }) {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message,
                    requestId: req.requestId || null
                },
                reply: message,
                response: message
            });
        }
    });
}

const chatLimiter = createLimiter({
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.rateLimitMax,
    message: 'Too many chat messages sent in a short time. Please wait a minute before trying again.'
});

const apiLimiter = createLimiter({
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.rateLimitMax * 2,
    message: 'API rate limit exceeded. Please try again shortly.'
});

const adminLimiter = createLimiter({
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.adminRateLimitMax,
    message: 'Too many admin API requests. Please wait before retrying.'
});

module.exports = { chatLimiter, apiLimiter, adminLimiter, createLimiter };
