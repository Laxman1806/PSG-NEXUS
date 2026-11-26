// backend/services/feedbackService.js - Feedback & Analytics Service
const feedbackRepo = require('../../db/repositories/feedbackRepository');

async function submitFeedback(ownerSessionId, payload) {
    return feedbackRepo.recordFeedback({
        ownerSessionId,
        ...payload
    });
}

async function getRecentFeedback(limit = 100) {
    return feedbackRepo.listFeedback(limit);
}

function logChatMetric(metric) {
    feedbackRepo.recordQueryMetric(metric);
}

function getAnalytics() {
    return feedbackRepo.getAnalyticsSnapshot();
}

module.exports = {
    submitFeedback,
    getRecentFeedback,
    logChatMetric,
    getAnalytics
};
