require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// We need two models: one for embeddings (searching) and one for generating text
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Define the Schema exactly as Karthi created it in MongoDB
const chunkSchema = new mongoose.Schema({
    chunkIndex: Number,
    content: String,
    embedding: [Number], // The 768-element array
    title: String,
    updatedAt: Date
}, { collection: 'website_chunks' }); // Ensure it points to the exact collection name

const Chunk = mongoose.model('Chunk', chunkSchema);

// The Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const userQuery = req.body.message;
        if (!userQuery) {
            return res.status(400).json({ 
                reply: "Please ask a question.",
                response: "Please ask a question."
            });
        }

        console.log(`🗣️ User asked: "${userQuery}"`);

        // 1. Convert the user's question into an embedding vector
        const embeddingResult = await embeddingModel.embedContent(userQuery);
        const queryVector = embeddingResult.embedding.values;

        // 2. Perform a Vector Search in MongoDB to find the most relevant chunks
        // NOTE: For this to work, Karthi must have created a Vector Search Index on the 'embedding' field in Atlas.
        const searchResults = await Chunk.aggregate([
            {
                "$vectorSearch": {
                    "index": "vector_index", // Name of the index Karthi created in Atlas
                    "path": "embedding",
                    "queryVector": queryVector,
                    "numCandidates": 10,
                    "limit": 3 // Get the top 3 most relevant chunks
                }
            },
            {
                "$project": {
                    "content": 1,
                    "title": 1,
                    "score": { "$meta": "vectorSearchScore" }
                }
            }
        ]);

        // 3. Prepare the context for Gemini
        let contextText = "";
        let isContextFound = false;

        // We only use chunks if the similarity score is decent
        if (searchResults.length > 0 && searchResults[0].score > 0.6) {
             isContextFound = true;
             contextText = searchResults.map(doc => ` Information: ${doc.content}`).join('\n\n');
        }

        // 4. Generate the final response using Gemini
        if (!isContextFound) {
            // If nothing matched well in the database, return the default fallback message
            return res.json({ 
                reply: "I am still learning and currently do not have information regarding that specific query about PSG Tech.",
                response: "I am still learning and currently do not have information regarding that specific query about PSG Tech."
            });
        }

        const systemPrompt = `
        You are PSG Nexus, the official AI assistant for PSG College of Technology.
        Answer the user's question using ONLY the context provided below.
        Be polite, concise, and helpful. Do not make up information.
        
        Context:
        ${contextText}

        User Question: ${userQuery}
        `;

        const chatResult = await chatModel.generateContent(systemPrompt);
        const botReply = chatResult.response.text();

        res.json({ 
            reply: botReply,
            response: botReply
        });

    } catch (error) {
        console.error("❌ Error processing chat:", error);
        res.status(500).json({ 
            reply: "I'm sorry, I encountered an internal error while trying to find that information.",
            response: "I'm sorry, I encountered an internal error while trying to find that information."
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 PSG Nexus Server running on http://localhost:${PORT}`);
});
