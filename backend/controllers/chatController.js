// backend/controllers/chatController.js - Chatbot Request Handlers & Campus Navigator
const { getDB } = require('../../db/connection');
const { searchWebsite } = require('../../db/searchService');
const { generateAnswer } = require('../services/geminiService');

const MAX_QUERY_LENGTH = 1000;

// Greeting check regex (only matches standalone greetings, not questions with a greeting prefix)
const GREETING_REGEX = /^(hi|hello|hey|hey there|greetings|good\s*(morning|afternoon|evening)|who\s*are\s*you|what\s*can\s*you\s*do)[\s!.,?]*$/i;

const WELCOME_REPLY = `Hello! I am **PSG Nexus**, the official AI campus assistant for **PSG College of Technology**, Coimbatore. 👋

I am here to assist:
* **👨‍🏫 Staff & Faculty:** Ask *"take me to staff profiles"* to visit faculty directories.
* **📚 Syllabus & Courses:** Ask *"take me to the syllabus page"* for B.E., B.Tech, MCA & M.Sc curriculum.
* **🎓 Admissions:** TNEA Counselling Code: 2006, cutoffs, eligibility & lateral entry.
* **💼 Placements:** CDC stats, top recruiters & average/highest packages.
* **🏢 Campus Facilities:** Hostels, mess, sports complex & GRD library.

How can I help you today? You can ask a question or tell me which page you would like to visit!`;

// Campus Page Navigation Map
const CAMPUS_PAGES = [
    {
        keywords: ['staff', 'faculty', 'professor', 'teacher', 'hod', 'faculty profile', 'lecturer', 'dean', 'instructors'],
        url: '/facultyDetails.php',
        label: 'Faculty & Staff Directory'
    },
    {
        keywords: ['syllabus', 'syllub', 'curriculum', 'course structure', 'courses', 'programme', 'program', 'degree', 'b.e', 'btech', 'mca', 'msc', 'study'],
        url: '/programme.php',
        label: 'Academic Programmes & Syllabus'
    },
    {
        keywords: ['admission', 'apply', 'tnea', 'eligibility', 'counselling', 'cutoff', 'lateral entry', 'seat', 'btech admission'],
        url: '/admission.php',
        label: 'Admissions & Eligibility Portal'
    },
    {
        keywords: ['placement', 'recruit', 'package', 'salary', 'career', 'job', 'cdc', 'top recruiter', 'internship', 'highest package'],
        url: '/placements',
        label: 'Career & Placements Portal'
    },
    {
        keywords: ['hostel', 'mess', 'room', 'curfew', 'warden', 'boarding', 'stay', 'accommodation', 'hostel fee'],
        url: '/hostel',
        label: 'Hostels & Residential Life'
    },
    {
        keywords: ['scholarship', 'financial aid', 'fee concession', 'waiver', 'endowment', 'merit award'],
        url: '/scholarships.php',
        label: 'Scholarships & Concessions'
    },
    {
        keywords: ['coe', 'exam', 'examination', 'controller of examination', 'hall ticket', 'revaluation', 'grade', 'autonomous exam'],
        url: '/coe.php',
        label: 'Controller of Examinations (CoE)'
    },
    {
        keywords: ['contact', 'address', 'phone', 'email', 'location', 'reach', 'helpline', 'helpdesk', 'where is'],
        url: '/cont.php',
        label: 'Campus Contact & Location'
    },
    {
        keywords: ['about', 'history', 'founder', 'charities', 'management', 'ranking', 'nirf'],
        url: '/abtcllg.php',
        label: 'About PSG College of Technology'
    },
    {
        keywords: ['sports', 'gym', 'ground', 'athletic', 'tournament', 'basketball', 'cricket'],
        url: '/sports',
        label: 'Physical Education & Sports'
    },
    {
        keywords: ['library', 'grd library', 'book', 'journal', 'digital library', 'reading room'],
        url: '/library',
        label: 'GRD Memorial Library'
    }
];

