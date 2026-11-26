# PSG NEXUS — Official Website Integration Guide

This guide explains how the PSG College of Technology web team can embed the **PSG NEXUS** chatbot widget cleanly into `www.psgtech.edu` and its subdomains without duplicating large inline HTML snippets.

## 1. Required Frontend Assets (4 Static Files)
Host or serve these static assets from the PSG NEXUS origin (or CDN):
1. `/css/chatbot.css` (isolated `#psg-nexus-root` scoped styling + mobile full-screen responsive rules)
2. `/js/chat-api.js` (HTTP client + signed `X-Session-Token` management + cancellation)
3. `/js/conversation-manager.js` (cross-page `sessionStorage` conversation persistence)
4. `/js/chatbot.js` (accessible DOM widget rendering `#psg-fab-btn` and `#psg-chat-window`)

## 2. Minimal Page Embed Snippet
Include the following in the shared site layout template before `</body>`:

```html
<link rel="stylesheet" href="https://assistant.psgtech.edu/css/chatbot.css">
<script>
  window.PSGNEXUS_API_BASE = "https://assistant.psgtech.edu";
</script>
<script src="https://assistant.psgtech.edu/js/chat-api.js" defer></script>
<script src="https://assistant.psgtech.edu/js/conversation-manager.js" defer></script>
<script src="https://assistant.psgtech.edu/js/chatbot.js" defer></script>
```

When the chatbot and website share the same origin, `window.PSGNEXUS_API_BASE` can be omitted.

## 3. CORS & CSP Configuration
If `www.psgtech.edu` and subdomains (`library.psgtech.ac.in`, `sports.psgtech.ac.in`, etc.) call the assistant API across origins:
- Add every approved origin to `CORS_ORIGINS` in the backend environment:
  `CORS_ORIGINS=https://www.psgtech.edu,https://library.psgtech.ac.in,https://sports.psgtech.ac.in`
- On the parent college website's Content Security Policy (`CSP`), permit:
  - `script-src`: assistant script host
  - `style-src`: assistant stylesheet host
  - `connect-src`: assistant API origin

## 4. Rollback & Versioning
- All widget markup is injected cleanly inside `#psg-nexus-root` without modifying existing college page CSS selectors or scripts.
- To disable or roll back immediately, remove or toggle the shared layout template `<script>` tags—zero per-page edits are required.
