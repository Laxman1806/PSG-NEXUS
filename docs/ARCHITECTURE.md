# PSG NEXUS — System Architecture

## 1. High-Level Request Flow

```text
Browser (chatbot.js / chat-api.js)
   │  POST /api/chat  (X-Session-Token, { message, conversationId })
   ▼
Express Pipeline (backend/app.js)
   ├── requestIdMiddleware (X-Request-Id)
   ├── helmet (CSP & security headers) + strict CORS
   ├── express.json (100kb limit)
   ├── chatLimiter (rate limiting)
   ├── resolvePublicSession (HMAC-SHA256 signed session verification)
   └── validateChatRequest (type, length <= 1500 chars, sanitization)
   ▼
Chat Orchestrator (backend/services/chatOrchestrator.js)
   ├── 1. detectPromptInjection() -> immediate safe refusal
   ├── 2. detectLanguage() + expandMultilingualQuery() -> en | ta | tanglish
   ├── 3. classifyIntent() -> GREETING | OUT_OF_SCOPE | HUMAN_SUPPORT | Q&A | NAV
   ├── 4. conversationService -> load session-owned conversation
   ├── 5. rewriteFollowUpQuery() -> resolve contextual references
   ├── 6. publicQueryCache -> TTL cache check (non-followup public queries only)
   ├── 7. retrieveEvidence() -> Atlas $vectorSearch + IDF lexical + RRF + rerank
   ├── 8. assessEvidence() -> VERIFIED | PARTIAL | INSUFFICIENT | CONFLICTING | OUTDATED | LIVE_DATA_REQUIRED
   ├── 9. generateGroundedAnswer() -> Gemini JSON generation + backoff + fallback
   ├── 10. validateGeneratedResponse() & selectValidatedCitations()
   ├── 11. resolveNavigationForIntent() -> allowlisted internal URLs only
   └── 12. conversationService.recordTurn() + logChatMetric()
```

## 2. Layer Responsibilities

- **Presentation (`frontend/`):** Modular vanilla JS (`chat-api.js`, `conversation-manager.js`, `chatbot.js`) injected via Express middleware across `/` and subdomain routes (`/sports`, `/library`, etc.).
- **API & Middleware (`backend/`):** Thin HTTP controllers (`chatController.js`, `conversationController.js`, `feedbackController.js`, `documentController.js`) delegating business logic to services and validation/auth to middleware.
- **Data & Ingestion (`db/`):** Connection pool (`connection.js`), hybrid search (`searchService.js`), schemas (`knowledgeSchemas.js`), repositories (`knowledgeRepository.js`, `conversationRepository.js`, `feedbackRepository.js`), and multi-format incremental ingestion (`db/ingestion/`).

## 3. Resilience & Graceful Degradation

- **Database pool:** Tries MongoDB Atlas -> falls back to local MongoDB (`127.0.0.1:27017`) -> falls back to local pre-embedded `db/data/knowledge_chunks.json` + managed snapshot.
- **Gemini execution:** Uses `AbortController` + `SingleRequestOptions.timeout` + semaphore concurrency limit (`GEMINI_MAX_CONCURRENCY`) + model fallback across deduplicated `CHAT_MODEL_PRIORITY` + extractive context fallback if all remote models fail.
- **Shutdown:** `backend/server.js` handles `SIGINT` / `SIGTERM` by closing the HTTP listener and MongoDB connection pool.
