// backend/server.js - Server Listener & DB Initialization
require('dotenv').config();
const app = require('./app');
const { connectDB, closeDB } = require('../db/connection');

const PORT = process.env.PORT || 5000;

function registerShutdownHandlers(server) {
    const shutdown = async (signal) => {
        console.log(`\nReceived ${signal}. Shutting down gracefully...`);
        server.close(async () => {
            await closeDB();
            process.exit(0);
        });
    };
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
}

// Connect to Database and start listening
connectDB()
    .then(async (db) => {
        let chunkCount = 0;
        if (db) {
            chunkCount = await db.collection('website_chunks').countDocuments().catch(() => 0);
        }
        const server = app.listen(PORT, () => {
            console.log(`====================================================`);
            console.log(`🚀 PSG NEXUS (Unified Campus Chatbot System)`);
            console.log(`🌐 Server active at: http://localhost:${PORT}`);
            console.log(`🏛️ PSG Tech Web Replica + AI Campus Guide Loaded`);
            if (!db) {
                console.log(`💾 Database Status: Local Semantic Cache Mode (db/data/knowledge_chunks.json)`);
            } else if (chunkCount === 0) {
                console.log(`📭 MongoDB Status: Connected (0 chunks stored)`);
            } else {
                console.log(`📚 MongoDB Status: READY (${chunkCount} chunks loaded)`);
            }
            console.log(`====================================================`);
        });
        registerShutdownHandlers(server);
    })
    .catch(err => {
        console.warn("Database initialization note:", err.message);
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
        registerShutdownHandlers(server);
    });
