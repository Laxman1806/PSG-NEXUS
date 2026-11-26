// db/scripts/ingest-local-pages.js - Safe CLI Wrapper for Checkpointed Incremental Knowledge Ingestion
const { connectDB, closeDB } = require('../connection');
const { runIncrementalIngestion } = require('../ingestion/pipeline');

function parseArgs(argv) {
    const args = {
        dryRun: argv.includes('--dry-run'),
        incremental: !argv.includes('--full'),
        embed: !argv.includes('--no-embed'),
        includePdfs: !argv.includes('--no-pdfs') && !argv.includes('--html-only'),
        limit: null,
        maxPdfPages: null
    };
    const limitFlag = argv.find((a) => a.startsWith('--limit='));
    if (limitFlag) {
        const n = Number.parseInt(limitFlag.split('=')[1], 10);
        if (Number.isFinite(n) && n > 0) args.limit = n;
    }
    const maxPagesFlag = argv.find((a) => a.startsWith('--max-pdf-pages='));
    if (maxPagesFlag) {
        const n = Number.parseInt(maxPagesFlag.split('=')[1], 10);
        if (Number.isFinite(n) && n > 0) args.maxPdfPages = n;
    }
    return args;
}

async function main() {
    const opts = parseArgs(process.argv.slice(2));
    console.log('====================================================');
    console.log('PSG NEXUS SAFE CHECKPOINTED INGESTION PIPELINE');
    console.log('Options:', JSON.stringify(opts));
    console.log('Tip: Pass --html-only or --max-pdf-pages=100 for fast free-tier runs.');
    console.log('Note: Existing legacy website_chunks collection is preserved untouched.');
    console.log('====================================================');

    await connectDB();
    try {
        const report = await runIncrementalIngestion(opts);
        console.log('\nIngestion Report:');
        console.log(JSON.stringify(report, null, 2));
    } finally {
        await closeDB();
    }
}

main().catch((err) => {
    console.error('Ingestion failed:', err.message);
    process.exit(1);
});
