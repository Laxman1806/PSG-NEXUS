// tests/rag/eval-rag.js - Quantitative RAG & Orchestration Evaluation Runner (200 Questions)
const fs = require('fs');
const path = require('path');

const { detectLanguage, expandMultilingualQuery } = require('../../backend/services/languageService');
const { classifyIntent } = require('../../backend/services/intentService');
const { rewriteFollowUpQuery } = require('../../backend/services/queryRewriteService');
const { searchByKeywords, hybridSearch } = require('../../db/searchService');
const { assessEvidence, detectPromptInjection } = require('../../backend/services/answerValidationService');
const { connectDB, closeDB } = require('../../db/connection');

async function runEvaluation() {
    const datasetPath = path.resolve(__dirname, './eval-dataset-200.json');
    const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

    const useLiveEmbeddings = process.argv.includes('--live-embed');
    if (useLiveEmbeddings) {
        await connectDB();
    }

    const stats = {
        totalQuestions: dataset.length,
        mode: useLiveEmbeddings ? 'hybrid-live-embeddings' : 'hybrid-lexical-rerank-offline',
        languageAccuracy: { correct: 0, total: 0 },
        intentAccuracy: { correct: 0, total: 0 },
        retrievalBaseline: { hitsAt5: 0, hitsAt10: 0, precisionAt5Sum: 0, total: 0 },
        retrievalHybridReranked: { hitsAt5: 0, hitsAt10: 0, precisionAt5Sum: 0, total: 0 },
        guardrails: {
            injectionTotal: 0,
            injectionBlocked: 0,
            abstainTotal: 0,
            abstainCorrect: 0
        },
        latenciesMs: []
    };

    const failures = [];

    for (const item of dataset) {
        const start = Date.now();
        const lang = detectLanguage(item.query);
        stats.languageAccuracy.total++;
        if (lang === item.language) stats.languageAccuracy.correct++;

        const { expandedQuery } = expandMultilingualQuery(item.query, lang);
        const intent = classifyIntent(item.query, expandedQuery);
        stats.intentAccuracy.total++;
        if (intent === item.expectedIntent) stats.intentAccuracy.correct++;

        if (item.isInjection) {
            stats.guardrails.injectionTotal++;
            if (detectPromptInjection(item.query)) stats.guardrails.injectionBlocked++;
        }

        // Handle follow-up rewrite
        let effectiveQuery = item.query;
        if (item.followUpTopic) {
            const conv = { messages: [{ role: 'user', content: item.followUpTopic }] };
            effectiveQuery = rewriteFollowUpQuery(item.query, conv).rewrittenQuery;
        }
        const searchQuery = lang === 'en' ? effectiveQuery : `${effectiveQuery} ${expandedQuery}`;

        if (item.expectedUrl) {
            stats.retrievalBaseline.total++;
            stats.retrievalHybridReranked.total++;

            const base10 = searchByKeywords(searchQuery, undefined, 10);
            const base5 = base10.slice(0, 5);
            const baseHit5 = base5.some((r) => (r.sourceUrl || r.url) === item.expectedUrl);
            const baseHit10 = base10.some((r) => (r.sourceUrl || r.url) === item.expectedUrl);
            if (baseHit5) stats.retrievalBaseline.hitsAt5++;
            if (baseHit10) stats.retrievalBaseline.hitsAt10++;
            stats.retrievalBaseline.precisionAt5Sum += base5.filter((r) => (r.sourceUrl || r.url) === item.expectedUrl).length / Math.max(1, base5.length);

            const hybrid10 = await hybridSearch(searchQuery, {
                limit: 10,
                candidateLimit: 20,
                skipEmbedding: !useLiveEmbeddings
            });
            const hyb5 = hybrid10.results.slice(0, 5);
            const hybHit5 = hyb5.some((r) => (r.sourceUrl || r.url) === item.expectedUrl);
            const hybHit10 = hybrid10.results.some((r) => (r.sourceUrl || r.url) === item.expectedUrl);
            if (hybHit5) stats.retrievalHybridReranked.hitsAt5++;
            if (hybHit10) stats.retrievalHybridReranked.hitsAt10++;
            stats.retrievalHybridReranked.precisionAt5Sum += hyb5.filter((r) => (r.sourceUrl || r.url) === item.expectedUrl).length / Math.max(1, hyb5.length);

            if (!hybHit5) {
                failures.push({
                    id: item.id,
                    category: item.category,
                    query: item.query,
                    expectedUrl: item.expectedUrl,
                    top5Urls: hyb5.map((r) => r.sourceUrl || r.url)
                });
            }
        }

        if (item.shouldAbstain && !item.isInjection) {
            stats.guardrails.abstainTotal++;
            const hyb = await hybridSearch(searchQuery, { limit: 5, skipEmbedding: !useLiveEmbeddings });
            const assessment = assessEvidence(item.query, hyb.results);
            const abstained =
                intent === 'OUT_OF_SCOPE' ||
                intent === 'PERSONAL_STUDENT_SERVICE' ||
                intent === 'LIVE_INFORMATION' ||
                assessment.status === 'INSUFFICIENT' ||
                assessment.status === 'LIVE_DATA_REQUIRED' ||
                assessment.status === 'PARTIAL';
            if (abstained) stats.guardrails.abstainCorrect++;
        }

        stats.latenciesMs.push(Date.now() - start);
    }

    if (useLiveEmbeddings) await closeDB();

    const avgLatencyMs = Math.round(stats.latenciesMs.reduce((a, b) => a + b, 0) / stats.latenciesMs.length);
    const pct = (n, d) => d > 0 ? Number(((n / d) * 100).toFixed(2)) : 0;

    const summary = {
        totalQuestions: stats.totalQuestions,
        mode: stats.mode,
        languageAccuracyPct: pct(stats.languageAccuracy.correct, stats.languageAccuracy.total),
        intentAccuracyPct: pct(stats.intentAccuracy.correct, stats.intentAccuracy.total),
        baselineRetrieval: {
            evaluated: stats.retrievalBaseline.total,
            recallAt5Pct: pct(stats.retrievalBaseline.hitsAt5, stats.retrievalBaseline.total),
            recallAt10Pct: pct(stats.retrievalBaseline.hitsAt10, stats.retrievalBaseline.total),
            precisionAt5: Number((stats.retrievalBaseline.precisionAt5Sum / stats.retrievalBaseline.total).toFixed(3))
        },
        hybridRerankedRetrieval: {
            evaluated: stats.retrievalHybridReranked.total,
            recallAt5Pct: pct(stats.retrievalHybridReranked.hitsAt5, stats.retrievalHybridReranked.total),
            recallAt10Pct: pct(stats.retrievalHybridReranked.hitsAt10, stats.retrievalHybridReranked.total),
            precisionAt5: Number((stats.retrievalHybridReranked.precisionAt5Sum / stats.retrievalHybridReranked.total).toFixed(3))
        },
        guardrails: {
            promptInjectionBlockRatePct: pct(stats.guardrails.injectionBlocked, stats.guardrails.injectionTotal),
            abstentionAccuracyPct: pct(stats.guardrails.abstainCorrect, stats.guardrails.abstainTotal)
        },
        avgLatencyMs,
        sampleRetrievalMisses: failures.slice(0, 10)
    };

    console.log(JSON.stringify(summary, null, 2));
}

runEvaluation().catch((err) => {
    console.error('RAG Evaluation Error:', err);
    process.exit(1);
});
