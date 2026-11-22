// js/script.js - PSGNexus AI Client Controller

const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const fabBtn = document.getElementById('fab-btn');
const closeBtn = document.getElementById('close-btn');
const resetBtn = document.getElementById('reset-btn');
const chatWindow = document.getElementById('chat-window');

// Welcome message content
const WELCOME_MESSAGE = "Hello! I am **PSG Nexus**, your digital campus guide for PSG College of Technology. 👋\n\nHow can I help you today? You can ask about:\n* **Academic Programmes** (B.E., B.Tech, MCA, MBA, M.Sc)\n* **Admissions & Eligibility** (TNEA Code: 2006, TANCET, Lateral Entry)\n* **Placements & Top Recruiters** (Package highlights, companies)\n* **Hostels & Residential Rules** (timings, mess, warden)\n* **Academic Regulations** (75% minimum attendance rule)";

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

// Convert markdown text to clean HTML
function formatMarkdown(text) {
    if (!text || typeof text !== 'string') return '';

    let escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Markdown bold **text**
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Markdown links [text](url)
    escaped = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">$1</a>');

    // Bullet lists: lines starting with * or -
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

// Function to add a message bubble to the chat UI
function appendMessage(text, sender, sources = []) {
    if (!chatMessages) return;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    if (sender === 'bot') {
        let contentHtml = formatMarkdown(text);

        // Append clickable source badges if present
        if (sources && sources.length > 0) {
            const uniqueSources = [];
            const seen = new Set();
            for (const s of sources) {
                const key = s.title || s.url;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueSources.push(s);
                }
            }

            contentHtml += `
                <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; display: flex; flex-wrap: wrap; gap: 4px; align-items: center;">
                    <span style="font-weight: 600; color: #0066cc;">📍 Sources:</span>
                    ${uniqueSources.map(s => {
                        const targetUrl = s.url ? (s.url.startsWith('/') ? s.url.substring(1) : s.url) : '#';
                        return `<a href="${targetUrl}" target="_blank" style="background: #f1f5f9; color: #0a2c66; padding: 2px 7px; border-radius: 4px; text-decoration: none; border: 1px solid #e2e8f0; font-weight: 500; font-size: 10.5px;">${s.title}</a>`;
                    }).join(' ')}
                </div>
            `;
        }

        messageDiv.innerHTML = contentHtml;
    } else {
        messageDiv.innerText = text;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

let isSending = false;

// The main function that communicates with the backend
async function handleSend() {
    if (!chatInput || isSending) return;
    const userText = chatInput.value.trim();
    if (!userText) return;

    isSending = true;
    if (sendButton) sendButton.disabled = true;

    // Show user message in UI and clear input
    appendMessage(userText, 'user');
    chatInput.value = '';

    // Show temporary "thinking..." bubble
    const typingMessage = document.createElement('div');
    typingMessage.innerHTML = '<em>PSG Nexus is consulting campus knowledge...</em>';
    typingMessage.classList.add('message', 'bot', 'typing');
    chatMessages.appendChild(typingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const endpoints = getApiEndpoints();
    let replyText = null;
    let replySources = [];

    for (const url of endpoints) {
        try {
            console.log(`📡 Connecting to: ${url}`);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText }),
                signal: AbortSignal.timeout(30000) // 30s timeout
            });

            if (response.ok) {
                const data = await response.json();
                replyText = data.response || data.reply;
                replySources = data.sources || [];
                if (replyText) break;
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
        appendMessage(replyText, 'bot', replySources);
    } else {
        appendMessage("Sorry, I'm having trouble connecting to the campus hub server. Please ensure the backend server is running (`npm start`) on port 5000.", 'bot');
    }

    isSending = false;
    if (sendButton) sendButton.disabled = false;
    if (chatInput) chatInput.focus();
}

// Listen for Clicks or Enter Key
if (sendButton) {
    sendButton.addEventListener('click', handleSend);
}

if (chatInput) {
    chatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    });
}

if (chatForm) {
    chatForm.addEventListener('submit', function (e) {
        e.preventDefault();
        handleSend();
    });
}

// Chat Window Open / Close Window Handlers
if (fabBtn && chatWindow) {
    fabBtn.addEventListener('click', function () {
        const isHidden = chatWindow.classList.contains('chat-hidden');
        if (isHidden) {
            chatWindow.classList.remove('chat-hidden');
            chatWindow.classList.add('chat-visible');
            const dot = fabBtn.querySelector('.bg-red-500, span');
            if (dot) dot.style.display = 'none';

            // Show initial welcome message if empty
            if (chatMessages && chatMessages.children.length === 0) {
                appendMessage(WELCOME_MESSAGE, 'bot');
            }

            if (chatInput) setTimeout(() => chatInput.focus(), 300);
            if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            chatWindow.classList.remove('chat-visible');
            chatWindow.classList.add('chat-hidden');
        }
    });
}

if (closeBtn && chatWindow) {
    closeBtn.addEventListener('click', function () {
        chatWindow.classList.remove('chat-visible');
        chatWindow.classList.add('chat-hidden');
    });
}

if (resetBtn && chatMessages) {
    resetBtn.addEventListener('click', function () {
        chatMessages.innerHTML = '';
        appendMessage(WELCOME_MESSAGE, 'bot');
        if (chatInput) chatInput.focus();
    });
}

// Support Clickable Quick Chips
document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('psg-quick-chip')) {
        const chipText = e.target.getAttribute('data-chip') || e.target.innerText;
        if (chatInput) {
            chatInput.value = chipText;
            handleSend();
        }
    }
});
