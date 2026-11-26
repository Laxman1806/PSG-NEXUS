// db/ingestion/chunker.js - Document-Aware Chunking & Metadata Inference
const { KNOWLEDGE_CATEGORIES } = require('../schemas/knowledgeSchemas');

const CHUNK_PROFILES = Object.freeze({
    html: { maxWords: 320, overlap: 50, minChars: 80 },
    pdf: { maxWords: 300, overlap: 45, minChars: 60 },
    docx: { maxWords: 320, overlap: 50, minChars: 60 },
    txt: { maxWords: 320, overlap: 50, minChars: 50 },
    notice: { maxWords: 500, overlap: 40, minChars: 40 },
    regulation: { maxWords: 280, overlap: 60, minChars: 60 },
    url: { maxWords: 320, overlap: 50, minChars: 80 }
});

const CATEGORY_RULES = [
    { pattern: /(admission|tnea|tanca|fn_oci|bscmscadmission)/i, category: 'admissions' },
    { pattern: /(programme|curriculum|syllabus|course conducted|bshets)/i, category: 'academic_programmes' },
    { pattern: /(faculty|heads|professor of practice)/i, category: 'faculty' },
    { pattern: /(coe|exam|autonomous|revaluation|timetable)/i, category: 'examinations' },
    { pattern: /(attendance|regulation|student\.php|mandatorycommittee)/i, category: 'academic_regulations' },
    { pattern: /(placement|recruit|cdc|iipc)/i, category: 'placements' },
    { pattern: /(hostel|mess|warden)/i, category: 'hostel' },
    { pattern: /(scholarship|concession|fee)/i, category: 'scholarships' },
    { pattern: /(library|grd)/i, category: 'library' },
    { pattern: /(sports|physical education)/i, category: 'sports' },
    { pattern: /(research|r&d|ird|conclave|iic|coeindutech|journals)/i, category: 'research' },
    { pattern: /(calendar|academicschedule)/i, category: 'academic_calendar' },
    { pattern: /(alumni)/i, category: 'alumni' },
    { pattern: /(mousgloblink|international)/i, category: 'international_relations' },
    { pattern: /(cont\.php|contact|help-desk|enquiry)/i, category: 'contact_directory' },
    { pattern: /(principal|dean|management|founders|trustees|secretary|viceprincipal|gcct|statutory|undertaking|disclosure|nirf|nba|approval)/i, category: 'administration' },
    { pattern: /(parentzone)/i, category: 'student_services' },
    { pattern: /(notice|announcement|circular|brochure)/i, category: 'college_notices' }
];

function inferCategory(title = '', sourceUrl = '', rawText = '') {
    const combined = `${sourceUrl} ${title} ${rawText.slice(0, 400)}`;
    for (const rule of CATEGORY_RULES) {
        if (rule.pattern.test(combined)) {
            return rule.category;
        }
    }
    return KNOWLEDGE_CATEGORIES[0] ? 'academic_programmes' : 'administration';
}

function inferAcademicYear(title = '', sourceUrl = '') {
    const combined = `${sourceUrl} ${title}`;
    const rangeMatch = combined.match(/\b(20\d{2})[-–](20\d{2}|\d{2})\b/);
    if (rangeMatch) return rangeMatch[0];
    const singleMatch = combined.match(/\b(202[0-9])\b/);
    if (singleMatch) return singleMatch[1];
    return null;
}

function inferIsHistorical(academicYear, title = '', sourceUrl = '') {
    const currentYear = new Date().getFullYear();
    if (!academicYear) {
        const lower = `${title} ${sourceUrl}`.toLowerCase();
        return lower.includes('archive') || lower.includes('previous regulation');
    }
    const years = academicYear.match(/20\d{2}/g);
    if (!years || years.length === 0) return false;
    const latestMentioned = Math.max(...years.map(Number));
    return latestMentioned < currentYear - 1;
}

function splitWordWindow(text, { maxWords, overlap, minChars }) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    if (words.length <= maxWords) {
        const single = words.join(' ');
        return single.length >= minChars ? [single] : [];
    }

    const chunks = [];
    const step = Math.max(1, maxWords - overlap);
    for (let i = 0; i < words.length; i += step) {
        const slice = words.slice(i, i + maxWords).join(' ');
        if (slice.length >= minChars) {
            chunks.push(slice);
        }
        if (i + maxWords >= words.length) break;
    }
    return chunks;
}

function splitRegulationClauses(text, profile) {
    const clausePattern = /(?=\n(?:Regulation|Clause|Section|Rule|\d+\.\d+|\d+\.)\s+)/gi;
    const blocks = String(text || '').split(clausePattern).map((b) => b.trim()).filter(Boolean);
    if (blocks.length <= 1) {
        return splitWordWindow(text, profile).map((c) => ({ content: c, sectionHeading: null }));
    }

    const chunks = [];
    for (const block of blocks) {
        const firstLine = block.split('\n')[0].slice(0, 120).trim();
        const parts = splitWordWindow(block, profile);
        for (const p of parts) {
            chunks.push({ content: p, sectionHeading: firstLine });
        }
    }
    return chunks;
}

function chunkExtractedDocument(extractedDoc, customConfig = {}) {
    const sourceType = extractedDoc.sourceType || 'html';
    const baseProfile = CHUNK_PROFILES[sourceType] || CHUNK_PROFILES.html;
    const profile = {
        maxWords: customConfig.maxWords || baseProfile.maxWords,
        overlap: customConfig.overlap ?? baseProfile.overlap,
        minChars: customConfig.minChars ?? baseProfile.minChars
    };

    const chunks = [];

    if (sourceType === 'pdf' && Array.isArray(extractedDoc.pages) && extractedDoc.pages.length > 0) {
        for (const page of extractedDoc.pages) {
            const pageChunks = splitWordWindow(page.text, profile);
            for (const c of pageChunks) {
                chunks.push({
                    content: c,
                    pageNumber: page.pageNumber,
                    sectionHeading: `${extractedDoc.title} (Page ${page.pageNumber})`
                });
            }
        }
    } else if (sourceType === 'regulation') {
        const regChunks = splitRegulationClauses(extractedDoc.rawText, profile);
        for (const c of regChunks) {
            chunks.push({
                content: c.content,
                pageNumber: null,
                sectionHeading: c.sectionHeading || extractedDoc.title
            });
        }
    } else if (Array.isArray(extractedDoc.sections) && extractedDoc.sections.length > 0) {
        for (const section of extractedDoc.sections) {
            const prefix = section.heading && section.heading !== extractedDoc.title
                ? `${section.heading}\n`
                : '';
            const sectionChunks = splitWordWindow(`${prefix}${section.text}`, profile);
            for (const c of sectionChunks) {
                chunks.push({
                    content: c,
                    pageNumber: null,
                    sectionHeading: section.heading || extractedDoc.title
                });
            }
        }
    } else {
        const plainChunks = splitWordWindow(extractedDoc.rawText, profile);
        for (const c of plainChunks) {
            chunks.push({
                content: c,
                pageNumber: null,
                sectionHeading: extractedDoc.title
            });
        }
    }

    return chunks;
}

module.exports = {
    CHUNK_PROFILES,
    inferCategory,
    inferAcademicYear,
    inferIsHistorical,
    splitWordWindow,
    chunkExtractedDocument
};
