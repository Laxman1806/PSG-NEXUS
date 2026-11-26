// db/ingestion/pipeline.js - Safe Incremental Checkpointed Multi-Format Knowledge Ingestion Pipeline
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { config } = require('../../backend/config/env');
const { EMBEDDING_CONFIG } = require('../../backend/config/modelConfig');
const { generateEmbeddingsBatch } = require('../../backend/services/embeddingService');
const { getDB } = require('../connection');
const logger = require('../../backend/utils/logger');
const {
    buildDocumentId,
    createDocumentRecord,
    createChunkRecord,
    sha256
} = require('../schemas/knowledgeSchemas');
const {
    isAssetWrapperHtml,
    extractHtmlDocument,
    extractPdfDocument,
    extractDocxDocument,
    extractTxtDocument
} = require('./extractors');
const {
    inferCategory,
    inferAcademicYear,
    inferIsHistorical,
    chunkExtractedDocument
} = require('./chunker');
const knowledgeRepo = require('../repositories/knowledgeRepository');

const ROOT_DIR = path.resolve(__dirname, '../..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const REPLICA_BASE = path.join(FRONTEND_DIR, 'psgtech_offline_replica');

const DOMAIN_PREFIX_MAP = {
    'www.psgtech.edu': '',
    'psgtech.edu': '',
    'sports.psgtech.ac.in': '/sports',
    'library.psgtech.ac.in': '/library',
    'thebridge.psgtech.ac.in': '/thebridge',
    'academicschedule.psgtech.ac.in': '/academicschedule',
    'iipc.psgtech.ac.in': '/iipc',
    'platinum.psgtech.ac.in': '/platinum',
    'alumni.psgtech.ac.in': '/alumni',
    'enquiry.psgtech.ac.in': '/enquiry'
};

function walkFiles(dir, extensions, results = []) {
    if (!fs.existsSync(dir)) return results;
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        let stat;
        try {
            stat = fs.statSync(full);
        } catch (_e) {
            continue;
        }
        if (stat.isDirectory()) {
            walkFiles(full, extensions, results);
        } else if (extensions.some((ext) => entry.toLowerCase().endsWith(ext))) {
            results.push(full);
        }
    }
    return results;
}

function discoverLocalSources({ includeReplica = true, includePdfs = true, includeDocs = true } = {}) {
    const sources = [];

    if (includeReplica && fs.existsSync(REPLICA_BASE)) {
        const domainFolders = fs.readdirSync(REPLICA_BASE).filter((name) => {
            const full = path.join(REPLICA_BASE, name);
            return fs.statSync(full).isDirectory();
        });

        for (const folder of domainFolders) {
            const domainPath = path.join(REPLICA_BASE, folder);
            const prefix = Object.prototype.hasOwnProperty.call(DOMAIN_PREFIX_MAP, folder)
                ? DOMAIN_PREFIX_MAP[folder]
                : `/${folder.split('.')[0]}`;

            const htmlFiles = walkFiles(domainPath, ['.html', '.htm']);
            for (const filePath of htmlFiles) {
                const rel = path.relative(domainPath, filePath).replace(/\\/g, '/');
                if (isAssetWrapperHtml(rel)) continue;
                sources.push({
                    filePath,
                    relativePath: rel,
                    urlPrefix: prefix,
                    sourceType: 'html',
                    authority: 'official_portal',
                    sizeBytes: fs.statSync(filePath).size
                });
            }
        }
    }

    const pdfEntries = [];
    if (includePdfs) {
        const pdfRoots = [
            path.join(FRONTEND_DIR, 'files'),
            path.join(FRONTEND_DIR, 'educms'),
            path.join(FRONTEND_DIR, 'NAAC')
        ];
        for (const dir of pdfRoots) {
            for (const filePath of walkFiles(dir, ['.pdf'])) {
                const relFromFrontend = '/' + path.relative(FRONTEND_DIR, filePath).replace(/\\/g, '/');
                pdfEntries.push({
                    filePath,
                    relativePath: relFromFrontend,
                    sourceUrl: relFromFrontend,
                    sourceType: 'pdf',
                    authority: 'official_pdf',
                    sizeBytes: fs.statSync(filePath).size
                });
            }
        }
        // Process smaller/concise PDFs before massive multi-hundred-page filings
        pdfEntries.sort((a, b) => a.sizeBytes - b.sizeBytes);
    }

    if (includeDocs) {
        const docRoots = [path.join(FRONTEND_DIR, 'files')];
        for (const dir of docRoots) {
            for (const filePath of walkFiles(dir, ['.docx', '.txt'])) {
                const relFromFrontend = '/' + path.relative(FRONTEND_DIR, filePath).replace(/\\/g, '/');
                const ext = path.extname(filePath).toLowerCase();
                sources.push({
                    filePath,
                    relativePath: relFromFrontend,
                    sourceUrl: relFromFrontend,
                    sourceType: ext === '.docx' ? 'docx' : 'txt',
                    authority: 'official_pdf',
                    sizeBytes: fs.statSync(filePath).size
                });
            }
        }
    }

    // HTML & lightweight docs first, PDFs ordered smallest-to-largest afterwards
    return [...sources, ...pdfEntries];
}

