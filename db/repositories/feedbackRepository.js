// db/repositories/feedbackRepository.js - User Feedback & Query Telemetry Persistence with Fallback
const crypto = require('crypto');
const { config } = require('../../backend/config/env');
const { getDB } = require('../connection');
const logger = require('../../backend/utils/logger');

const memoryFeedback = [];
const memoryQueryMetrics = [];

async function recordFeedback(entry) {
    const record = {
        feedbackId: `fb-${crypto.randomUUID()}`,
        conversationId: entry.conversationId || null,
        messageId: entry.messageId || null,
        ownerSessionId: entry.ownerSessionId || null,
        rating: entry.rating, // 'up' | 'down'
        comment: entry.comment || '',
        query: entry.query || '',
        createdAt: new Date()
    };

    memoryFeedback.push(record);

    const db = getDB();
    if (db) {
        try {
            await db.collection(config.mongo.feedbackCollection).insertOne({ ...record });
        } catch (err) {
            logger.warn('MongoDB feedback insert failed; stored in memory fallback', { error: err });
        }
    }
    return record;
}

async function listFeedback(limit = 100) {
    const db = getDB();
    if (db) {
        try {
            return await db.collection(config.mongo.feedbackCollection)
                .find({}, { projection: { _id: 0, ownerSessionId: 0 } })
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray();
        } catch (err) {
            logger.warn('MongoDB feedback list failed; using memory fallback', { error: err });
        }
    }
    return [...memoryFeedback].reverse().slice(0, limit);
}

function recordQueryMetric(metric) {
    memoryQueryMetrics.push({
        timestamp: new Date().toISOString(),
        ...metric
    });
    if (memoryQueryMetrics.length > 1000) {
        memoryQueryMetrics.shift();
    }
}

function getAnalyticsSnapshot() {
    const total = memoryQueryMetrics.length;
    const unanswered = memoryQueryMetrics.filter((m) => m.status === 'INSUFFICIENT' || m.status === 'LIVE_DATA_REQUIRED').length;
    const avgLatencyMs = total > 0
        ? Math.round(memoryQueryMetrics.reduce((acc, m) => acc + (m.latencyMs || 0), 0) / total)
        : 0;
    const countsByIntent = {};
    const questionFreq = {};

    for (const m of memoryQueryMetrics) {
        countsByIntent[m.intent || 'UNKNOWN'] = (countsByIntent[m.intent || 'UNKNOWN'] || 0) + 1;
        if (m.query) {
            const k = m.query.toLowerCase().slice(0, 80);
            questionFreq[k] = (questionFreq[k] || 0) + 1;
        }
    }

    const popularQuestions = Object.entries(questionFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }));

    return {
        totalQueries: total,
        unansweredQueries: unanswered,
        avgLatencyMs,
        countsByIntent,
        popularQuestions,
        recentQueries: memoryQueryMetrics.slice(-25).reverse()
    };
}

module.exports = {
    recordFeedback,
    listFeedback,
    recordQueryMetric,
    getAnalyticsSnapshot
};
