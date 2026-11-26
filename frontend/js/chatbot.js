// frontend/js/chatbot.js - Institutional AI Assistant UI (Safe DOM Rendering, Accessible, Mobile-Ready)
(function () {
    // ── SVG Assets ────────────────────────────────────────────────────────
    const ROBOT_SVG_HEADER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30" aria-hidden="true">
        <!-- Antenna -->
        <line x1="24" y1="6" x2="24" y2="11" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/>
        <circle cx="24" cy="5" r="2.5" fill="#38bdf8" class="psg-robot-eye-glow"/>
        <!-- Head -->
        <rect x="11" y="11" width="26" height="20" rx="5" fill="#1e3a8a"/>
        <rect x="12" y="12" width="24" height="18" rx="4" fill="#2563eb" opacity="0.3"/>
        <!-- Eyes -->
        <g class="psg-robot-eye">
            <circle cx="19" cy="20" r="4" fill="#0f172a"/>
            <circle cx="29" cy="20" r="4" fill="#0f172a"/>
            <circle cx="19" cy="20" r="2.2" fill="#38bdf8" class="psg-robot-eye-glow"/>
            <circle cx="29" cy="20" r="2.2" fill="#38bdf8" class="psg-robot-eye-glow"/>
            <circle cx="20.2" cy="19" r="0.8" fill="#fff" opacity="0.9"/>
            <circle cx="30.2" cy="19" r="0.8" fill="#fff" opacity="0.9"/>
        </g>
        <!-- Mouth -->
        <rect x="17" y="27" width="14" height="2" rx="1" fill="#38bdf8" opacity="0.8"/>
        <rect x="19" y="27" width="2" height="2" rx="0.5" fill="#93c5fd"/>
        <rect x="23" y="27" width="2" height="2" rx="0.5" fill="#93c5fd"/>
        <rect x="27" y="27" width="2" height="2" rx="0.5" fill="#93c5fd"/>
        <!-- Body -->
        <rect x="13" y="32" width="22" height="11" rx="4" fill="#1e3a8a"/>
        <rect x="17" y="35" width="6" height="4" rx="2" fill="#38bdf8" opacity="0.6"/>
        <rect x="25" y="35" width="6" height="4" rx="2" fill="#38bdf8" opacity="0.6"/>
        <!-- Arms -->
        <rect x="6" y="33" width="6" height="8" rx="3" fill="#1e3a8a"/>
        <rect x="36" y="33" width="6" height="8" rx="3" fill="#1e3a8a"/>
        <!-- Legs -->
        <rect x="16" y="43" width="6" height="4" rx="2" fill="#0a2c66"/>
        <rect x="26" y="43" width="6" height="4" rx="2" fill="#0a2c66"/>
    </svg>`;

    const ROBOT_SVG_FAB = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="22" height="22" aria-hidden="true">
        <line x1="18" y1="3" x2="18" y2="8" stroke="#bfdbfe" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="18" cy="2.5" r="2" fill="#38bdf8"/>
        <rect x="7" y="8" width="22" height="16" rx="4" fill="rgba(255,255,255,0.9)"/>
        <circle cx="14" cy="15" r="3" fill="#0a2c66"/>
        <circle cx="22" cy="15" r="3" fill="#0a2c66"/>
        <circle cx="14" cy="15" r="1.5" fill="#38bdf8"/>
        <circle cx="22" cy="15" r="1.5" fill="#38bdf8"/>
        <rect x="12" y="21" width="12" height="1.5" rx="0.75" fill="#bfdbfe" opacity="0.8"/>
        <rect x="9" y="25" width="18" height="8" rx="3" fill="rgba(255,255,255,0.8)"/>
        <rect x="2" y="26" width="5" height="6" rx="2.5" fill="rgba(255,255,255,0.7)"/>
        <rect x="29" y="26" width="5" height="6" rx="2.5" fill="rgba(255,255,255,0.7)"/>
    </svg>`;

    const ROBOT_SVG_WELCOME = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="52" height="52" aria-hidden="true">
        <line x1="32" y1="4" x2="32" y2="11" stroke="#93c5fd" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="32" cy="3" r="3.5" fill="#38bdf8"/>
        <rect x="12" y="11" width="40" height="28" rx="7" fill="#1e3a8a"/>
        <rect x="13" y="12" width="38" height="26" rx="6" fill="#2563eb" opacity="0.25"/>
        <circle cx="23" cy="24" r="6" fill="#0f172a"/>
        <circle cx="41" cy="24" r="6" fill="#0f172a"/>
        <circle cx="23" cy="24" r="3.5" fill="#38bdf8"/>
        <circle cx="41" cy="24" r="3.5" fill="#38bdf8"/>
        <circle cx="25" cy="22" r="1.2" fill="#fff" opacity="0.9"/>
        <circle cx="43" cy="22" r="1.2" fill="#fff" opacity="0.9"/>
        <rect x="22" y="34" width="20" height="2.5" rx="1.25" fill="#38bdf8" opacity="0.7"/>
        <rect x="26" y="34" width="3" height="2.5" rx="0.75" fill="#93c5fd"/>
        <rect x="31" y="34" width="3" height="2.5" rx="0.75" fill="#93c5fd"/>
        <rect x="36" y="34" width="3" height="2.5" rx="0.75" fill="#93c5fd"/>
        <rect x="16" y="40" width="32" height="16" rx="6" fill="#1e3a8a"/>
        <rect x="22" y="46" width="8" height="5" rx="2.5" fill="#38bdf8" opacity="0.5"/>
        <rect x="34" y="46" width="8" height="5" rx="2.5" fill="#38bdf8" opacity="0.5"/>
        <rect x="7" y="41" width="8" height="12" rx="4" fill="#1e3a8a"/>
        <rect x="49" y="41" width="8" height="12" rx="4" fill="#1e3a8a"/>
        <rect x="20" y="56" width="10" height="6" rx="3" fill="#0a2c66"/>
        <rect x="34" y="56" width="10" height="6" rx="3" fill="#0a2c66"/>
    </svg>`;

    const WELCOME_MESSAGE =
        "Hello! I'm **PSG NEXUS**, your AI campus assistant for **PSG College of Technology**. I can help you explore academic programmes, admissions, departments, placements, campus facilities and official college information.";

    const ALLOWED_ROUTES = new Set([
        '/', '/facultyDetails.php', '/Heads.php', '/programme.php', '/programme_offered.php',
        '/admission.php', '/BScMScAdmission2026', '/fn_oci', '/placements', '/hostel',
        '/scholarships.php', '/coe.php', '/student.php', '/parentzone.php', '/cont.php',
        '/abtcllg.php', '/principal.php', '/nirf.php', '/R&D.php', '/sports', '/library',
        '/thebridge', '/academicschedule', '/iipc', '/platinum', '/alumni', '/enquiry'
    ]);

    const QUICK_CATEGORIES = [
        { label: 'Admissions', prompt: 'How do admissions work at PSG Tech? Share eligibility and TNEA/TANCA routes.' },
        { label: 'Programmes', prompt: 'What undergraduate and postgraduate academic programmes are offered?' },
        { label: 'Departments', prompt: 'Which academic departments exist at PSG Tech?' },
        { label: 'Faculty', prompt: 'Where can I find department-wise faculty details and HoDs?' },
        { label: 'Placements', prompt: 'Share verified details about placements and Career Development Centre.' },
        { label: 'Hostel', prompt: 'What are the hostel facilities and rules at PSG Tech?' },
        { label: 'Scholarships', prompt: 'What scholarships and fee concessions are available?' },
        { label: 'Examinations', prompt: 'What are the CoE examination and minimum attendance rules?' },
        { label: 'Campus Facilities', prompt: 'Tell me about library, sports, and campus facilities.' },
        { label: 'College Notices', prompt: 'Take me to official college portals and announcements.' }
    ];

    let elements = {};
    let messages = [];
    let pendingNav = null;
    let activeAbortController = null;
    let lastFailedQuery = null;

    function getState() {
        return window.PSGNexusState || {
            getConversationId: () => null,
            setConversationId: () => {},
            getMessages: () => [],
            saveMessages: () => {},
            isOpen: () => false,
            setOpen: () => {},
            setJustNavigated: () => {},
            consumeJustNavigated: () => null,
            clearAll: () => {}
        };
    }

    function getApi() {
        if (window.PSGNexusAPI) return window.PSGNexusAPI;
        return {
            sendChatMessage: async ({ message, conversationId, signal }) => {
                const res = await fetch(`${window.location.origin}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, conversationId }),
                    signal
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
                return data;
            },
            deleteConversation: async () => {},
            submitFeedback: async () => false
        };
    }

    function isSafeInternalRoute(url) {
        if (!url || typeof url !== 'string') return false;
        const clean = url.trim();
        return ALLOWED_ROUTES.has(clean);
    }

    function isSafeCitationUrl(url) {
        if (!url || typeof url !== 'string') return false;
        const clean = url.trim();
        if (clean.startsWith('/')) return true;
        try {
            const parsed = new URL(clean);
            return parsed.protocol === 'https:' || parsed.protocol === 'http:';
        } catch (_e) {
            return false;
        }
    }

    function isCurrentPage(targetUrl) {
        if (!targetUrl) return false;
        const norm = (u) => u.toLowerCase().replace(/\/index\.(php|html)$/i, '').replace(/\/+$/, '') || '/';
        return norm(window.location.pathname) === norm(targetUrl);
    }

    function el(tag, className, textContent) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (textContent !== undefined && textContent !== null) node.textContent = textContent;
        return node;
    }

    // Safe inline formatting using DOM nodes (never innerHTML on model text)
    function appendInlineNodes(parent, rawText) {
        const tokenRegex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g;
        let lastIndex = 0;
        let match;

        while ((match = tokenRegex.exec(rawText)) !== null) {
            if (match.index > lastIndex) {
                parent.appendChild(document.createTextNode(rawText.slice(lastIndex, match.index)));
            }
            const token = match[0];
            if (token.startsWith('**') && token.endsWith('**')) {
                const strong = document.createElement('strong');
                strong.textContent = token.slice(2, -2);
                parent.appendChild(strong);
            } else if (token.startsWith('`') && token.endsWith('`')) {
                const code = document.createElement('code');
                code.className = 'psg-inline-code';
                code.textContent = token.slice(1, -1);
                parent.appendChild(code);
            } else if (token.startsWith('[')) {
                const m = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                if (m && isSafeCitationUrl(m[2])) {
                    const a = document.createElement('a');
                    a.href = m[2].trim();
                    a.textContent = m[1];
                    a.className = 'psg-inline-link';
                    if (m[2].startsWith('http')) {
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                    }
                    parent.appendChild(a);
                } else {
                    parent.appendChild(document.createTextNode(token));
                }
            }
            lastIndex = tokenRegex.lastIndex;
        }
        if (lastIndex < rawText.length) {
            parent.appendChild(document.createTextNode(rawText.slice(lastIndex)));
        }
    }

    function renderFormattedText(container, text) {
        const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
        let currentList = null;

        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) {
                currentList = null;
                continue;
            }

            if (line.startsWith('### ') || line.startsWith('## ')) {
                currentList = null;
                const h = el('h4', 'psg-msg-heading');
                appendInlineNodes(h, line.replace(/^#{2,3}\s+/, ''));
                container.appendChild(h);
                continue;
            }

            if (line.startsWith('* ') || line.startsWith('- ')) {
                if (!currentList) {
                    currentList = el('ul', 'psg-msg-list');
                    container.appendChild(currentList);
                }
                const li = el('li');
                appendInlineNodes(li, line.slice(2));
                currentList.appendChild(li);
                continue;
            }

            currentList = null;
            const p = el('p', 'psg-msg-paragraph');
            appendInlineNodes(p, line);
            container.appendChild(p);
        }
    }

    function createStatusBadge(status) {
        if (!status || status === 'VERIFIED') return null;
        const map = {
            PARTIAL: { text: 'Partial evidence', cls: 'psg-badge-partial' },
            INSUFFICIENT: { text: 'Unverified / No matching official record', cls: 'psg-badge-warn' },
            CONFLICTING: { text: 'Conflicting sources detected', cls: 'psg-badge-warn' },
            OUTDATED: { text: 'Historical document notice', cls: 'psg-badge-warn' },
            LIVE_DATA_REQUIRED: { text: 'Live student portal required', cls: 'psg-badge-info' }
        };
        const info = map[status];
        if (!info) return null;
        return el('div', `psg-status-badge ${info.cls}`, info.text);
    }

    function ensureWidgetDOM() {
        if (document.getElementById('psg-nexus-root')) return;

        // Clean up any legacy hardcoded markup if present
        const legacyWin = document.getElementById('chat-window');
        const legacyFab = document.getElementById('fab-btn');
        if (legacyWin) legacyWin.remove();
        if (legacyFab) legacyFab.remove();

        const root = el('div', 'psg-nexus-root');
        root.id = 'psg-nexus-root';

        // Floating Launcher
        const fab = el('button', 'psg-fab-btn');
        fab.id = 'psg-fab-btn';
        fab.type = 'button';
        fab.setAttribute('aria-label', 'Open PSG NEXUS AI Campus Assistant');
        fab.setAttribute('aria-expanded', 'false');
        fab.title = 'Ask PSG NEXUS';

        const fabRobot = el('span', 'psg-fab-robot');
        fabRobot.setAttribute('aria-hidden', 'true');
        fabRobot.innerHTML = ROBOT_SVG_FAB;
        const fabLabel = el('span', 'psg-fab-label', 'Ask PSG NEXUS');
        fab.append(fabRobot, fabLabel);

        // Chat Dialog Window
        const win = el('section', 'psg-chat-window psg-chat-hidden');
        win.id = 'psg-chat-window';
        win.setAttribute('role', 'dialog');
        win.setAttribute('aria-label', 'PSG NEXUS AI Campus Assistant');

        // Header
        const header = el('header', 'psg-chat-header');
        const brand = el('div', 'psg-brand');

        // Robot avatar
        const headerRobot = el('div', 'psg-header-robot');
        headerRobot.setAttribute('aria-hidden', 'true');
        headerRobot.innerHTML = ROBOT_SVG_HEADER;
        brand.appendChild(headerRobot);

        // Brand info
        const brandInfo = el('div', 'psg-brand-info');
        const title = el('h2', 'psg-brand-title', 'PSG NEXUS');
        const subtitle = el('p', 'psg-brand-subtitle');
        const statusDot = el('span', 'psg-status-dot');
        statusDot.setAttribute('aria-hidden', 'true');
        subtitle.appendChild(statusDot);
        subtitle.appendChild(document.createTextNode('PSG College of Technology · AI Campus Assistant'));
        brandInfo.append(title, subtitle);
        brand.appendChild(brandInfo);

        const actions = el('div', 'psg-header-actions');
        const newBtn = el('button', 'psg-icon-btn');
        newBtn.type = 'button';
        newBtn.id = 'psg-new-chat-btn';
        newBtn.title = 'Start new conversation';
        newBtn.setAttribute('aria-label', 'Start new conversation');
        newBtn.innerHTML = `<svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor" aria-hidden="true" style="display:inline;vertical-align:-2px;margin-right:4px"><path d="M10 2a8 8 0 1 1-8 8 8 8 0 0 1 8-8zm0 4a1 1 0 0 0-1 1v2H7a1 1 0 0 0 0 2h2v2a1 1 0 0 0 2 0v-2h2a1 1 0 0 0 0-2h-2V7a1 1 0 0 0-1-1z"/></svg>New`;

        const closeBtn = el('button', 'psg-icon-btn');
        closeBtn.type = 'button';
        closeBtn.id = 'psg-close-btn';
        closeBtn.title = 'Close assistant';
        closeBtn.setAttribute('aria-label', 'Close assistant');
        closeBtn.innerHTML = `<span class="psg-close-icon" aria-hidden="true">×</span>`;

        actions.append(newBtn, closeBtn);
        header.append(brand, actions);

        // Messages Container
        const messagesBox = el('div', 'psg-chat-messages');
        messagesBox.id = 'psg-chat-messages';
        messagesBox.setAttribute('aria-live', 'polite');

        // Category Quick Prompts Bar
        const chipsBar = el('div', 'psg-chips-bar');
        chipsBar.setAttribute('aria-label', 'Quick campus topics');
        for (const cat of QUICK_CATEGORIES) {
            const chip = el('button', 'psg-quick-chip', cat.label);
            chip.type = 'button';
            chip.dataset.prompt = cat.prompt;
            chipsBar.appendChild(chip);
        }

        // Input Area
        const footer = el('div', 'psg-chat-footer');
        const form = el('form', 'psg-chat-form');
        form.id = 'psg-chat-form';

        const input = el('input', 'psg-chat-input');
        input.id = 'psg-chat-input';
        input.type = 'text';
        input.maxLength = 1500;
        input.placeholder = 'Ask in English, Tamil, or Tanglish...';
        input.autocomplete = 'off';
        input.setAttribute('aria-label', 'Ask a question about PSG College of Technology');

        const sendBtn = el('button', 'psg-send-btn');
        sendBtn.id = 'psg-send-btn';
        sendBtn.type = 'submit';
        sendBtn.setAttribute('aria-label', 'Send message');
        sendBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;

        const cancelBtn = el('button', 'psg-cancel-btn psg-hidden', 'Stop');
        cancelBtn.id = 'psg-cancel-btn';
        cancelBtn.type = 'button';
        cancelBtn.setAttribute('aria-label', 'Cancel generation');

        form.append(input, sendBtn, cancelBtn);
        const disclaimer = el('div', 'psg-disclaimer', 'Grounded in retrieved PSG Tech records • Verify critical deadlines on official circulars');
        footer.append(form, disclaimer);

        win.append(header, messagesBox, chipsBar, footer);
        root.append(win, fab);
        document.body.appendChild(root);

        elements = { root, fab, win, messagesBox, form, input, sendBtn, cancelBtn, newBtn, closeBtn, chipsBar };
    }

    function renderMessageNode(msg) {
        const isWelcomeCard = msg.isWelcome && msg.sender === 'bot';
        const wrapper = el('article', `psg-message psg-message-${msg.sender}${isWelcomeCard ? ' psg-welcome-card' : ''}`);
        wrapper.dataset.messageId = msg.id;

        if (msg.sender === 'user') {
            const p = el('p', 'psg-msg-paragraph', msg.text);
            wrapper.appendChild(p);
            return wrapper;
        }

        // Welcome card gets a large robot logo
        if (isWelcomeCard) {
            const logoWrap = el('div', 'psg-welcome-logo');
            logoWrap.setAttribute('aria-hidden', 'true');
            logoWrap.innerHTML = ROBOT_SVG_WELCOME;
            wrapper.appendChild(logoWrap);
        }

        const badge = createStatusBadge(msg.status);
        if (badge) wrapper.appendChild(badge);

        const body = el('div', 'psg-msg-body');
        renderFormattedText(body, msg.text);
        wrapper.appendChild(body);

        // Navigation card (allowlisted routes only)
        if (msg.navigation && isSafeInternalRoute(msg.navigation.url) && !isCurrentPage(msg.navigation.url)) {
            const navCard = el('div', 'psg-nav-card');
            const navTitle = el('div', 'psg-nav-title', `Navigate to ${msg.navigation.label}`);
            navCard.appendChild(navTitle);

            if (msg.navHandled) {
                navCard.appendChild(el('span', 'psg-nav-status', 'Navigation handled.'));
            } else {
                pendingNav = { messageId: msg.id, url: msg.navigation.url, label: msg.navigation.label };
                const btnRow = el('div', 'psg-nav-actions');
                const goBtn = el('button', 'psg-nav-confirm', `Open ${msg.navigation.label}`);
                goBtn.type = 'button';
                goBtn.dataset.action = 'nav-confirm';
                goBtn.dataset.url = msg.navigation.url;
                goBtn.dataset.label = msg.navigation.label;
                goBtn.dataset.messageId = msg.id;

                const stayBtn = el('button', 'psg-nav-dismiss', 'Stay Here');
                stayBtn.type = 'button';
                stayBtn.dataset.action = 'nav-dismiss';
                stayBtn.dataset.messageId = msg.id;

                btnRow.append(goBtn, stayBtn);
                navCard.appendChild(btnRow);
            }
            wrapper.appendChild(navCard);
        }

        // Citations with expandable snippet previews
        if (Array.isArray(msg.citations) && msg.citations.length > 0) {
            const citesWrap = el('div', 'psg-citations');
            citesWrap.appendChild(el('div', 'psg-citations-label', 'Verified Sources'));
            for (const cite of msg.citations) {
                const item = el('details', 'psg-citation-item');
                const summary = el('summary', 'psg-citation-summary');
                const titleSpan = el('span', 'psg-citation-title', cite.title || 'Official Source');
                summary.appendChild(titleSpan);
                if (cite.page) {
                    summary.appendChild(el('span', 'psg-citation-meta', `p.${cite.page}`));
                }
                if (cite.academicYear) {
                    summary.appendChild(el('span', 'psg-citation-meta', cite.academicYear));
                }
                item.appendChild(summary);

                const detailBody = el('div', 'psg-citation-detail');
                if (cite.snippet) {
                    detailBody.appendChild(el('p', 'psg-citation-snippet', cite.snippet));
                }
                if (isSafeCitationUrl(cite.url)) {
                    const link = el('a', 'psg-citation-link', `Visit ${cite.url}`);
                    link.href = cite.url;
                    if (cite.url.startsWith('http')) {
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                    }
                    detailBody.appendChild(link);
                }
                item.appendChild(detailBody);
                citesWrap.appendChild(item);
            }
            wrapper.appendChild(citesWrap);
        }

        // Follow-up suggestions
        if (Array.isArray(msg.suggestedQuestions) && msg.suggestedQuestions.length > 0 && !msg.isWelcome) {
            const sugWrap = el('div', 'psg-suggestions');
            for (const q of msg.suggestedQuestions) {
                const sBtn = el('button', 'psg-suggestion-chip', q);
                sBtn.type = 'button';
                sBtn.dataset.prompt = q;
                sugWrap.appendChild(sBtn);
            }
            wrapper.appendChild(sugWrap);
        }

        // Message toolbar (Copy + Feedback)
        if (!msg.isWelcome && !msg.isError) {
            const toolbar = el('div', 'psg-msg-toolbar');
            const copyBtn = el('button', 'psg-tool-btn', 'Copy');
            copyBtn.type = 'button';
            copyBtn.dataset.action = 'copy';
            copyBtn.dataset.messageId = msg.id;

            const upBtn = el('button', 'psg-tool-btn', 'Helpful');
            upBtn.type = 'button';
            upBtn.dataset.action = 'feedback-up';
            upBtn.dataset.messageId = msg.id;

            const downBtn = el('button', 'psg-tool-btn', 'Needs work');
            downBtn.type = 'button';
            downBtn.dataset.action = 'feedback-down';
            downBtn.dataset.messageId = msg.id;

            toolbar.append(copyBtn, upBtn, downBtn);
            wrapper.appendChild(toolbar);
        }

        if (msg.isError) {
            const retryBtn = el('button', 'psg-retry-btn', 'Retry Question');
            retryBtn.type = 'button';
            retryBtn.dataset.action = 'retry';
            wrapper.appendChild(retryBtn);
        }

        return wrapper;
    }

    function renderAllMessages() {
        elements.messagesBox.innerHTML = '';
        for (const msg of messages) {
            elements.messagesBox.appendChild(renderMessageNode(msg));
        }
        elements.messagesBox.scrollTop = elements.messagesBox.scrollHeight;
    }

    function pushMessage(msgObj, persist = true) {
        const msg = {
            id: msgObj.id || `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: Date.now(),
            ...msgObj
        };
        messages.push(msg);
        elements.messagesBox.appendChild(renderMessageNode(msg));
        elements.messagesBox.scrollTop = elements.messagesBox.scrollHeight;
        if (persist) getState().saveMessages(messages);
        return msg;
    }

    function setOpenState(open) {
        if (open) {
            elements.win.classList.remove('psg-chat-hidden');
            elements.win.classList.add('psg-chat-visible');
            elements.fab.setAttribute('aria-expanded', 'true');
            getState().setOpen(true);
            setTimeout(() => elements.input?.focus(), 120);
        } else {
            elements.win.classList.remove('psg-chat-visible');
            elements.win.classList.add('psg-chat-hidden');
            elements.fab.setAttribute('aria-expanded', 'false');
            getState().setOpen(false);
        }
    }

    function confirmNavigation(url, label, messageId) {
        if (!isSafeInternalRoute(url)) return;
        pendingNav = null;
        const found = messages.find((m) => m.id === messageId);
        if (found) found.navHandled = true;
        getState().setOpen(true);
        getState().setJustNavigated(label);
        getState().saveMessages(messages);
        window.location.href = url;
    }

    function dismissNavigation(messageId) {
        pendingNav = null;
        const found = messages.find((m) => m.id === messageId);
        if (found) found.navHandled = true;
        getState().saveMessages(messages);
        renderAllMessages();
    }

    async function sendQuery(rawText) {
        const text = String(rawText || '').trim();
        if (!text || activeAbortController) return;

        // Handle short yes/no confirmation if a navigation prompt is pending
        if (pendingNav) {
            const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
            if (/^(yes|yeah|ok|okay|open|go ahead|redirect|take me there)$/i.test(clean)) {
                elements.input.value = '';
                confirmNavigation(pendingNav.url, pendingNav.label, pendingNav.messageId);
                return;
            }
            if (/^(no|nope|stay|stay here|cancel)$/i.test(clean)) {
                elements.input.value = '';
                const navId = pendingNav.messageId;
                pushMessage({ sender: 'user', text });
                dismissNavigation(navId);
                pushMessage({ sender: 'bot', text: 'Okay, staying on the current page. Feel free to ask anything else.' });
                return;
            }
        }

        lastFailedQuery = null;
        pushMessage({ sender: 'user', text });
        elements.input.value = '';

        const typingEl = el('div', 'psg-typing-indicator');
        const typingText = el('span', 'psg-typing-text', 'Checking PSG Tech records');
        const typingDots = el('span', 'psg-typing-dots');
        typingDots.setAttribute('aria-hidden', 'true');
        typingDots.innerHTML = '<span class="psg-typing-dot"></span><span class="psg-typing-dot"></span><span class="psg-typing-dot"></span>';
        typingEl.append(typingText, typingDots);
        elements.messagesBox.appendChild(typingEl);
        elements.messagesBox.scrollTop = elements.messagesBox.scrollHeight;

        activeAbortController = new AbortController();
        elements.sendBtn.disabled = true;
        elements.cancelBtn.classList.remove('psg-hidden');

        try {
            const state = getState();
            const data = await getApi().sendChatMessage({
                message: text,
                conversationId: state.getConversationId(),
                signal: activeAbortController.signal
            });

            if (data.conversationId) {
                state.setConversationId(data.conversationId);
            }

            if (typingEl.parentNode) typingEl.remove();

            pushMessage({
                sender: 'bot',
                text: data.answer || data.reply || data.response,
                status: data.status || 'VERIFIED',
                citations: data.citations || data.sources || [],
                suggestedQuestions: data.suggestedQuestions || [],
                navigation: data.navigation || null,
                query: text
            });
        } catch (err) {
            if (typingEl.parentNode) typingEl.remove();
            if (err.name === 'AbortError') {
                pushMessage({ sender: 'bot', text: 'Generation cancelled.', isError: false });
            } else {
                lastFailedQuery = text;
                pushMessage({
                    sender: 'bot',
                    text: `Unable to get a response right now (${err.message}).`,
                    isError: true
                });
            }
        } finally {
            activeAbortController = null;
            elements.sendBtn.disabled = false;
            elements.cancelBtn.classList.add('psg-hidden');
            elements.input?.focus();
        }
    }

    async function handleClearOrNewChat() {
        const state = getState();
        const prevId = state.getConversationId();
        if (prevId) {
            getApi().deleteConversation(prevId).catch(() => {});
        }
        state.clearAll();
        messages = [];
        pendingNav = null;
        renderAllMessages();
        pushMessage({ sender: 'bot', text: WELCOME_MESSAGE, isWelcome: true });
        elements.input?.focus();
    }

    function bindEvents() {
        elements.fab.addEventListener('click', () => {
            const isHidden = elements.win.classList.contains('psg-chat-hidden');
            setOpenState(isHidden);
        });

        elements.closeBtn.addEventListener('click', () => setOpenState(false));
        elements.newBtn.addEventListener('click', handleClearOrNewChat);

        elements.cancelBtn.addEventListener('click', () => {
            if (activeAbortController) activeAbortController.abort();
        });

        elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            sendQuery(elements.input.value);
        });

        elements.chipsBar.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-prompt]');
            if (btn) sendQuery(btn.dataset.prompt);
        });

        // Delegated message interactions (Copy, Feedback, Navigation, Retry, Suggestions)
        elements.messagesBox.addEventListener('click', async (e) => {
            const sug = e.target.closest('button[data-prompt]');
            if (sug) {
                sendQuery(sug.dataset.prompt);
                return;
            }

            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;

            if (action === 'nav-confirm') {
                confirmNavigation(btn.dataset.url, btn.dataset.label, btn.dataset.messageId);
            } else if (action === 'nav-dismiss') {
                dismissNavigation(btn.dataset.messageId);
            } else if (action === 'retry' && lastFailedQuery) {
                sendQuery(lastFailedQuery);
            } else if (action === 'copy') {
                const m = messages.find((item) => item.id === btn.dataset.messageId);
                if (m && navigator.clipboard) {
                    await navigator.clipboard.writeText(m.text).catch(() => {});
                    btn.textContent = 'Copied';
                    setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
                }
            } else if (action === 'feedback-up' || action === 'feedback-down') {
                const m = messages.find((item) => item.id === btn.dataset.messageId);
                const rating = action === 'feedback-up' ? 'up' : 'down';
                const ok = await getApi().submitFeedback({
                    conversationId: getState().getConversationId(),
                    messageId: btn.dataset.messageId,
                    rating,
                    query: m?.query || ''
                }).catch(() => false);
                btn.textContent = ok ? (rating === 'up' ? 'Thanks!' : 'Noted') : 'Error';
                btn.disabled = true;
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.win?.classList.contains('psg-chat-visible')) {
                setOpenState(false);
            }
        });
    }

    function initChatbot() {
        ensureWidgetDOM();
        bindEvents();

        const state = getState();
        messages = state.getMessages();

        if (messages.length > 0) {
            renderAllMessages();
        } else {
            pushMessage({ sender: 'bot', text: WELCOME_MESSAGE, isWelcome: true });
        }

        const navigatedTo = state.consumeJustNavigated();
        if (navigatedTo) {
            pushMessage({
                sender: 'bot',
                text: `Opened **${navigatedTo}**. Your conversation context is preserved.`
            });
        }

        if (state.isOpen()) {
            setOpenState(true);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
})();