async function extractSourceItem(item) {
    if (item.sourceType === 'html') {
        const html = fs.readFileSync(item.filePath, 'utf8');
        return extractHtmlDocument(html, {
            relativePath: item.relativePath,
            urlPrefix: item.urlPrefix,
            sourceUrl: item.sourceUrl
        });
    }
    if (item.sourceType === 'pdf') {
        return extractPdfDocument(item.filePath, {
            title: item.title || path.basename(item.filePath, '.pdf'),
            sourceUrl: item.sourceUrl || item.relativePath
        });
    }
    if (item.sourceType === 'docx') {
        return extractDocxDocument(item.filePath, {
            title: item.title || path.basename(item.filePath, '.docx'),
            sourceUrl: item.sourceUrl || item.relativePath
        });
    }
    if (item.sourceType === 'txt') {
        return extractTxtDocument(fs.readFileSync(item.filePath), {
            title: item.title || path.basename(item.filePath, '.txt'),
            sourceUrl: item.sourceUrl || item.relativePath
        });
    }
    return { skipped: true, reason: `unsupported-type:${item.sourceType}` };
}

// Build reusable embedding cache from existing DB/JSON chunks so identical content isn't re-embedded via API
async function buildExistingEmbeddingMap() {
    const map = new Map();
    const expectedDim = EMBEDDING_CONFIG.dimensions;

    const addIfValid = (content, vec) => {
        if (typeof content === 'string' && Array.isArray(vec) && vec.length === expectedDim) {
            map.set(sha256(content.trim()), vec);
        }
    };

    const jsonPath = path.resolve(__dirname, '../data/knowledge_chunks.json');
    if (fs.existsSync(jsonPath)) {
        try {
            const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            if (Array.isArray(parsed)) {
                for (const c of parsed) addIfValid(c.content, c.embedding);
            }
        } catch (_e) {
            // ignore
        }
    }

    const db = getDB();
    if (db) {
        try {
            const existingManaged = await db
                .collection(config.mongo.chunksCollection)
                .find({ status: 'active' }, { projection: { content: 1, embedding: 1 } })
                .toArray();
            for (const c of existingManaged) addIfValid(c.content, c.embedding);
        } catch (_e) {
            // ignore
        }
    }

    return map;
}

