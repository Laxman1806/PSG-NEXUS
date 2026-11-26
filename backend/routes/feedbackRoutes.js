// backend/routes/feedbackRoutes.js - Public Feedback Submission Route
const express = require('express');
const router = express.Router();
const { resolvePublicSession } = require('../middleware/authenticate');
const { validateFeedbackRequest } = require('../middleware/validateRequest');
const { handleCreateFeedback } = require('../controllers/feedbackController');

router.post('/', resolvePublicSession, validateFeedbackRequest, handleCreateFeedback);

module.exports = router;