// Explicit allowlist of valid internal campus navigation routes
const ALLOWED_NAV_ROUTES = new Set([
    ...CAMPUS_PAGES.map((p) => p.url),
    '/',
    '/BScMScAdmission2026',
    '/fn_oci',
    '/Heads.php',
    '/principal.php',
    '/parentzone.php',
    '/student.php',
    '/R&D.php',
    '/nirf.php',
    '/approval.php',
    '/bshets.php',
    '/coeindutech',
    '/Dean-Academic.php',
    '/Dean-Administration.php',
    '/Dean-Autonomous.php',
    '/founders.php',
    '/Glances',
    '/help-desk.php',
    '/IIC',
    '/Management.php',
    '/MandatoryCommittee.php',
    '/Mousgloblink.php',
    '/NBA Accreditation.php',
    '/Professor_Practice.php',
    '/programme_offered.php',
    '/psgcrs',
    '/Report-RC2026.php',
    '/Research/ird.html',
    '/secretary.php',
    '/tech bulletin.php',
    '/teqip',
    '/trustees.php',
    '/VicePrincipal_WomenWelfare.php',
    '/websiteUrls.php',
    '/academicschedule',
    '/iipc',
    '/platinum',
    '/thebridge',
    '/alumni',
    '/enquiry',
    '/course conducted.php'
]);

/**
 * Normalizes and validates an internal relative campus path to block external redirects and javascript: URIs.
 */
function sanitizeInternalPath(rawUrl) {
    if (typeof rawUrl !== 'string') return null;
    let cleaned = rawUrl.trim();
    if (!cleaned) return null;

    if (!cleaned.startsWith('/')) {
        // Reject scheme-prefixed URIs (e.g. javascript:, http:, https:, data:)
        if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(cleaned)) {
            return null;
        }
        cleaned = '/' + cleaned;
    }

    // Reject protocol-relative URLs (//evil.com), traversal, backslashes, or colons
    if (cleaned.startsWith('//') || cleaned.includes('..') || cleaned.includes('\\') || cleaned.includes(':')) {
        return null;
    }

    if (cleaned.length > 1 && cleaned.endsWith('/')) {
        cleaned = cleaned.slice(0, -1);
    }

    if (cleaned === '/about') {
        cleaned = '/abtcllg.php';
    }

    return /^\/[a-zA-Z0-9\-_.\/& %]*$/.test(cleaned) ? cleaned : null;
}

/**
 * Validates navigation targets emitted by keyword matching or LLM output against ALLOWED_NAV_ROUTES.
 */
function sanitizeNavigation(rawUrl, rawLabel) {
    const safeUrl = sanitizeInternalPath(rawUrl);
    if (!safeUrl || !ALLOWED_NAV_ROUTES.has(safeUrl)) {
        return null;
    }
    const cleanLabel = String(rawLabel || '')
        .replace(/[\u0000-\u001F\u007F]/g, '')
        .trim()
        .slice(0, 80);
    return {
        url: safeUrl,
        label: cleanLabel || 'Campus Page'
    };
}

// Helper function to resolve navigation target from user prompt or keywords
function resolveNavigationIntent(userText) {
    if (!userText) return null;
    const lower = userText.toLowerCase();

    for (const page of CAMPUS_PAGES) {
        for (const kw of page.keywords) {
            if (lower.includes(kw)) {
                return { url: page.url, label: page.label };
            }
        }
    }

    return null;
}

