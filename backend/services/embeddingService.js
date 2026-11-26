// backend/services/embeddingService.js - Controlled Gemini Embedding Service with batchEmbedContents & Free-Tier TPM/RPM Pacing
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { config } = require('../config/env');
const { EMBEDDING_CONFIG } = require('../config/modelConfig');
const { ExternalServiceError } = require('../utils/errors');
const logger = require('../utils/logger');

let genAIClient = null;
let activeRequests = 0;
const waitQueue = [];
let dailyQuotaBlockedUntil = 0;

function resetEmbeddingQuotaCooldown() {
    dailyQuotaBlockedUntil = 0;
}

function isDailyQuotaError(err) {
    const msg = String(err?.message || '');
    if (/PerDay|EmbedContentRequestsPerDay/i.test(msg)) return true;
    const hintedMs = parseRawRetryDelayMs(err);
    return hintedMs !== null && hintedMs > 120000;
}

function parseRawRetryDelayMs(err) {
    const msg = String(err?.message || '');
    const secMatch = msg.match(/retry in\s+([\d.]+)s/i) || msg.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
    if (secMatch) {
        const seconds = Number.parseFloat(secMatch[1]);
        if (Number.isFinite(seconds) && seconds >= 0) {
            return Math.ceil(seconds * 1000);
        }
    }
    return null;
}

function getGenAI() {
    if (!genAIClient) {
        if (!config.gemini.apiKey) {
            throw new ExternalServiceError('Missing GEMINI_API_KEY in environment configuration.');
        }
        genAIClient = new GoogleGenerativeAI(config.gemini.apiKey);
    }
    return genAIClient;
}

async function acquireSlot() {
    if (activeRequests < config.gemini.maxConcurrency) {
        activeRequests++;
        return;
    }
    await new Promise((resolve) => waitQueue.push(resolve));
    activeRequests++;
}

function releaseSlot() {
    activeRequests = Math.max(0, activeRequests - 1);
    if (waitQueue.length > 0) {
        const next = waitQueue.shift();
        next();
    }
}

function isRetryableError(err) {
    const msg = (err?.message || '').toLowerCase();
    return (
        msg.includes('429') ||
        msg.includes('quota') ||
        msg.includes('too many requests') ||
        msg.includes('resource_exhausted') ||
        msg.includes('503') ||
        msg.includes('timeout') ||
        err?.name === 'AbortError' ||
        err?.name === 'GoogleGenerativeAIAbortError'
    );
}

// Extract retry delay suggested by Google Gemini API (e.g., "Please retry in 57.1s" or "retryDelay":"57s")
function parseRetryDelayMs(err) {
    const msg = String(err?.message || '');
    const secMatch = msg.match(/retry in\s+([\d.]+)s/i) || msg.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
    if (secMatch) {
        const seconds = Number.parseFloat(secMatch[1]);
        if (Number.isFinite(seconds) && seconds >= 0) {
            return Math.min(Math.ceil((seconds + 2) * 1000), 75000);
        }
    }
    const msMatch = msg.match(/retry in\s+([\d.]+)ms/i);
    if (msMatch) {
        const ms = Number.parseFloat(msMatch[1]);
        if (Number.isFinite(ms) && ms > 0) {
            return Math.min(Math.ceil(ms + 500), 15000);
        }
    }
    return null;
}

function estimateTokens(text) {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(10, Math.ceil(words * 1.45));
}

async function generateEmbedding(text, options = {}) {
    const input = typeof text === 'string' ? text.trim() : '';
    if (!input) {
        throw new Error('Cannot generate embedding for empty text.');
    }

    if (!options.bypassCooldown && Date.now() < dailyQuotaBlockedUntil) {
        throw new ExternalServiceError('Gemini embedding daily quota cooldown active; using lexical retrieval fallback.');
    }

    const timeoutMs = options.timeoutMs || config.gemini.embeddingTimeoutMs;
    const maxAttempts = options.maxAttempts || (options.respectRetryAfter ? 5 : 3);
    const modelName = options.model || EMBEDDING_CONFIG.model;
    const outputDimensionality = options.dimensions || EMBEDDING_CONFIG.dimensions;

    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: modelName });

    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        await acquireSlot();
        try {
            const result = await model.embedContent(
                {
                    content: { parts: [{ text: input }] },
                    outputDimensionality
                },
                {
                    timeout: timeoutMs,
                    signal: controller.signal
                }
            );

            const values = result?.embedding?.values;
            if (!Array.isArray(values) || values.length !== outputDimensionality) {
                throw new ExternalServiceError(
                    `Embedding dimension mismatch: expected ${outputDimensionality}, got ${values ? values.length : 0}`
                );
            }
            return values;
        } catch (err) {
            lastError = err;
            if (isDailyQuotaError(err)) {
                dailyQuotaBlockedUntil = Date.now() + 60 * 1000;
                logger.warn('Gemini embedding daily quota exhausted; failing over without retry', { error: err });
                break;
            }
            if (attempt < maxAttempts && isRetryableError(err)) {
                const hintedDelay = options.respectRetryAfter ? parseRetryDelayMs(err) : null;
                const baseDelay = hintedDelay || (400 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 250));
                logger.warn('Retrying Gemini embedding call', { attempt, delayMs: baseDelay, error: err });
                await new Promise((r) => setTimeout(r, baseDelay));
            } else {
                break;
            }
        } finally {
            clearTimeout(timer);
            releaseSlot();
        }
    }

    throw new ExternalServiceError(
        `Embedding generation failed: ${lastError?.message || 'Unknown error'}`,
        { model: modelName, dimensions: outputDimensionality }
    );
}

