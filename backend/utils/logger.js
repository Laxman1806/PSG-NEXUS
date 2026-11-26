// backend/utils/logger.js - Structured Logger with Secret Redaction
const { config } = require('../config/env');

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const activeLevel = LEVELS[config.logging.level] ?? LEVELS.info;

function redactString(value) {
    if (typeof value !== 'string') return value;
    return value
        .replace(/AIza[0-9A-Za-z_-]{15,}/g, '[REDACTED_GEMINI_KEY]')
        .replace(/(mongodb(?:\+srv)?:\/\/)([^:@/\s]+):([^@/\s]+)@/gi, '$1[REDACTED]:[REDACTED]@')
        .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, '$1[REDACTED]')
        .replace(/(key=)[^&\s]+/gi, '$1[REDACTED]');
}

function sanitizeValue(val, depth = 0) {
    if (depth > 4) return '[TRUNCATED]';
    if (typeof val === 'string') return redactString(val);
    if (val instanceof Error) {
        return {
            name: val.name,
            message: redactString(val.message),
            code: val.code
        };
    }
    if (Array.isArray(val)) return val.slice(0, 20).map((item) => sanitizeValue(item, depth + 1));
    if (val && typeof val === 'object') {
        const clean = {};
        for (const [k, v] of Object.entries(val)) {
            if (/apiKey|password|secret|token|authorization|mongoUri|uri/i.test(k) && typeof v === 'string') {
                clean[k] = k.toLowerCase().includes('uri') ? redactString(v) : '[REDACTED]';
            } else {
                clean[k] = sanitizeValue(v, depth + 1);
            }
        }
        return clean;
    }
    return val;
}

function writeLog(level, message, meta = {}) {
    if ((LEVELS[level] ?? LEVELS.info) > activeLevel) return;
    if (config.isTest && process.env.TEST_LOGS !== 'true' && level !== 'error') return;

    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message: redactString(message),
        ...sanitizeValue(meta)
    };

    const line = JSON.stringify(entry);
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
}

module.exports = {
    error: (msg, meta) => writeLog('error', msg, meta),
    warn: (msg, meta) => writeLog('warn', msg, meta),
    info: (msg, meta) => writeLog('info', msg, meta),
    debug: (msg, meta) => writeLog('debug', msg, meta),
    redactString
};
