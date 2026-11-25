// backend/routes/chatRoutes.js - API Route Definitions
const express = require('express');
const router = express.Router();
const { handleChat, handleHealth } = require('../controllers/chatController');
const { createRateLimiter } = require('../middleware/security');

const parsedLimit = Number.parseInt(process.env.CHAT_RATE_LIMIT_MAX, 10);
const chatLimiter = createRateLimiter({
    windowMs: 60_000,
    max: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 60
});

// Chat Query Endpoint (rate-limited to protect Gemini API quota)
router.post('/chat', chatLimiter, handleChat);

// Health Check Endpoint
router.get('/health', handleHealth);

module.exports = router;
