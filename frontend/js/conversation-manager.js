// frontend/js/conversation-manager.js - Cross-Page Session & Conversation State Manager
(function (globalScope) {
    const KEYS = {
        MESSAGES: 'psg_nexus_chat_history_v3',
        CONVERSATION_ID: 'psg_nexus_conversation_id_v1',
        IS_OPEN: 'psg_nexus_chat_is_open_v1',
        JUST_NAVIGATED: 'psg_nexus_just_navigated_v1'
    };

    function readJson(key, fallback) {
        try {
            const raw = sessionStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (_e) {
            return fallback;
        }
    }

    function writeJson(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (_e) {
            // Ignore quota issues
        }
    }

    function getConversationId() {
        try {
            return sessionStorage.getItem(KEYS.CONVERSATION_ID) || null;
        } catch (_e) {
            return null;
        }
    }

    function setConversationId(id) {
        try {
            if (id) sessionStorage.setItem(KEYS.CONVERSATION_ID, id);
            else sessionStorage.removeItem(KEYS.CONVERSATION_ID);
        } catch (_e) {
            // Ignore
        }
    }

    function getMessages() {
        const list = readJson(KEYS.MESSAGES, []);
        return Array.isArray(list) ? list : [];
    }

    function saveMessages(messages) {
        writeJson(KEYS.MESSAGES, Array.isArray(messages) ? messages.slice(-40) : []);
    }

    function isOpen() {
        try {
            return sessionStorage.getItem(KEYS.IS_OPEN) === 'true';
        } catch (_e) {
            return false;
        }
    }

    function setOpen(open) {
        try {
            sessionStorage.setItem(KEYS.IS_OPEN, open ? 'true' : 'false');
        } catch (_e) {
            // Ignore
        }
    }

    function setJustNavigated(label) {
        try {
            if (label) sessionStorage.setItem(KEYS.JUST_NAVIGATED, label);
            else sessionStorage.removeItem(KEYS.JUST_NAVIGATED);
        } catch (_e) {
            // Ignore
        }
    }

    function consumeJustNavigated() {
        try {
            const val = sessionStorage.getItem(KEYS.JUST_NAVIGATED);
            if (val) sessionStorage.removeItem(KEYS.JUST_NAVIGATED);
            return val;
        } catch (_e) {
            return null;
        }
    }

    function clearAll() {
        try {
            sessionStorage.removeItem(KEYS.MESSAGES);
            sessionStorage.removeItem(KEYS.CONVERSATION_ID);
            sessionStorage.removeItem(KEYS.JUST_NAVIGATED);
        } catch (_e) {
            // Ignore
        }
    }

    globalScope.PSGNexusState = {
        getConversationId,
        setConversationId,
        getMessages,
        saveMessages,
        isOpen,
        setOpen,
        setJustNavigated,
        consumeJustNavigated,
        clearAll
    };
})(window);
