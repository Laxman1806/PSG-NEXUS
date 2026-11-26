// db/repositories/knowledgeRepository.js - Safe Staging, Versioned Activation & Rollback Repository
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { config } = require('../../backend/config/env');
const { getDB } = require('../connection');
const logger = require('../../backend/utils/logger');

function getSnapshotFile() {
    return process.env.KNOWLEDGE_SNAPSHOT_PATH || path.resolve(__dirname, '../data/managed_knowledge_snapshot.json');
}

const SNAPSHOT_FILE = getSnapshotFile();

function loadSnapshot() {
    const file = getSnapshotFile();
    if (!fs.existsSync(file)) {
        return { documents: [], chunks: [], runs: [] };
    }
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (_err) {
        return { documents: [], chunks: [], runs: [] };
    }
}

function saveSnapshot(data) {
    const file = getSnapshotFile();
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data), 'utf8');
}

async function getDocumentById(documentId) {
    const db = getDB();
    if (db) {
        return db.collection(config.mongo.documentsCollection).findOne({ documentId });
    }
    const snap = loadSnapshot();
    return snap.documents.find((d) => d.documentId === documentId) || null;
}

async function listDocuments(filter = {}, limit = 100) {
    const db = getDB();
    if (db) {
        return db.collection(config.mongo.documentsCollection)
            .find(filter)
            .sort({ updatedAt: -1 })
            .limit(limit)
            .toArray();
    }
    const snap = loadSnapshot();
    return snap.documents.filter((d) => {
        if (filter.status && d.status !== filter.status) return false;
        if (filter.category && d.category !== filter.category) return false;
        return true;
    }).slice(0, limit);
}

async function upsertDocumentRecord(docRecord) {
    const db = getDB();
    if (db) {
        await db.collection(config.mongo.documentsCollection).updateOne(
            { documentId: docRecord.documentId },
            { $set: docRecord },
            { upsert: true }
        );
        return docRecord;
    }
    const snap = loadSnapshot();
    const idx = snap.documents.findIndex((d) => d.documentId === docRecord.documentId);
    if (idx >= 0) snap.documents[idx] = docRecord;
    else snap.documents.push(docRecord);
    saveSnapshot(snap);
    return docRecord;
}

async function updateDocumentStatus(documentId, updates) {
    const db = getDB();
    const patch = { ...updates, updatedAt: new Date() };
    if (db) {
        await db.collection(config.mongo.documentsCollection).updateOne({ documentId }, { $set: patch });
        if (updates.status) {
            await db.collection(config.mongo.chunksCollection).updateMany(
                { documentId },
                { $set: { status: updates.status } }
            );
        }
        return getDocumentById(documentId);
    }

    const snap = loadSnapshot();
    const doc = snap.documents.find((d) => d.documentId === documentId);
    if (!doc) return null;
    Object.assign(doc, patch);
    if (updates.status) {
        for (const chunk of snap.chunks) {
            if (chunk.documentId === documentId) chunk.status = updates.status;
        }
    }
    saveSnapshot(snap);
    return doc;
}

// Write candidate chunks into staging collection (never touches active production chunks)
async function stageChunks(runId, chunks) {
    if (!Array.isArray(chunks) || chunks.length === 0) return 0;
    const db = getDB();
    if (db) {
        const staging = db.collection(config.mongo.stagingChunksCollection);
        await staging.deleteMany({ ingestionRunId: runId });
        await staging.insertMany(chunks);
        return chunks.length;
    }
    const snap = loadSnapshot();
    snap.staging = (snap.staging || []).filter((c) => c.ingestionRunId !== runId).concat(chunks);
    saveSnapshot(snap);
    return chunks.length;
}

