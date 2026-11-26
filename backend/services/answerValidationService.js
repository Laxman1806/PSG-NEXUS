// backend/services/answerValidationService.js - Evidence Assessment, Abstention & Prompt-Injection Guard
const { extractQueryKeywords, isHistoricalQuery } = require('./rerankingService');
const { selectValidatedCitations } = require('./citationService');
const { redactString } = require('../utils/logger');

const ANSWER_STATUSES = Object.freeze([
    'VERIFIED',
    'PARTIAL',
    'INSUFFICIENT',
    'CONFLICTING',
    'OUTDATED',
    'LIVE_DATA_REQUIRED'
]);

const LIVE_QUERY_REGEX = /\b(my attendance|my marks|my result|my grade|current seat|vacant seats|available seats right now|today'?s bus|live status|my fee balance|my roll number|yesterday)\b/i;
const HIGH_SPECIFICITY_UNVERIFIABLE_REGEX = /\b(per rupee|room\s+\d+|0\.5\s*marks|exact\s+20\d{2}\s+.*(cutoff|fee))\b/i;
const PROMPT_INJECTION_REGEX = /(ignore\s+(all\s+)?(previous|above)\s+instructions|reveal\s+(your\s+)?(system\s+prompt|api\s*key|env|mongo|password)|act\s+as\s+dan|jailbreak|dump\s+database)/i;

function detectPromptInjection(text) {
    return PROMPT_INJECTION_REGEX.test(String(text || ''));
}

function detectNumericConflicts(evidence) {
    if (!Array.isArray(evidence) || evidence.length < 2) return null;
    const attendancePercents = new Set();
    const tneaCodes = new Set();

    for (const chunk of evidence.slice(0, 4)) {
        const content = String(chunk.content || '');
        if (/minimum.*attendance|required attendance/i.test(content)) {
            const matches = content.match(/\b(\d{2,3})%/g) || [];
            if (matches[0]) attendancePercents.add(matches[0]);
        }
        if (/tnea.*code|counselling code/i.test(content)) {
            const codeMatch = content.match(/\b(\d{4})\b/);
            if (codeMatch) tneaCodes.add(codeMatch[1]);
        }
    }
    if (attendancePercents.size > 1) {
        return `Retrieved documents mention differing attendance figures (${[...attendancePercents].join(' vs ')}).`;
    }
    if (tneaCodes.size > 1) {
        return `Retrieved documents mention differing counselling codes (${[...tneaCodes].join(' vs ')}).`;
    }
    return null;
}

function assessEvidence(query, evidence = []) {
    if (LIVE_QUERY_REGEX.test(String(query || ''))) {
        return {
            status: 'LIVE_DATA_REQUIRED',
            reason: 'Query requests personal or real-time live institutional data that requires authenticated portal access.',
            conflictDetails: null,
            historicalOnly: false
        };
    }

    if (!Array.isArray(evidence) || evidence.length === 0) {
        return {
            status: 'INSUFFICIENT',
            reason: 'No matching institutional evidence chunks were retrieved.',
            conflictDetails: null,
            historicalOnly: false
        };
    }

    const queryKeywords = extractQueryKeywords(query);
    const top = evidence[0];
    const maxCoverage = Math.max(...evidence.map((e) => e.coverageScore || 0), 0);
    const maxVector = Math.max(...evidence.map((e) => e.vectorScore || 0), 0);
    const maxLexical = Math.max(...evidence.map((e) => e.lexicalScore || 0), 0);

    // If query asks for hyper-specific numeric facts not present in retrieved evidence
    if (HIGH_SPECIFICITY_UNVERIFIABLE_REGEX.test(String(query || ''))) {
        const joinedEvidence = evidence.map((e) => `${e.title || ''} ${e.content || ''}`).join(' ').toLowerCase();
        const specificTokens = String(query || '').toLowerCase().match(/\b(304|0\.5|per rupee|cutoff)\b/g) || [];
        const missingSpecific = specificTokens.some((tok) => !joinedEvidence.includes(tok));
        if (missingSpecific || maxCoverage < 0.75) {
            return {
                status: 'INSUFFICIENT',
                reason: 'Exact granular figure requested is not present in available official records.',
                conflictDetails: null,
                historicalOnly: false
            };
        }
    }

    // If query has specific keywords and none match meaningfully in either vector or lexical signal
    if (queryKeywords.length > 0 && maxCoverage === 0 && maxVector < 0.50 && maxLexical < 2.0) {
        return {
            status: 'INSUFFICIENT',
            reason: 'Retrieved passages did not match the core terms of the question.',
            conflictDetails: null,
            historicalOnly: false
        };
    }

    const historicalOnly = evidence.every((e) => Boolean(e.isHistorical));
    if (historicalOnly && !isHistoricalQuery(query)) {
        return {
            status: 'OUTDATED',
            reason: 'Only historical/older documents matched this query.',
            conflictDetails: null,
            historicalOnly: true
        };
    }

    const conflictDetails = detectNumericConflicts(evidence);
    if (conflictDetails) {
        return {
            status: 'CONFLICTING',
            reason: conflictDetails,
            conflictDetails,
            historicalOnly
        };
    }

    const strongMatch = maxCoverage >= 0.5 || maxVector >= 0.72 || (top.lexicalScore || 0) >= 6;
    return {
        status: strongMatch ? 'VERIFIED' : 'PARTIAL',
        reason: strongMatch
            ? 'Supported by retrieved PSG College of Technology evidence.'
            : 'Partially supported by available campus knowledge.',
        conflictDetails: null,
        historicalOnly
    };
}

function buildAbstentionMessage(status, language = 'en') {
    if (status === 'LIVE_DATA_REQUIRED') {
        return language === 'ta'
            ? 'தனிப்பட்ட மாணவர் வருகைப்பதிவு, மதிப்பெண்கள் அல்லது நேரடி தகவல்களுக்கு PSG Tech அதிகாரப்பூர்வ போர்ட்டலில் (Parent Zone / Student Portal) உள்நுழையவும்.'
            : 'This request requires live or personal student records that are not available in public documents. Please sign in to the official **PSG Tech Student / Parent Zone** (`/parentzone.php`) or contact the respective department office.';
    }
    if (language === 'ta') {
        return 'மன்னிக்கவும், உங்கள் கேள்விக்குப் போதுமான அதிகாரப்பூர்வ தகவலை என்னால் சரிபார்க்க முடியவில்லை. தயவுசெய்து PSG College of Technology அதிகாரப்பூர்வ இணையதளம் (/cont.php) அல்லது சம்பந்தப்பட்ட துறையைத் தொடர்பு கொள்ளவும்.';
    }
    return 'I could not find verified information in the PSG College of Technology knowledge base to answer that reliably. Please refer to the official contact directory (`/cont.php`) or reach out to the relevant college office (`principal@psgtech.ac.in`).';
}

function sanitizeOutputText(text) {
    let cleaned = redactString(String(text || '').trim());
    // Strip any leaked prompt markers or raw navigation directives
    cleaned = cleaned
        .replace(/\[\[NAVIGATE:(.*?)\|(.*?)\]\]/g, '')
        .replace(/<\/?UNTRUSTED_RETRIEVED_EVIDENCE>/gi, '')
        .trim();
    return cleaned;
}

function validateGeneratedResponse({ modelOutput, evidence, preAssessment, language = 'en', query = '' }) {
    if (detectPromptInjection(query)) {
        return {
            answer: 'I can only answer verified questions about PSG College of Technology and cannot follow instructions that override system rules or expose internal configurations.',
            status: 'INSUFFICIENT',
            citations: [],
            suggestedQuestions: [
                'What academic programmes are offered at PSG Tech?',
                'How do admissions work at PSG College of Technology?'
            ]
        };
    }

    if (preAssessment.status === 'INSUFFICIENT' || preAssessment.status === 'LIVE_DATA_REQUIRED') {
        return {
            answer: buildAbstentionMessage(preAssessment.status, language),
            status: preAssessment.status,
            citations: [],
            suggestedQuestions: [
                'What are the admission procedures at PSG Tech?',
                'How can I contact PSG College of Technology?'
            ]
        };
    }

    const answerText = sanitizeOutputText(modelOutput?.answer || '');
    if (!answerText) {
        return {
            answer: buildAbstentionMessage('INSUFFICIENT', language),
            status: 'INSUFFICIENT',
            citations: [],
            suggestedQuestions: []
        };
    }

    // Respect model self-abstention if it determined evidence was insufficient
    let finalStatus = preAssessment.status;
    if (modelOutput?.status && ANSWER_STATUSES.includes(modelOutput.status)) {
        if (modelOutput.status === 'INSUFFICIENT' || modelOutput.status === 'PARTIAL' || modelOutput.status === 'CONFLICTING') {
            finalStatus = modelOutput.status;
        }
    }

    const citations = selectValidatedCitations(modelOutput?.citedIds, evidence, finalStatus);

    const suggestedQuestions = Array.isArray(modelOutput?.suggestedQuestions)
        ? modelOutput.suggestedQuestions
            .map((q) => sanitizeOutputText(q))
            .filter((q) => q.length >= 6 && q.length <= 140)
            .slice(0, 3)
        : [];

    return {
        answer: answerText,
        status: finalStatus,
        citations,
        suggestedQuestions
    };
}

module.exports = {
    ANSWER_STATUSES,
    detectPromptInjection,
    assessEvidence,
    buildAbstentionMessage,
    sanitizeOutputText,
    validateGeneratedResponse
};
