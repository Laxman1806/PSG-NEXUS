// backend/controllers/documentController.js - Admin Knowledge Management, Retrieval Inspector & Analytics
const path = require('path');
const { config } = require('../config/env');
const { getDB } = require('../../db/connection');
const knowledgeRepo = require('../../db/repositories/knowledgeRepository');
const { ingestUploadedDocument, runIncrementalIngestion } = require('../../db/ingestion/pipeline');
const { fetchApprovedUrl } = require('../../db/ingestion/extractors');
const { detectLanguage, expandMultilingualQuery } = require('../services/languageService');
const { classifyIntent } = require('../services/intentService');
const { retrieveEvidence } = require('../services/retrievalService');
const { assessEvidence } = require('../services/answerValidationService');
const { generateGroundedAnswer } = require('../services/geminiService');
const { invalidateQueryCache } = require('../services/chatOrchestrator');
const { getAnalytics, getRecentFeedback } = require('../services/feedbackService');
const { ValidationError, NotFoundError } = require('../utils/errors');

async function handleUploadDocument(req, res, next) {
    try {
        const meta = {
            title: typeof req.body?.title === 'string' ? req.body.title.trim() : undefined,
            category: typeof req.body?.category === 'string' ? req.body.category.trim() : undefined,
            department: typeof req.body?.department === 'string' ? req.body.department.trim() : undefined,
            academicYear: typeof req.body?.academicYear === 'string' ? req.body.academicYear.trim() : undefined,
            authority: typeof req.body?.authority === 'string' ? req.body.authority.trim() : 'admin_upload',
            language: typeof req.body?.language === 'string' ? req.body.language.trim() : 'en',
            isHistorical: req.body?.isHistorical === true || req.body?.isHistorical === 'true'
        };

        const autoApprove = req.body?.autoApprove === true || req.body?.autoApprove === 'true';
        const skipEmbed = req.body?.skipEmbed === true || req.body?.skipEmbed === 'true';

        let result;
        if (req.file) {
            result = await ingestUploadedDocument({
                buffer: req.file.buffer,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                metadata: meta,
                embed: !skipEmbed,
                autoApprove
            });
        } else if (typeof req.body?.url === 'string' && req.body.url.trim()) {
            const fetched = await fetchApprovedUrl(req.body.url.trim(), { title: meta.title });
            if (!fetched || fetched.skipped) {
                return next(new ValidationError(`Unable to extract content from URL: ${fetched?.reason || 'unknown'}`));
            }
            result = await ingestUploadedDocument({
                buffer: Buffer.from(fetched.rawText, 'utf8'),
                originalName: `${path.basename(fetched.sourceUrl || 'url') || 'page'}.txt`,
                mimeType: 'text/plain',
                metadata: { ...meta, title: meta.title || fetched.title, sourceUrl: fetched.sourceUrl, sourceType: 'url' },
                embed: !skipEmbed,
                autoApprove
            });
        } else {
            return next(new ValidationError('Provide either a multipart file upload or an approved "url".'));
        }

        if (!result.ok) {
            return next(new ValidationError(`Document ingestion failed: ${result.reason}`, { warnings: result.warnings }));
        }

        await knowledgeRepo.createAuditLog({
            actorId: req.actor.id,
            role: req.actor.role,
            action: 'DOCUMENT_UPLOADED',
            documentId: result.document.documentId,
            status: result.document.status
        });

        if (autoApprove) invalidateQueryCache();

        return res.status(201).json({
            document: result.document,
            chunkCount: result.chunkCount,
            preview: result.preview,
            warnings: result.warnings
        });
    } catch (err) {
        return next(err);
    }
}

async function handleListDocuments(req, res, next) {
    try {
        const filter = {};
        if (req.query.status) filter.status = String(req.query.status);
        if (req.query.category) filter.category = String(req.query.category);
        const limit = Math.min(Number.parseInt(req.query.limit, 10) || 100, 500);
        const documents = await knowledgeRepo.listDocuments(filter, limit);
        return res.json({ count: documents.length, documents });
    } catch (err) {
        return next(err);
    }
}

async function handleGetDocumentById(req, res, next) {
    try {
        const doc = await knowledgeRepo.getDocumentById(req.params.id);
        if (!doc) return next(new NotFoundError(`Document ${req.params.id} not found.`));
        return res.json({ document: doc });
    } catch (err) {
        return next(err);
    }
}

async function handleUpdateDocument(req, res, next) {
    try {
        const existing = await knowledgeRepo.getDocumentById(req.params.id);
        if (!existing) return next(new NotFoundError(`Document ${req.params.id} not found.`));

        const allowedFields = ['title', 'category', 'department', 'academicYear', 'effectiveFrom', 'effectiveTo', 'isHistorical', 'status'];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        }
        if (Object.keys(updates).length === 0) {
            return next(new ValidationError('No valid document update fields provided.'));
        }

        const updated = await knowledgeRepo.updateDocumentStatus(req.params.id, updates);
        await knowledgeRepo.createAuditLog({
            actorId: req.actor.id,
            role: req.actor.role,
            action: 'DOCUMENT_UPDATED',
            documentId: req.params.id,
            updates
        });
        invalidateQueryCache();

        return res.json({ document: updated });
    } catch (err) {
        return next(err);
    }
}

