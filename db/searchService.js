// db/searchService.js - Hybrid Vector + Lexical Search Service with RRF & Safe Fallbacks
const fs = require('fs');
const path = require('path');
const { config } = require('../backend/config/env');
const { getDB, isAtlasConnected } = require('./connection');
const { generateEmbedding } = require('../backend/services/embeddingService');
const { loadSnapshot } = require('./repositories/knowledgeRepository');
const { extractQueryKeywords, isHistoricalQuery, rerankCandidates } = require('../backend/services/rerankingService');
const logger = require('../backend/utils/logger');

const SYNONYM_EXPANSIONS = {
    accommodation: ['hostel', 'residential', 'room', 'mess', 'warden'],
    join: ['admission', 'apply', 'procedure', 'eligibility'],
    apply: ['admission', 'counselling', 'tnea', 'tanca', 'procedure'],
    fee: ['fees', 'tuition', 'concession', 'scholarship', 'payment'],
    fees: ['fee', 'tuition', 'concession', 'scholarship', 'payment'],
    syllabus: ['curriculum', 'programme', 'courses', 'credits'],
    exam: ['examination', 'coe', 'autonomous', 'revaluation', 'hall', 'timetable'],
    exams: ['examination', 'coe', 'autonomous', 'revaluation'],
    principal: ['thilagavathi', 'head', 'administration'],
    damodaran: ['principal', 'founders', 'library'],
    located: ['contact', 'cont', 'location', 'address', 'peelamedu', 'avinashi', 'coimbatore'],
    contact: ['cont', 'email', 'phone', 'address', 'reception', 'helpline'],
    location: ['contact', 'cont', 'address', 'peelamedu', 'avinashi'],
    governing: ['management', 'council', 'trustees'],
    naac: ['nba', 'accreditation', 'quality'],
    tancet: ['mca', 'mba', 'admission', 'tanca'],
    ceeta: ['admission', 'tanca', 'gate', 'me', 'mtech'],
    hod: ['head', 'departments', 'heads'],
    hods: ['head', 'departments', 'heads'],
    staff: ['faculty', 'professor', 'lecturer', 'department'],
    faculty: ['staff', 'professor', 'department'],
    hostel: ['accommodation', 'mess', 'warden', 'curfew', 'residential'],
    evlo: ['fee', 'fees', 'amount', 'cost'],
    enna: ['what', 'details', 'rules'],
    epdi: ['how', 'procedure', 'apply']
};

let localChunksCache = null;

function cosineSimilarity(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || a.length !== b.length) {
        return 0;
    }
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
}

function getLocalChunks() {
    if (!localChunksCache) {
        const cacheFile = path.resolve(__dirname, './data/knowledge_chunks.json');
        if (fs.existsSync(cacheFile)) {
            try {
                const parsed = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                if (Array.isArray(parsed)) {
                    localChunksCache = parsed.map((c, idx) => ({
                        chunkId: c.chunkId || c._id || `legacy-${idx}`,
                        documentId: c.documentId || `legacy-doc-${idx}`,
                        title: c.title || 'PSG Tech Info',
                        sourceUrl: c.sourceUrl || c.url || '/',
                        url: c.sourceUrl || c.url || '/',
                        sourceType: c.sourceType || 'html',
                        category: c.category || null,
                        department: c.department || null,
                        academicYear: c.academicYear || null,
                        language: c.language || 'en',
                        authority: c.authority || (c.isCore ? 'curated_reference' : 'official_portal'),
                        isHistorical: Boolean(c.isHistorical),
                        status: c.status || 'active',
                        content: c.content || '',
                        chunkIndex: c.chunkIndex ?? idx,
                        embedding: c.embedding
                    }));
                }
            } catch (err) {
                logger.warn('Failed reading local knowledge_chunks.json', { error: err });
            }
        }
    }
    return localChunksCache || [];
}

function resetLocalCache() {
    localChunksCache = null;
}

function expandKeywords(query) {
    const base = extractQueryKeywords(query);
    const expanded = new Set(base);
    for (const term of base) {
        const syns = SYNONYM_EXPANSIONS[term];
        if (syns) syns.forEach((s) => expanded.add(s));
    }
    return [...expanded];
}

