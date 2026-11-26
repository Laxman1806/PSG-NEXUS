// backend/services/conversationService.js - Isolated Server-Side Conversation Lifecycle Service
const conversationRepo = require('../../db/repositories/conversationRepository');

async function getOrCreateConversation(ownerSessionId, conversationId = null) {
    if (conversationId) {
        const existing = await conversationRepo.getConversation(conversationId, ownerSessionId);
        if (existing) return existing;
    }
    return conversationRepo.createConversation(ownerSessionId, 'New Conversation');
}

async function createNewConversation(ownerSessionId, title = 'New Conversation') {
    return conversationRepo.createConversation(ownerSessionId, title);
}

async function getOwnedConversation(conversationId, ownerSessionId) {
    return conversationRepo.getConversation(conversationId, ownerSessionId);
}

async function listUserConversations(ownerSessionId) {
    return conversationRepo.listConversations(ownerSessionId);
}

async function recordTurn(conversationId, ownerSessionId, userText, assistantText, metadata = {}) {
    const now = new Date();
    const turns = [
        { role: 'user', content: userText, timestamp: now },
        {
            role: 'assistant',
            content: assistantText,
            status: metadata.status || 'VERIFIED',
            citations: metadata.citations || [],
            timestamp: now
        }
    ];
    return conversationRepo.appendMessages(conversationId, ownerSessionId, turns);
}

async function deleteOwnedConversation(conversationId, ownerSessionId) {
    return conversationRepo.deleteConversation(conversationId, ownerSessionId);
}

module.exports = {
    getOrCreateConversation,
    createNewConversation,
    getOwnedConversation,
    listUserConversations,
    recordTurn,
    deleteOwnedConversation
};
