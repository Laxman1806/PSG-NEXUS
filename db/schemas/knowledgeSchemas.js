// db/schemas/knowledgeSchemas.js - PSG NEXUS Knowledge Domain, Document & Chunk Schemas
const crypto = require('crypto');

const KNOWLEDGE_CATEGORIES = Object.freeze([
    'admissions',
    'academic_programmes',
    'departments',
    'faculty',
    'curriculum_syllabus',
    'academic_regulations',
    'examinations',
    'attendance_rules',
    'placements',
    'hostel',
    'scholarships',
    'fees_payments',
    'campus_facilities',
    'library',
    'sports',
    'research',
    'student_services',
    'administration',
    'college_notices',
    'academic_calendar',
    'alumni',
    'international_relations',
    'contact_directory',
    'events'
]);

const SOURCE_TYPES = Object.freeze(['html', 'pdf', 'docx', 'txt', 'url', 'notice', 'regulation']);
const DOCUMENT_STATUSES = Object.freeze(['pending', 'staging', 'active', 'archived', 'rejected', 'historical']);
const SOURCE_AUTHORITIES = Object.freeze([
    'official_portal',
    'official_pdf',
    'official_notice',
    'admin_upload',
    'curated_reference'
]);

function sha256(input) {
    return crypto.createHash('sha256').update(String(input || '')).digest('hex');
}

function buildDocumentId(sourceUrl, sourceType = 'html') {
    return sha256(`${sourceType}:${String(sourceUrl || '').trim().toLowerCase()}`).slice(0, 32);
}

function buildChunkId(documentId, version, chunkIndex, contentHash) {
    return sha256(`${documentId}:v${version}:${chunkIndex}:${contentHash}`).slice(0, 32);
}

function normalizeCategory(cat) {
    if (!cat || typeof cat !== 'string') return 'academic_programmes';
    const clean = cat.trim().toLowerCase().replace(/[\s-]+/g, '_');
    return KNOWLEDGE_CATEGORIES.includes(clean) ? clean : 'academic_programmes';
}

function createDocumentRecord(input) {
    const sourceUrl = String(input.sourceUrl || '').trim();
    const sourceType = SOURCE_TYPES.includes(input.sourceType) ? input.sourceType : 'html';
    const documentId = input.documentId || buildDocumentId(sourceUrl, sourceType);
    const contentHash = input.contentHash || sha256(input.rawText || input.title || sourceUrl);

    return {
        documentId,
        title: String(input.title || 'PSG College of Technology Document').trim(),
        sourceUrl,
        sourceType,
        category: normalizeCategory(input.category),
        department: input.department ? String(input.department).trim() : null,
        academicYear: input.academicYear ? String(input.academicYear).trim() : null,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
        effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : null,
        effectiveTo: input.effectiveTo ? new Date(input.effectiveTo) : null,
        lastVerifiedAt: input.lastVerifiedAt ? new Date(input.lastVerifiedAt) : null,
        language: input.language || 'en',
        authority: SOURCE_AUTHORITIES.includes(input.authority) ? input.authority : 'official_portal',
        documentVersion: Number.isInteger(input.documentVersion) && input.documentVersion > 0 ? input.documentVersion : 1,
        contentHash,
        isHistorical: Boolean(input.isHistorical),
        status: DOCUMENT_STATUSES.includes(input.status) ? input.status : 'pending',
        extractionWarnings: Array.isArray(input.extractionWarnings) ? input.extractionWarnings : [],
        chunkCount: Number.isInteger(input.chunkCount) ? input.chunkCount : 0,
        ingestionRunId: input.ingestionRunId || null,
        updatedAt: new Date()
    };
}

function createChunkRecord(input) {
    const content = String(input.content || '').trim();
    const contentHash = input.contentHash || sha256(content);
    const documentVersion = Number.isInteger(input.documentVersion) && input.documentVersion > 0 ? input.documentVersion : 1;
    const chunkIndex = Number.isInteger(input.chunkIndex) && input.chunkIndex >= 0 ? input.chunkIndex : 0;
    const chunkId = input.chunkId || buildChunkId(input.documentId, documentVersion, chunkIndex, contentHash);

    return {
        documentId: input.documentId,
        chunkId,
        title: String(input.title || '').trim(),
        content,
        sourceUrl: String(input.sourceUrl || '').trim(),
        sourceType: SOURCE_TYPES.includes(input.sourceType) ? input.sourceType : 'html',
        category: normalizeCategory(input.category),
        department: input.department ? String(input.department).trim() : null,
        academicYear: input.academicYear ? String(input.academicYear).trim() : null,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
        effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : null,
        effectiveTo: input.effectiveTo ? new Date(input.effectiveTo) : null,
        lastVerifiedAt: input.lastVerifiedAt ? new Date(input.lastVerifiedAt) : null,
        language: input.language || 'en',
        authority: SOURCE_AUTHORITIES.includes(input.authority) ? input.authority : 'official_portal',
        documentVersion,
        chunkIndex,
        pageNumber: Number.isInteger(input.pageNumber) ? input.pageNumber : null,
        sectionHeading: input.sectionHeading ? String(input.sectionHeading).trim() : null,
        embeddingModel: input.embeddingModel || null,
        embeddingDimensions: Number.isInteger(input.embeddingDimensions) ? input.embeddingDimensions : null,
        embedding: Array.isArray(input.embedding) ? input.embedding : null,
        contentHash,
        isHistorical: Boolean(input.isHistorical),
        status: DOCUMENT_STATUSES.includes(input.status) ? input.status : 'staging',
        ingestionRunId: input.ingestionRunId || null,
        createdAt: input.createdAt ? new Date(input.createdAt) : new Date()
    };
}

module.exports = {
    KNOWLEDGE_CATEGORIES,
    SOURCE_TYPES,
    DOCUMENT_STATUSES,
    SOURCE_AUTHORITIES,
    sha256,
    buildDocumentId,
    buildChunkId,
    normalizeCategory,
    createDocumentRecord,
    createChunkRecord
};