async function runIncrementalIngestion(options = {}) {
    const runId = `run-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const dryRun = Boolean(options.dryRun);
    const incremental = options.incremental !== false;
    const embed = options.embed !== false && Boolean(config.gemini.apiKey);
    const includePdfs = options.includePdfs !== false;
    const maxPdfPages = Number.isInteger(options.maxPdfPages) && options.maxPdfPages > 0 ? options.maxPdfPages : null;
    const maxSources = Number.isInteger(options.limit) && options.limit > 0 ? options.limit : null;

    const startedAt = new Date();
    const discovered = discoverLocalSources({
        includeReplica: options.includeReplica !== false,
        includePdfs,
        includeDocs: options.includeDocs !== false
    });

    const targetSources = maxSources ? discovered.slice(0, maxSources) : discovered;
    const existingDocs = await knowledgeRepo.listDocuments({}, 5000);
    const existingById = new Map(existingDocs.map((d) => [d.documentId, d]));

    const report = {
        runId,
        dryRun,
        incremental,
        embed,
        startedAt: startedAt.toISOString(),
        discoveredCount: discovered.length,
        evaluatedCount: targetSources.length,
        unchangedCount: 0,
        changedOrNewCount: 0,
        skippedCount: 0,
        reusedEmbeddingsCount: 0,
        newlyEmbeddedCount: 0,
        failedDocuments: [],
        deletedDocumentIds: [],
        stagedChunkCount: 0,
        activatedChunkCount: 0,
        warnings: []
    };

    const seenDocumentIds = new Set();
    const pendingUnits = []; // [{ docRecord, chunks }]

    for (const item of targetSources) {
        try {
            const extracted = await extractSourceItem(item);
            if (!extracted || extracted.skipped) {
                report.skippedCount++;
                if (extracted?.isScanned || extracted?.reason === 'scanned-pdf-no-text') {
                    report.failedDocuments.push({
                        source: item.relativePath,
                        reason: extracted.reason,
                        warnings: extracted.warnings || []
                    });
                }
                continue;
            }

            if (maxPdfPages && extracted.sourceType === 'pdf' && extracted.numPages > maxPdfPages) {
                report.skippedCount++;
                report.warnings.push({
                    source: extracted.sourceUrl,
                    warnings: [`Skipped large PDF (${extracted.numPages} pages > --max-pdf-pages=${maxPdfPages}).`]
                });
                continue;
            }

            if (Array.isArray(extracted.warnings) && extracted.warnings.length > 0) {
                report.warnings.push({ source: extracted.sourceUrl, warnings: extracted.warnings });
            }

            const documentId = buildDocumentId(extracted.sourceUrl, extracted.sourceType);
            seenDocumentIds.add(documentId);

            const contentHash = sha256(extracted.rawText);
            const existing = existingById.get(documentId);
            if (incremental && existing && existing.contentHash === contentHash && existing.status === 'active') {
                report.unchangedCount++;
                continue;
            }

            const nextVersion = existing ? (existing.documentVersion || 1) + 1 : 1;
            const category = inferCategory(extracted.title, extracted.sourceUrl, extracted.rawText);
            const academicYear = inferAcademicYear(extracted.title, extracted.sourceUrl);
            const isHistorical = inferIsHistorical(academicYear, extracted.title, extracted.sourceUrl);

            const docRecord = createDocumentRecord({
                documentId,
                title: extracted.title,
                sourceUrl: extracted.sourceUrl,
                sourceType: extracted.sourceType,
                category,
                department: extracted.department || null,
                academicYear,
                publishedAt: extracted.publishedAt || null,
                language: 'en',
                authority: item.authority || 'official_portal',
                documentVersion: nextVersion,
                contentHash,
                isHistorical,
                status: dryRun ? 'pending' : 'active',
                extractionWarnings: extracted.warnings || [],
                ingestionRunId: runId
            });

            const rawChunks = chunkExtractedDocument(extracted);
            docRecord.chunkCount = rawChunks.length;
            report.changedOrNewCount++;

            const chunkRecords = rawChunks.map((rc, idx) =>
                createChunkRecord({
                    documentId,
                    title: extracted.title,
                    content: rc.content,
                    sourceUrl: extracted.sourceUrl,
                    sourceType: extracted.sourceType,
                    category,
                    department: rc.department || extracted.department || null,
                    academicYear,
                    publishedAt: extracted.publishedAt || null,
                    language: 'en',
                    authority: item.authority || 'official_portal',
                    documentVersion: nextVersion,
                    chunkIndex: idx,
                    pageNumber: rc.pageNumber,
                    sectionHeading: rc.sectionHeading,
                    embeddingModel: embed ? EMBEDDING_CONFIG.model : null,
                    embeddingDimensions: embed ? EMBEDDING_CONFIG.dimensions : null,
                    embedding: null,
                    isHistorical,
                    status: 'staging',
                    ingestionRunId: runId
                })
            );

            pendingUnits.push({ docRecord, chunks: chunkRecords });
            report.stagedChunkCount += chunkRecords.length;
        } catch (err) {
            report.failedDocuments.push({
                source: item.relativePath || item.filePath,
                reason: err.message
            });
        }
    }

    if (!maxSources && !maxPdfPages && includePdfs) {
        for (const existing of existingDocs) {
            if (existing.status === 'active' && !seenDocumentIds.has(existing.documentId)) {
                report.deletedDocumentIds.push(existing.documentId);
                if (!dryRun) {
                    await knowledgeRepo.updateDocumentStatus(existing.documentId, { status: 'archived' });
                }
            }
        }
    }

    if (dryRun) {
        report.status = 'dry_run_completed';
        report.completedAt = new Date().toISOString();
        return report;
    }

    if (pendingUnits.length === 0) {
        report.status = 'no_changes';
        report.completedAt = new Date().toISOString();
        await knowledgeRepo.recordIngestionRun(report);
        return report;
    }

    const existingEmbedMap = await buildExistingEmbeddingMap();
    await knowledgeRepo.recordIngestionRun({ ...report, status: 'staging' });

    // Commit in checkpointed batches (~36 chunks per checkpoint) so progress is never lost
    const CHECKPOINT_TARGET_CHUNKS = 36;
    let groupUnits = [];
    let groupChunkTotal = 0;

    async function flushGroup(units) {
        if (units.length === 0) return;
        const allChunks = units.flatMap((u) => u.chunks);
        const chunksNeedingEmbed = [];

        for (const c of allChunks) {
            const cachedVec = existingEmbedMap.get(sha256(c.content.trim()));
            if (cachedVec) {
                c.embedding = cachedVec;
                if (!c.embeddingModel) c.embeddingModel = EMBEDDING_CONFIG.model;
                if (!c.embeddingDimensions) c.embeddingDimensions = EMBEDDING_CONFIG.dimensions;
                report.reusedEmbeddingsCount++;
            } else if (embed) {
                chunksNeedingEmbed.push(c);
            }
        }

        if (embed && chunksNeedingEmbed.length > 0) {
            const embedResults = await generateEmbeddingsBatch(
                chunksNeedingEmbed.map((c) => c.content),
                { batchSize: 18, maxTokensPerMin: 24000 }
            );
            for (let i = 0; i < chunksNeedingEmbed.length; i++) {
                if (embedResults[i].ok) {
                    chunksNeedingEmbed[i].embedding = embedResults[i].vector;
                    report.newlyEmbeddedCount++;
                } else {
                    report.failedDocuments.push({
                        source: chunksNeedingEmbed[i].sourceUrl,
                        reason: `embedding-failed-chunk-${chunksNeedingEmbed[i].chunkIndex}: ${embedResults[i].error}`
                    });
                }
            }
        }

        // Keep only documents whose chunks all succeeded (or didn't require embedding)
        for (const u of units) {
            const validChunks = embed ? u.chunks.filter((c) => Array.isArray(c.embedding)) : u.chunks;
            if (validChunks.length === 0) continue;

            const subRunId = `${runId}-${u.docRecord.documentId.slice(0, 8)}`;
            validChunks.forEach((c) => { c.ingestionRunId = subRunId; });
            u.docRecord.ingestionRunId = subRunId;
            u.docRecord.chunkCount = validChunks.length;

            await knowledgeRepo.stageChunks(subRunId, validChunks);
            await knowledgeRepo.upsertDocumentRecord(u.docRecord);
            const promo = await knowledgeRepo.promoteStagedRun(subRunId, {
                documentIds: [u.docRecord.documentId]
            });
            report.activatedChunkCount += promo.promotedCount;
        }
    }

    for (const unit of pendingUnits) {
        groupUnits.push(unit);
        groupChunkTotal += unit.chunks.length;
        if (groupChunkTotal >= CHECKPOINT_TARGET_CHUNKS) {
            await flushGroup(groupUnits);
            groupUnits = [];
            groupChunkTotal = 0;
        }
    }
    if (groupUnits.length > 0) {
        await flushGroup(groupUnits);
    }

    report.status = report.activatedChunkCount > 0 ? 'active' : 'failed_no_valid_chunks';
    report.completedAt = new Date().toISOString();
    await knowledgeRepo.recordIngestionRun(report);

    logger.info('Incremental ingestion run completed', {
        runId,
        activatedChunks: report.activatedChunkCount,
        reusedEmbeddings: report.reusedEmbeddingsCount,
        newlyEmbedded: report.newlyEmbeddedCount
    });

    return report;
}

async function ingestUploadedDocument({ buffer, originalName, mimeType = '', metadata = {}, embed = true, autoApprove = false }) {
    const ext = path.extname(originalName || '').toLowerCase();
    const sourceUrl = metadata.sourceUrl || `/uploads/${originalName}`;
    let extracted;

    if (ext === '.pdf' || mimeType.includes('pdf')) {
        extracted = await extractPdfDocument(buffer, { title: metadata.title || originalName, sourceUrl });
    } else if (ext === '.docx' || mimeType.includes('wordprocessingml')) {
        extracted = await extractDocxDocument(buffer, { title: metadata.title || originalName, sourceUrl });
    } else if (ext === '.html' || ext === '.htm' || mimeType.includes('html')) {
        extracted = extractHtmlDocument(buffer.toString('utf8'), { sourceUrl });
    } else {
        extracted = extractTxtDocument(buffer, { title: metadata.title || originalName, sourceUrl });
    }

    if (!extracted || extracted.skipped) {
        return { ok: false, reason: extracted?.reason || 'extraction-failed', warnings: extracted?.warnings || [] };
    }

    const runId = `upload-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const documentId = buildDocumentId(extracted.sourceUrl, extracted.sourceType);
    const existing = await knowledgeRepo.getDocumentById(documentId);
    const nextVersion = existing ? (existing.documentVersion || 1) + 1 : 1;
    const category = metadata.category || inferCategory(extracted.title, extracted.sourceUrl, extracted.rawText);
    const academicYear = metadata.academicYear || inferAcademicYear(extracted.title, extracted.sourceUrl);
    const status = autoApprove ? 'active' : 'pending';

    const docRecord = createDocumentRecord({
        documentId,
        title: metadata.title || extracted.title,
        sourceUrl: extracted.sourceUrl,
        sourceType: metadata.sourceType || extracted.sourceType,
        category,
        department: metadata.department || extracted.department || null,
        academicYear,
        publishedAt: metadata.publishedAt || extracted.publishedAt || null,
        effectiveFrom: metadata.effectiveFrom || null,
        effectiveTo: metadata.effectiveTo || null,
        language: metadata.language || 'en',
        authority: metadata.authority || 'admin_upload',
        documentVersion: nextVersion,
        contentHash: sha256(extracted.rawText),
        isHistorical: Boolean(metadata.isHistorical),
        status,
        extractionWarnings: extracted.warnings || [],
        ingestionRunId: runId
    });

    const rawChunks = chunkExtractedDocument(extracted);
    docRecord.chunkCount = rawChunks.length;

    const chunkRecords = rawChunks.map((rc, idx) =>
        createChunkRecord({
            documentId,
            title: docRecord.title,
            content: rc.content,
            sourceUrl: docRecord.sourceUrl,
            sourceType: docRecord.sourceType,
            category: docRecord.category,
            department: docRecord.department,
            academicYear: docRecord.academicYear,
            publishedAt: docRecord.publishedAt,
            effectiveFrom: docRecord.effectiveFrom,
            effectiveTo: docRecord.effectiveTo,
            language: docRecord.language,
            authority: docRecord.authority,
            documentVersion: nextVersion,
            chunkIndex: idx,
            pageNumber: rc.pageNumber,
            sectionHeading: rc.sectionHeading,
            embeddingModel: embed && config.gemini.apiKey ? EMBEDDING_CONFIG.model : null,
            embeddingDimensions: embed && config.gemini.apiKey ? EMBEDDING_CONFIG.dimensions : null,
            isHistorical: docRecord.isHistorical,
            status: 'staging',
            ingestionRunId: runId
        })
    );

    if (embed && config.gemini.apiKey && chunkRecords.length > 0) {
        const res = await generateEmbeddingsBatch(chunkRecords.map((c) => c.content));
        for (let i = 0; i < chunkRecords.length; i++) {
            if (res[i].ok) chunkRecords[i].embedding = res[i].vector;
        }
    }

    await knowledgeRepo.upsertDocumentRecord(docRecord);
    await knowledgeRepo.stageChunks(runId, chunkRecords);
    if (autoApprove) {
        await knowledgeRepo.promoteStagedRun(runId, { documentIds: [documentId] });
    }

    return {
        ok: true,
        runId,
        document: docRecord,
        chunkCount: chunkRecords.length,
        preview: extracted.rawText.slice(0, 600),
        warnings: extracted.warnings || []
    };
}

module.exports = {
    discoverLocalSources,
    extractSourceItem,
    buildExistingEmbeddingMap,
    runIncrementalIngestion,
    ingestUploadedDocument
};