// Batch embedding via batchEmbedContents with Free-Tier TPM (~24k tokens/min) & RPM pacing
async function generateEmbeddingsBatch(texts, options = {}) {
    if (!Array.isArray(texts) || texts.length === 0) return [];

    const modelName = options.model || EMBEDDING_CONFIG.model;
    const outputDimensionality = options.dimensions || EMBEDDING_CONFIG.dimensions;
    const batchSize = options.batchSize || 18;
    const timeoutMs = options.timeoutMs || Math.max(config.gemini.embeddingTimeoutMs, 20000);
    const maxTokensPerMin = options.maxTokensPerMin || 24000;

    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: modelName });
    const results = new Array(texts.length);

    let windowStartedAt = Date.now();
    let tokensInWindow = 0;

    for (let start = 0; start < texts.length; start += batchSize) {
        const slice = texts.slice(start, start + batchSize);
        const batchTokens = slice.reduce((sum, t) => sum + estimateTokens(t), 0);

        // Enforce token-per-minute budget cleanly before sending batch
        const elapsed = Date.now() - windowStartedAt;
        if (elapsed >= 61000) {
            windowStartedAt = Date.now();
            tokensInWindow = 0;
        } else if (tokensInWindow + batchTokens > maxTokensPerMin && tokensInWindow > 0) {
            const waitMs = 61500 - elapsed;
            logger.info('Pacing batch embedding to stay within Gemini TPM quota', {
                waitMs,
                tokensInWindow,
                nextBatchTokens: batchTokens
            });
            await new Promise((r) => setTimeout(r, waitMs));
            windowStartedAt = Date.now();
            tokensInWindow = 0;
        }

        let batchEmbeddings = null;
        let lastErr = null;
        const maxAttempts = 5;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const response = await model.batchEmbedContents(
                    {
                        requests: slice.map((text) => ({
                            content: { parts: [{ text: String(text || '').trim() }] },
                            outputDimensionality
                        }))
                    },
                    { timeout: timeoutMs, signal: controller.signal }
                );
                if (Array.isArray(response?.embeddings) && response.embeddings.length === slice.length) {
                    batchEmbeddings = response.embeddings.map((e) => e.values);
                    break;
                }
                throw new Error('Unexpected batchEmbedContents response length');
            } catch (err) {
                lastErr = err;
                if (isDailyQuotaError(err)) {
                    dailyQuotaBlockedUntil = Date.now() + 60 * 1000;
                    logger.warn('Batch embedding stopped: Gemini daily quota exhausted');
                    break;
                }
                if (attempt < maxAttempts && isRetryableError(err)) {
                    const hinted = parseRetryDelayMs(err) || 15000 * attempt;
                    logger.warn('Batch embedding rate-limited/retried; waiting for quota refill', {
                        attempt,
                        delayMs: hinted,
                        batchStart: start
                    });
                    await new Promise((r) => setTimeout(r, hinted));
                    windowStartedAt = Date.now();
                    tokensInWindow = 0;
                } else {
                    break;
                }
            } finally {
                clearTimeout(timer);
            }
        }

        tokensInWindow += batchTokens;

        if (batchEmbeddings) {
            for (let i = 0; i < slice.length; i++) {
                const vec = batchEmbeddings[i];
                if (Array.isArray(vec) && vec.length === outputDimensionality) {
                    results[start + i] = { ok: true, vector: vec };
                } else {
                    results[start + i] = { ok: false, error: 'Invalid embedding vector dimensions' };
                }
            }
        } else if (Date.now() < dailyQuotaBlockedUntil || isDailyQuotaError(lastErr)) {
            for (let i = start; i < texts.length; i++) {
                results[i] = { ok: false, error: lastErr?.message || 'Daily embedding quota exhausted' };
            }
            break;
        } else {
            // Fallback per-item with retry-after waiting so one oversized/bad item doesn't fail whole batch
            for (let i = 0; i < slice.length; i++) {
                try {
                    const vector = await generateEmbedding(slice[i], {
                        ...options,
                        respectRetryAfter: true,
                        maxAttempts: 4
                    });
                    results[start + i] = { ok: true, vector };
                } catch (err) {
                    results[start + i] = { ok: false, error: err.message || lastErr?.message || 'Embedding failed' };
                }
                await new Promise((r) => setTimeout(r, 750));
            }
        }
    }

    return results;
}

module.exports = {
    generateEmbedding,
    generateEmbeddingsBatch,
    parseRetryDelayMs,
    estimateTokens,
    isDailyQuotaError,
    resetEmbeddingQuotaCooldown,
    EMBEDDING_CONFIG
};
