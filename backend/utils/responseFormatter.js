// backend/utils/responseFormatter.js - Standardized API Response Formatting
const { redactString } = require('./logger');

function formatErrorResponse(err, requestId) {
    const statusCode = err.statusCode || 500;
    const isOperational = Boolean(err.isOperational);
    const safeMessage = isOperational
        ? redactString(err.message)
        : 'An unexpected server error occurred. Please try again later.';

    const body = {
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: safeMessage,
            requestId: requestId || null
        }
    };

    if (isOperational && err.details) {
        body.error.details = err.details;
    }

    return { statusCode, body };
}

function formatSuccessResponse(data, meta = null) {
    if (!meta) return data;
    return { ...data, meta };
}

module.exports = { formatErrorResponse, formatSuccessResponse };