function matchesMetadataFilters(chunk, filters = {}) {
    if (!chunk) return false;
    if (chunk.status && chunk.status !== 'active' && chunk.status !== 'historical') return false;
    if (filters.category && chunk.category && chunk.category !== filters.category) return false;
    if (filters.department && chunk.department && chunk.department.toLowerCase() !== String(filters.department).toLowerCase()) return false;
    if (filters.academicYear && chunk.academicYear && chunk.academicYear !== filters.academicYear) return false;
    if (filters.sourceType && chunk.sourceType && chunk.sourceType !== filters.sourceType) return false;
    if (filters.language && chunk.language && chunk.language !== filters.language) return false;
    if (filters.authority && chunk.authority && chunk.authority !== filters.authority) return false;
    return true;
}

function normalizeCandidate(doc, sourceOrigin) {
    const rawUrl = String(doc.sourceUrl || doc.url || '/').trim();
    const sourceUrl = rawUrl.length > 1 && rawUrl.startsWith('/') ? rawUrl.replace(/\/+$/, '') : rawUrl;
    return {
        chunkId: doc.chunkId || doc._id?.toString() || `${sourceUrl}:${doc.chunkIndex ?? 0}`,
        documentId: doc.documentId || null,
        title: doc.title || 'PSG College of Technology',
        content: doc.content || '',
        sourceUrl,
        url: sourceUrl,
        sourceType: doc.sourceType || 'html',
        category: doc.category || null,
        department: doc.department || null,
        academicYear: doc.academicYear || null,
        publishedAt: doc.publishedAt || null,
        effectiveFrom: doc.effectiveFrom || null,
        effectiveTo: doc.effectiveTo || null,
        pageNumber: doc.pageNumber ?? null,
        sectionHeading: doc.sectionHeading || null,
        language: doc.language || 'en',
        authority: doc.authority || 'official_portal',
        isHistorical: Boolean(doc.isHistorical),
        chunkIndex: doc.chunkIndex ?? 0,
        sourceOrigin
    };
}

function searchLexicalOverPool(query, pool, filters = {}, limit = 15) {
    const expanded = expandKeywords(query);
    const baseKeywords = extractQueryKeywords(query);
    const cleanQ = String(query || '').toLowerCase().trim();

    if (expanded.length === 0) return [];

    const filteredPool = pool.filter((raw) => matchesMetadataFilters(raw, filters));
    if (filteredPool.length === 0) return [];

    // Compute inverse document frequency (IDF) across pool so generic terms don't drown out specific entities
    const N = filteredPool.length;
    const idf = {};
    for (const kw of expanded) {
        let df = 0;
        for (const raw of filteredPool) {
            const hay = `${raw.title || ''} ${raw.sectionHeading || ''} ${raw.content || ''}`.toLowerCase();
            if (hay.includes(kw)) df++;
        }
        idf[kw] = Math.log(1 + (N - df + 0.5) / (df + 0.5));
    }

    const scored = [];
    for (const raw of filteredPool) {
        const titleLower = String(raw.title || '').toLowerCase();
        const contentLower = String(raw.content || '').toLowerCase();
        const urlLower = String(raw.sourceUrl || raw.url || '').toLowerCase();
        const headingLower = String(raw.sectionHeading || '').toLowerCase();

        let score = 0;
        for (const kw of baseKeywords) {
            const weight = Math.max(0.2, idf[kw] || 1);
            if (titleLower.includes(kw)) score += 4.0 * weight;
            if (headingLower.includes(kw)) score += 3.0 * weight;
            if (urlLower.includes(kw)) score += 2.5 * weight;
            if (contentLower.includes(kw)) score += 1.5 * weight;
        }
        for (const kw of expanded) {
            if (!baseKeywords.includes(kw)) {
                const weight = Math.max(0.2, idf[kw] || 1);
                if (titleLower.includes(kw)) score += 1.8 * weight;
                if (contentLower.includes(kw)) score += 0.8 * weight;
            }
        }

        if (cleanQ.length >= 6 && contentLower.includes(cleanQ)) {
            score += 5.0;
        }

        if (score > 0) {
            const norm = normalizeCandidate(raw, raw.sourceOrigin || 'lexical');
            norm.lexicalScore = Number(score.toFixed(4));
            scored.push(norm);
        }
    }

    scored.sort((a, b) => b.lexicalScore - a.lexicalScore);
    return scored.slice(0, limit);
}

