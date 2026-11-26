// backend/middleware/errorHandler.js - Centralized Error & 404 Handler
const logger = require('../utils/logger');
const { formatErrorResponse } = require('../utils/responseFormatter');
const { NotFoundError } = require('../utils/errors');

function notFoundHandler(req, _res, next) {
    if (req.path.startsWith('/api/')) {
        return next(new NotFoundError(`API endpoint ${req.method} ${req.path} not found.`));
    }
    return next();
}

function errorHandler(err, req, res, _next) {
    // Handle malformed JSON payloads from express.json()
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: {
                code: 'INVALID_JSON',
                message: 'Malformed JSON in request body.',
                requestId: req.requestId || null
            }
        });
    }

    // Handle payload too large errors
    if (err.type === 'entity.too.large' || err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            error: {
                code: 'PAYLOAD_TOO_LARGE',
                message: 'Request payload exceeds allowed size limit.',
                requestId: req.requestId || null
            }
        });
    }

    const { statusCode, body } = formatErrorResponse(err, req.requestId);

    logger.error('Request failed', {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        statusCode,
        error: err
    });

    // Preserve legacy reply/response keys on /api/chat errors for UI backward compatibility
    if (req.path === '/api/chat' || req.originalUrl === '/api/chat') {
        body.reply = body.error.message;
        body.response = body.error.message;
    }

    return res.status(statusCode).json(body);
}

module.exports = { notFoundHandler, errorHandler };
