// backend/config/env.js - Centralized & Validated Environment Configuration
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config({ quiet: true });

function parseIntOr(val, fallback) {
    const parsed = Number.parseInt(val, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseList(val, fallback = []) {
    if (!val || typeof val !== 'string') return fallback;
    return val
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function buildCorsOrigins(explicitVal, fallbackOrigins, envObj = process.env) {
    const base = parseList(explicitVal, fallbackOrigins);
    const dynamic = [];
    const renderUrl = (envObj.RENDER_EXTERNAL_URL || '').trim().replace(/\/+$/, '');
    if (renderUrl) dynamic.push(renderUrl);
    const renderHost = (envObj.RENDER_EXTERNAL_HOSTNAME || '').trim();
    if (renderHost) dynamic.push(`https://${renderHost}`);
    return Array.from(new Set([...base, ...dynamic]));
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isTest = nodeEnv === 'test';
const port = parseIntOr(process.env.PORT, 5000);
const host = (process.env.HOST || '0.0.0.0').trim();

const defaultCorsOrigins = [
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

// Ephemeral fallback only for non-production local runs; production must set SESSION_SECRET explicitly
const ephemeralSessionSecret = crypto.randomBytes(32).toString('hex');

const config = Object.freeze({
    nodeEnv,
    isProduction,
    isTest,
    port,
    host,
    gemini: Object.freeze({
        apiKey: (process.env.GEMINI_API_KEY || '').trim(),
        chatModel: (process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite').trim(),
        fallbackModels: parseList(
            process.env.GEMINI_FALLBACK_MODELS,
            ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash']
        ),
        embeddingModel: (process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001').trim(),
        embeddingDimensions: parseIntOr(process.env.GEMINI_EMBEDDING_DIM, 768),
        requestTimeoutMs: parseIntOr(process.env.REQUEST_TIMEOUT_MS, 10000),
        embeddingTimeoutMs: parseIntOr(process.env.EMBEDDING_TIMEOUT_MS, 7000),
        maxConcurrency: parseIntOr(process.env.GEMINI_MAX_CONCURRENCY, 5),
        enableModelDiscoveryCheck: process.env.ENABLE_MODEL_STARTUP_CHECK !== 'false'
    }),
    mongo: Object.freeze({
        uri: (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim(),
        localUri: (process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/psg_chatbot').trim(),
        dbName: (process.env.MONGODB_DB_NAME || 'psg_chatbot').trim(),
        collection: (process.env.MONGODB_COLLECTION || 'website_chunks').trim(),
        vectorIndexName: (process.env.VECTOR_INDEX_NAME || 'vector_index').trim(),
        documentsCollection: (process.env.DOCUMENTS_COLLECTION || 'knowledge_documents').trim(),
        chunksCollection: (process.env.CHUNKS_COLLECTION || 'knowledge_chunks').trim(),
        stagingChunksCollection: (process.env.STAGING_CHUNKS_COLLECTION || 'knowledge_chunks_staging').trim(),
        knowledgeVectorIndexName: (process.env.KNOWLEDGE_VECTOR_INDEX_NAME || 'knowledge_vector_index').trim(),
        ingestionRunsCollection: (process.env.INGESTION_RUNS_COLLECTION || 'ingestion_runs').trim(),
        conversationsCollection: (process.env.CONVERSATIONS_COLLECTION || 'conversations').trim(),
        feedbackCollection: (process.env.FEEDBACK_COLLECTION || 'feedback').trim(),
        auditLogsCollection: (process.env.AUDIT_LOGS_COLLECTION || 'audit_logs').trim(),
        connectTimeoutMs: parseIntOr(process.env.MONGO_CONNECT_TIMEOUT_MS, 4500),
        maxPoolSize: parseIntOr(process.env.MONGO_MAX_POOL_SIZE, 20)
    }),
    security: Object.freeze({
        corsOrigins: buildCorsOrigins(process.env.CORS_ORIGINS, defaultCorsOrigins),
        maxBodySize: (process.env.MAX_BODY_SIZE || '100kb').trim(),
        rateLimitWindowMs: parseIntOr(process.env.RATE_LIMIT_WINDOW_MS, 60 * 1000),
        rateLimitMax: parseIntOr(process.env.RATE_LIMIT_MAX, 30),
        adminRateLimitMax: parseIntOr(process.env.ADMIN_RATE_LIMIT_MAX, 60),
        adminApiKey: (process.env.ADMIN_API_KEY || '').trim(),
        reviewerApiKey: (process.env.REVIEWER_API_KEY || '').trim(),
        sessionSecret: (process.env.SESSION_SECRET || '').trim() || (isProduction ? '' : ephemeralSessionSecret),
        allowedFetchHosts: parseList(process.env.ALLOWED_FETCH_HOSTS, [
            'www.psgtech.edu',
            'psgtech.edu',
            'sports.psgtech.ac.in',
            'library.psgtech.ac.in',
            'thebridge.psgtech.ac.in',
            'academicschedule.psgtech.ac.in',
            'iipc.psgtech.ac.in',
            'platinum.psgtech.ac.in'
        ])
    }),
    rag: Object.freeze({
        candidateLimit: parseIntOr(process.env.RAG_CANDIDATE_LIMIT, 15),
        finalEvidenceLimit: parseIntOr(process.env.RAG_EVIDENCE_LIMIT, 5),
        minVectorScore: Number.parseFloat(process.env.RAG_MIN_VECTOR_SCORE || '0.45'),
        cacheTtlMs: parseIntOr(process.env.RAG_CACHE_TTL_MS, 5 * 60 * 1000),
        maxConversationTurns: parseIntOr(process.env.MAX_CONVERSATION_TURNS, 8)
    }),
    logging: Object.freeze({
        level: (process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug')).trim().toLowerCase()
    })
});

function validateConfig(options = {}) {
    const errors = [];
    const warnings = [];

    if (!config.gemini.apiKey) {
        const msg = 'GEMINI_API_KEY is not configured; live embedding and generation calls will fail over to fallbacks.';
        if (options.requireGemini) errors.push(msg);
        else warnings.push(msg);
    }

    if (!config.mongo.uri) {
        warnings.push('MONGO_URI is not configured; Atlas Vector Search will be skipped in favor of local MongoDB / JSON cache.');
    }

    if (config.isProduction && !process.env.SESSION_SECRET) {
        errors.push('SESSION_SECRET must be explicitly set in production.');
    } else if (!process.env.SESSION_SECRET) {
        warnings.push('SESSION_SECRET not set; using ephemeral per-process secret for anonymous session signatures.');
    }

    if (!config.security.adminApiKey) {
        warnings.push('ADMIN_API_KEY is not configured; /api/admin/* endpoints will remain locked (fail-closed).');
    }

    if (config.isProduction && !process.env.CORS_ORIGINS && !process.env.RENDER_EXTERNAL_URL && !process.env.RENDER_EXTERNAL_HOSTNAME) {
        warnings.push('CORS_ORIGINS not explicitly set in production; only localhost defaults are permitted.');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

module.exports = { config, validateConfig, buildCorsOrigins };
