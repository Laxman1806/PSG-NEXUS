// backend/config/modelConfig.js - Centralized Gemini Model & Embedding Configuration
const { config } = require('./env');

const EMBEDDING_CONFIG = Object.freeze({
    model: config.gemini.embeddingModel,
    dimensions: config.gemini.embeddingDimensions,
    version: `${config.gemini.embeddingModel}:${config.gemini.embeddingDimensions}`
});

function buildChatModelPriority() {
    const raw = [config.gemini.chatModel, ...config.gemini.fallbackModels];
    const seen = new Set();
    const deduped = [];
    for (const model of raw) {
        const clean = (model || '').replace(/^models\//, '').trim();
        if (clean && !seen.has(clean)) {
            seen.add(clean);
            deduped.push(clean);
        }
    }
    return deduped;
}

const CHAT_MODEL_PRIORITY = Object.freeze(buildChatModelPriority());

let cachedDiscovery = {
    checkedAt: null,
    available: false,
    supportedModels: [],
    error: null
};

async function discoverSupportedModels({ forceRefresh = false, timeoutMs = 5000 } = {}) {
    if (!config.gemini.apiKey) {
        cachedDiscovery = {
            checkedAt: new Date().toISOString(),
            available: false,
            supportedModels: [],
            error: 'GEMINI_API_KEY is not configured'
        };
        return cachedDiscovery;
    }

    const ageMs = cachedDiscovery.checkedAt
        ? Date.now() - Date.parse(cachedDiscovery.checkedAt)
        : Infinity;

    if (!forceRefresh && cachedDiscovery.checkedAt && ageMs < 5 * 60 * 1000) {
        return cachedDiscovery;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(config.gemini.apiKey)}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
            throw new Error(`Model discovery HTTP ${res.status}`);
        }
        const data = await res.json();
        const models = Array.isArray(data.models) ? data.models : [];
        const supported = models.map((m) => ({
            name: (m.name || '').replace(/^models\//, ''),
            methods: m.supportedGenerationMethods || []
        }));

        cachedDiscovery = {
            checkedAt: new Date().toISOString(),
            available: true,
            supportedModels: supported,
            error: null
        };
        return cachedDiscovery;
    } catch (err) {
        cachedDiscovery = {
            checkedAt: new Date().toISOString(),
            available: false,
            supportedModels: [],
            error: err.name === 'AbortError' ? 'Model discovery request timed out' : err.message
        };
        return cachedDiscovery;
    } finally {
        clearTimeout(timer);
    }
}

function getModelValidationReport() {
    const availableNames = new Set(cachedDiscovery.supportedModels.map((m) => m.name));
    const configuredSupported = cachedDiscovery.available
        ? CHAT_MODEL_PRIORITY.filter((m) => availableNames.has(m))
        : [];
    const embeddingSupported = cachedDiscovery.available
        ? availableNames.has(EMBEDDING_CONFIG.model)
        : null;

    return {
        checkedAt: cachedDiscovery.checkedAt,
        discoveryAvailable: cachedDiscovery.available,
        discoveryError: cachedDiscovery.error,
        primaryChatModel: CHAT_MODEL_PRIORITY[0],
        fallbackPriority: CHAT_MODEL_PRIORITY,
        configuredSupported,
        embeddingModel: EMBEDDING_CONFIG.model,
        embeddingDimensions: EMBEDDING_CONFIG.dimensions,
        embeddingSupported
    };
}

module.exports = {
    EMBEDDING_CONFIG,
    CHAT_MODEL_PRIORITY,
    discoverSupportedModels,
    getModelValidationReport
};
