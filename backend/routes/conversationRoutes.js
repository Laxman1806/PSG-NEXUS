// backend/routes/conversationRoutes.js - Session-Isolated Conversation Routes
const express = require('express');
const router = express.Router();
const { resolvePublicSession } = require('../middleware/authenticate');
const { validateConversationIdParam } = require('../middleware/validateRequest');
const {
    createConversation,
    listConversations,
    getConversationById,
    deleteConversationById
} = require('../controllers/conversationController');

router.use(resolvePublicSession);

router.post('/', createConversation);
router.get('/', listConversations);
router.get('/:id', validateConversationIdParam, getConversationById);
router.delete('/:id', validateConversationIdParam, deleteConversationById);

module.exports = router;
