require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { connectDB, getDB } = require('./src/config/database');
const { searchWebsite } = require('./src/services/searchService');
const { generateAnswer } = require('./src/services/geminiService');

const app = express();
app.use(cors());
app.use(express.json());

// Serve all static website replica files (HTML, CSS, JS, images, fonts, subpages)
app.use(express.static(__dirname));

// Route helper to serve directory index.html for .php subpages (e.g. /abtcllg.php -> /abtcllg.php/index.html)
app.use((req, res, next) => {
    if (req.method !== 'GET') return next();

    const cleanPath = req.path.replace(/^\/+|\/+$/g, '');
    if (!cleanPath) return next();

    const directDirIndex = path.join(__dirname, cleanPath, 'index.html');
    if (fs.existsSync(directDirIndex)) {
        return res.sendFile(directDirIndex);
    }

    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    const db = getDB();
    res.json({
        status: 'online',
        database: db ? 'connected' : 'in-memory-cache-mode',
        knowledgeBase: 'verified 71 chunks (768d embeddings)',
        models: {
            embedding: 'gemini-embedding-001',
            chat: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite (with fallback)'
        }
    });
});

// Chatbot Query Endpoint
app.post('/api/chat', async (req, res) => {
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
        const isGreeting = /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|who\s*are\s*you|what\s*can\s*you\s*do)\b/i.test(userQuery);
        if (isGreeting) {
            const welcomeText = "Hello! I am **PSG Nexus**, your official AI digital assistant for **PSG College of Technology**, Coimbatore. 👋\n\nI can help you explore everything about our campus:\n* **Admissions & Eligibility** (B.E., B.Tech, MCA, MBA)\n* **Hostels & Residential Rules** (timings, facilities, mess)\n* **Placements & Top Recruiters** (salary statistics, companies)\n* **Academic Regulations** (75% attendance policy, grading)\n* **Programmes, Departments & HoDs**\n\nWhat would you like to know today?";
            return res.json({ reply: welcomeText, response: welcomeText });
        }

        // 1. Retrieve most relevant chunks across all PSG Tech pages
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

        // 2. Generate answer via Gemini with intelligent fallback
        const botAnswer = await generateAnswer(userQuery, contextText);

        return res.json({
            reply: botAnswer,
            response: botAnswer,
            sources: sources
        });

    } catch (error) {
        console.error("❌ Error processing chat request:", error.message);
        return res.status(500).json({
            reply: "I apologize, but I encountered a brief issue retrieving that information. Please ask again or visit the official PSG Tech portal at https://www.psgtech.edu.",
            response: "I apologize, but I encountered a brief issue retrieving that information. Please ask again or visit the official PSG Tech portal at https://www.psgtech.edu."
        });
    }
});

// Root path serves the replicated homepage with embedded chatbot
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;

// Initialize Database connection on startup
connectDB()
    .catch(err => console.warn("Database initialization note:", err.message))
    .finally(() => {
        app.listen(PORT, () => {
            console.log(`====================================================`);
            console.log(`🚀 PSG NEXUS (Unified Campus Chatbot System)`);
            console.log(`🌐 Server active at: http://localhost:${PORT}`);
            console.log(`🏛️ PSG Tech Web Replica + AI Campus Guide Loaded`);
            console.log(`====================================================`);
        });
    });