function searchByKeywords(question, chunks = getLocalChunks(), limit = 5, filters = {}) {
    return searchLexicalOverPool(question, chunks, filters, limit).map((c) => ({
        ...c,
        score: c.lexicalScore
    }));
}

function reciprocalRankFusion(vectorCandidates, lexicalCandidates, { k = 60, vectorWeight = 1.0, lexicalWeight = 0.85 } = {}) {
    const fusedMap = new Map();

    function keyFor(c) {
        const cleanContentSig = String(c.content || '').slice(0, 120).toLowerCase().replace(/\s+/g, ' ');
        return `${c.sourceUrl}::${cleanContentSig}`;
    }

    vectorCandidates.forEach((cand, idx) => {
        const key = keyFor(cand);
        const rrf = vectorWeight / (k + idx + 1);
        fusedMap.set(key, {
            ...cand,
            vectorRank: idx + 1,
            rrfScore: rrf
        });
    });

    lexicalCandidates.forEach((cand, idx) => {
        const key = keyFor(cand);
        const rrf = lexicalWeight / (k + idx + 1);
        const existing = fusedMap.get(key);
        if (existing) {
            existing.lexicalRank = idx + 1;
            existing.lexicalScore = cand.lexicalScore;
            existing.rrfScore += rrf;
        } else {
            fusedMap.set(key, {
                ...cand,
                lexicalRank: idx + 1,
                rrfScore: rrf
            });
        }
    });

    return Array.from(fusedMap.values()).sort((a, b) => b.rrfScore - a.rrfScore);
}

async function queryAtlasVectorIndex(collection, indexName, queryEmbedding, limit) {
    return collection.aggregate([
        {
            $vectorSearch: {
                index: indexName,
                path: 'embedding',
                queryVector: queryEmbedding,
                numCandidates: Math.max(limit * 8, 80),
                limit
            }
        },
        {
            $project: {
                _id: 1,
                documentId: 1,
                chunkId: 1,
                title: 1,
                content: 1,
                url: 1,
                sourceUrl: 1,
                sourceType: 1,
                category: 1,
                department: 1,
                academicYear: 1,
                publishedAt: 1,
                effectiveFrom: 1,
                effectiveTo: 1,
                pageNumber: 1,
                sectionHeading: 1,
                language: 1,
                authority: 1,
                isHistorical: 1,
                status: 1,
                chunkIndex: 1,
                score: { $meta: 'vectorSearchScore' }
            }
        }
    ]).toArray();
}

async function loadCombinedFallbackPool() {
    const legacy = getLocalChunks();
    const snap = loadSnapshot();
    const managedActive = Array.isArray(snap?.chunks)
        ? snap.chunks.filter((c) => c.status === 'active').map((c) => ({ ...c, sourceOrigin: 'managed_snapshot' }))
        : [];

    const db = getDB();
    let dbManaged = [];
    if (db) {
        dbManaged = await db
            .collection(config.mongo.chunksCollection)
            .find({ status: 'active' })
            .limit(1000)
            .toArray()
            .catch(() => []);
    }

    return [...dbManaged, ...managedActive, ...legacy];
}

