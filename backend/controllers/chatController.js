// backend/controllers/chatController.js - Thin HTTP Handlers for Chat, Health & Readiness
const fs = require('fs');
const path = require('path');
const { config, validateConfig } = require('../config/env');
const { EMBEDDING_CONFIG, getModelValidationReport } = require('../config/modelConfig');
const { getDB, getConnectionStatus, pingDB, isAtlasConnected } = require('../../db/connection');
const { searchWebsite } = require('../../db/searchService');
const { generateAnswer } = require('../services/geminiService');
const { handleChatHttp } = require('../services/chatOrchestrator');

const GREETING_REGEX = /^(hi|hello|hey|hey there|greetings|good\s*(morning|afternoon|evening)|who\s*are\s*you|what\s*can\s*you\s*do)[\s!.,?]*$/i;

const WELCOME_REPLY = `Hello! I am **PSG NEXUS**, the AI campus assistant for **PSG College of Technology**, Coimbatore.

I can help you with verified college information across:
* **Admissions & Programmes:** TNEA / TANCA routes, B.E., B.Tech, M.E., MCA, MBA & M.Sc details.
* **Faculty & Departments:** Department directory, HoDs & academic offices.
* **Hostels & Facilities:** Accommodation, library, sports & student support.
* **Examinations & Placements:** Autonomous regulations, CoE circulars & placement services.

Ask any question or tell me which campus page you would like to visit!`;

const CAMPUS_PAGES = [
    {
        keywords: ['staff', 'faculty', 'professor', 'teacher', 'hod', 'faculty profile', 'lecturer', 'dean'],
        url: '/facultyDetails.php',
        label: 'Faculty & Staff Directory'
    },
    {
        keywords: ['syllabus', 'curriculum', 'course structure', 'courses', 'programme', 'program'],
        url: '/programme.php',
        label: 'Academic Programmes & Syllabus'
    },
    {
        keywords: ['admission', 'apply', 'tnea', 'eligibility', 'counselling', 'cutoff', 'lateral entry'],
        url: '/admission.php',
        label: 'Admissions & Eligibility Portal'
    },
    {
        keywords: ['placement', 'recruit', 'package', 'salary', 'career', 'cdc', 'internship'],
        url: '/placements',
        label: 'Career & Placements Portal'
    },
    {
        keywords: ['hostel', 'mess', 'warden', 'accommodation', 'residential'],
        url: '/hostel',
        label: 'Hostels & Residential Life'
    },
    {
        keywords: ['scholarship', 'financial aid', 'fee concession', 'waiver', 'endowment'],
        url: '/scholarships.php',
        label: 'Scholarships & Concessions'
    },
    {
        keywords: ['coe', 'exam', 'examination', 'controller of examination', 'hall ticket', 'revaluation'],
        url: '/coe.php',
        label: 'Controller of Examinations (CoE)'
    },
    {
        keywords: ['contact', 'address', 'phone', 'email', 'helpline', 'helpdesk'],
        url: '/cont.php',
        label: 'Campus Contact & Location'
    },
    {
        keywords: ['about', 'history', 'founder', 'charities', 'management', 'ranking', 'nirf'],
        url: '/abtcllg.php',
        label: 'About PSG College of Technology'
    },
    {
        keywords: ['sports', 'gym', 'ground', 'athletic', 'basketball', 'cricket'],
        url: '/sports',
        label: 'Physical Education & Sports'
    },
    {
        keywords: ['library', 'grd library', 'digital library', 'reading room'],
        url: '/library',
        label: 'GRD Memorial Library'
    }
];

const ALLOWED_NAVIGATION_URLS = new Set(CAMPUS_PAGES.map((p) => p.url));

function sanitizeNavigation(nav) {
    if (!nav || typeof nav.url !== 'string') return null;
    const cleanUrl = nav.url.trim();
    if (!ALLOWED_NAVIGATION_URLS.has(cleanUrl)) return null;
    const matched = CAMPUS_PAGES.find((p) => p.url === cleanUrl);
    return {
        url: cleanUrl,
        label: matched ? matched.label : (nav.label || cleanUrl)
    };
}

function resolveExplicitNavigationIntent(userText) {
    if (!userText) return null;
    const lower = userText.toLowerCase();
    const wantsNavigation = /\b(open|go to|take me|navigate|visit|show me the page|where is .* page|redirect)\b/i.test(lower);
    if (!wantsNavigation) return null;

    for (const page of CAMPUS_PAGES) {
        for (const kw of page.keywords) {
            const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (new RegExp(`\\b${escaped}\\b`, 'i').test(lower)) {
                return { url: page.url, label: page.label };
            }
        }
    }
    return null;
}

// Orchestrator hook defaults to full chatOrchestrator pipeline
let orchestratorHandler = handleChatHttp;
function setOrchestrator(fn) {
    orchestratorHandler = fn;
}

