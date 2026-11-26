// db/scripts/refresh-knowledge.js - Clean Noise, Fix Structured Directories & Sync Atlas + Local Cache
const fs = require('fs');
const path = require('path');
const { config } = require('../../backend/config/env');
const { connectDB, closeDB } = require('../connection');
const { extractHtmlDocument, stripNewsTickerNoise } = require('../ingestion/extractors');
const { chunkExtractedDocument, inferCategory } = require('../ingestion/chunker');
const { runIncrementalIngestion } = require('../ingestion/pipeline');
const { resetLocalCache } = require('../../db/searchService');

const ROOT_DIR = path.resolve(__dirname, '../..');
const JSON_PATH = path.join(ROOT_DIR, 'db/data/knowledge_chunks.json');
const REPLICA_WWW = path.join(ROOT_DIR, 'frontend/psgtech_offline_replica/www.psgtech.edu');

const ACCURATE_HOSTEL_OVERVIEW = `PSG Tech provides on-campus hostel accommodation for both male and female students:
Boys Hostels: Located adjacent to the academic blocks with multiple blocks (Junior, Senior, PG blocks).
Girls Hostels: Located securely within campus premises with biometric entry and round-the-clock security.
Facilities: High-speed Wi-Fi internet, RO purified drinking water, hot water geysers, indoor sports room, gymnasium, reading rooms, TV hall, and laundry services.
Mess: Both vegetarian and non-vegetarian mess facilities offering hygienic South Indian and North Indian food. Monthly mess bill is based on dividing system.
Rules, Curfew & Permissions: Managed by the Hostel Residents Council (Patron, Chief Warden, Wardens, Manager, Deputy Wardens, Resident Tutors, and Student Representatives). General hostel gate timings, curfew rules, late-night lab/project permission, leave, and discipline guidelines are published at /hostel.`;

const ACCURATE_PLACEMENTS_OVERVIEW = `Career Development Centre (CDC) & Placements at PSG College of Technology:
PSG College of Technology operates a dedicated Career Development Centre (Placement & Training Section) headed by Dr. Nadarajan R., Dean - Placement & Training, supported by Corporate Liaison Officers and placement staff.
The CDC facilitates campus recruitment and internships with leading multinational and national organizations across engineering, software, core manufacturing, consulting, and analytics sectors.
Services include pre-placement talks, aptitude and technical coding preparation, soft-skills bootcamps, mock interviews, and industry-academia career partnerships. Visit /placements for official CDC details; specific annual salary package figures are published in official institutional placement reports.`;

function cleanText(raw) {
    return stripNewsTickerNoise(String(raw || '').replace(/\uFFFD/g, ' '));
}

function loadStructuredPageChunks(relHtmlPath, routeUrl, fallbackTitle) {
    const full = path.join(REPLICA_WWW, relHtmlPath);
    if (!fs.existsSync(full)) return [];
    const extracted = extractHtmlDocument(fs.readFileSync(full, 'utf8'), {
        relativePath: relHtmlPath,
        sourceUrl: routeUrl
    });
    if (!extracted || extracted.skipped) return [];
    const chunks = chunkExtractedDocument(extracted);
    const category = inferCategory(extracted.title, extracted.sourceUrl, extracted.rawText);
    return chunks.map((rc, idx) => ({
        title: fallbackTitle || extracted.title,
        url: routeUrl,
        sourceUrl: routeUrl,
        sourceType: 'html',
        category,
        department: rc.department || null,
        sectionHeading: rc.sectionHeading || fallbackTitle || extracted.title,
        authority: 'official_portal',
        isCore: false,
        content: rc.content,
        chunkIndex: idx
    }));
}

