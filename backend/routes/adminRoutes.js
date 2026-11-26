// backend/routes/adminRoutes.js - Protected Admin Knowledge, Retrieval Inspector & Analytics Routes
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const { adminLimiter } = require('../middleware/rateLimiter');
const { authenticateAdmin } = require('../middleware/authenticate');
const { requireRole } = require('../middleware/authorize');
const { validateRetrievalTestRequest } = require('../middleware/validateRequest');
const { ValidationError } = require('../utils/errors');
const {
    handleUploadDocument,
    handleListDocuments,
    handleGetDocumentById,
    handleUpdateDocument,
    handleApproveDocument,
    handleTriggerIngestion,
    handleGetIngestionRun,
    handleRetrievalTest,
    handleAnalyticsOverview,
    handleAnalyticsQueries,
    handleAuditLogs
} = require('../controllers/documentController');

const ALLOWED_EXTS = new Set(['.pdf', '.docx', '.txt', '.html', '.htm']);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        if (!ALLOWED_EXTS.has(ext)) {
            return cb(new ValidationError(`Unsupported file extension '${ext}'. Allowed: PDF, DOCX, TXT, HTML.`));
        }
        return cb(null, true);
    }
});

router.use(adminLimiter, authenticateAdmin);

// Document Management
router.post('/documents', requireRole('admin'), upload.single('file'), handleUploadDocument);
router.get('/documents', requireRole('admin', 'reviewer'), handleListDocuments);
router.get('/documents/:id', requireRole('admin', 'reviewer'), handleGetDocumentById);
router.patch('/documents/:id', requireRole('admin'), handleUpdateDocument);
router.post('/documents/:id/approve', requireRole('admin'), handleApproveDocument);

// Ingestion Runs
router.post('/ingestion', requireRole('admin'), handleTriggerIngestion);
router.get('/ingestion/:id', requireRole('admin', 'reviewer'), handleGetIngestionRun);

// Retrieval & Analytics Diagnostics
router.post('/retrieval-test', requireRole('admin', 'reviewer'), validateRetrievalTestRequest, handleRetrievalTest);
router.get('/analytics/overview', requireRole('admin', 'reviewer'), handleAnalyticsOverview);
router.get('/analytics/queries', requireRole('admin', 'reviewer'), handleAnalyticsQueries);
router.get('/audit-logs', requireRole('admin', 'reviewer'), handleAuditLogs);

module.exports = router;
