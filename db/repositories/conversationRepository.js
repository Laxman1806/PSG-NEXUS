// db/repositories/conversationRepository.js - Session-Scoped Server-Side Conversation Persistence with Fault-Tolerant Fallback
const crypto = require('crypto');
const { config } = require('../../backend/config/env');
const { getDB } = require('../connection');
const logger = require('../../backend/utils/logger');

const memoryConversations = new Map();

function buildNewConversation(ownerSessionId, title = 'New Conversation') {
    const now = new Date();
    return {
        conversationId: `conv-${crypto.randomUUID()}`,
        ownerSessionId,
        title,
        summary: '',
        messages: [],
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    };
}

async function createConversation(ownerSessionId, title) {
    const doc = buildNewConversation(ownerSessionId, title);
    memoryConversations.set(doc.conversationId, doc);
    const db = getDB();
    if (db) {
        try {
            await db.collection(config.mongo.conversationsCollection).insertOne({ ...doc });
        } catch (err) {
            logger.warn('MongoDB conversation insert failed; using in-memory fallback', { error: err });
        }
    }
    return doc;
}

async function getConversation(conversationId, ownerSessionId) {
    if (!conversationId || !ownerSessionId) return null;
    const db = getDB();
    if (db) {
        try {
            const found = await db.collection(config.mongo.conversationsCollection).findOne({
                conversationId,
                ownerSessionId
            });
            if (found) return found;
        } catch (err) {
            logger.warn('MongoDB conversation lookup failed; checking in-memory fallback', { error: err });
        }
    }
    const local = memoryConversations.get(conversationId);
    if (!local || local.ownerSessionId !== ownerSessionId) return null;
    return local;
}

async function listConversations(ownerSessionId, limit = 25) {
    if (!ownerSessionId) return [];
    const db = getDB();
    if (db) {
        try {
            return await db.collection(config.mongo.conversationsCollection)
                .find({ ownerSessionId }, { projection: { _id: 0, ownerSessionId: 0 } })
                .sort({ updatedAt: -1 })
                .limit(limit)
                .toArray();
        } catch (err) {
            logger.warn('MongoDB conversation list failed; falling back to memory', { error: err });
        }
    }
    return Array.from(memoryConversations.values())
        .filter((c) => c.ownerSessionId === ownerSessionId)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, limit)
        .map(({ ownerSessionId: _hidden, ...rest }) => rest);
}

async function appendMessages(conversationId, ownerSessionId, newMessages = [], summary = null) {
    const maxStored = config.rag.maxConversationTurns * 2;
    const existing = await getConversation(conversationId, ownerSessionId);
    if (!existing) return null;

    const combined = [...(existing.messages || []), ...newMessages];
    const bounded = combined.slice(-maxStored);
    const title = existing.title === 'New Conversation' && newMessages[0]?.content
        ? String(newMessages[0].content).slice(0, 60)
        : existing.title;

    const patch = {
        messages: bounded,
        title,
        updatedAt: new Date()
    };
    if (summary !== null) patch.summary = summary;

    Object.assign(existing, patch);
    memoryConversations.set(conversationId, existing);

    const db = getDB();
    if (db) {
        try {
            await db.collection(config.mongo.conversationsCollection).updateOne(
                { conversationId, ownerSessionId },
                { $set: patch }
            );
        } catch (err) {
            logger.warn('MongoDB conversation update failed; preserved in memory', { error: err });
        }
    }

    return existing;
}

async function deleteConversation(conversationId, ownerSessionId) {
    const local = memoryConversations.get(conversationId);
    let deletedLocal = false;
    if (local && local.ownerSessionId === ownerSessionId) {
        memoryConversations.delete(conversationId);
        deletedLocal = true;
    }

    const db = getDB();
    if (db) {
        try {
            const res = await db.collection(config.mongo.conversationsCollection).deleteOne({
                conversationId,
                ownerSessionId
            });
            return res.deletedCount > 0 || deletedLocal;
        } catch (err) {
            logger.warn('MongoDB conversation delete failed; using memory state', { error: err });
        }
    }
    return deletedLocal;
}

module.exports = {
    createConversation,
    getConversation,
    listConversations,
    appendMessages,
    deleteConversation
};
