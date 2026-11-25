// js/chatbot.js - PSGNexus AI Client Controller with Persistent Cross-Page Session & User-Confirmed Navigation
(function () {
    const WELCOME_MESSAGE = `Hello! I am **PSG Nexus**, the official AI campus assistant for **PSG College of Technology**, Coimbatore. 👋

I am here to assist:
* **👨‍🏫 Staff & Faculty:** Faculty profiles and HoD directory.
* **📚 Syllabus & Courses:** B.E., B.Tech, MCA & M.Sc curriculum.
* **🎓 Admissions:** TNEA Counselling Code: 2006, cutoffs, eligibility & lateral entry.
* **💼 Placements:** CDC stats, top recruiters & average/highest packages.
* **🏢 Campus Facilities:** Hostels, mess, sports complex & GRD library.

How can I help you today? You can ask a question or tell me which page you would like to visit!`;

    const STORAGE_KEYS = {
        MESSAGES: 'psg_nexus_chat_history_v2',
        IS_OPEN: 'psg_nexus_chat_is_open',
        JUST_NAVIGATED: 'psg_nexus_just_navigated'
    };

    let chatInput, sendButton, chatMessages, chatForm, fabBtn, closeBtn, resetBtn, chatWindow;
    let conversationHistory = [];
    let isSending = false;
    window.pendingNavigation = null;

    // 1. Ensure DOM contains Chatbot Widget (self-bootstraps on any page)
    function ensureChatbotDOM() {
        if (!document.getElementById('fab-btn')) {
            const fab = document.createElement('button');
            fab.id = 'fab-btn';
            fab.title = 'Chat with PSGNexus AI';
            fab.innerHTML = `
                <svg viewBox="0 0 100 100" style="width: 34px; height: 34px; position: relative; z-index: 10;">
                    <path d="M50 5 L90 25 V50 C90 75 50 95 50 95 C50 95 10 75 10 50 V25 Z" fill="none" stroke="#ffffff" stroke-width="6" stroke-linejoin="round"/>
                    <circle cx="50" cy="45" r="15" fill="#0066cc"/>
                    <circle cx="30" cy="30" r="4" fill="#ffffff"/>
                    <circle cx="70" cy="30" r="4" fill="#ffffff"/>
                    <circle cx="50" cy="75" r="5" fill="#ffffff"/>
                    <line x1="50" y1="45" x2="30" y2="30" stroke="#ffffff" stroke-width="2"/>
                    <line x1="50" y1="45" x2="70" y2="30" stroke="#ffffff" stroke-width="2"/>
                    <line x1="50" y1="45" x2="50" y2="75" stroke="#ffffff" stroke-width="2"/>
                </svg>
                <span style="position: absolute; top: 3px; right: 3px; width: 14px; height: 14px; background: #ef4444; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 6px #ef4444;"></span>
            `;
            document.body.appendChild(fab);
        }

        if (!document.getElementById('chat-window')) {
            const win = document.createElement('div');
            win.id = 'chat-window';
            win.className = 'chat-hidden';
            win.innerHTML = `
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #06193b 0%, #0a2c66 100%); padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 42px; height: 42px; border-radius: 50%; background: white; border: 2px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; padding: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                            <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
                                <path d="M50 10 L85 25 V50 C85 75 50 90 50 90 C50 90 15 75 15 50 V25 Z" fill="none" stroke="#0a2c66" stroke-width="6"/>
                                <circle cx="50" cy="45" r="14" fill="#0066cc"/>
                                <circle cx="50" cy="72" r="5" fill="#0a2c66"/>
                            </svg>
                        </div>
                        <div>
                            <h3 style="color: white; font-weight: 700; font-size: 16px; margin: 0; line-height: 1.2; display: flex; align-items: center; gap: 6px;">
                                PSG Nexus AI
                                <span style="display: inline-block; width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 8px #22c55e;"></span>
                            </h3>
                            <p style="color: #bfdbfe; font-size: 11px; margin: 2px 0 0 0; font-weight: 500;">Campus Knowledge & Navigation Guide</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <button id="reset-btn" title="Restart Conversation" style="background: transparent; border: none; cursor: pointer; color: #bfdbfe; padding: 6px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                                <path d="M21 3v5h-5"/>
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                                <path d="M8 16H3v5"/>
                            </svg>
                        </button>
                        <button id="close-btn" title="Close Chat" style="background: transparent; border: none; cursor: pointer; color: #bfdbfe; padding: 6px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                <!-- Chat Messages Area -->
                <div id="chat-messages" class="chat-scroll" style="flex: 1; overflow-y: auto; padding: 16px; background: linear-gradient(to bottom, #ffffff, #f8fafc); display: flex; flex-direction: column; gap: 12px;">
                </div>

                <!-- Quick Prompt Chips -->
                <div style="padding: 8px 14px; background: #ffffff; border-top: 1px solid #f1f5f9; display: flex; gap: 6px; overflow-x: auto; white-space: nowrap;" class="chat-scroll">
                    <span class="psg-quick-chip" data-chip="What are the placement statistics and top recruiters?">💼 Placements</span>
                    <span class="psg-quick-chip" data-chip="How to apply for admissions, what is TNEA code and cutoff?">🎓 Admissions</span>
                    <span class="psg-quick-chip" data-chip="What are the hostel facilities, mess timings and curfew?">🏢 Hostels</span>
                    <span class="psg-quick-chip" data-chip="How can parents track student marks and attendance on Parent Zone?">👨‍👩‍👧 Parent Zone</span>
                    <span class="psg-quick-chip" data-chip="Show me faculty details and staff profiles">👨‍🏫 Faculty</span>
                    <span class="psg-quick-chip" data-chip="Show me programmes offered and syllabus">📚 Syllabus</span>
                </div>

                <!-- Input Area -->
                <div style="padding: 12px 14px; background: rgba(255,255,255,0.95); border-top: 1px solid #e2e8f0;">
                    <form id="chat-form" style="position: relative; display: flex; align-items: center; margin: 0;">
                        <input type="text" id="chat-input" placeholder="Ask about placements, hostels, admissions..." autocomplete="off"
                            style="width: 100%; border-radius: 9999px; padding: 11px 48px 11px 16px; border: 1px solid #cbd5e1; background: #f8fafc; font-size: 13.5px; outline: none; transition: all 0.2s ease;">
                        
                        <button type="submit" id="send-btn" style="position: absolute; right: 5px; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; border-radius: 50%; background: #0066cc; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,102,204,0.3);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px;"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </form>
                    <div style="font-size: 10.5px; color: #94a3b8; text-align: center; margin-top: 5px; font-weight: 500;">
                        🔒 PSGNexus AI • Connected to Campus Knowledge & Live Navigation
                    </div>
                </div>
            `;
            document.body.appendChild(win);
        }

        // Cache elements
        chatInput = document.getElementById('chat-input');
        sendButton = document.getElementById('send-btn');
        chatMessages = document.getElementById('chat-messages');
        chatForm = document.getElementById('chat-form');
        fabBtn = document.getElementById('fab-btn');
        closeBtn = document.getElementById('close-btn');
        resetBtn = document.getElementById('reset-btn');
        chatWindow = document.getElementById('chat-window');
    }

    // Determine API endpoint dynamically
    function getApiEndpoints() {
        const endpoints = [];
        if (window.location.protocol.startsWith('http')) {
            endpoints.push(`${window.location.origin}/api/chat`);
        }
        endpoints.push('http://localhost:5000/api/chat');
        endpoints.push('http://localhost:3000/api/chat');
        return [...new Set(endpoints)];
    }

    // Check if the current page already matches the target URL
    function isCurrentPage(targetUrl) {
        if (!targetUrl) return false;
        const current = window.location.pathname.toLowerCase().replace(/\/index\.(php|html)$/i, '').replace(/\/+$/, '') || '/';
        const target = targetUrl.toLowerCase().replace(/\/index\.(php|html)$/i, '').replace(/\/+$/, '') || '/';
        return current === target;
    }

    // Validate that a navigation/source URL is a safe same-origin relative path
    function normalizeSafeInternalUrl(rawUrl) {
        if (typeof rawUrl !== 'string') return null;
        let cleaned = rawUrl.trim();
        if (!cleaned) return null;
        if (!cleaned.startsWith('/')) {
            if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(cleaned)) {
                return null;
            }
            cleaned = '/' + cleaned;
        }
        if (cleaned.startsWith('//') || cleaned.includes('..') || cleaned.includes('\\') || cleaned.includes(':')) {
            return null;
        }
        return /^\/[a-zA-Z0-9\-_.\/& %]*$/.test(cleaned) ? cleaned : null;
    }

    // Escape HTML characters
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Convert markdown text to clean HTML
    function formatMarkdown(text) {
        if (!text || typeof text !== 'string') return '';

        // Strip raw [[NAVIGATE:...]] tags from text
        let cleanText = text.replace(/\[\[NAVIGATE:(.*?)\|(.*?)\]\]/g, '');

        let escaped = escapeHtml(cleanText);

        // Markdown bold **text**
        escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Markdown links [text](https://...)
        escaped = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">$1</a>');

        // Bullet lists
        const lines = escaped.split('\n');
        let inList = false;
        const processedLines = [];

        for (let line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                if (!inList) {
                    inList = true;
                    processedLines.push('<ul style="margin: 6px 0; padding-left: 20px; list-style-type: disc;">');
                }
                processedLines.push(`<li style="margin: 3px 0;">${trimmed.substring(2)}</li>`);
            } else {
                if (inList) {
                    inList = false;
                    processedLines.push('</ul>');
                }
                processedLines.push(line);
            }
        }
        if (inList) {
            processedLines.push('</ul>');
        }

        return processedLines.join('<br>').replace(/<\/ul><br>/g, '</ul>').replace(/<br><ul/g, '<ul');
    }

    // Save session history to sessionStorage
    function saveSession() {
        try {
            sessionStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(conversationHistory));
        } catch (e) {
            console.warn('Failed saving session to sessionStorage:', e);
        }
    }

    // Load session history from sessionStorage
    function loadSession() {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEYS.MESSAGES);
            if (raw) {
                const parsed = JSON.parse(raw);
                conversationHistory = Array.isArray(parsed) ? parsed : [];
            }
        } catch (e) {
            conversationHistory = [];
        }
    }

    // Global navigation confirmation triggered by button click or affirmative user text
    window.confirmNavigation = function (targetUrl, targetLabel, cardId) {
        const safeTarget = normalizeSafeInternalUrl(targetUrl);
        if (!safeTarget) {
            window.dismissNavigation(cardId);
            return;
        }

        window.pendingNavigation = null;
        const actionsElem = document.getElementById(`nav-actions-${cardId}`);
        if (actionsElem) {
            actionsElem.textContent = '';
            const statusSpan = document.createElement('span');
            statusSpan.style.cssText = 'color: #0369a1; font-weight: 600; font-size: 12.5px;';
            statusSpan.appendChild(document.createTextNode('🚀 Navigating to '));
            const labelStrong = document.createElement('strong');
            labelStrong.textContent = targetLabel || 'Campus Page';
            statusSpan.appendChild(labelStrong);
            statusSpan.appendChild(document.createTextNode('... Session will continue on that page!'));
            actionsElem.appendChild(statusSpan);
        }

        // Update stored message so card doesn't prompt again on reload
        const storedMsg = conversationHistory.find(m => m.id === cardId);
        if (storedMsg) {
            storedMsg.dismissed = true;
            storedMsg.confirmed = true;
        }

        // Save session state with chat open flag and welcome intent
        sessionStorage.setItem(STORAGE_KEYS.IS_OPEN, 'true');
        sessionStorage.setItem(STORAGE_KEYS.JUST_NAVIGATED, String(targetLabel || 'Campus Page'));
        saveSession();

        // Redirect after brief pause to show acknowledgment
        setTimeout(() => {
            window.location.href = safeTarget;
        }, 350);
    };

    // Global navigation dismissal
    window.dismissNavigation = function (cardId) {
        window.pendingNavigation = null;
        const actionsElem = document.getElementById(`nav-actions-${cardId}`);
        if (actionsElem) {
            actionsElem.textContent = '';
            const span = document.createElement('span');
            span.style.cssText = 'color: #64748b; font-size: 12px; font-style: italic;';
            span.textContent = 'Staying on current page. Feel free to ask more questions!';
            actionsElem.appendChild(span);
        }
        const storedMsg = conversationHistory.find(m => m.id === cardId);
        if (storedMsg) {
            storedMsg.dismissed = true;
        }
        saveSession();
    };

    // Build navigation confirmation card safely via DOM APIs (prevents attribute/JS XSS)
    function createNavigationCard(safeUrl, targetLabel, cardId, dismissed) {
        const card = document.createElement('div');
        card.className = 'psg-nav-card';
        card.id = `nav-card-${cardId}`;

        const header = document.createElement('div');
        header.className = 'psg-nav-header';
        const headerTitle = document.createElement('span');
        headerTitle.textContent = '🧭 Campus Navigation';
        const badge = document.createElement('span');
        badge.style.cssText = 'background: #e0f2fe; color: #0284c7; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700;';
        badge.textContent = 'CONFIRMATION';
        header.appendChild(headerTitle);
        header.appendChild(badge);

        const desc = document.createElement('div');
        desc.className = 'psg-nav-desc';
        desc.appendChild(document.createTextNode('Can I redirect you to the official '));
        const strongLabel = document.createElement('strong');
        strongLabel.textContent = targetLabel;
        desc.appendChild(strongLabel);
        desc.appendChild(document.createTextNode(' page for detailed information?'));

        const actions = document.createElement('div');
        actions.className = 'psg-nav-actions';
        actions.id = `nav-actions-${cardId}`;

        if (dismissed) {
            const handled = document.createElement('span');
            handled.style.cssText = 'color: #64748b; font-size: 12px; font-style: italic;';
            handled.textContent = 'Navigation decision handled.';
            actions.appendChild(handled);
        } else {
            const confirmBtn = document.createElement('button');
            confirmBtn.type = 'button';
            confirmBtn.className = 'psg-nav-btn psg-confirm-btn';
            confirmBtn.textContent = '👉 Yes, Redirect Me';
            confirmBtn.addEventListener('click', () => window.confirmNavigation(safeUrl, targetLabel, cardId));

            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'psg-nav-cancel';
            cancelBtn.textContent = 'No, Stay Here';
            cancelBtn.addEventListener('click', () => window.dismissNavigation(cardId));

            actions.appendChild(confirmBtn);
            actions.appendChild(cancelBtn);
        }

        card.appendChild(header);
        card.appendChild(desc);
        card.appendChild(actions);
        return card;
    }

    // Build source citation badges safely via DOM APIs
    function createSourcesBar(sources) {
        const uniqueSources = [];
        const seen = new Set();
        for (const s of sources) {
            const key = s.title || s.url;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueSources.push(s);
            }
        }

        const bar = document.createElement('div');
        bar.style.cssText = 'margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; display: flex; flex-wrap: wrap; gap: 4px; align-items: center;';

        const prefix = document.createElement('span');
        prefix.style.cssText = 'font-weight: 600; color: #0066cc;';
        prefix.textContent = '📍 Sources:';
        bar.appendChild(prefix);

        for (const s of uniqueSources) {
            const safeSourceUrl = normalizeSafeInternalUrl(s.url) || '#';
            const link = document.createElement('a');
            link.setAttribute('href', safeSourceUrl);
            link.style.cssText = 'background: #f1f5f9; color: #0a2c66; padding: 2px 7px; border-radius: 4px; text-decoration: none; border: 1px solid #e2e8f0; font-weight: 500; font-size: 10.5px;';
            link.textContent = s.title || 'Campus Page';
            bar.appendChild(link);
        }

        return bar;
    }

    // Render a message into the DOM
    function renderMessageToDOM(text, sender, sources = [], navigation = null, messageId = null, dismissed = false) {
        if (!chatMessages) return;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        if (messageId) messageDiv.id = `msg-${messageId}`;

        if (sender === 'bot') {
            const textWrapper = document.createElement('div');
            textWrapper.innerHTML = formatMarkdown(text);
            messageDiv.appendChild(textWrapper);

            // Render confirmation redirect card if navigation is valid AND user is NOT on that page
            const safeNavUrl = navigation && navigation.url ? normalizeSafeInternalUrl(navigation.url) : null;
            if (safeNavUrl && !isCurrentPage(safeNavUrl)) {
                const cardId = messageId || ('nav-' + Date.now());
                const targetLabel = navigation.label || navigation.pageTitle || 'Requested Page';

                if (!dismissed) {
                    window.pendingNavigation = { url: safeNavUrl, label: targetLabel, cardId: cardId };
                }

                messageDiv.appendChild(createNavigationCard(safeNavUrl, targetLabel, cardId, dismissed));
            }

            if (sources && sources.length > 0) {
                messageDiv.appendChild(createSourcesBar(sources));
            }
        } else {
            messageDiv.innerText = text;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Append and save a new message
    function appendMessage(text, sender, sources = [], navigation = null, skipSave = false) {
        const messageId = 'm-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        renderMessageToDOM(text, sender, sources, navigation, messageId, false);

        if (!skipSave) {
            conversationHistory.push({
                id: messageId,
                text,
                sender,
                sources: sources || [],
                navigation: navigation || null,
                dismissed: false,
                timestamp: Date.now()
            });
            saveSession();
        }
    }

    // Main send handler
    async function handleSend() {
        if (!chatInput || isSending) return;
        const userText = chatInput.value.trim();
        if (!userText) return;

        // Check for text confirmation when navigation is pending
        if (window.pendingNavigation) {
            const clean = userText.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
            const isYes = /^(yes|yeah|yep|sure|ok|okay|redirect|take me there|go ahead|take me|open page|proceed)$/i.test(clean);
            const isNo = /^(no|nope|cancel|stay|stay here|dont redirect|no thanks)$/i.test(clean);

            if (isYes) {
                const { url, label, cardId } = window.pendingNavigation;
                chatInput.value = '';
                window.confirmNavigation(url, label, cardId);
                return;
            }

            if (isNo) {
                const { cardId } = window.pendingNavigation;
                chatInput.value = '';
                appendMessage(userText, 'user');
                appendMessage("Understood! We will stay on this page. What else can I assist you with?", 'bot');
                window.dismissNavigation(cardId);
                return;
            }
        }

        isSending = true;
        if (sendButton) sendButton.disabled = true;

        // Show user message in UI and clear input
        appendMessage(userText, 'user');
        chatInput.value = '';

        // Show temporary typing indicator
        const typingMessage = document.createElement('div');
        typingMessage.innerHTML = '<em>PSG Nexus is consulting campus knowledge...</em>';
        typingMessage.classList.add('message', 'bot', 'typing');
        chatMessages.appendChild(typingMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const endpoints = getApiEndpoints();
        let replyText = null;
        let replySources = [];
        let replyNavigation = null;

        for (const url of endpoints) {
            try {
                console.log(`📡 Connecting to: ${url}`);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userText }),
                    signal: AbortSignal.timeout(30000)
                });

                if (response.ok) {
                    const data = await response.json();
                    replyText = data.response || data.reply;
                    replySources = data.sources || [];
                    replyNavigation = data.navigation || null;
                    if (replyText) break;
                } else if (response.status === 400 || response.status === 429) {
                    const data = await response.json().catch(() => null);
                    if (data && (data.response || data.reply)) {
                        replyText = data.response || data.reply;
                        break;
                    }
                }
            } catch (err) {
                console.warn(`Connection to ${url} failed:`, err.message);
            }
        }

        // Remove typing bubble
        if (typingMessage.parentNode) {
            chatMessages.removeChild(typingMessage);
        }

        if (replyText) {
            appendMessage(replyText, 'bot', replySources, replyNavigation);
        } else {
            appendMessage("Sorry, I'm having trouble connecting to the campus hub server. Please ensure the backend server is running and try again.", 'bot');
        }

        isSending = false;
        if (sendButton) sendButton.disabled = false;
        if (chatInput) chatInput.focus();
    }

    // Initialize Widget, Restore Session & Bind Events
    function initChatbot() {
        ensureChatbotDOM();

        // Restore conversation history from sessionStorage
        loadSession();

        if (conversationHistory.length > 0) {
            chatMessages.innerHTML = '';
            for (const msg of conversationHistory) {
                renderMessageToDOM(msg.text, msg.sender, msg.sources, msg.navigation, msg.id, msg.dismissed);
            }
        } else {
            appendMessage(WELCOME_MESSAGE, 'bot');
        }

        // Check if user just arrived from a confirmed navigation
        const justNavigated = sessionStorage.getItem(STORAGE_KEYS.JUST_NAVIGATED);
        if (justNavigated) {
            sessionStorage.removeItem(STORAGE_KEYS.JUST_NAVIGATED);
            appendMessage(`📍 **Welcome to the ${justNavigated} page!** Your previous conversation has been preserved. What would you like to know next?`, 'bot');
        }

        // Check and restore open/closed state
        const wasOpen = sessionStorage.getItem(STORAGE_KEYS.IS_OPEN);
        if (wasOpen === 'true') {
            chatWindow.classList.remove('chat-hidden');
            chatWindow.classList.add('chat-visible');
            const dot = fabBtn.querySelector('.bg-red-500, span');
            if (dot) dot.style.display = 'none';
            if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Event: Form submit (handles both Submit button click and Enter key cleanly)
        if (chatForm) {
            chatForm.addEventListener('submit', function (e) {
                e.preventDefault();
                handleSend();
            });
        }

        // Event: FAB Button toggle
        if (fabBtn && chatWindow) {
            fabBtn.addEventListener('click', function () {
                const isHidden = chatWindow.classList.contains('chat-hidden');
                if (isHidden) {
                    chatWindow.classList.remove('chat-hidden');
                    chatWindow.classList.add('chat-visible');
                    sessionStorage.setItem(STORAGE_KEYS.IS_OPEN, 'true');
                    const dot = fabBtn.querySelector('.bg-red-500, span');
                    if (dot) dot.style.display = 'none';

                    if (chatInput) setTimeout(() => chatInput.focus(), 300);
                    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
                } else {
                    chatWindow.classList.remove('chat-visible');
                    chatWindow.classList.add('chat-hidden');
                    sessionStorage.setItem(STORAGE_KEYS.IS_OPEN, 'false');
                }
            });
        }

        // Event: Close Button
        if (closeBtn && chatWindow) {
            closeBtn.addEventListener('click', function () {
                chatWindow.classList.remove('chat-visible');
                chatWindow.classList.add('chat-hidden');
                sessionStorage.setItem(STORAGE_KEYS.IS_OPEN, 'false');
            });
        }

        // Event: Reset Button
        if (resetBtn && chatMessages) {
            resetBtn.addEventListener('click', function () {
                conversationHistory = [];
                sessionStorage.removeItem(STORAGE_KEYS.MESSAGES);
                sessionStorage.removeItem(STORAGE_KEYS.JUST_NAVIGATED);
                window.pendingNavigation = null;
                chatMessages.innerHTML = '';
                appendMessage(WELCOME_MESSAGE, 'bot');
                if (chatInput) chatInput.focus();
            });
        }

        // Event: Quick Prompt Chips
        document.addEventListener('click', function (e) {
            if (e.target && e.target.classList.contains('psg-quick-chip')) {
                const chipText = e.target.getAttribute('data-chip') || e.target.innerText;
                if (chatInput) {
                    chatInput.value = chipText;
                    handleSend();
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
})();
