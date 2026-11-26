// backend/middleware/validateRequest.js - Strict Input Validation Middleware
const { ValidationError } = require('../utils/errors');

const MAX_MESSAGE_CHARS = 1500;
const CONVERSATION_ID_REGEX = /^[A-Za-z0-9_-]{8,80}$/;

function sanitizePlainString(value) {
    if (typeof value !== 'string') return '';
    // Strip ASCII control characters except tab/newline
    return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

function validateChatRequest(req, _res, next) {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return next(new ValidationError('Request body must be a JSON object.'));
    }

    const message = sanitizePlainString(req.body.message);
    if (!message) {
        return next(new ValidationError('Please provide a non-empty "message" string.'));
    }
    if (message.length > MAX_MESSAGE_CHARS) {
        return next(new ValidationError(`Message exceeds maximum length of ${MAX_MESSAGE_CHARS} characters.`));
    }

    if (req.body.conversationId !== undefined && req.body.conversationId !== null && req.body.conversationId !== '') {
        if (typeof req.body.conversationId !== 'string' || !CONVERSATION_ID_REGEX.test(req.body.conversationId)) {
            return next(new ValidationError('Invalid conversationId format.'));
        }
    }

    if (req.body.filters !== undefined && (typeof req.body.filters !== 'object' || Array.isArray(req.body.filters))) {
        return next(new ValidationError('Filters must be an object.'));
    }

    req.validatedBody = {
        message,
        conversationId: req.body.conversationId || null,
        languageHint: typeof req.body.language === 'string' ? sanitizePlainString(req.body.language).slice(0, 16) : null,
        filters: req.body.filters || {}
    };

    return next();
}

function validateConversationIdParam(req, _res, next) {
    const id = req.params.id;
    if (!id || !CONVERSATION_ID_REGEX.test(id)) {
        return next(new ValidationError('Invalid conversation ID.'));
    }
    return next();
}

function validateFeedbackRequest(req, _res, next) {
    if (!req.body || typeof req.body !== 'object') {
        return next(new ValidationError('Request body must be a JSON object.'));
    }

    const rating = req.body.rating;
    if (rating !== 'up' && rating !== 'down') {
        return next(new ValidationError('Feedback rating must be "up" or "down".'));
    }

    const conversationId = req.body.conversationId;
    if (conversationId && (typeof conversationId !== 'string' || !CONVERSATION_ID_REGEX.test(conversationId))) {
        return next(new ValidationError('Invalid conversationId format.'));
    }

    const messageId = typeof req.body.messageId === 'string' ? sanitizePlainString(req.body.messageId).slice(0, 80) : null;
    const comment = typeof req.body.comment === 'string' ? sanitizePlainString(req.body.comment).slice(0, 500) : '';
    const query = typeof req.body.query === 'string' ? sanitizePlainString(req.body.query).slice(0, MAX_MESSAGE_CHARS) : '';

    req.validatedFeedback = {
        conversationId: conversationId || null,
        messageId,
        rating,
        comment,
        query
    };

    return next();
}

function validateRetrievalTestRequest(req, _res, next) {
    if (!req.body || typeof req.body !== 'object') {
        return next(new ValidationError('Request body must be a JSON object.'));
    }
    const query = sanitizePlainString(req.body.query || req.body.message || '');
    if (!query) {
        return next(new ValidationError('Retrieval test requires a non-empty "query".'));
    }
    if (query.length > MAX_MESSAGE_CHARS) {
        return next(new ValidationError(`Query exceeds maximum length of ${MAX_MESSAGE_CHARS} characters.`));
    }
    req.validatedRetrievalTest = {
        query,
        filters: req.body.filters && typeof req.body.filters === 'object' ? req.body.filters : {}
    };
    return next();
}

module.exports = {
    MAX_MESSAGE_CHARS,
    CONVERSATION_ID_REGEX,
    sanitizePlainString,
    validateChatRequest,
    validateConversationIdParam,
    validateFeedbackRequest,
    validateRetrievalTestRequest
};
