// backend/server.js - Server Listener, Config Validation, DB Init & Graceful Shutdown
const { config, validateConfig } = require('./config/env');
const { discoverSupportedModels } = require('./config/modelConfig');
const logger = require('./utils/logger');
const app = require('./app');
const { connectDB, closeDB, getConnectionStatus } = require('../db/connection');

let serverInstance = null;

async function startServer() {
    const validation = validateConfig();
    validation.warnings.forEach((w) => logger.warn('Config notice', { detail: w }));
    if (!validation.valid) {
        validation.errors.forEach((e) => logger.error('Config error', { detail: e }));
        if (config.isProduction) {
            process.exit(1);
        }
    }

    const db = await connectDB();
    let chunkCount = 0;
    if (db) {
        chunkCount = await db.collection(config.mongo.collection).countDocuments().catch(() => 0);
    }

    if (config.gemini.enableModelDiscoveryCheck && config.gemini.apiKey && !config.isTest) {
        discoverSupportedModels().then((discovery) => {
            if (discovery.available) {
                logger.info('Gemini model discovery verified', { count: discovery.supportedModels.length });
            } else {
                logger.warn('Gemini model discovery check unavailable', { detail: discovery.error });
            }
        });
    }

    serverInstance = app.listen(config.port, config.host, () => {
        const dbStatus = getConnectionStatus();
        const activeUrl = (process.env.RENDER_EXTERNAL_URL || `http://localhost:${config.port}`).replace(/\/+$/, '');
        logger.info('PSG NEXUS server started', {
            host: config.host,
            port: config.port,
            activeUrl,
            nodeEnv: config.nodeEnv,
            dbMode: dbStatus.mode,
            activeChunks: chunkCount
        });
        console.log(`====================================================`);
        console.log(`PSG NEXUS (AI Campus Assistant for PSG Tech)`);
        console.log(`Server active at: ${activeUrl} (${config.host}:${config.port})`);
        console.log(`Database mode: ${dbStatus.mode} (${chunkCount} active legacy chunks)`);
        console.log(`====================================================`);
    });

    return serverInstance;
}

async function shutdown(signal) {
    logger.info('Received shutdown signal, closing resources gracefully', { signal });
    if (serverInstance) {
        await new Promise((resolve) => serverInstance.close(resolve));
    }
    await closeDB();
    process.exit(0);
}

if (require.main === module || process.argv[1]?.endsWith('server.js')) {
    startServer().catch((err) => {
        logger.error('Failed to start server', { error: err });
        process.exit(1);
    });

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}

module.exports = { startServer, shutdown };
