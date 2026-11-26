// frontend/js/chat-api.js - Secure API Client with Session Token & Cancellation Support
(function (globalScope) {
    const TOKEN_KEY = 'psg_nexus_session_token_v1';

    function getSessionToken() {
        try {
            return sessionStorage.getItem(TOKEN_KEY) || '';
        } catch (_e) {
            return '';
        }
    }

    function setSessionToken(token) {
        if (!token) return;
        try {
            sessionStorage.setItem(TOKEN_KEY, token);
        } catch (_e) {
            // Ignore storage quota errors
        }
    }

    function buildHeaders(extra = {}) {
        const headers = { 'Content-Type': 'application/json', ...extra };
        const token = getSessionToken();
        if (token) headers['X-Session-Token'] = token;
        return headers;
    }

    function captureSessionHeader(response) {
        const nextToken = response.headers.get('X-Session-Token');
        if (nextToken) setSessionToken(nextToken);
    }

    function getApiBase() {
        if (window.PSGNEXUS_API_BASE) return window.PSGNEXUS_API_BASE.replace(/\/+$/, '');
        if (window.location.protocol.startsWith('http')) {
            return window.location.origin;
        }
        return 'http://localhost:5000';
    }

    async function sendChatMessage({ message, conversationId = null, signal = null }) {
        const url = `${getApiBase()}/api/chat`;
        const response = await fetch(url, {
            method: 'POST',
            headers: buildHeaders(),
            body: JSON.stringify({ message, conversationId }),
            signal
        });
        captureSessionHeader(response);
        const data = await response.json();
        if (!response.ok) {
            const msg = data?.error?.message || data?.reply || `Server returned HTTP ${response.status}`;
            throw new Error(msg);
        }
        return data;
    }

    async function createConversation(title = 'New Conversation') {
        const url = `${getApiBase()}/api/conversations`;
        const response = await fetch(url, {
            method: 'POST',
            headers: buildHeaders(),
            body: JSON.stringify({ title })
        });
        captureSessionHeader(response);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    async function deleteConversation(conversationId) {
        if (!conversationId) return;
        const url = `${getApiBase()}/api/conversations/${encodeURIComponent(conversationId)}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: buildHeaders()
        });
        captureSessionHeader(response);
    }

    async function submitFeedback({ conversationId, messageId, rating, query, comment = '' }) {
        const url = `${getApiBase()}/api/feedback`;
        const response = await fetch(url, {
            method: 'POST',
            headers: buildHeaders(),
            body: JSON.stringify({ conversationId, messageId, rating, query, comment })
        });
        captureSessionHeader(response);
        return response.ok;
    }

    globalScope.PSGNexusAPI = {
        sendChatMessage,
        createConversation,
        deleteConversation,
        submitFeedback,
        getApiBase
    };
})(window);
