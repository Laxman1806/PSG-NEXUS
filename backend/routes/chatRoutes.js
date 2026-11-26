// backend/routes/chatRoutes.js - API Route Definitions
const express = require('express');
const router = express.Router();
const { handleChat, handleHealth, handleReady } = require('../controllers/chatController');
const { createRateLimiter } = require('../middleware/security');

const parsedLimit = Number.parseInt(process.env.CHAT_RATE_LIMIT_MAX, 10);
const chatLimiter = createRateLimiter({
    windowMs: 60_000,
    max: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 60
});

// Chat Query Endpoint (rate-limited to protect Gemini API quota)
router.post('/chat', chatLimiter, handleChat);

// Health Check Endpoint (lightweight ping — always 200 when server is up)
router.get('/health', handleHealth);

// Readiness Check Endpoint (reports actual DB and API service statuses)
router.get('/ready', handleReady);

module.exports = router;
