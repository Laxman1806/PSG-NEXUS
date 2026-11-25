// backend/middleware/security.js - Security Headers, CORS Policy, Rate Limiting, and Safe Error Handling

/**
 * Sets baseline HTTP security headers across all Express responses.
 * Permits inline scripts/styles required by the replicated static campus portal while blocking framing, MIME sniffing, and external script loading.
 */
function securityHeaders(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: https:",
            "connect-src 'self' http://localhost:5000 http://127.0.0.1:5000 http://localhost:3000",
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "object-src 'none'",
            "form-action 'self'"
        ].join('; ')
    );
    next();
}

/**
 * Builds CORS options restricting cross-origin access to explicitly allowed local or configured origins.
 */
function createCorsOptions() {
    const port = process.env.PORT || 5000;
    const defaultOrigins = [
        `http://localhost:${port}`,
        `http://127.0.0.1:${port}`,
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ];
    const envOrigins = (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
    const allowedOrigins = new Set([...defaultOrigins, ...envOrigins]);

    return {
        origin(origin, callback) {
            // Allow same-origin / non-browser clients (no Origin header) and allowlisted origins
            if (!origin || allowedOrigins.has(origin)) {
                return callback(null, true);
            }
            return callback(null, false);
        },
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type']
    };
}

/**
 * Creates a lightweight in-memory fixed-window rate limiter keyed by client IP.
 */
function createRateLimiter({ windowMs = 60_000, max = 60 } = {}) {
    const hits = new Map();

    return function rateLimitMiddleware(req, res, next) {
        const now = Date.now();
        const key = req.ip || req.socket?.remoteAddress || 'unknown';

        // Bound map growth by pruning expired entries periodically
        if (hits.size > 1000) {
            for (const [k, entry] of hits.entries()) {
                if (now >= entry.resetAt) hits.delete(k);
            }
        }

        let record = hits.get(key);
        if (!record || now >= record.resetAt) {
            record = { count: 0, resetAt: now + windowMs };
            hits.set(key, record);
        }

        record.count += 1;
        const remaining = Math.max(0, max - record.count);
        res.setHeader('X-RateLimit-Limit', String(max));
        res.setHeader('X-RateLimit-Remaining', String(remaining));

        if (record.count > max) {
            const retryAfterSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
            res.setHeader('Retry-After', String(retryAfterSec));
            return res.status(429).json({
                reply: 'Too many requests. Please wait a moment before sending another question.',
                response: 'Too many requests. Please wait a moment before sending another question.',
                error: 'Rate limit exceeded'
            });
        }

        next();
    };
}

/**
 * Handles unmatched routes cleanly without exposing internal paths or stack traces.
 */
function notFoundHandler(req, res) {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found.' });
    }
    return res.status(404).type('text/plain').send('404 Not Found');
}

/**
 * Central Express error handler preventing stack trace and filesystem path leakage.
 */
function errorHandler(err, req, res, _next) {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            reply: 'Invalid JSON payload.',
            response: 'Invalid JSON payload.',
            error: 'Invalid JSON payload.'
        });
    }

    if (err && err.type === 'entity.too.large') {
        return res.status(413).json({
            reply: 'Request payload is too large.',
            response: 'Request payload is too large.',
            error: 'Payload too large'
        });
    }

    console.error('Unhandled server error:', err?.message || err);
    if (req.path.startsWith('/api')) {
        return res.status(500).json({
            reply: 'An unexpected error occurred. Please try again later.',
            response: 'An unexpected error occurred. Please try again later.',
            error: 'Internal server error'
        });
    }
    return res.status(500).type('text/plain').send('Internal Server Error');
}

module.exports = {
    securityHeaders,
    createCorsOptions,
    createRateLimiter,
    notFoundHandler,
    errorHandler
};