// Validate staged chunks, then safely promote to active collection without wiping unrelated documents
async function promoteStagedRun(runId, { expectedDimensions = config.gemini.embeddingDimensions, documentIds = [] } = {}) {
    const db = getDB();

    if (db) {
        const staging = db.collection(config.mongo.stagingChunksCollection);
        const activeCol = db.collection(config.mongo.chunksCollection);
        const runsCol = db.collection(config.mongo.ingestionRunsCollection);

        const stagedChunks = await staging.find({ ingestionRunId: runId }).toArray();
        if (stagedChunks.length === 0) {
            throw new Error(`No staged chunks found for runId=${runId}; active index left unchanged.`);
        }

        const invalidEmbed = stagedChunks.find(
            (c) => Array.isArray(c.embedding) && c.embedding.length !== expectedDimensions
        );
        if (invalidEmbed) {
            throw new Error(`Validation failed: chunk ${invalidEmbed.chunkId} has wrong embedding dimension.`);
        }

        // Record previous active run for rollback
        const previousRun = await runsCol.findOne({ status: 'active' }, { sort: { completedAt: -1 } });

        // Archive superseded chunks ONLY for the documents updated in this run (non-destructive)
        if (documentIds.length > 0) {
            await activeCol.updateMany(
                { documentId: { $in: documentIds }, status: 'active' },
                { $set: { status: 'archived', supersededByRunId: runId } }
            );
        }

        const docsToActivate = stagedChunks.map(({ _id, ...rest }) => ({
            ...rest,
            status: 'active',
            activatedAt: new Date()
        }));

        await activeCol.insertMany(docsToActivate);
        await staging.deleteMany({ ingestionRunId: runId });

        if (previousRun) {
            await runsCol.updateOne({ runId: previousRun.runId }, { $set: { status: 'superseded' } });
        }

        await runsCol.updateOne(
            { runId },
            {
                $set: {
                    status: 'active',
                    previousRunId: previousRun?.runId || null,
                    activatedChunks: docsToActivate.length,
                    completedAt: new Date()
                }
            },
            { upsert: true }
        );

        logger.info('Promoted staged ingestion run to active knowledge_chunks', {
            runId,
            activatedChunks: docsToActivate.length
        });

        return { promotedCount: docsToActivate.length, previousRunId: previousRun?.runId || null };
    }

    // Local snapshot mode
    const snap = loadSnapshot();
    const staged = (snap.staging || []).filter((c) => c.ingestionRunId === runId);
    if (staged.length === 0) {
        throw new Error(`No staged chunks found for runId=${runId}`);
    }
    for (const c of snap.chunks) {
        if (documentIds.includes(c.documentId) && c.status === 'active') {
            c.status = 'archived';
            c.supersededByRunId = runId;
        }
    }
    const activated = staged.map((c) => ({ ...c, status: 'active', activatedAt: new Date().toISOString() }));
    snap.chunks.push(...activated);
    snap.staging = (snap.staging || []).filter((c) => c.ingestionRunId !== runId);
    const prevRun = snap.runs.find((r) => r.status === 'active');
    if (prevRun) prevRun.status = 'superseded';
    snap.runs.push({
        runId,
        status: 'active',
        previousRunId: prevRun?.runId || null,
        activatedChunks: activated.length,
        completedAt: new Date().toISOString()
    });
    saveSnapshot(snap);
    return { promotedCount: activated.length, previousRunId: prevRun?.runId || null };
}

async function rollbackIngestionRun(runId) {
    const db = getDB();
    if (db) {
        const activeCol = db.collection(config.mongo.chunksCollection);
        const runsCol = db.collection(config.mongo.ingestionRunsCollection);

        const targetRun = await runsCol.findOne({ runId });
        if (!targetRun) throw new Error(`Ingestion run ${runId} not found.`);

        await activeCol.updateMany({ ingestionRunId: runId }, { $set: { status: 'archived', rolledBackAt: new Date() } });
        await activeCol.updateMany({ supersededByRunId: runId }, { $set: { status: 'active', supersededByRunId: null } });
        await runsCol.updateOne({ runId }, { $set: { status: 'rolled_back', rolledBackAt: new Date() } });
        if (targetRun.previousRunId) {
            await runsCol.updateOne({ runId: targetRun.previousRunId }, { $set: { status: 'active' } });
        }
        return { rolledBackRunId: runId, restoredRunId: targetRun.previousRunId || null };
    }

    const snap = loadSnapshot();
    const targetRun = snap.runs.find((r) => r.runId === runId);
    if (!targetRun) throw new Error(`Ingestion run ${runId} not found.`);
    for (const c of snap.chunks) {
        if (c.ingestionRunId === runId) c.status = 'archived';
        if (c.supersededByRunId === runId) {
            c.status = 'active';
            delete c.supersededByRunId;
        }
    }
    targetRun.status = 'rolled_back';
    if (targetRun.previousRunId) {
        const prev = snap.runs.find((r) => r.runId === targetRun.previousRunId);
        if (prev) prev.status = 'active';
    }
    saveSnapshot(snap);
    return { rolledBackRunId: runId, restoredRunId: targetRun.previousRunId || null };
}

async function recordIngestionRun(runRecord) {
    const db = getDB();
    if (db) {
        await db.collection(config.mongo.ingestionRunsCollection).updateOne(
            { runId: runRecord.runId },
            { $set: runRecord },
            { upsert: true }
        );
        return runRecord;
    }
    const snap = loadSnapshot();
    const idx = snap.runs.findIndex((r) => r.runId === runRecord.runId);
    if (idx >= 0) snap.runs[idx] = runRecord;
    else snap.runs.push(runRecord);
    saveSnapshot(snap);
    return runRecord;
}

async function listActiveManagedChunks(filter = {}) {
    const db = getDB();
    if (db) {
        return db.collection(config.mongo.chunksCollection)
            .find({ status: 'active', ...filter })
            .toArray();
    }
    const snap = loadSnapshot();
    return snap.chunks.filter((c) => {
        if (c.status !== 'active') return false;
        if (filter.category && c.category !== filter.category) return false;
        if (filter.department && c.department !== filter.department) return false;
        return true;
    });
}

async function createAuditLog(entry) {
    const logItem = {
        auditId: crypto.randomUUID(),
        timestamp: new Date(),
        ...entry
    };
    const db = getDB();
    if (db) {
        await db.collection(config.mongo.auditLogsCollection).insertOne(logItem);
        return logItem;
    }
    const snap = loadSnapshot();
    snap.auditLogs = snap.auditLogs || [];
    snap.auditLogs.push(logItem);
    saveSnapshot(snap);
    return logItem;
}

module.exports = {
    getDocumentById,
    listDocuments,
    upsertDocumentRecord,
    updateDocumentStatus,
    stageChunks,
    promoteStagedRun,
    rollbackIngestionRun,
    recordIngestionRun,
    listActiveManagedChunks,
    createAuditLog,
    loadSnapshot,
    SNAPSHOT_FILE
};
