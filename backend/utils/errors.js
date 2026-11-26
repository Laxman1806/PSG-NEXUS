// backend/utils/errors.js - Typed Operational Errors

class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;
    }
}

class ValidationError extends AppError {
    constructor(message = 'Invalid request payload', details = null) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

class RateLimitError extends AppError {
    constructor(message = 'Too many requests, please try again shortly') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}

class ExternalServiceError extends AppError {
    constructor(message = 'Upstream AI service unavailable', details = null) {
        super(message, 502, 'EXTERNAL_SERVICE_ERROR', details);
    }
}

class DatabaseUnavailableError extends AppError {
    constructor(message = 'Database service unavailable') {
        super(message, 503, 'DATABASE_UNAVAILABLE');
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    RateLimitError,
    ExternalServiceError,
    DatabaseUnavailableError
};
