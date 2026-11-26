
// backend/server.js
// Start the application only after MongoDB Atlas is connected.

require('dotenv').config();

const app = require('./app');
const { connectDB, closeDB } = require('../db/connection');

const PORT = process.env.PORT || 5000;
const COLLECTION_NAME = process.env.MONGODB_COLLECTION || 'website_chunks';

async function startServer() {
    let server;

    try {
        console.log('Connecting to MongoDB Atlas...');

        const db = await connectDB();

        // Verify that the Atlas collection is accessible.
        const chunkCount = await db
            .collection(COLLECTION_NAME)
            .countDocuments();

        server = app.listen(PORT, () => {
            console.log('====================================================');
            console.log('PSG NEXUS - Unified Campus Chatbot System');
            console.log(`Server active at: http://localhost:${PORT}`);
            console.log('Database Mode: MongoDB Atlas ONLY');
            console.log(`MongoDB Status: CONNECTED (${chunkCount} chunks)`);
            console.log('====================================================');

            if (chunkCount === 0) {
                console.warn('WARNING: The Atlas collection contains no chunks.');
            }
        });

        const shutdown = async (signal) => {
            console.log(`\nReceived ${signal}. Shutting down gracefully...`);

            server.close(async () => {
                try {
                    await closeDB();
                    process.exit(0);
                } catch (error) {
                    console.error('Shutdown error:', error.message);
                    process.exit(1);
                }
            });
        };

        process.once('SIGINT', () => shutdown('SIGINT'));
        process.once('SIGTERM', () => shutdown('SIGTERM'));

    } catch (error) {
        console.error('SERVER STARTUP FAILED:', error.message);
        console.error('PSG NEXUS will not start without MongoDB Atlas.');
        await closeDB().catch(() => {});
        process.exitCode = 1;
    }
}

startServer();
