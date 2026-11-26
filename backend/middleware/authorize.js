// backend/middleware/authorize.js - Role-Based Authorization Middleware
const { AuthorizationError, AuthenticationError } = require('../utils/errors');

function requireRole(...allowedRoles) {
    const allowed = new Set(allowedRoles);
    return (req, _res, next) => {
        if (!req.actor) {
            return next(new AuthenticationError('Authentication required.'));
        }
        if (!allowed.has(req.actor.role)) {
            return next(new AuthorizationError(`Role '${req.actor.role}' is not authorized for this action.`));
        }
        return next();
    };
}

module.exports = { requireRole };
