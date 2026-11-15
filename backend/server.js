// backend/server.js - Server Listener & DB Initialization
require('dotenv').config();
const app = require('./app');
const { connectDB } = require('../db/connection');

const PORT = process.env.PORT || 5000;

// Connect to Database and start listening
connectDB()
    .then(async (db) => {
        let chunkCount = 0;
        if (db) {
            chunkCount = await db.collection('website_chunks').countDocuments().catch(() => 0);
        }
        app.listen(PORT, () => {
            console.log(`====================================================`);
            console.log(`🚀 PSG NEXUS (Unified Campus Chatbot System)`);
            console.log(`🌐 Server active at: http://localhost:${PORT}`);
            console.log(`🏛️ PSG Tech Web Replica + AI Campus Guide Loaded`);
            if (chunkCount === 0) {
                console.log(`📭 MongoDB Status: Connected (0 chunks stored)`);
            } else {
                console.log(`📚 MongoDB Status: READY (${chunkCount} chunks loaded)`);
            }
            console.log(`====================================================`);
        });
    })
    .catch(err => {
        console.warn("Database initialization note:", err.message);
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    });