async function handleApproveDocument(req, res, next) {
    try {
        const doc = await knowledgeRepo.getDocumentById(req.params.id);
        if (!doc) return next(new NotFoundError(`Document ${req.params.id} not found.`));

        if (doc.ingestionRunId && doc.status !== 'active') {
            await knowledgeRepo.promoteStagedRun(doc.ingestionRunId, { documentIds: [doc.documentId] }).catch(() => null);
        }

        const updated = await knowledgeRepo.updateDocumentStatus(doc.documentId, {
            status: 'active',
            lastVerifiedAt: new Date()
        });

        await knowledgeRepo.createAuditLog({
            actorId: req.actor.id,
            role: req.actor.role,
            action: 'DOCUMENT_APPROVED',
            documentId: doc.documentId
        });

        invalidateQueryCache();
        return res.json({ document: updated, status: 'active' });
    } catch (err) {
        return next(err);
    }
}

async function handleTriggerIngestion(req, res, next) {
    try {
        const dryRun = Boolean(req.body?.dryRun);
        const embed = req.body?.embed !== false;
        const includePdfs = req.body?.includePdfs !== false;
        const limit = Number.isInteger(req.body?.limit) && req.body.limit > 0 ? req.body.limit : null;

        const report = await runIncrementalIngestion({
            dryRun,
            embed,
            includePdfs,
            incremental: req.body?.incremental !== false,
            limit
        });

        await knowledgeRepo.createAuditLog({
            actorId: req.actor.id,
            role: req.actor.role,
            action: dryRun ? 'INGESTION_DRY_RUN' : 'INGESTION_EXECUTED',
            runId: report.runId,
            activatedChunkCount: report.activatedChunkCount
        });

        if (!dryRun && report.activatedChunkCount > 0) {
            invalidateQueryCache();
        }

        return res.status(202).json({ report });
    } catch (err) {
        return next(err);
    }
}

async function handleGetIngestionRun(req, res, next) {
    try {
        const db = getDB();
        let run = null;
        if (db) {
            run = await db.collection(config.mongo.ingestionRunsCollection).findOne({ runId: req.params.id });
        } else {
            const snap = knowledgeRepo.loadSnapshot();
            run = (snap.runs || []).find((r) => r.runId === req.params.id) || null;
        }
        if (!run) return next(new NotFoundError(`Ingestion run ${req.params.id} not found.`));
        return res.json({ run });
    } catch (err) {
        return next(err);
    }
}

async function handleRetrievalTest(req, res, next) {
    try {
        const { query, filters } = req.validatedRetrievalTest;
        const { language, expandedQuery } = expandMultilingualQuery(query);
        const intent = classifyIntent(query, expandedQuery);
        const searchQuery = language === 'en' ? query : `${query} ${expandedQuery}`;

        const { evidence, diagnostics } = await retrieveEvidence(searchQuery, {
            filters,
            skipEmbedding: Boolean(req.body?.skipEmbedding)
        });
        const assessment = assessEvidence(query, evidence);

        let generated = null;
        if (req.body?.includeGeneration) {
            generated = await generateGroundedAnswer({
                question: query,
                evidence,
                language,
                assessment
            });
        }

        return res.json({
            query,
            language: detectLanguage(query),
            intent,
            expandedSearchQuery: searchQuery,
            diagnostics,
            assessment,
            evidence: evidence.map((e) => ({
                chunkId: e.chunkId,
                title: e.title,
                sourceUrl: e.sourceUrl || e.url,
                sourceType: e.sourceType,
                category: e.category,
                academicYear: e.academicYear,
                isHistorical: e.isHistorical,
                vectorScore: e.vectorScore,
                lexicalScore: e.lexicalScore,
                rerankScore: e.rerankScore,
                coverageScore: e.coverageScore,
                preview: String(e.content || '').slice(0, 300)
            })),
            generated
        });
    } catch (err) {
        return next(err);
    }
}

async function handleAnalyticsOverview(_req, res, next) {
    try {
        const analytics = getAnalytics();
        const docs = await knowledgeRepo.listDocuments({}, 5000);
        const feedback = await getRecentFeedback(50);

        return res.json({
            queries: {
                total: analytics.totalQueries,
                unanswered: analytics.unansweredQueries,
                avgLatencyMs: analytics.avgLatencyMs,
                countsByIntent: analytics.countsByIntent
            },
            knowledgeBase: {
                managedDocuments: docs.length,
                activeDocuments: docs.filter((d) => d.status === 'active').length,
                pendingDocuments: docs.filter((d) => d.status === 'pending').length
            },
            feedbackSummary: {
                total: feedback.length,
                positive: feedback.filter((f) => f.rating === 'up').length,
                negative: feedback.filter((f) => f.rating === 'down').length
            }
        });
    } catch (err) {
        return next(err);
    }
}

async function handleAnalyticsQueries(_req, res, next) {
    try {
        const analytics = getAnalytics();
        const feedback = await getRecentFeedback(50);
        return res.json({
            popularQuestions: analytics.popularQuestions,
            recentQueries: analytics.recentQueries,
            recentFeedback: feedback
        });
    } catch (err) {
        return next(err);
    }
}

async function handleAuditLogs(_req, res, next) {
    try {
        const db = getDB();
        let logs = [];
        if (db) {
            logs = await db.collection(config.mongo.auditLogsCollection)
                .find({}, { projection: { _id: 0 } })
                .sort({ timestamp: -1 })
                .limit(100)
                .toArray();
        } else {
            const snap = knowledgeRepo.loadSnapshot();
            logs = [...(snap.auditLogs || [])].reverse().slice(0, 100);
        }
        return res.json({ logs });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
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
};
