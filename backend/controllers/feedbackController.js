// backend/controllers/feedbackController.js & Feedback Route Handler
const { submitFeedback } = require('../services/feedbackService');

async function handleCreateFeedback(req, res, next) {
    try {
        const record = await submitFeedback(req.sessionId, req.validatedFeedback);
        return res.status(201).json({
            feedbackId: record.feedbackId,
            status: 'recorded'
        });
    } catch (err) {
        return next(err);
    }
}

module.exports = { handleCreateFeedback };