async function main() {
    console.log('====================================================');
    console.log('PSG NEXUS DATA ACCURACY & STRUCTURAL REFRESH');
    console.log('====================================================');

    // 1. Build authoritative structured extractions for key directory & leadership pages
    const headsChunks = loadStructuredPageChunks('Heads.php/index.html', '/Heads.php', 'Heads of Departments (HoD)');
    const facultyDeptChunks = loadStructuredPageChunks('facultyDetails.php/index.html', '/facultyDetails.php', 'Faculty Members & Staff Directory');
    const leadershipPages = [
        ['Dean-Academic.php/index.html', '/Dean-Academic.php', 'Dean - Academic'],
        ['Dean-Administration.php/index.html', '/Dean-Administration.php', 'Dean - Administration'],
        ['Dean-Autonomous.php/index.html', '/Dean-Autonomous.php', 'Dean - Autonomous Functioning'],
        ['secretary.php/index.html', '/secretary.php', 'Secretary - PSG College of Technology'],
        ['VicePrincipal_WomenWelfare.php/index.html', '/VicePrincipal_WomenWelfare.php', 'Vice Principal (Women Welfare)'],
        ['principal.php/index.html', '/principal.php', 'Principal - PSG College of Technology'],
        ['trustees.php/index.html', '/trustees.php', 'Managing Trustee - PSG & Sons Charities Trust']
    ];
    const leadershipChunks = leadershipPages.flatMap(([rel, url, title]) => loadStructuredPageChunks(rel, url, title));

    const headsJoinedText = headsChunks.map((c) => c.content).join('\n\n');
    console.log(`Extracted /Heads.php chunks: ${headsChunks.length} (len=${headsJoinedText.length})`);
    console.log(`Extracted /facultyDetails.php per-dept chunks: ${facultyDeptChunks.length}`);
    console.log(`Extracted leadership profile chunks: ${leadershipChunks.length}`);

    // 2. Clean & upgrade db/data/knowledge_chunks.json (preserving existing valid 768d embeddings!)
    const local = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    const existingVecByUrl = new Map();
    for (const c of local) {
        if (Array.isArray(c.embedding) && c.embedding.length === 768 && c.url) {
            if (!existingVecByUrl.has(c.url)) existingVecByUrl.set(c.url, c.embedding);
        }
    }

    const updatedLocal = [];
    let replacedHeads = false;
    const replacedLeadershipUrls = new Set(leadershipChunks.map((c) => c.url));

    for (const item of local) {
        // Replace legacy fragmented /facultyDetails.php scraped chunks (keep isCore summary [1])
        if (item.url === '/facultyDetails.php' && !item.isCore) {
            continue;
        }
        // Replace broken flat /Heads.php with clean structured HoD lines (keep its 768d vector!)
        if (item.url === '/Heads.php') {
            if (!replacedHeads && headsChunks.length > 0) {
                for (const hc of headsChunks) {
                    updatedLocal.push({
                        ...item,
                        ...hc,
                        embedding: item.embedding || existingVecByUrl.get('/Heads.php') || undefined
                    });
                }
                replacedHeads = true;
            }
            continue;
        }
        // Replace noisy single-chunk leadership stubs with clean structured chunks
        if (replacedLeadershipUrls.has(item.url)) {
            continue;
        }

        const copy = { ...item };
        if (copy.url === '/hostel' && /8:30 PM/i.test(copy.content || '')) {
            copy.content = ACCURATE_HOSTEL_OVERVIEW;
        } else if (copy.url === '/placements' && /52\s*LPA/i.test(copy.content || '')) {
            copy.content = ACCURATE_PLACEMENTS_OVERVIEW;
        } else {
            copy.content = cleanText(copy.content);
        }
        updatedLocal.push(copy);
    }

    // Append structured leadership chunks & per-department faculty chunks
    for (const lc of [...leadershipChunks, ...facultyDeptChunks]) {
        const vec = leadershipChunks.includes(lc) ? existingVecByUrl.get(lc.url) : undefined;
        updatedLocal.push(vec ? { ...lc, embedding: vec } : lc);
    }

    fs.writeFileSync(JSON_PATH, JSON.stringify(updatedLocal), 'utf8');
    resetLocalCache();
    console.log(`Updated db/data/knowledge_chunks.json: ${local.length} -> ${updatedLocal.length} chunks`);

    // 3. Connect to MongoDB Atlas and clean legacy website_chunks + populate active knowledge_chunks
    const db = await connectDB();
    if (!db) {
        console.warn('MongoDB unavailable; skipped Atlas updates.');
        return;
    }

    try {
        const legacyCol = db.collection(config.mongo.collection);
        const legacyDocs = await legacyCol.find({}).toArray();
        let cleanedLegacyCount = 0;

        for (const doc of legacyDocs) {
            let nextContent = cleanText(doc.content);
            if (doc.url === '/Heads.php' && headsJoinedText) {
                nextContent = `Head of the Departments\n${headsJoinedText}`;
            } else if (doc.url === '/hostel' && /8:30 PM/i.test(nextContent)) {
                nextContent = ACCURATE_HOSTEL_OVERVIEW;
            } else if (doc.url === '/placements' && /52\s*LPA/i.test(nextContent)) {
                nextContent = ACCURATE_PLACEMENTS_OVERVIEW;
            }

            if (nextContent !== doc.content) {
                await legacyCol.updateOne({ _id: doc._id }, { $set: { content: nextContent } });
                cleanedLegacyCount++;
            }
        }
        console.log(`Cleaned Atlas ${config.mongo.collection} documents (preserved all 768d embeddings): ${cleanedLegacyCount}/${legacyDocs.length}`);

        // Run full HTML ingestion into knowledge_documents & knowledge_chunks (reusing existing vectors, no API quota burn)
        const report = await runIncrementalIngestion({
            dryRun: false,
            incremental: false,
            embed: false,
            includePdfs: false,
            includeDocs: false
        });
        console.log('Atlas knowledge_chunks ingestion report:', JSON.stringify({
            runId: report.runId,
            status: report.status,
            evaluatedCount: report.evaluatedCount,
            changedOrNewCount: report.changedOrNewCount,
            reusedEmbeddingsCount: report.reusedEmbeddingsCount,
            activatedChunkCount: report.activatedChunkCount,
            skippedCount: report.skippedCount
        }, null, 2));
    } finally {
        await closeDB();
    }
}

main().catch((err) => {
    console.error('Refresh failed:', err);
    process.exit(1);
});
