// tests/unit/stage3-ingestion.test.js
const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tempSnapshot = path.join(os.tmpdir(), `psg-nexus-stage3-snap-${process.pid}.json`);
process.env.KNOWLEDGE_SNAPSHOT_PATH = tempSnapshot;

const {
    extractHtmlDocument,
    extractPdfDocument,
    extractTxtDocument,
    isAssetWrapperHtml
} = require('../../db/ingestion/extractors');
const {
    chunkExtractedDocument,
    inferCategory,
    inferAcademicYear,
    inferIsHistorical
} = require('../../db/ingestion/chunker');
const { runIncrementalIngestion } = require('../../db/ingestion/pipeline');
const { parseRetryDelayMs, estimateTokens } = require('../../backend/services/embeddingService');
const knowledgeRepo = require('../../db/repositories/knowledgeRepository');

describe('Stage 3: Multi-Format Extraction, Chunking & Safe Versioned Ingestion', () => {
    const testRunIds = [];

    after(() => {
        if (fs.existsSync(tempSnapshot)) {
            fs.unlinkSync(tempSnapshot);
        }
    });

    it('strips .tg-ticker, header, footer, and preserves #tg-main content from replica HTML', () => {
        const htmlPath = path.resolve(
            __dirname,
            '../../frontend/psgtech_offline_replica/www.psgtech.edu/principal.php/index.html'
        );
        const html = fs.readFileSync(htmlPath, 'utf8');
        const extracted = extractHtmlDocument(html, { relativePath: 'principal.php/index.html' });

        assert.equal(extracted.skipped, false);
        assert.equal(extracted.sourceUrl, '/principal.php');
        assert.ok(!extracted.rawText.includes('Registration for Redo Courses'));
        assert.ok(extracted.rawText.includes('Dr. G. Thilagavathi'));
    });

    it('skips asset-wrapper HTML paths', () => {
        assert.equal(isAssetWrapperHtml('images/logo.png/index.html'), true);
        assert.equal(isAssetWrapperHtml('js/main.js/index.html'), true);
        assert.equal(isAssetWrapperHtml('placements/index.php/index.html'), false);
        const res = extractHtmlDocument('<html><body>hello</body></html>', { relativePath: 'images/a.png/index.html' });
        assert.equal(res.skipped, true);
        assert.equal(res.reason, 'asset-wrapper-html');
    });

    it('extracts text and page numbers from text-based PDFs and flags scanned PDFs', async () => {
        const textPdf = path.resolve(__dirname, '../../frontend/files/general/UGC Undertaking.pdf');
        const res1 = await extractPdfDocument(textPdf, { sourceUrl: '/files/general/UGC Undertaking.pdf' });
        assert.equal(res1.skipped, false);
        assert.equal(res1.numPages, 1);
        assert.ok(res1.rawText.includes('PSG College of Technology'));
        assert.equal(res1.pages[0].pageNumber, 1);

        const scannedPdf = path.resolve(__dirname, '../../frontend/NAAC/Statutory Declaration under the Section.pdf');
        const res2 = await extractPdfDocument(scannedPdf, { sourceUrl: '/NAAC/Statutory Declaration.pdf' });
        assert.equal(res2.skipped, true);
        assert.equal(res2.isScanned, true);
        assert.equal(res2.reason, 'scanned-pdf-no-text');
    });

    it('extracts notice metadata from TXT files and keeps notices intact', () => {
        const txt = `Title: Autonomous Semester Exam Schedule Notice\nDate: 2026-11-20\nDepartment: Office of CoE\nStudents must verify hall tickets before Dec 1.`;
        const extracted = extractTxtDocument(txt, { sourceUrl: '/notices/coe-2026.txt' });
        assert.equal(extracted.skipped, false);
        assert.equal(extracted.sourceType, 'notice');
        assert.equal(extracted.department, 'Office of CoE');
        const chunks = chunkExtractedDocument(extracted);
        assert.equal(chunks.length, 1);
        assert.ok(chunks[0].content.includes('hall tickets'));
    });

    it('infers categories, academic years, and historical status accurately', () => {
        assert.equal(inferCategory('Hostel Rules', '/hostel', ''), 'hostel');
        assert.equal(inferCategory('Placement Report', '/placements', ''), 'placements');
        assert.equal(inferAcademicYear('Academic Calendar 2025-2026', '/calendar.pdf'), '2025-2026');
        assert.equal(inferIsHistorical('2022', 'NIRF 2022', '/nirf2022'), true);
        assert.equal(inferIsHistorical('2026', 'NIRF 2026', '/nirf2026'), false);
    });

    it('runs dry-run incremental ingestion across local HTML + PDFs without altering storage', async () => {
        const report = await runIncrementalIngestion({
            dryRun: true,
            embed: false,
            includePdfs: true,
            limit: 12
        });
        assert.equal(report.status, 'dry_run_completed');
        assert.ok(report.discoveredCount > 50);
        assert.equal(report.evaluatedCount, 12);
        assert.ok(report.stagedChunkCount > 0);
        assert.equal(report.activatedChunkCount, 0);
    });

    it('promotes staged run and supports safe rollback in repository', async () => {
        const runId = 'test-run-rollback-001';
        testRunIds.push(runId);

        await knowledgeRepo.stageChunks(runId, [
            {
                documentId: 'doc-test-001',
                chunkId: 'chk-test-001',
                title: 'Test Hostel Doc',
                content: 'Test hostel accommodation details',
                sourceUrl: '/hostel',
                sourceType: 'html',
                category: 'hostel',
                status: 'staging',
                ingestionRunId: runId
            }
        ]);

        const promo = await knowledgeRepo.promoteStagedRun(runId, { documentIds: ['doc-test-001'] });
        assert.equal(promo.promotedCount, 1);

        const active = await knowledgeRepo.listActiveManagedChunks({ category: 'hostel' });
        assert.ok(active.some((c) => c.chunkId === 'chk-test-001'));

        const rb = await knowledgeRepo.rollbackIngestionRun(runId);
        assert.equal(rb.rolledBackRunId, runId);

        const afterRb = await knowledgeRepo.listActiveManagedChunks({ category: 'hostel' });
        assert.ok(!afterRb.some((c) => c.chunkId === 'chk-test-001'));
    });

    it('parses Gemini 429 retryDelay hints and estimates token counts accurately', () => {
        const msg = 'Quota exceeded. Please retry in 57.107s. [{"retryDelay":"57s"}]';
        const delayMs = parseRetryDelayMs(new Error(msg));
        assert.ok(delayMs >= 59000 && delayMs <= 61000);
        assert.ok(estimateTokens('PSG College of Technology hostel rules') >= 10);
    });
});
