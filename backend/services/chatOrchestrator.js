// backend/services/chatOrchestrator.js - End-to-End RAG & Conversation Orchestrator
const crypto = require('crypto');
const { config } = require('../config/env');
const { detectLanguage, expandMultilingualQuery } = require('./languageService');
const { INTENTS, classifyIntent, INTENT_TO_CATEGORY } = require('./intentService');
const { rewriteFollowUpQuery } = require('./queryRewriteService');
const { retrieveEvidence } = require('./retrievalService');
const { assessEvidence, detectPromptInjection } = require('./answerValidationService');
const { generateGroundedAnswer } = require('./geminiService');
const { resolveNavigationForIntent } = require('./navigationService');
const conversationService = require('./conversationService');
const { logChatMetric } = require('./feedbackService');
const logger = require('../utils/logger');

const publicQueryCache = new Map();

function invalidateQueryCache() {
    publicQueryCache.clear();
}

function getCachedResponse(cacheKey) {
    const entry = publicQueryCache.get(cacheKey);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        publicQueryCache.delete(cacheKey);
        return null;
    }
    return entry.payload;
}

function setCachedResponse(cacheKey, payload) {
    if (publicQueryCache.size >= 250) {
        const oldestKey = publicQueryCache.keys().next().value;
        publicQueryCache.delete(oldestKey);
    }
    publicQueryCache.set(cacheKey, {
        expiresAt: Date.now() + config.rag.cacheTtlMs,
        payload
    });
}

function buildWelcomeText(language) {
    if (language === 'ta') {
        return `வணக்கம்! நான் **PSG NEXUS** — கோயம்புத்தூர் **PSG College of Technology** வளாகத் தகவல் AI உதவியாளர்.\n\nசேர்க்கை (Admissions), பாடத்திட்டம், விடுதி (Hostel), வேலைவாய்ப்பு (Placements), தேர்வு விதிகள் (CoE) மற்றும் தொடர்பு விவரங்களைக் கேளுங்கள்.`;
    }
    return `Hello! I'm **PSG NEXUS**, your AI campus assistant for **PSG College of Technology**. I can help you explore academic programmes, admissions, departments, faculty, placements, hostel facilities, examination regulations, and official college information.`;
}

function buildSupportPayload(intent) {
    if (intent === INTENTS.HUMAN_SUPPORT) {
        return {
            recommendedDepartment: 'College Administration / Student Help Desk',
            contactUrl: '/cont.php',
            email: 'principal@psgtech.ac.in'
        };
    }
    if (intent === INTENTS.PERSONAL_STUDENT_SERVICE || intent === INTENTS.LIVE_INFORMATION) {
        return {
            recommendedDepartment: 'Student / Parent Zone Portal',
            contactUrl: '/parentzone.php'
        };
    }
    return null;
}

function buildDefaultSuggestions(intent, language) {
    if (language === 'ta') {
        return ['சேர்க்கை விதிகள் என்ன?', 'விடுதி வசதிகள் பற்றி சொல்லுங்கள்'];
    }
    switch (intent) {
        case INTENTS.ADMISSIONS:
            return ['What are the eligibility rules for B.E./B.Tech?', 'How does MCA/MBA admission work?'];
        case INTENTS.HOSTEL:
            return ['What facilities are available in the hostels?', 'How can I visit the hostel page?'];
        case INTENTS.PLACEMENTS:
            return ['Which companies recruit at PSG Tech?', 'What does the Career Development Centre do?'];
        case INTENTS.EXAMINATION:
            return ['What is the minimum attendance requirement?', 'Where can I check CoE exam updates?'];
        default:
            return ['What programmes are offered?', 'How can parents monitor student progress?'];
    }
}