async function handleChat(req, res) {
    try {
        if (!req.body || typeof req.body !== 'object' || typeof req.body.message !== 'string') {
            return res.status(400).json({
                reply: "Invalid request: 'message' must be a non-empty text string.",
                response: "Invalid request: 'message' must be a non-empty text string."
            });
        }

        const userQuery = req.body.message
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
            .trim();

        if (!userQuery) {
            return res.status(400).json({
                reply: "Please ask a question about PSG College of Technology.",
                response: "Please ask a question about PSG College of Technology."
            });
        }

        if (userQuery.length > MAX_QUERY_LENGTH) {
            return res.status(400).json({
                reply: `Please keep your question concise (maximum ${MAX_QUERY_LENGTH} characters).`,
                response: `Please keep your question concise (maximum ${MAX_QUERY_LENGTH} characters).`
            });
        }

        console.log(`\n🗣️ User Query: "${userQuery}"`);

        // Check for simple greetings
        if (GREETING_REGEX.test(userQuery)) {
            return res.json({ reply: WELCOME_REPLY, response: WELCOME_REPLY });
        }

        // 1. Check for page navigation intent
        let navigation = resolveNavigationIntent(userQuery);

        // 2. Retrieve most relevant context chunks across all PSG Tech pages
        const relevantChunks = await searchWebsite(userQuery);

        if (!Array.isArray(relevantChunks)) {
    throw new Error("Invalid response from Atlas search service.");
}

if (relevantChunks.length === 0) {
    const noInfo =
        "I couldn't find this information on the PSG Tech website.";

    return res.json({
        reply: noInfo,
        response: noInfo,
        sources: [],
        navigation: navigation
    });
}

        let contextText = "";
        let sources = [];

        if (relevantChunks && relevantChunks.length > 0) {
            sources = relevantChunks.map(c => ({
                title: c.title,
                url: sanitizeInternalPath(c.url) || '/',
                score: c.score ? Number(c.score.toFixed(3)) : undefined
            }));

            contextText = relevantChunks
                .map((chunk, idx) => `[Source ${idx + 1}: ${chunk.title || 'PSG Tech Info'} (${chunk.url || ''})]\n${chunk.content}`)
                .join('\n\n');

            console.log(`📑 Retrieved ${relevantChunks.length} context chunks (Top source: ${sources[0]?.title})`);
        }

        // 3. Generate answer via Gemini with intelligent fallback
        let botAnswer = await generateAnswer(userQuery, contextText);

        // Check if Gemini embedded [[NAVIGATE:/url|Label]] and validate against allowlist
        const navMatch = botAnswer.match(/\[\[NAVIGATE:(.*?)\|(.*?)\]\]/);
        if (navMatch) {
            const validatedNav = sanitizeNavigation(navMatch[1], navMatch[2]);
            if (validatedNav) {
                navigation = validatedNav;
            }
        }
        // Always strip raw navigation tags from prose
        botAnswer = botAnswer.replace(/\[\[NAVIGATE:(.*?)\|(.*?)\]\]/g, '').trim();

        // If no explicit navigation yet, check if top source maps to a campus page
        if (!navigation && sources && sources.length > 0 && sources[0].url && sources[0].url !== '/') {
            const topUrl = sources[0].url;
            const matchedPage = CAMPUS_PAGES.find(p => p.url === topUrl);
            if (matchedPage) {
                navigation = { url: matchedPage.url, label: matchedPage.label };
            }
        }

        if (navigation) {
            console.log(`🧭 Navigation intent detected -> ${navigation.label} (${navigation.url})`);
        }

        return res.json({
            reply: botAnswer,
            response: botAnswer,
            sources: sources,
            navigation: navigation
        });

    } catch (error) {
        console.error("❌ Error processing chat request:", error.message);
        return res.status(500).json({
            reply: "I apologize, but I encountered a brief issue retrieving that information. Please ask again or visit the official PSG Tech portal at https://www.psgtech.edu.",
            response: "I apologize, but I encountered a brief issue retrieving that information. Please ask again or visit the official PSG Tech portal at https://www.psgtech.edu."
        });
    }
}

function handleHealth(req, res) {
    return res.status(200).json({
        status: "online",
        application: "PSG NEXUS",
        databaseMode: "MongoDB Atlas only"
    });
}
/**
 * Readiness endpoint: reports actual DB status, API key presence, and fallback status.
 * Used by deployment platforms and monitoring systems to assess service readiness.
 */
async function handleReady(req, res) {
    try {
        const db = getDB();

        // Verify that Atlas is responding.
        await db.command({ ping: 1 });

        const collection = db.collection(
            process.env.MONGODB_COLLECTION || "website_chunks"
        );

        const chunkCount = await collection.countDocuments();

        const hasGeminiKey = Boolean(
            process.env.GEMINI_API_KEY &&
            process.env.GEMINI_API_KEY.length > 10
        );

        if (chunkCount === 0 || !hasGeminiKey) {
            return res.status(503).json({
                ready: false,
                database: "mongodb-atlas-connected",
                chunks: chunkCount,
                ai: hasGeminiKey ? "configured" : "missing",
                message: "Application dependencies are not fully ready."
            });
        }

        return res.status(200).json({
            ready: true,
            database: "mongodb-atlas-connected",
            collection: process.env.MONGODB_COLLECTION || "website_chunks",
            chunks: chunkCount,
            ai: "configured",
            retrieval: "MongoDB Atlas Vector Search only"
        });

    } catch (error) {
        console.error("Readiness check failed:", error.message);

        return res.status(503).json({
            ready: false,
            database: "unavailable",
            retrieval: "unavailable",
            message: "Required application services are unavailable."
        });
    }
}

module.exports = { handleChat, handleHealth, handleReady, sanitizeInternalPath, sanitizeNavigation };
