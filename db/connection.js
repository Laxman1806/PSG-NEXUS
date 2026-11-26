// db/connection.js - Singleton MongoDB Connection Pool Manager (Atlas + Local + Offline Fallback)
const { MongoClient } = require('mongodb');
const { config } = require('../backend/config/env');
const logger = require('../backend/utils/logger');

let client = null;
let db = null;
let connectPromise = null;

const connectionState = {
    connected: false,
    mode: 'disconnected', // 'atlas' | 'local' | 'offline-cache' | 'disconnected'
    dbName: config.mongo.dbName,
    lastError: null,
    lastCheckedAt: null
};

async function tryConnect(uri, mode, timeoutMs) {
    const nextClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: timeoutMs,
        maxPoolSize: config.mongo.maxPoolSize,
        minPoolSize: 1,
        autoSelectFamily: false
    });
    await nextClient.connect();
    const nextDb = nextClient.db(config.mongo.dbName);
    await nextDb.command({ ping: 1 });
    return { nextClient, nextDb, mode };
}

async function connectDB() {
    if (db) return db;
    if (connectPromise) return connectPromise;

    connectPromise = (async () => {
        // 1. Try MongoDB Atlas first if configured (retry once on transient handshake error)
        if (config.mongo.uri) {
            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    logger.info('Connecting to MongoDB Atlas', { dbName: config.mongo.dbName, attempt });
                    const res = await tryConnect(config.mongo.uri, 'atlas', config.mongo.connectTimeoutMs);
                    client = res.nextClient;
                    db = res.nextDb;
                    connectionState.connected = true;
                    connectionState.mode = 'atlas';
                    connectionState.lastError = null;
                    connectionState.lastCheckedAt = new Date().toISOString();
                    logger.info('MongoDB Atlas connected', { dbName: config.mongo.dbName });
                    return db;
                } catch (atlasErr) {
                    connectionState.lastError = atlasErr.message;
                    const isTlsAlert80 = String(atlasErr.message || '').includes('alert number 80');
                    if (attempt === 1 && !isTlsAlert80) {
                        await new Promise((r) => setTimeout(r, 500));
                        continue;
                    }
                    logger.warn(
                        isTlsAlert80
                            ? 'MongoDB Atlas TLS handshake rejected (check Atlas Network Access IP Allowlist); trying local MongoDB'
                            : 'MongoDB Atlas connection failed, trying local MongoDB',
                        { error: atlasErr }
                    );
                    break;
                }
            }
        }

        // 2. Fallback to local Community MongoDB
        try {
            logger.info('Connecting to local MongoDB', { dbName: config.mongo.dbName });
            const res = await tryConnect(config.mongo.localUri, 'local', Math.min(config.mongo.connectTimeoutMs, 3000));
            client = res.nextClient;
            db = res.nextDb;
            connectionState.connected = true;
            connectionState.mode = 'local';
            connectionState.lastError = null;
            connectionState.lastCheckedAt = new Date().toISOString();
            logger.info('Local MongoDB connected', { dbName: config.mongo.dbName });
            return db;
        } catch (localErr) {
            connectionState.connected = false;
            connectionState.mode = 'offline-cache';
            connectionState.lastError = localErr.message;
            connectionState.lastCheckedAt = new Date().toISOString();
            logger.warn('MongoDB unavailable; operating in local semantic cache mode', { error: localErr });
            return null;
        }
    })();

    try {
        return await connectPromise;
    } finally {
        connectPromise = null;
    }
}

function getDB() {
    return db;
}

function getClient() {
    return client;
}

function isAtlasConnected() {
    return Boolean(db && connectionState.mode === 'atlas');
}

function getConnectionStatus() {
    return { ...connectionState };
}

async function pingDB() {
    if (!db) {
        return { ok: false, mode: connectionState.mode, error: connectionState.lastError || 'Not connected' };
    }
    try {
        const start = Date.now();
        await db.command({ ping: 1 });
        connectionState.lastCheckedAt = new Date().toISOString();
        return {
            ok: true,
            mode: connectionState.mode,
            latencyMs: Date.now() - start
        };
    } catch (err) {
        connectionState.connected = false;
        connectionState.lastError = err.message;
        return { ok: false, mode: connectionState.mode, error: err.message };
    }
}

async function closeDB() {
    if (client) {
        try {
            await client.close();
            logger.info('MongoDB connection closed gracefully');
        } catch (err) {
            logger.warn('Error closing MongoDB connection', { error: err });
        } finally {
            client = null;
            db = null;
            connectionState.connected = false;
            connectionState.mode = 'disconnected';
        }
    }
}

module.exports = {
    connectDB,
    getDB,
    getClient,
    isAtlasConnected,
    getConnectionStatus,
    pingDB,
    closeDB
};
