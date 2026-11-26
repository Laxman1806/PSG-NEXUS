# PSG NEXUS — Security & Privacy Architecture

## 1. Transport, Headers & Access Control
- **HTTP Headers (`helmet`):** Sets `X-Content-Type-Options`, `X-Frame-Options` / `frame-ancestors 'self'`, `object-src 'none'`, `base-uri 'self'`, and CSP rules.
- **CORS:** Explicitly restricted to `CORS_ORIGINS` (defaults to local origins rather than wildcard `*`); unauthorized browser origins receive `403 Forbidden`.
- **Rate Limiting (`express-rate-limit`):** Applies sliding-window limits per IP (`chatLimiter`, `apiLimiter`, `adminLimiter`) returning structured `429` JSON responses.
- **Payload & Input Validation (`validateRequest.js`):** Enforces `100kb` JSON limit, strict type checks (blocking MongoDB operator objects like `{ "$ne": null }`), control-character stripping, and 1500-character message bounds.
- **Path Traversal Guard (`backend/app.js`):** `resolveInsideDir()` verifies decoded request paths remain strictly within the configured web directory root.

## 2. Authentication & Session Isolation
- **Admin Routes (`/api/admin/*`):** Protected by timing-safe comparison (`crypto.timingSafeEqual`) against `ADMIN_API_KEY` (`admin` role) and `REVIEWER_API_KEY` (`reviewer` role). Fails closed (`503` if keys unset, `401` if invalid, `403` for unauthorized role actions).
- **Conversation Isolation:** Public sessions use HMAC-SHA256 signed `X-Session-Token` headers (`SESSION_SECRET`). Every conversation read/write/delete filters by `{ conversationId, ownerSessionId }`.

## 3. AI & Frontend Security
- **Prompt Injection Defense:** Retrieved documents and user text are isolated inside `<UNTRUSTED_RETRIEVED_EVIDENCE>` boundaries; high-risk override/secret-exfiltration patterns are intercepted pre-generation (`detectPromptInjection()`).
- **Log Redaction (`backend/utils/logger.js`):** Automatically scrubs Gemini keys (`AIza...`), MongoDB URIs with credentials, and Bearer tokens before writing logs.
- **SSRF Protection:** URL fetching in `extractors.js` permits only `http:`/`https:` hostnames listed in `ALLOWED_FETCH_HOSTS`.
- **Frontend XSS Safety (`frontend/js/chatbot.js`):** Renders all model responses, citations, and snippets via `document.createElement` + `textContent` (zero `innerHTML` on untrusted strings, zero inline `onclick` attributes), and validates navigation targets against `ALLOWED_ROUTES`.
