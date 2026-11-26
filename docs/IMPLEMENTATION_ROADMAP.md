# PSG NEXUS — Implementation Roadmap

This roadmap tracks the incremental transformation of **PSG NEXUS** from an experimental prototype into an institutional-grade, evidence-grounded, production-ready AI campus assistant for **PSG College of Technology**.

---

## Phased Execution Plan

| Stage | Scope | Key Deliverables | Verification Gate |
| :--- | :--- | :--- | :--- |
| **Stage 1 (Phase 0)** | Repository Inspection & Audit | `docs/PROJECT_AUDIT.md`, `docs/IMPLEMENTATION_ROADMAP.md` | All source, DB, index, and model checks verified against live codebase. |
| **Stage 2 (Phase 1 & 9 Foundation)** | Architecture Refactor, Centralized Config & Security | `backend/config/{env,modelConfig}.js`, `backend/utils/{logger,errors,responseFormatter}.js`, `backend/middleware/{errorHandler,rateLimiter,validateRequest,authenticate,authorize,requestId}.js`, `helmet`, restricted CORS, `/api/health` & `/api/ready`, path-containment + subdomain injection fix in `backend/app.js`, remove unused deps (`mongoose`, `axios`), single-source frontend asset routing. | Unit tests for config, validation, rate limit, security headers, route injection & `/api/health` + `/api/ready`. |
| **Stage 3 (Phase 2.1–2.3)** | Knowledge Ingestion & Data Architecture | `db/schemas/`, `db/repositories/{documentRepository,chunkRepository,ingestionRunRepository}.js`, `db/ingestion/` (HTML `#tg-main`-aware parser, PDF via `pdf-parse`, DOCX via `mammoth`, TXT, dry-run mode, content hashing, staging -> validation -> active promotion without destroying `website_chunks`). | Dry-run & safe ingestion tests across HTML, PDF, DOCX, TXT; verify rollback & zero destruction of `website_chunks`. |
| **Stage 4 (Phase 2.4–2.6)** | Hybrid RAG Retrieval & Reranking | `backend/services/retrievalService.js`, `backend/services/rerankingService.js`, upgraded `db/searchService.js` (Atlas `$vectorSearch` + lexical BM25-style scoring + RRF fusion + metadata filtering + deduplication + heuristic/cross-signal reranker). | Retrieval unit + integration tests comparing baseline vs hybrid+reranked Recall@5, Recall@10, Precision@5. |
| **Stage 5 (Phase 2.7–2.10)** | Evidence Validation, Citations & Grounded Generation | `backend/services/answerValidationService.js`, `backend/services/citationService.js`, upgraded `backend/services/geminiService.js` & `embeddingService.js` (AbortSignal timeouts, jittered retries, concurrency guard, token/latency tracking, strict evidence-only system prompt, validated structured JSON output, prompt-injection defense, status states `VERIFIED`/`PARTIAL`/`INSUFFICIENT`/`CONFLICTING`/`OUTDATED`/`LIVE_DATA_REQUIRED`). | Citation validation, prompt injection resistance, and abstention unit/integration tests. |
| **Stage 6 (Phase 3, 4 & 7)** | Orchestration, Conversation Memory, Intents & Multilingual (EN/TA/Tanglish) | `backend/services/{chatOrchestrator,intentService,queryRewriteService,conversationService,navigationService,languageService}.js`, `db/repositories/{conversationRepository,feedbackRepository}.js`, `/api/conversations*`, `/api/feedback`. | Multi-turn follow-up resolution, session isolation, Tamil/Tanglish intent/retrieval tests. |
| **Stage 7 (Phase 5 & 6)** | Institutional Frontend UI, Accessibility & PSG Features | Modular `frontend/js/{chat-api,conversation-manager,chatbot}.js`, clean academic `frontend/css/chatbot.css`, ARIA & keyboard support, mobile full-screen view, copy/feedback/retry/source previews, safe DOM rendering (no inline `onclick` or unescaped HTML), allowlisted navigation, clean `frontend/index.html` integration. | Frontend asset, XSS safety, and end-to-end API/UI tests. |
| **Stage 8 (Phase 8)** | Admin APIs & Knowledge Management | `backend/routes/adminRoutes.js`, `backend/controllers/documentController.js`, `backend/services/{feedbackService,analyticsService}.js`, protected `/api/admin/*` endpoints for upload, preview, approve/reject/archive, re-index, retrieval inspector, analytics, and audit log (standalone `/admin` UI subsequently removed). | Admin authz (401/403), upload, approval, retrieval test, and analytics integration tests. |
| **Stage 9 (Phase 10, 11, 12 & Final Review)** | Full Test Suite, RAG 200Q Eval, Performance/Ops, Full Docs & Readiness Report | `tests/{unit,integration,rag,security,e2e}/`, 200-question PSG evaluation dataset + real metrics runner, query cache + graceful shutdown, all 13 docs in `docs/` + `README.md`, and independent `docs/PRODUCTION_READINESS_REPORT.md`. | Full `npm test`, RAG evaluation run, security suite, and independent production readiness audit. |

---

## Non-Negotiable Guardrails
1. **No destructive DB operations:** Existing `psg_chatbot.website_chunks` (`93` Atlas documents) must remain untouched; new document pipelines use dedicated versioned collections + staging activation.
2. **No fabricated college facts:** Unsupported figures are purged from system prompts; answers reflect only retrieved evidence.
3. **Verify each stage with real automated tests** before starting the next stage.
4. **Never push to git** (`git push` strictly forbidden).
