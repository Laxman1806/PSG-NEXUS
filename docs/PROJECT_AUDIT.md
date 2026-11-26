# PSG NEXUS — Phase 0 Project Audit

**Audit Date:** 2026-11-26  
**Audited Codebase:** `E:\psg_nexus\PSG-NEXUS` (Node.js `v22.17.0`, Express `^5.3.0`, MongoDB driver `^6.12.0`, `@google/generative-ai` `^0.24.1`)  
**Audit Method:** Direct inspection of source files, static asset structure, `.env` key names, Atlas search index metadata (`listSearchIndexes`), Gemini API model listing (`list-gemini-models.js`), local/Atlas collection inspection (`inspect-db.js`), and execution of existing test scripts (`test-server-routes.js`, `test-vector-search.js`, `test-chat-and-routes.js`).

---

## 1. Existing Architecture & Implementation Summary

The repository currently uses a 3-layer layout:

- **Entrypoint:** `server.js` -> `backend/server.js`, which connects to MongoDB via `db/connection.js`, counts documents in `website_chunks`, and starts `backend/app.js` on `PORT` (`5000`).
- **Backend (`backend/`):**
  - `backend/app.js` mounts `/api` routes (`backend/routes/chatRoutes.js`), subdomain static mounts (`/sports`, `/library`, etc.), a universal route resolver for `frontend/psgtech_offline_replica/www.psgtech.edu`, and injects `chatbot.css` + `chatbot.js` into HTML responses via `sendHtmlWithChatbot()`.
  - `backend/controllers/chatController.js` exposes `handleChat` (`POST /api/chat`) and `handleHealth` (`GET /api/health`).
  - `backend/services/embeddingService.js` wraps `gemini-embedding-001` (`outputDimensionality: 768`).
  - `backend/services/geminiService.js` wraps `generateContent` with `MODELS_PRIORITY` and `formatContextualFallback`.
- **Database & Retrieval (`db/`):**
  - `db/connection.js` tries `MONGO_URI || MONGODB_URI` (Atlas), falls back to `mongodb://127.0.0.1:27017/psg_chatbot`, and returns `null` if neither connects.
  - `db/searchService.js` attempts Atlas `$vectorSearch` (`vector_index`, `numCandidates: 100`, `limit: 3`), falls back to in-memory cosine similarity over `db/data/knowledge_chunks.json` (`score >= 0.35`), and falls back to keyword scoring (`searchByKeywords`).
  - `db/scripts/ingest-local-pages.js` combines 12 hardcoded `verifiedKnowledgePacks` with `.html` files from 7 hardcoded directories under `frontend/psgtech_offline_replica/`, slices to 160 chunks, generates 768d embeddings, writes `db/data/knowledge_chunks.json`, and attempts to replace `website_chunks` in MongoDB.
- **Frontend (`frontend/`):**
  - `frontend/js/chatbot.js` (duplicated identically in `frontend/js/script.js` and `frontend/psgtech_offline_replica/www.psgtech.edu/js/{chatbot,script}.js`) renders `#fab-btn` and `#chat-window`, sends `{ message }` to `POST /api/chat`, parses `navigation` and `sources`, and stores UI display history in browser `sessionStorage`.
  - `frontend/css/chatbot.css` (also duplicated in `www.psgtech.edu/css/chatbot.css`).
  - `frontend/index.html` and `frontend/psgtech_offline_replica/www.psgtech.edu/index.html` hardcode `#chat-window` markup inline and load `/js/script.js`.

---

## 2. Verification Findings on Required Specific Checks