async function processChatMessage({ message, conversationId = null, ownerSessionId, filters = {}, skipEmbedding = false }) {
    const start = Date.now();
    const { language, expandedQuery } = expandMultilingualQuery(message);
    const conversation = await conversationService.getOrCreateConversation(ownerSessionId, conversationId);

    // Detect prompt injection immediately
    if (detectPromptInjection(message)) {
        const refusal = 'I can only assist with verified PSG College of Technology information and cannot follow instructions that override assistant guidelines or disclose internal configuration.';
        await conversationService.recordTurn(conversation.conversationId, ownerSessionId, message, refusal, {
            status: 'INSUFFICIENT',
            citations: []
        });
        logChatMetric({ intent: 'PROMPT_INJECTION_BLOCKED', status: 'INSUFFICIENT', language, latencyMs: Date.now() - start, query: message });
        return {
            conversationId: conversation.conversationId,
            answer: refusal,
            reply: refusal,
            response: refusal,
            status: 'INSUFFICIENT',
            language,
            citations: [],
            sources: [],
            suggestedQuestions: ['What programmes are offered at PSG Tech?', 'How do admissions work?'],
            navigation: null,
            support: null
        };
    }

    const intent = classifyIntent(message, expandedQuery);

    // Handle greeting directly
    if (intent === INTENTS.GREETING) {
        const welcome = buildWelcomeText(language);
        const suggestions = buildDefaultSuggestions(intent, language);
        await conversationService.recordTurn(conversation.conversationId, ownerSessionId, message, welcome, {
            status: 'VERIFIED',
            citations: []
        });
        logChatMetric({ intent, status: 'VERIFIED', language, latencyMs: Date.now() - start, query: message });
        return {
            conversationId: conversation.conversationId,
            answer: welcome,
            reply: welcome,
            response: welcome,
            status: 'VERIFIED',
            language,
            citations: [],
            sources: [],
            suggestedQuestions: suggestions,
            navigation: null,
            support: null
        };
    }

    // Handle out-of-scope or personal/live data requests cleanly without fabricating
    if (intent === INTENTS.OUT_OF_SCOPE) {
        const outOfScopeMsg = 'I am **PSG NEXUS**, focused specifically on **PSG College of Technology** academics, admissions, campus facilities, regulations, and official information. Please ask a college-related question.';
        await conversationService.recordTurn(conversation.conversationId, ownerSessionId, message, outOfScopeMsg, {
            status: 'INSUFFICIENT',
            citations: []
        });
        logChatMetric({ intent, status: 'INSUFFICIENT', language, latencyMs: Date.now() - start, query: message });
        return {
            conversationId: conversation.conversationId,
            answer: outOfScopeMsg,
            reply: outOfScopeMsg,
            response: outOfScopeMsg,
            status: 'INSUFFICIENT',
            language,
            citations: [],
            sources: [],
            suggestedQuestions: ['What programmes are offered at PSG Tech?', 'Tell me about hostel facilities.'],
            navigation: null,
            support: null
        };
    }

    if (intent === INTENTS.HUMAN_SUPPORT) {
        const supportMsg = 'To speak directly with PSG College of Technology officials or submit an enquiry, please visit the **Campus Contact Directory** (`/cont.php`) or **Enquiry Portal** (`/enquiry`), or email `principal@psgtech.ac.in`.';
        await conversationService.recordTurn(conversation.conversationId, ownerSessionId, message, supportMsg, {
            status: 'VERIFIED',
            citations: [{ title: 'Campus Contact & Directory', url: '/cont.php', sourceType: 'html' }]
        });
        logChatMetric({ intent, status: 'VERIFIED', language, latencyMs: Date.now() - start, query: message });
        return {
            conversationId: conversation.conversationId,
            answer: supportMsg,
            reply: supportMsg,
            response: supportMsg,
            status: 'VERIFIED',
            language,
            citations: [{ title: 'Campus Contact & Directory', url: '/cont.php', sourceType: 'html' }],
            sources: [{ title: 'Campus Contact & Directory', url: '/cont.php' }],
            suggestedQuestions: ['Where is PSG College of Technology located?'],
            navigation: { url: '/cont.php', label: 'Campus Contact & Location' },
            support: buildSupportPayload(intent)
        };
    }

    // Rewrite follow-up query using bounded conversation context
    const rewrite = rewriteFollowUpQuery(message, conversation);
    const retrievalQuery = language === 'en' ? rewrite.rewrittenQuery : `${rewrite.rewrittenQuery} ${expandedQuery}`;

    // Check public cache only for standalone queries (non-follow-up, no custom filters)
    const canCache = !rewrite.isFollowUp && Object.keys(filters).length === 0 && !skipEmbedding;
    const cacheKey = crypto.createHash('sha256').update(`${language}:${retrievalQuery.toLowerCase()}`).digest('hex');

    if (canCache) {
        const cached = getCachedResponse(cacheKey);
        if (cached) {
            await conversationService.recordTurn(conversation.conversationId, ownerSessionId, message, cached.answer, {
                status: cached.status,
                citations: cached.citations
            });
            logChatMetric({ intent, status: cached.status, language, cached: true, latencyMs: Date.now() - start, query: message });
            return {
                ...cached,
                conversationId: conversation.conversationId
            };
        }
    }

    // Apply soft category filter only when user did not pass custom filters and not a follow-up
    const effectiveFilters = { ...filters };
    if (!effectiveFilters.category && !rewrite.isFollowUp && INTENT_TO_CATEGORY[intent]) {
        // Keep retrieval broad enough unless category has matching chunks; searchService filters strictly if set,
        // so we pass no hard filter for cross-domain queries unless explicitly requested by caller.
    }

    // Hybrid RAG Retrieval
    const { evidence } = await retrieveEvidence(retrievalQuery, {
        filters: effectiveFilters,
        skipEmbedding
    });

    const assessment = assessEvidence(rewrite.rewrittenQuery, evidence);

    // Grounded Answer Generation + Citation Validation
    const generated = await generateGroundedAnswer({
        question: message,
        evidence,
        conversationSummary: rewrite.contextSummary,
        language,
        assessment
    });

    const navigation = resolveNavigationForIntent(message, intent, generated.citations);
    const support = buildSupportPayload(intent) || (generated.status === 'INSUFFICIENT' ? { contactUrl: '/cont.php' } : null);
    const suggestedQuestions = generated.suggestedQuestions.length > 0
        ? generated.suggestedQuestions
        : buildDefaultSuggestions(intent, language);

    const sources = generated.citations.map((c) => ({
        title: c.title,
        url: c.url,
        page: c.page,
        score: c.score ?? undefined
    }));

    const payload = {
        conversationId: conversation.conversationId,
        answer: generated.answer,
        reply: generated.answer,
        response: generated.answer,
        status: generated.status,
        language,
        intent,
        rewrittenQuery: rewrite.isFollowUp ? rewrite.rewrittenQuery : undefined,
        citations: generated.citations,
        sources,
        suggestedQuestions,
        navigation,
        support
    };

    if (canCache && (generated.status === 'VERIFIED' || generated.status === 'PARTIAL')) {
        setCachedResponse(cacheKey, payload);
    }

    await conversationService.recordTurn(conversation.conversationId, ownerSessionId, message, generated.answer, {
        status: generated.status,
        citations: generated.citations
    });

    const latencyMs = Date.now() - start;
    logChatMetric({
        intent,
        status: generated.status,
        language,
        latencyMs,
        modelUsed: generated.telemetry?.modelUsed,
        usedFallback: generated.telemetry?.usedFallback,
        query: message
    });

    logger.info('Chat turn orchestrated', {
        conversationId: conversation.conversationId,
        intent,
        language,
        status: generated.status,
        citationCount: generated.citations.length,
        latencyMs
    });

    return payload;
}

async function handleChatHttp(req, res, next) {
    try {
        const { message, conversationId, filters } = req.validatedBody;
        const result = await processChatMessage({
            message,
            conversationId,
            ownerSessionId: req.sessionId,
            filters
        });
        return res.json(result);
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    processChatMessage,
    handleChatHttp,
    invalidateQueryCache
};