async function hybridSearch(question, options = {}) {
    const candidateLimit = options.candidateLimit || config.rag.candidateLimit;
    const finalLimit = options.limit || config.rag.finalEvidenceLimit;
    const filters = options.filters || {};
    const allowHistorical = Boolean(filters.includeHistorical) || isHistoricalQuery(question);

    let queryEmbedding = options.queryEmbedding || null;
    if (!queryEmbedding && options.skipEmbedding !== true && config.gemini.apiKey) {
        try {
            queryEmbedding = await generateEmbedding(question);
        } catch (err) {
            logger.warn('Embedding generation failed during retrieval; proceeding with lexical retrieval', { error: err });
        }
    }

    let vectorCandidates = [];
    const pool = await loadCombinedFallbackPool();

    // 1. Vector search (Atlas if connected, otherwise local cosine over active pool)
    if (queryEmbedding && isAtlasConnected()) {
        const db = getDB();
        const searches = [];

        searches.push(
            queryAtlasVectorIndex(
                db.collection(config.mongo.collection),
                config.mongo.vectorIndexName,
                queryEmbedding,
                candidateLimit
            ).catch((err) => {
                logger.debug('Atlas legacy vector search note', { error: err });
                return [];
            })
        );

        searches.push(
            queryAtlasVectorIndex(
                db.collection(config.mongo.chunksCollection),
                config.mongo.knowledgeVectorIndexName,
                queryEmbedding,
                candidateLimit
            ).catch(() => [])
        );

        const [legacyResults, managedResults] = await Promise.all(searches);
        const combinedAtlas = [...managedResults, ...legacyResults];
        vectorCandidates = combinedAtlas
            .filter((d) => matchesMetadataFilters(d, filters))
            .map((d) => {
                const cand = normalizeCandidate(d, 'atlas_vector');
                cand.vectorScore = d.score;
                return cand;
            })
            .sort((a, b) => (b.vectorScore || 0) - (a.vectorScore || 0))
            .slice(0, candidateLimit);
    }

    if (vectorCandidates.length === 0 && queryEmbedding && pool.length > 0) {
        vectorCandidates = pool
            .filter((c) => matchesMetadataFilters(c, filters) && Array.isArray(c.embedding))
            .map((c) => {
                const cand = normalizeCandidate(c, 'local_cosine');
                cand.vectorScore = Number(cosineSimilarity(queryEmbedding, c.embedding).toFixed(4));
                return cand;
            })
            .filter((c) => c.vectorScore >= 0.30)
            .sort((a, b) => b.vectorScore - a.vectorScore)
            .slice(0, candidateLimit);
    }

    // 2. Lexical search across DB + local pool
    let lexicalPool = pool;
    const db = getDB();
    if (db) {
        const keywords = extractQueryKeywords(question).slice(0, 6);
        if (keywords.length > 0) {
            const regexPattern = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
            const [dbLegacy, dbManaged] = await Promise.all([
                db.collection(config.mongo.collection)
                    .find({
                        $or: [
                            { title: { $regex: regexPattern, $options: 'i' } },
                            { content: { $regex: regexPattern, $options: 'i' } }
                        ]
                    })
                    .limit(40)
                    .toArray()
                    .catch(() => []),
                db.collection(config.mongo.chunksCollection)
                    .find({
                        status: 'active',
                        $or: [
                            { title: { $regex: regexPattern, $options: 'i' } },
                            { content: { $regex: regexPattern, $options: 'i' } }
                        ]
                    })
                    .limit(40)
                    .toArray()
                    .catch(() => [])
            ]);
            if (dbLegacy.length > 0 || dbManaged.length > 0) {
                lexicalPool = [...dbManaged, ...dbLegacy, ...pool];
            }
        }
    }

    const lexicalCandidates = searchLexicalOverPool(question, lexicalPool, filters, candidateLimit);

    // 3. Fuse rankings (RRF) & Rerank
    const fused = reciprocalRankFusion(vectorCandidates, lexicalCandidates);
    const reranked = rerankCandidates(question, fused, {
        limit: finalLimit,
        includeHistorical: allowHistorical
    });

    return {
        results: reranked,
        diagnostics: {
            vectorCount: vectorCandidates.length,
            lexicalCount: lexicalCandidates.length,
            fusedCount: fused.length,
            returnedCount: reranked.length,
            usedEmbedding: Boolean(queryEmbedding)
        }
    };
}

// Backward-compatible wrapper used by existing scripts
async function searchWebsite(question, options = {}) {
    const { results } = await hybridSearch(question, { limit: options.limit || 5, ...options });
    return results;
}

module.exports = {
    cosineSimilarity,
    getLocalChunks,
    resetLocalCache,
    expandKeywords,
    searchByKeywords,
    reciprocalRankFusion,
    hybridSearch,
    searchWebsite
};
