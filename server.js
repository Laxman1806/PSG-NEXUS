require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files from workspace root
app.use(express.static(__dirname));

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.error('❌ Missing GEMINI_API_KEY in environment variables!');
}
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Models: gemini-embedding-001 for vector search, gemini-3.1-flash-lite for fast conversational responses
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
const primaryChatModel = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
const fallbackChatModel = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

// Helper to generate text with fallback
async function generateWithFallback(prompt) {
    try {
        const result = await primaryChatModel.generateContent(prompt);
        return result.response.text();
    } catch (primaryErr) {
        console.warn('⚠️ Primary model (gemini-3.1-flash-lite) error, trying fallback (gemini-3.5-flash):', primaryErr.message);
        const result = await fallbackChatModel.generateContent(prompt);
        return result.response.text();
    }
}

// Connect to MongoDB Atlas (pointing explicitly to psg_chatbot database)
const mongoUri = process.env.MONGO_URI || '';
mongoose.connect(mongoUri, {
    dbName: 'psg_chatbot',
    serverSelectionTimeoutMS: 5000
})
.then(() => console.log('✅ Connected to MongoDB Atlas (database: psg_chatbot)'))
.catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// Schema definition matching MongoDB Atlas collection: website_chunks
const chunkSchema = new mongoose.Schema({
    chunkIndex: Number,
    content: String,
    embedding: [Number], // 768-element vector
    title: String,
    url: String,
    updatedAt: Date
}, { collection: 'website_chunks' });

const Chunk = mongoose.model('Chunk', chunkSchema);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting/disconnected',
        models: {
            embedding: 'gemini-embedding-001 (768d)',
            chat: 'gemini-3.1-flash-lite'
        }
    });
});

// Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const userQuery = req.body.message ? req.body.message.trim() : '';
        if (!userQuery) {
            return res.status(400).json({ 
                reply: "Please ask a question.",
                response: "Please ask a question."
            });
        }

        console.log(`🗣️ User asked: "${userQuery}"`);

        // Check if query is a simple greeting
        const isGreeting = /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|who\s*are\s*you|what\s*can\s*you\s*do)\b/i.test(userQuery);

        let contextText = "";
        let searchResults = [];

        try {
            // 1. Convert user's query into an embedding vector matching the index's 768 dimensions
            const embeddingResult = await embeddingModel.embedContent({
                content: { parts: [{ text: userQuery }] },
                outputDimensionality: 768
            });
            const queryVector = embeddingResult.embedding.values;

            // 2. Perform Vector Search on MongoDB Atlas vector_index
            if (mongoose.connection.readyState === 1) {
                searchResults = await Chunk.aggregate([
                    {
                        "$vectorSearch": {
                            "index": "vector_index",
                            "path": "embedding",
                            "queryVector": queryVector,
                            "numCandidates": 10,
                            "limit": 3
                        }
                    },
                    {
                        "$project": {
                            "content": 1,
                            "title": 1,
                            "url": 1,
                            "score": { "$meta": "vectorSearchScore" }
                        }
                    }
                ]);

                console.log(`🔍 Retrieved ${searchResults.length} vector search candidates (top score: ${searchResults[0]?.score?.toFixed(3) || 'none'})`);

                if (searchResults.length > 0 && searchResults[0].score >= 0.65) {
                    contextText = searchResults
                        .filter(doc => doc.score >= 0.65)
                        .map(doc => `[Source: ${doc.title || 'PSG Tech Info'}]\n${doc.content}`)
                        .join('\n\n');
                }
            }
        } catch (searchError) {
            console.warn('⚠️ Vector search note:', searchError.message);
            // Non-fatal: if vector search has issues, Gemini can still answer institutional questions
        }

        // 3. Formulate Prompt for Gemini
        const systemPrompt = `You are PSG Nexus, the official intelligent AI campus assistant for PSG College of Technology, Coimbatore.
You assist students, aspirants, parents, and visitors with accurate information about admissions, academic programmes, departments, campus life, and placements.

Behavior Guidelines:
- Tone: Professional, welcoming, encouraging, and clear.
- Formatting: Use markdown (bold headings, bullet points) to make responses easy to read.
- Greetings: If the user says hello or asks who you are, greet them warmly, introduce yourself as PSG Nexus, and highlight what you can assist with.
- Answering queries: Prioritize the verified context provided below.
- Accuracy: If information is not in the context or PSG Tech public domain, politely guide the user to official sources (https://www.psgtech.edu).

${contextText ? `=== VERIFIED PSG TECH KNOWLEDGE BASE CONTEXT ===\n${contextText}\n===============================================` : 'Note: Answer using verified general knowledge about PSG College of Technology, Coimbatore.'}

User Question: ${userQuery}
`;

        // 4. Generate AI response using Gemini
        const botReply = await generateWithFallback(systemPrompt);

        return res.json({ 
            reply: botReply,
            response: botReply
        });

    } catch (error) {
        console.error("❌ Error processing chat:", error);
        return res.status(500).json({ 
            reply: "I apologize, but I encountered an error while retrieving that information. Please try asking again or visit https://www.psgtech.edu.",
            response: "I apologize, but I encountered an error while retrieving that information. Please try asking again or visit https://www.psgtech.edu."
        });
    }
});

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 PSG Nexus Server running on http://localhost:${PORT}`);
});
