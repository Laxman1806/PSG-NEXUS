// backend/controllers/chatController.js - Chatbot Request Handlers
const { getDB } = require('../../db/connection');
const { searchWebsite } = require('../../db/searchService');
const { generateAnswer } = require('../services/geminiService');

// Greeting check regex
const GREETING_REGEX = /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|who\s*are\s*you|what\s*can\s*you\s*do)\b/i;

const WELCOME_REPLY = `Hello! I am **PSG Nexus**, the official AI campus assistant for **PSG College of Technology**, Coimbatore. 👋

I am here to assist:
* **👨‍👩‍👧 Parents:** Parent Portal ward monitoring, hostel security, 8:30 PM curfew, health care & fee details.
* **🎓 Students:** Admissions (TNEA Code: 2006), 5-Year Sandwich engineering, 75% attendance rule & placements.
* **📍 Visitors & Recruiters:** Campus navigation (Peelamedu), guest house, CDC placements & departmental contacts.

How can I help you today?`;

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

        // 1. Retrieve most relevant context chunks across all PSG Tech pages
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
}

function handleHealth(req, res) {
    const db = getDB();
    res.json({
        status: 'online',
        database: db ? 'connected' : 'local-semantic-cache-mode',
        knowledgeBase: 'verified chunks with 768d embeddings',
        models: {
            embedding: 'gemini-embedding-001',
            chat: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite (with fallback)'
        }
    });
}

module.exports = { handleChat, handleHealth };