async function handleChat(req, res, next) {
    try {
        if (orchestratorHandler) {
            return await orchestratorHandler(req, res, next);
        }

        const { message: userQuery } = req.validatedBody;
        if (GREETING_REGEX.test(userQuery)) {
            return res.json({
                reply: WELCOME_REPLY,
                response: WELCOME_REPLY,
                status: 'VERIFIED',
                sources: [],
                citations: [],
                navigation: null
            });
        }

        let navigation = resolveExplicitNavigationIntent(userQuery);
        const relevantChunks = await searchWebsite(userQuery);

        let contextText = '';
        let sources = [];
        if (relevantChunks && relevantChunks.length > 0) {
            sources = relevantChunks.map((c) => ({
                title: c.title,
                url: c.url,
                score: c.score ? Number(c.score.toFixed(3)) : undefined
            }));
            contextText = relevantChunks
                .map((chunk, idx) => `[Source ${idx + 1}: ${chunk.title || 'PSG Tech Info'} (${chunk.url || ''})]\n${chunk.content}`)
                .join('\n\n');
        }

        let botAnswer = await generateAnswer(userQuery, contextText);
        const navMatch = botAnswer.match(/\[\[NAVIGATE:(.*?)\|(.*?)\]\]/);
        if (navMatch && !navigation) {
            navigation = sanitizeNavigation({ url: navMatch[1].trim(), label: navMatch[2].trim() });
        }
        botAnswer = botAnswer.replace(/\[\[NAVIGATE:(.*?)\|(.*?)\]\]/g, '').trim();

        return res.json({
            reply: botAnswer,
            response: botAnswer,
            sources,
            navigation: sanitizeNavigation(navigation)
        });
    } catch (err) {
        return next(err);
    }
}

async function inspectKnowledgeAvailability() {
    const db = getDB();
    let legacyChunks = 0;
    let managedChunks = 0;
    let vectorIndexReady = false;

    if (db) {
        legacyChunks = await db.collection(config.mongo.collection).countDocuments().catch(() => 0);
        managedChunks = await db.collection(config.mongo.chunksCollection).countDocuments({ status: 'active' }).catch(() => 0);

        if (isAtlasConnected()) {
            try {
                const indexes = await db.collection(config.mongo.collection).listSearchIndexes().toArray();
                vectorIndexReady = indexes.some((idx) => idx.name === config.mongo.vectorIndexName && idx.queryable);
            } catch (_err) {
                vectorIndexReady = false;
            }
        }
    }

    const cachePath = path.resolve(__dirname, '../../db/data/knowledge_chunks.json');
    let localCacheCount = 0;
    if (fs.existsSync(cachePath)) {
        try {
            const parsed = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            localCacheCount = Array.isArray(parsed) ? parsed.length : 0;
        } catch (_e) {
            localCacheCount = 0;
        }
    }

    return { legacyChunks, managedChunks, vectorIndexReady, localCacheCount };
}

function handleHealth(_req, res) {
    const dbStatus = getConnectionStatus();
    const configCheck = validateConfig();
    res.json({
        status: 'alive',
        uptimeSeconds: Math.round(process.uptime()),
        environment: config.nodeEnv,
        databaseMode: dbStatus.mode,
        configValid: configCheck.valid
    });
}

async function handleReady(_req, res) {
    const dbPing = await pingDB();
    const knowledge = await inspectKnowledgeAvailability();
    const modelReport = getModelValidationReport();
    const hasKnowledge = knowledge.legacyChunks > 0 || knowledge.managedChunks > 0 || knowledge.localCacheCount > 0;
    const isReady = hasKnowledge && (dbPing.ok || knowledge.localCacheCount > 0);

    const payload = {
        status: isReady ? 'ready' : 'degraded',
        checks: {
            database: dbPing,
            knowledgeBase: {
                ready: hasKnowledge,
                atlasVectorIndexReady: knowledge.vectorIndexReady,
                legacyChunks: knowledge.legacyChunks,
                managedActiveChunks: knowledge.managedChunks,
                localCacheChunks: knowledge.localCacheCount
            },
            gemini: {
                apiKeyConfigured: Boolean(config.gemini.apiKey),
                embeddingModel: EMBEDDING_CONFIG.model,
                embeddingDimensions: EMBEDDING_CONFIG.dimensions,
                primaryChatModel: modelReport.primaryChatModel,
                discoveryCheckedAt: modelReport.checkedAt,
                discoveryAvailable: modelReport.discoveryAvailable
            }
        }
    };

    return res.status(isReady ? 200 : 503).json(payload);
}

module.exports = {
    handleChat,
    handleHealth,
    handleReady,
    setOrchestrator,
    CAMPUS_PAGES,
    ALLOWED_NAVIGATION_URLS,
    sanitizeNavigation,
    resolveExplicitNavigationIntent
};
