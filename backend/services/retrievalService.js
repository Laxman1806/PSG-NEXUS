// backend/services/retrievalService.js - RAG Retrieval Service & Diagnostics
const { hybridSearch } = require('../../db/searchService');
const { config } = require('../config/env');

async function retrieveEvidence(query, options = {}) {
    const limit = options.limit || config.rag.finalEvidenceLimit;
    const candidateLimit = options.candidateLimit || config.rag.candidateLimit;

    const { results, diagnostics } = await hybridSearch(query, {
        limit,
        candidateLimit,
        filters: options.filters || {},
        skipEmbedding: options.skipEmbedding,
        queryEmbedding: options.queryEmbedding
    });

    return {
        query,
        evidence: results,
        diagnostics
    };
}

module.exports = { retrieveEvidence };
