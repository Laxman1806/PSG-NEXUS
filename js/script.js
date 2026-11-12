// js/script.js - PSGNexus AI Client Controller

// 1. Get the HTML elements Laxman created (Update the IDs if Laxman named them differently)
const chatInput = document.getElementById('chat-input');       // The text box where user types
const sendButton = document.getElementById('send-btn');        // The send button
const chatMessages = document.getElementById('chat-messages'); // The div showing the chat bubbles
const chatForm = document.getElementById('chat-form');         // The chat form
const fabBtn = document.getElementById('fab-btn');             // The floating launcher button
const closeBtn = document.getElementById('close-btn');         // The close button
const resetBtn = document.getElementById('reset-btn');         // The reset conversation button
const chatWindow = document.getElementById('chat-window');     // The main chat window modal

// 2. Function to add a message bubble to the chat UI
function appendMessage(text, sender) {
    if (!chatMessages) return;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender); // 'user' or 'bot' class for styling
    
    // Render clean text or formatted markdown if coming from AI
    if (typeof text === 'string' && (text.includes('**') || text.includes('\n'))) {
        messageDiv.innerHTML = text
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    } else {
        messageDiv.innerText = text;
    }

    chatMessages.appendChild(messageDiv);
    
    // Auto-scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight; 
}

// 3. The main function that talks to YOUR backend
async function handleSend() {
    if (!chatInput) return;
    const userText = chatInput.value.trim();
    if (!userText) return;

    // Show user message in UI and clear input
    appendMessage(userText, 'user');
    chatInput.value = '';

    // Show a temporary "typing..." message
    const typingMessage = document.createElement('div');
    typingMessage.innerText = "PSG Nexus is thinking...";
    typingMessage.classList.add('message', 'bot', 'typing');
    chatMessages.appendChild(typingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        // Send the text to YOUR Node.js server!
        // Automatically checks port 5000, and falls back to port 3000 if needed
        let response;
        try {
            response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText }),
                signal: AbortSignal.timeout(4000)
            });
        } catch (err5000) {
            // Fallback to port 3000
            response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText }),
                signal: AbortSignal.timeout(4000)
            });
        }

        const data = await response.json();
        
        // Remove "typing..." and show the real AI response
        if (typingMessage.parentNode) {
            chatMessages.removeChild(typingMessage);
        }
        
        // Supports both data.response and data.reply
        const replyText = data.response || data.reply || "No response received from campus hub.";
        appendMessage(replyText, 'bot');

    } catch (error) {
        console.error("Error:", error);
        if (typingMessage.parentNode) {
            chatMessages.removeChild(typingMessage);
        }
        appendMessage("Sorry, I'm having trouble connecting to the campus hub.", 'bot');
    }
}

// 4. Listen for Clicks or Enter Key
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

// 5. Chat Window Open / Close Window Handlers
if (fabBtn && chatWindow) {
    fabBtn.addEventListener('click', function () {
        const isHidden = chatWindow.classList.contains('chat-hidden');
        if (isHidden) {
            chatWindow.classList.remove('chat-hidden');
            chatWindow.classList.add('chat-visible');
            const dot = fabBtn.querySelector('.bg-red-500, span');
            if (dot) dot.style.display = 'none';
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
        appendMessage("Hi! I'm the PSGNexus AI. 👋\n\nI can help you with admissions, placements, syllabus, hostel rules, fees, and campus navigation. What do you need?", 'bot');
    });
}

// 6. Support Clickable Quick Chips
document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('psg-quick-chip')) {
        const chipText = e.target.getAttribute('data-chip') || e.target.innerText;
        if (chatInput) {
            chatInput.value = chipText;
            handleSend();
        }
    }
});
