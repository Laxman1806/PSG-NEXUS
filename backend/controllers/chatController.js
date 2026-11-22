// backend/controllers/chatController.js - Chatbot Request Handlers & Campus Navigator
const { getDB } = require('../../db/connection');
const { searchWebsite } = require('../../db/searchService');
const { generateAnswer } = require('../services/geminiService');

// Greeting check regex
const GREETING_REGEX = /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|who\s*are\s*you|what\s*can\s*you\s*do)\b/i;

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

// Helper function to resolve navigation intent from user prompt
function resolveNavigationIntent(userText) {
    if (!userText) return null;
    const lower = userText.toLowerCase();

    // Check if user specifically requested to move/navigate/go/visit/see a page
    const navTriggerRegex = /(go\s*to|move\s*to|take\s*me\s*to|navigate\s*to|open\s*(the)?\s*page|page\s*(where|were|for)|link\s*(to|for)|view\s*(the)?\s*page|show\s*(me)?\s*(the)?\s*page|where\s*(is|are|can\s*i\s*find)\s*(the)?\s*(page|profile|syllabus))/i;

    const hasNavIntent = navTriggerRegex.test(lower);

    for (const page of CAMPUS_PAGES) {
        for (const kw of page.keywords) {
            if (lower.includes(kw)) {
                // If explicit navigation intent OR user directly asks for the page
                if (hasNavIntent || lower.startsWith('where ') || lower.includes('page')) {
                    return { url: page.url, label: page.label };
                }
            }
        }
    }

    return null;
}

async function handleChat(req, res) {
    try {
        const userQuery = req.body.message ? req.body.message.trim() : '';
        if (!userQuery) {
            return res.status(400).json({ 
                reply: "Please ask a question about PSG College of Technology.",
                response: "Please ask a question about PSG College of Technology."
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

        let contextText = "";
        let sources = [];

        if (relevantChunks && relevantChunks.length > 0) {
            sources = relevantChunks.map(c => ({
                title: c.title,
                url: c.url,
                score: c.score ? Number(c.score.toFixed(3)) : undefined
            }));

            contextText = relevantChunks
                .map((chunk, idx) => `[Source ${idx + 1}: ${chunk.title || 'PSG Tech Info'} (${chunk.url || ''})]\n${chunk.content}`)
                .join('\n\n');

            console.log(`📑 Retrieved ${relevantChunks.length} context chunks (Top source: ${sources[0]?.title})`);
        }

        // 3. Generate answer via Gemini with intelligent fallback
        let botAnswer = await generateAnswer(userQuery, contextText);

        // Check if Gemini embedded [[NAVIGATE:/url|Label]]
        const navMatch = botAnswer.match(/\[\[NAVIGATE:(.*?)\|(.*?)\]\]/);
        if (navMatch) {
            navigation = { url: navMatch[1].trim(), label: navMatch[2].trim() };
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
    const db = getDB();
    res.json({
        status: 'online',
        database: db ? 'connected' : 'local-semantic-cache-mode',
        knowledgeBase: 'verified chunks with 768d embeddings',
        navigation: 'enabled (staff profiles, syllabus, admissions, placements, hostels, coe)',
        models: {
            embedding: 'gemini-embedding-001',
            chat: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite (with fallback)'
        }
    });
}

module.exports = { handleChat, handleHealth };
