// backend/controllers/conversationController.js - HTTP Handlers for Conversation CRUD
const conversationService = require('../services/conversationService');
const { NotFoundError } = require('../utils/errors');

async function createConversation(req, res, next) {
    try {
        const title = typeof req.body?.title === 'string' && req.body.title.trim()
            ? req.body.title.trim().slice(0, 80)
            : 'New Conversation';
        const created = await conversationService.createNewConversation(req.sessionId, title);
        return res.status(201).json({
            conversationId: created.conversationId,
            title: created.title,
            createdAt: created.createdAt
        });
    } catch (err) {
        return next(err);
    }
}

async function listConversations(req, res, next) {
    try {
        const list = await conversationService.listUserConversations(req.sessionId);
        return res.json({ conversations: list });
    } catch (err) {
        return next(err);
    }
}

async function getConversationById(req, res, next) {
    try {
        const conv = await conversationService.getOwnedConversation(req.params.id, req.sessionId);
        if (!conv) {
            return next(new NotFoundError('Conversation not found for this session.'));
        }
        return res.json({
            conversationId: conv.conversationId,
            title: conv.title,
            summary: conv.summary,
            messages: conv.messages,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt
        });
    } catch (err) {
        return next(err);
    }
}

async function deleteConversationById(req, res, next) {
    try {
        const deleted = await conversationService.deleteOwnedConversation(req.params.id, req.sessionId);
        if (!deleted) {
            return next(new NotFoundError('Conversation not found for this session.'));
        }
        return res.json({ deleted: true, conversationId: req.params.id });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createConversation,
    listConversations,
    getConversationById,
    deleteConversationById
};
