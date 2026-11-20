import os

chatbot_head = '''    <!-- PSG Nexus AI Chatbot Integration Styles -->
    <link rel="stylesheet" href="css/chatbot.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap">
</head>'''

chatbot_body = '''    <!-- =========================================================================
         PSGNEXUS AI CHATBOT & CAMPUS NAVIGATOR COMPONENT
         ========================================================================= -->
    <div id="chat-window" class="chat-hidden">
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
            <!-- Messages rendered dynamically -->
        </div>

        <!-- Quick Prompt Chips -->
        <div style="padding: 8px 14px; background: #ffffff; border-top: 1px solid #f1f5f9; display: flex; gap: 6px; overflow-x: auto; white-space: nowrap;" class="chat-scroll">
            <span class="psg-quick-chip" data-chip="I need to go to the page where this staff profile is available">👨‍🏫 Staff Profiles</span>
            <span class="psg-quick-chip" data-chip="I need to go to the page where syllabus is available">📚 View Syllabus</span>
            <span class="psg-quick-chip" data-chip="What are the placement statistics and top recruiters?">💼 Placements</span>
            <span class="psg-quick-chip" data-chip="How to apply for admissions, what is TNEA code and cutoff?">🎓 Admissions</span>
            <span class="psg-quick-chip" data-chip="What are the hostel facilities, mess timings and curfew?">🏢 Hostels</span>
            <span class="psg-quick-chip" data-chip="How can parents track student marks and attendance on Parent Zone?">👨‍👩‍👧 Parent Zone</span>
        </div>

        <!-- Input Area -->
        <div style="padding: 12px 14px; background: rgba(255,255,255,0.95); border-top: 1px solid #e2e8f0;">
            <form id="chat-form" style="position: relative; display: flex; align-items: center; margin: 0;">
                <input type="text" id="chat-input" placeholder="Ask a question or say 'take me to syllabus'..." autocomplete="off"
                    style="width: 100%; border-radius: 9999px; padding: 11px 48px 11px 16px; border: 1px solid #cbd5e1; background: #f8fafc; font-size: 13.5px; outline: none; transition: all 0.2s ease;">
                
                <button type="submit" id="send-btn" style="position: absolute; right: 5px; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; border-radius: 50%; background: #0066cc; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,102,204,0.3);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px;"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </form>
            <div style="font-size: 10.5px; color: #94a3b8; text-align: center; margin-top: 5px; font-weight: 500;">
                🔒 PSGNexus AI • Connected to Campus Knowledge & Live Navigation
            </div>
        </div>
    </div>

    <!-- Floating Action Button (FAB) -->
    <button id="fab-btn" title="Chat with PSGNexus AI">
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
    </button>

    <script src="js/script.js"></script>
</body></html>'''

target_file = r'E:\psg_nexus\PSG-NEXUS\frontend\psgtech_offline_replica\www.psgtech.edu\index.html'

with open(target_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Replace </head>
if '</head>' in content and 'chatbot.css' not in content:
    content = content.replace('</head>', chatbot_head, 1)

# Replace </body></html>
if 'id="chat-window"' not in content:
    if '</body></html>' in content:
        content = content.replace('</body></html>', chatbot_body, 1)
    elif '</body>' in content:
        content = content.replace('</body>', chatbot_body + '</html>', 1)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

# Also write to frontend/index.html
with open(r'E:\psg_nexus\PSG-NEXUS\frontend\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Chatbot injected successfully into index.html!')
