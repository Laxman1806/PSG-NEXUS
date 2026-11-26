// backend/services/rerankingService.js - Multi-Signal Retrieval Reranker & Quality Metrics
const STOP_WORDS = new Set([
    'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
    'the', 'and', 'for', 'with', 'about', 'are', 'is', 'was', 'were', 'can',
    'could', 'would', 'should', 'tell', 'give', 'show', 'please', 'does', 'did',
    'from', 'into', 'this', 'that', 'there', 'here', 'psg', 'tech', 'college',
    'technology', 'coimbatore', 'india', 'page', 'open', 'take', 'of', 'in', 'at', 'to', 'a', 'an'
]);

const AUTHORITY_WEIGHT = Object.freeze({
    official_notice: 0.08,
    official_pdf: 0.06,
    official_portal: 0.04,
    admin_upload: 0.05,
    curated_reference: 0.06
});

function extractQueryKeywords(query) {
    return String(query || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

function isHistoricalQuery(query) {
    return /\b(201\d|202[0-3]|previous|old|past|archived?|history|earlier regulation)\b/i.test(String(query || ''));
}

function computeLexicalCoverage(queryKeywords, candidate) {
    if (queryKeywords.length === 0) return 0;
    const titleLower = String(candidate.title || '').toLowerCase();
    const contentLower = String(candidate.content || '').toLowerCase();
    const headingLower = String(candidate.sectionHeading || '').toLowerCase();
    const urlLower = String(candidate.sourceUrl || candidate.url || '').toLowerCase();

    let weightedMatches = 0;
    for (const kw of queryKeywords) {
        if (titleLower.includes(kw) || headingLower.includes(kw) || urlLower.includes(kw)) {
            weightedMatches += 1.3;
        } else if (contentLower.includes(kw)) {
            weightedMatches += 1.0;
        }
    }
    return Math.min(1, weightedMatches / queryKeywords.length);
}

function rerankCandidates(query, candidates, options = {}) {
    if (!Array.isArray(candidates) || candidates.length === 0) return [];

    const queryKeywords = extractQueryKeywords(query);
    const allowHistorical = Boolean(options.includeHistorical) || isHistoricalQuery(query);
    const maxResults = options.limit || candidates.length;

    const maxRrf = Math.max(...candidates.map((c) => c.rrfScore || 0), 0.0001);

    const reranked = candidates.map((cand) => {
        const normRrf = (cand.rrfScore || 0) / maxRrf;
        const vecScore = typeof cand.vectorScore === 'number' ? Math.max(0, Math.min(1, cand.vectorScore)) : 0;
        const coverage = computeLexicalCoverage(queryKeywords, cand);
        const authBonus = AUTHORITY_WEIGHT[cand.authority] || 0.02;

        // Penalize historical records unless user specifically asks about past years
        const historicalPenalty = cand.isHistorical && !allowHistorical ? -0.18 : 0;

        // Penalize localhost:3000 legacy broken URLs when clean paths exist
        const legacyLocalUrlPenalty = String(cand.sourceUrl || cand.url || '').includes('localhost:3000') ? -0.05 : 0;

        // Avoid niche Foreign National/OCI page crowding out general domestic admissions unless query asks for FN/OCI/NRI
        const isNicheOciPage = String(cand.sourceUrl || cand.url || '').toLowerCase().includes('fn_oci');
        const asksOci = /\b(fn|oci|nri|foreign)\b/i.test(String(query || ''));
        const nichePenalty = isNicheOciPage && !asksOci ? -0.08 : 0;

        // Exact title/URL match boost weighted by how many specific query keywords match
        const titleLower = String(cand.title || '').toLowerCase();
        const urlLower = String(cand.sourceUrl || cand.url || '').toLowerCase();
        const titleMatches = queryKeywords.filter((kw) => kw.length >= 3 && (titleLower.includes(kw) || urlLower.includes(kw))).length;
        const entityBoost = Math.min(0.18, titleMatches * 0.08);

        const rerankScore = Number(
            (
                normRrf * 0.38 +
                vecScore * 0.22 +
                coverage * 0.40 +
                authBonus +
                entityBoost +
                nichePenalty +
                historicalPenalty +
                legacyLocalUrlPenalty
            ).toFixed(4)
        );

        return {
            ...cand,
            coverageScore: Number(coverage.toFixed(4)),
            rerankScore,
            score: rerankScore
        };
    });

    reranked.sort((a, b) => b.rerankScore - a.rerankScore);
    return reranked.slice(0, maxResults);
}

module.exports = {
    extractQueryKeywords,
    isHistoricalQuery,
    computeLexicalCoverage,
    rerankCandidates
};