| Audit Check | Observed Reality in Code & Runtime |
| :--- | :--- |
| **`MONGO_URI` vs `MONGODB_URI`** | `.env`, `.env.example`, `clean-database.js`, `inspect-db.js`, and `test-vector-search.js` use `MONGO_URI`. `db/connection.js` checks `MONGO_URI || MONGODB_URI`. **`db/scripts/ingest-local-pages.js` line 323 checks ONLY `process.env.MONGODB_URI`**, so `npm run crawl` silently skips MongoDB Atlas upload. Consequently, Atlas has **93** stale chunks, `knowledge_chunks.json` has **107** chunks, and local MongoDB (`sync-local-mongodb.js`) has **190** chunks. |
| **Ingestion vs Search Collection Config** | `searchService.js` reads `process.env.MONGODB_COLLECTION || "website_chunks"` and `VECTOR_INDEX_NAME || "vector_index"`. `ingest-local-pages.js` and `backend/server.js` hardcode `'website_chunks'` instead of reading centralized config. |
| **Embedding Dimensions vs Atlas Vector Index** | Inspected Atlas `vector_index` on `website_chunks`: `status: "READY"`, `numDimensions: 768`, `similarity: "cosine"`, indexed field `embedding` ONLY (no `filter` fields indexed yet). `embeddingService.js` and `ingest-local-pages.js` both request `outputDimensionality: 768` on `gemini-embedding-001`. |
| **Supported Gemini Model IDs** | Queried live Gemini API (`list-gemini-models.js`): 50 `generateContent` models exist, including `gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-3.8-flash`, `gemini-3.1-flash-lite`, `gemini-3.1-flash-lite-preview`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`. However, `backend/services/geminiService.js` repeats `"gemini-3.5-flash-lite"` twice in `MODELS_PRIORITY` when `GEMINI_MODEL=gemini-3.5-flash-lite`, while `chatController.js` health check and `.env.example` still reference `gemini-3.1-flash-lite`. |
| **Do Timeouts Cancel Model Requests?** | **No.** Both `embeddingService.js` and `geminiService.js` use `Promise.race([sdkCall, setTimeoutReject])`. Underlying HTTP calls continue running in the background after timeout instead of passing `AbortSignal` / `SingleRequestOptions.timeout` (supported by `@google/generative-ai` v0.24.1 `RequestOptions`). |
| **Navigation URL Validation** | **Partial / Unsafe.** Server `CAMPUS_PAGES` has fixed URLs, **but** `chatController.js` accepts arbitrary `[[NAVIGATE:/url\|Label]]` extracted from Gemini output (`L139-L142`) without validating against an allowlist, and `frontend/js/chatbot.js` injects `targetUrl` into `onclick="window.confirmNavigation('${targetUrl}', ...)"` (`L295`), creating an attribute/JS injection vector and open/arbitrary redirect risk. |
| **Empty Retrieval -> Unsupported Answers** | **Yes — Critical Gap.** `geminiService.js` (`L49-L81`) embeds hardcoded factual claims inside the permanent `systemPrompt` (e.g., *"8:30 PM curfews"*, *"average ₹11.5–₹12.5 LPA, highest ₹52–₹56 LPA, 300+ dream offers"*, *"195+ cutoffs"*, *"5 km from airport"*), and instructs Gemini `"Use verified institutional facts regarding PSG College of Technology"` when `context` is empty! Meanwhile, Atlas `$vectorSearch` has no minimum relevance threshold, and out-of-scope or missing-evidence queries are not constrained to abstain. |
| **Destructive Ingestion** | **Yes — Critical Risk.** `ingest-local-pages.js` line 334 executes `await col.deleteMany({})` before `insertMany(embeddedDocs)`, and line 291 silently truncates at `slice(0, 160)`. Any failure during `insertMany` or empty embedding run destroys the active MongoDB collection. |
| **Health Check Accuracy** | **Misleading.** `chatController.js` `handleHealth()` (`L175-L187`) returns static strings (`knowledgeBase: 'verified chunks with 768d embeddings'`) without verifying DB ping, collection count, vector index readiness, or Gemini availability, and reports `local-semantic-cache-mode` if `connectDB()` wasn't called (e.g. direct app import in tests). |
| **Frontend History Sent to Backend?** | **No.** `chatbot.js` (`L412`) only sends `{ message: userText }`. `conversationHistory` is stored only in browser `sessionStorage` for visual re-rendering across redirects, so follow-up questions have zero conversational context on the server. |

---

## 3. Comprehensive Issue Register

| ID | Severity | Category | Issue & Evidence | Files Affected | Recommended Change |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AUD-01** | **Critical** | AI Accuracy / Prompt | Permanent `systemPrompt` hardcodes unverified/ungrounded numbers (packages, cutoffs, curfew timings, distances) and allows Gemini to answer without evidence when `context` is empty. | `backend/services/geminiService.js` | Remove factual claims from system prompt; enforce strict evidence-only grounding, confidence/status classification (`VERIFIED`/`PARTIAL`/`INSUFFICIENT`/`CONFLICTING`/`OUTDATED`/`LIVE_DATA_REQUIRED`), and explicit abstention. |
| **AUD-02** | **Critical** | Data Integrity / Ingestion | `ingest-local-pages.js` uses `MONGODB_URI` instead of `MONGO_URI`, caps at 160 chunks, wipes active DB via `deleteMany({})` before `insertMany()`, ignores 18+ replica folders and all 11 PDFs, and fails to strip `.tg-ticker` / header news noise (polluting every page with *"News: Registration for Redo Courses..."*). | `db/scripts/ingest-local-pages.js` | Build safe staging + versioned activation ingestion supporting HTML (`#tg-main` aware), PDF, DOCX, TXT, dry-run mode, content hashing, and zero automatic deletion of active collections. |
| **AUD-03** | **Critical** | Security / XSS & Navigation | Inline `onclick` interpolation in `chatbot.js`, unvalidated `[[NAVIGATE:...]]` URLs from LLM output, open CORS (`cors()`), no rate limiting, no `helmet`, no request body/size validation, no admin auth, and `path.join(dir, cleanPath)` lacks explicit root-containment verification. | `frontend/js/chatbot.js`, `backend/controllers/chatController.js`, `backend/app.js` | Add `helmet`, restricted `CORS_ORIGINS`, `express-rate-limit`, strict request validation, path containment check, allowlisted navigation validation, safe DOM APIs (no inline `onclick`), and prompt-injection hardening. |
| **AUD-04** | **High** | Frontend Integration Bug | Subdomain `express.static` mounts (`/sports`, `/library`, etc.) serve `index.html` before `app.get(prefix)` and bypass `sendHtmlWithChatbot()`. Also `!html.includes('script.js')` matches `css/megamenu-depent/script.js` on `/library` and `/platinum`. Verified `GET /sports` and `GET /library` lack chatbot JS/CSS completely. | `backend/app.js` | Disable `index` on static subdomain middleware or serve HTML via `sendHtmlWithChatbot()` consistently; check specifically for `chatbot.js` / `id="psg-nexus-root"` rather than substring `'script.js'`. |
| **AUD-05** | **High** | Duplication & Drift | 4 identical copies of chatbot JS (`frontend/js/chatbot.js`, `frontend/js/script.js`, `www.psgtech.edu/js/{chatbot,script}.js`), 2 copies of `chatbot.css`, plus hardcoded `#chat-window` in `index.html` with mismatched chips/placeholders. `primaryWebDir` serves replica copies ahead of `frontend/`. | `frontend/js/*`, `frontend/css/*`, `frontend/index.html`, `backend/app.js` | Maintain a single canonical frontend asset set in `frontend/js/` and `frontend/css/`, serve `/js/chatbot*` and `/css/chatbot.css` with priority before replica static assets, and inject cleanly via external bundle. |
| **AUD-06** | **High** | RAG Retrieval Quality | Atlas `vector_index` lacks filter fields; Atlas results have no score floor or hybrid lexical fusion; local fallback fails when `db` is local MongoDB (`$vectorSearch` throws every query) or if `chunk.embedding` is missing; `test-vector-search.js` missed `principal.php` on `"Who is the Principal?"` due to ticker pollution and missing keyword/hybrid matching. | `db/searchService.js`, `db/connection.js` | Implement hybrid retrieval (vector + lexical/BM25-style keyword + metadata filtering + RRF + reranking), clean HTML extraction, and track `isAtlas` properly in `connection.js`. |
| **AUD-07** | **High** | Conversation & Intent | Stateless `POST /api/chat` drops conversation context; `resolveNavigationIntent` uses substring `includes()` (`study`, `book`, `about`, `job`) causing every factual question to trigger a redirect prompt. | `backend/controllers/chatController.js`, `frontend/js/chatbot.js` | Build server-side conversation persistence (`conversations` repository), bounded history, follow-up query rewriting, and separate explicit navigation intent from Q&A intents. |
| **AUD-08** | **High** | Reliability / Timeouts | `Promise.race` timeouts do not abort Gemini HTTP calls; no retry jitter; no concurrency control; `backend/app.js` used in tests/serverless skips `connectDB()`; `handleHealth()` does not check DB/model readiness. | `backend/services/geminiService.js`, `backend/services/embeddingService.js`, `backend/server.js`, `backend/controllers/chatController.js` | Use centralized `env.js` & `modelConfig.js`, pass `AbortController` `signal` & `timeout` to SDK `RequestOptions`, implement backoff with jitter, graceful shutdown, and `/api/health` + `/api/ready`. |
| **AUD-09** | **Medium** | Multilingual & UX | No Tamil/Tanglish query detection or cross-lingual retrieval strategy; no copy button, feedback API, expandable source previews, retry button, or mobile full-screen responsive drawer; keyboard/ARIA attributes incomplete. | `frontend/js/chatbot.js`, `frontend/css/chatbot.css`, `backend/services/*` | Add language detection + bilingual query rewriting (Tamil/Tanglish/English), accessible responsive institutional UI, feedback & follow-up chips. |
| **AUD-10** | **Medium** | Admin & Operations | No document upload/approval workflow, no retrieval inspector, no analytics tracking, no feedback storage, no real test runner (`package.json` has no `test` script; existing scripts have few assertions and make live LLM calls), unused `axios` and `mongoose` dependencies in `package.json`. | `package.json`, `backend/`, `tests/`, `docs/` | Remove unused dependencies, add protected Admin APIs & dashboard, build unit/integration/security/RAG/E2E test suite with `npm test`, and complete `docs/`. |

---

## 4. Dependencies & Risks

- **External Dependencies Required for Full Production Verification:**
  - `GEMINI_API_KEY`: Verified active in `.env` (`50` models accessible).
  - `MONGO_URI`: Verified active Atlas cluster (`psg_chatbot`, existing `website_chunks` has `93` docs and `vector_index` `READY`).
  - **Constraint on Atlas Vector Index:** Updating the Atlas Search index definition (`knowledge_chunks` or adding filter fields on `website_chunks`) may require Atlas UI/CLI permissions if the DB user lacks `createSearchIndex` privileges—code must handle both indexed and non-indexed filter fallback gracefully.
  - **Existing Data Protection Risk:** Live `website_chunks` (`93` docs on Atlas) must never be cleared by tests or automated runs; new versioned collections (`knowledge_documents`, `knowledge_chunks`, `knowledge_chunks_staging`, `ingestion_runs`) will isolate new ingestion safely.
  - **Git Safety:** Working tree has prior uncommitted modifications; no `git push` or destructive git operations will be executed.
