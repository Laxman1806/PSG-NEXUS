// tests/rag/stage4-retrieval.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
    cosineSimilarity,
    expandKeywords,
    searchByKeywords,
    reciprocalRankFusion,
    hybridSearch
} = require('../../db/searchService');
const { rerankCandidates } = require('../../backend/services/rerankingService');
const { retrieveEvidence } = require('../../backend/services/retrievalService');

describe('Stage 4: Hybrid Retrieval, RRF Fusion & Reranking', () => {
    it('computes safe cosine similarity with dimension and empty checks', () => {
        assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
        assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
        assert.equal(cosineSimilarity(undefined, [1, 0]), 0);
        assert.equal(cosineSimilarity([1, 0], [1, 0, 0]), 0);
    });

    it('expands synonyms for Tanglish and domain paraphrases', () => {
        const exp = expandKeywords('How can I join the accommodation?');
        assert.ok(exp.includes('hostel'));
        assert.ok(exp.includes('admission'));

        const tanglish = expandKeywords('Hostel fees evlo?');
        assert.ok(tanglish.includes('hostel'));
        assert.ok(tanglish.includes('fee'));
    });

    it('combines vector and lexical lists cleanly via Reciprocal Rank Fusion', () => {
        const vec = [
            { sourceUrl: '/a', content: 'alpha content', vectorScore: 0.9 },
            { sourceUrl: '/b', content: 'beta content', vectorScore: 0.85 }
        ];
        const lex = [
            { sourceUrl: '/b', content: 'beta content', lexicalScore: 12 },
            { sourceUrl: '/c', content: 'gamma content', lexicalScore: 9 }
        ];
        const fused = reciprocalRankFusion(vec, lex);
        // /b appears in both lists so it should rank first
        assert.equal(fused[0].sourceUrl, '/b');
        assert.equal(fused.length, 3);
    });

    it('penalizes historical records unless query asks for historical years', () => {
        const cands = [
            { title: 'NIRF 2021', sourceUrl: '/nirf2021', content: 'nirf ranking data', rrfScore: 0.03, isHistorical: true },
            { title: 'NIRF 2026', sourceUrl: '/nirf.php', content: 'nirf ranking data 2026', rrfScore: 0.029, isHistorical: false }
        ];
        const rankedCurrent = rerankCandidates('What is the NIRF ranking?', cands);
        assert.equal(rankedCurrent[0].title, 'NIRF 2026');

        const rankedPast = rerankCandidates('What was the 2021 NIRF ranking?', cands);
        assert.ok(rankedPast.length === 2);
    });

    it('retrieves relevant hostel, placement, principal, and admission chunks via hybrid search (offline mode)', async () => {
        const queries = [
            { q: 'How do I apply for accommodation?', expectAny: ['hostel', 'accommodation'] },
            { q: 'Who is the Principal of PSG College of Technology?', expectAny: ['principal'] },
            { q: 'How to apply for MCA admissions?', expectAny: ['mca', 'admission', 'tancet'] },
            { q: 'Tell me about placement recruiters and CDC', expectAny: ['placement', 'recruit', 'cdc'] }
        ];

        for (const item of queries) {
            const res = await retrieveEvidence(item.q, { skipEmbedding: true, limit: 5 });
            assert.ok(res.evidence.length > 0, `Expected results for: ${item.q}`);
            const joined = res.evidence.map((e) => `${e.title} ${e.content}`).join(' ').toLowerCase();
            assert.ok(
                item.expectAny.some((term) => joined.includes(term)),
                `Expected one of [${item.expectAny.join(', ')}] in results for "${item.q}"`
            );
        }
    });

    it('measures baseline lexical precision vs hybrid+reranked retrieval on core sample set', async () => {
        const evalCases = [
            { q: 'Hostel curfew and mess facilities', expectedUrl: '/hostel' },
            { q: 'TNEA code and MCA eligibility', expectedUrl: '/admission.php' },
            { q: 'Minimum attendance requirement 75%', expectedUrl: '/coe.php' },
            { q: 'GRD Memorial Library resources', expectedUrl: '/library' },
            { q: 'Who is the Principal?', expectedUrl: '/principal.php' }
        ];

        let baselineHits = 0;
        let rerankedHits = 0;

        for (const tc of evalCases) {
            const base = searchByKeywords(tc.q, undefined, 5);
            if (base.some((r) => (r.sourceUrl || r.url) === tc.expectedUrl)) baselineHits++;

            const hybrid = await hybridSearch(tc.q, { skipEmbedding: true, limit: 5 });
            if (hybrid.results.some((r) => (r.sourceUrl || r.url) === tc.expectedUrl)) rerankedHits++;
        }

        assert.ok(rerankedHits >= baselineHits, `Reranked (${rerankedHits}) should be >= baseline (${baselineHits})`);
        assert.ok(rerankedHits >= 4, `Expected at least 4/5 Recall@5, got ${rerankedHits}/5`);
    });

    it('retrieves exact structured HoD, MCA, and Dean evidence without entity mismatch', async () => {
        const hodMca = await retrieveEvidence('hod of computer application', { skipEmbedding: true, limit: 5 });
        const hodText = hodMca.evidence.map((e) => e.content).join('\n');
        assert.ok(hodText.includes('Computer Applications (MCA) — Head of Department (HoD): Dr.Ilayaraja N'));

        const mcaShort = await retrieveEvidence('who is the hod of mca', { skipEmbedding: true, limit: 5 });
        const mcaJoined = mcaShort.evidence.map((e) => e.content).join('\n');
        assert.ok(/ilayaraja/i.test(mcaJoined));

        const deanRes = await retrieveEvidence('who is the dean academic and email', { skipEmbedding: true, limit: 5 });
        const deanJoined = deanRes.evidence.map((e) => e.content).join('\n');
        assert.ok(deanJoined.includes('Dr J V Ramasamy'));
    });
});
