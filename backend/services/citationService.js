// backend/services/citationService.js - Evidence Formatting & Citation Validation

function sanitizePublicUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return '#';
    const trimmed = rawUrl.trim();
    if (trimmed.startsWith('/')) return trimmed;
    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
            return parsed.toString();
        }
    } catch (_e) {
        return '#';
    }
    return '#';
}

function buildEvidenceCatalog(evidence = []) {
    return evidence.map((chunk, idx) => {
        const citationId = `E${idx + 1}`;
        return {
            citationId,
            documentId: chunk.documentId || chunk.chunkId || `doc-${idx + 1}`,
            chunkId: chunk.chunkId || `chunk-${idx + 1}`,
            title: chunk.title || 'PSG College of Technology Official Resource',
            url: sanitizePublicUrl(chunk.sourceUrl || chunk.url || '/'),
            sourceType: chunk.sourceType || 'html',
            category: chunk.category || null,
            department: chunk.department || null,
            academicYear: chunk.academicYear || null,
            publishedAt: chunk.publishedAt || null,
            effectiveFrom: chunk.effectiveFrom || null,
            effectiveTo: chunk.effectiveTo || null,
            page: chunk.pageNumber ?? null,
            section: chunk.sectionHeading || null,
            isHistorical: Boolean(chunk.isHistorical),
            authority: chunk.authority || 'official_portal',
            score: chunk.rerankScore ?? chunk.score ?? null,
            snippet: String(chunk.content || '').slice(0, 240)
        };
    });
}

function formatEvidenceForPrompt(evidence = []) {
    if (!Array.isArray(evidence) || evidence.length === 0) return '';
    return evidence
        .map((chunk, idx) => {
            const id = `E${idx + 1}`;
            const metaParts = [
                `Title: ${chunk.title || 'PSG Tech Document'}`,
                `URL: ${chunk.sourceUrl || chunk.url || '/'}`,
                `Type: ${chunk.sourceType || 'html'}`
            ];
            if (chunk.academicYear) metaParts.push(`AcademicYear: ${chunk.academicYear}`);
            if (chunk.publishedAt) metaParts.push(`PublishedAt: ${chunk.publishedAt}`);
            if (chunk.pageNumber) metaParts.push(`Page: ${chunk.pageNumber}`);
            if (chunk.sectionHeading) metaParts.push(`Section: ${chunk.sectionHeading}`);
            if (chunk.isHistorical) metaParts.push('Historical: true');

            return `[${id}] (${metaParts.join(' | ')})\n${chunk.content}`;
        })
        .join('\n\n');
}

function selectValidatedCitations(citedIds, evidence = [], status = 'VERIFIED') {
    if (!Array.isArray(evidence) || evidence.length === 0) return [];
    if (status === 'INSUFFICIENT' || status === 'LIVE_DATA_REQUIRED') return [];

    const catalog = buildEvidenceCatalog(evidence);
    const byId = new Map(catalog.map((c) => [c.citationId.toUpperCase(), c]));

    const selected = [];
    const seenUrls = new Set();

    if (Array.isArray(citedIds)) {
        for (const rawId of citedIds) {
            const norm = String(rawId || '').trim().toUpperCase();
            const match = byId.get(norm);
            if (match && !seenUrls.has(`${match.url}::${match.page ?? ''}`)) {
                seenUrls.add(`${match.url}::${match.page ?? ''}`);
                selected.push(match);
            }
        }
    }

    // If model omitted valid citedIds on a VERIFIED/PARTIAL answer, bind top supporting evidence up to 2 items
    if (selected.length === 0 && (status === 'VERIFIED' || status === 'PARTIAL' || status === 'OUTDATED' || status === 'CONFLICTING')) {
        for (const item of catalog.slice(0, 2)) {
            const key = `${item.url}::${item.page ?? ''}`;
            if (!seenUrls.has(key)) {
                seenUrls.add(key);
                selected.push(item);
            }
        }
    }

    return selected;
}

module.exports = {
    sanitizePublicUrl,
    buildEvidenceCatalog,
    formatEvidenceForPrompt,
    selectValidatedCitations
};
