// backend/services/queryRewriteService.js - Bounded Conversational Follow-Up Query Rewriting

const FOLLOWUP_PRONOUN_OR_ELLIPSIS = /\b(it|its|they|them|their|those|these|that|there|this|same|above|more|details|what about|how about|and for|what else)\b/i;

function extractTopicAnchor(historyMessages = []) {
    const userTurns = historyMessages.filter((m) => m.role === 'user');
    for (let i = userTurns.length - 1; i >= 0; i--) {
        const text = String(userTurns[i].content || '').trim();
        if (text.length >= 12 && !FOLLOWUP_PRONOUN_OR_ELLIPSIS.test(text.split(/\s+/)[0])) {
            return text;
        }
    }
    return userTurns.length > 0 ? userTurns[userTurns.length - 1].content : '';
}

function rewriteFollowUpQuery(currentQuery, conversation = null) {
    const cleanCurrent = String(currentQuery || '').trim();
    if (!conversation || !Array.isArray(conversation.messages) || conversation.messages.length === 0) {
        return {
            rewrittenQuery: cleanCurrent,
            isFollowUp: false,
            contextSummary: ''
        };
    }

    const recentMessages = conversation.messages.slice(-6);
    const contextSummary = recentMessages
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${String(m.content || '').slice(0, 220)}`)
        .join('\n');

    const words = cleanCurrent.split(/\s+/).filter(Boolean);
    const looksLikeFollowUp =
        words.length <= 7 && FOLLOWUP_PRONOUN_OR_ELLIPSIS.test(cleanCurrent) ||
        /^(what about|how about|and\s+|also\s+|is there|are there|do they|does it|can i)/i.test(cleanCurrent);

    if (!looksLikeFollowUp) {
        return {
            rewrittenQuery: cleanCurrent,
            isFollowUp: false,
            contextSummary
        };
    }

    const topicAnchor = extractTopicAnchor(recentMessages);
    if (!topicAnchor) {
        return {
            rewrittenQuery: cleanCurrent,
            isFollowUp: false,
            contextSummary
        };
    }

    // Merge previous topic anchor cleanly so retrieval sees full domain context
    const rewrittenQuery = `${topicAnchor} — follow-up: ${cleanCurrent}`;
    return {
        rewrittenQuery,
        isFollowUp: true,
        topicAnchor,
        contextSummary
    };
}

module.exports = { rewriteFollowUpQuery, extractTopicAnchor };
