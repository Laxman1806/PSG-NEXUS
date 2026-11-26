// backend/routes/chatRoutes.js - Public Chat, Liveness & Readiness Routes
const express = require('express');
const router = express.Router();
const { handleChat, handleHealth, handleReady } = require('../controllers/chatController');
const { chatLimiter } = require('../middleware/rateLimiter');
const { resolvePublicSession } = require('../middleware/authenticate');
const { validateChatRequest } = require('../middleware/validateRequest');

// Public Chat Query Endpoint
router.post('/chat', chatLimiter, resolvePublicSession, validateChatRequest, handleChat);

// Liveness & Readiness Checks
router.get('/health', handleHealth);
router.get('/ready', handleReady);

module.exports = router;
