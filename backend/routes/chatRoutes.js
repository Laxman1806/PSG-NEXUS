// backend/routes/chatRoutes.js - API Route Definitions
const express = require('express');
const router = express.Router();
const { handleChat, handleHealth } = require('../controllers/chatController');

// Chat Query Endpoint
router.post('/chat', handleChat);

// Health Check Endpoint
router.get('/health', handleHealth);

module.exports = router;
