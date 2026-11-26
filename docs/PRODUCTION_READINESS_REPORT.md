# PSG NEXUS — Independent Production Readiness Report

**Assessment Date:** 2026-11-26  
**Overall Classification:** **`READY FOR STAGING`** *(Not yet approved for final official production cutover until environment secrets, Atlas index activation, and institutional sign-offs below are completed.)*

---

## 1. Executive Summary

PSG NEXUS has been refactored from a single-controller prototype into a modular, security-hardened, evidence-grounded RAG campus assistant with automated unit, integration, RAG, security, and live end-to-end test verification.

### Verified Measurements
- **Automated Test Suite (`npm test`):** `54` tests across `11` suites — **`54` passed, `0` failed** (including live MongoDB Atlas + Gemini multi-turn English, Tamil, and Tanglish E2E tests and DB/Gemini resilience tests).
- **Dependency Security (`npm audit --omit=dev`):** **`0` vulnerabilities**.
- **200-Question Evaluation (`npm run eval:rag`):**
  - Language detection: **`100%`**
  - Intent classification: **`86.5%`**
  - Hybrid + reranked retrieval (`183` retrieval questions): **`Recall@5 = 97.81%`**, **`Recall@10 = 98.91%`**, **`Precision@5 = 0.413`**
  - Prompt injection blocking: **`100%`**
  - Out-of-scope / unverified abstention: **`91.67%`**
- **Existing Data Preservation:** Atlas `psg_chatbot.website_chunks` (`93` documents) verified untouched via `db/scripts/inspect-db.js`.

---

## 2. Audit Findings & Resolution Status

| Issue ID | Severity | Affected Area | Root Cause | Resolution Status | Evidence / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PR-01** | **Critical** | `backend/services/geminiService.js` | Unsupported numeric facts hardcoded in permanent system prompt; empty context still invited free-form answers. | **Implemented** | Hardcoded figures purged; evidence wrapped in `<UNTRUSTED_RETRIEVED_EVIDENCE>`; abstention enforced (`stage5-validation-citations.test.js`, `stage9-e2e.test.js`). |
| **PR-02** | **Critical** | `db/scripts/ingest-local-pages.js` | Checked `MONGODB_URI` instead of `MONGO_URI`, wiped active `website_chunks`, capped at 160 chunks, missed PDFs & `.tg-ticker` cleanup. | **Implemented** | Replaced with `db/ingestion/` safe incremental staging + rollback pipeline; `327` clean HTML chunks verified in dry-run; PDF/DOCX/TXT supported (`stage3-ingestion.test.js`). |
| **PR-03** | **Critical** | `README.md` & Credentials | Plaintext Atlas password exposed in `README.md` line 111. | **Implemented (Code) / Pending (Rotation)** | Removed from `README.md`; secret scan confirms 0 leaked keys in repo. **Action required:** rotate the Atlas DB user password before production. |
| **PR-04** | **Critical** | `frontend/js/chatbot.js`, `backend/app.js`, `backend/middleware/` | Inline `onclick`, unvalidated LLM navigation URLs, open CORS, no Helmet, no rate limits, no admin auth, path-traversal gap. | **Implemented** | Safe DOM creation (`textContent`), `ALLOWED_ROUTES` allowlist, `helmet` CSP, strict `CORS_ORIGINS`, `express-rate-limit`, timing-safe admin RBAC, `resolveInsideDir` containment (`stage2`, `stage7`, `stage8`, `stage9-security`). |
| **PR-05** | **High** | `backend/app.js`, `frontend/` | Subdomains `/sports` and `/library` lacked chatbot injection; 4 duplicate JS files existed. | **Implemented** | Duplicates removed; subdomain static middleware sets `{ index: false }`; verified `/sports`, `/library`, `/` all load canonical external modules (`stage2`, `stage7`). |
| **PR-06** | **High** | `db/searchService.js`, `backend/services/` | Pure vector search missed exact entities and lacked metadata/historical/conflict handling; timeouts didn't cancel SDK calls. | **Implemented** | Added Atlas+IDF-lexical+RRF+reranking, `AbortController` + `SingleRequestOptions.timeout`, conflict & historical detection (`stage4`, `stage5`). |
| **PR-07** | **High** | Conversation & Multilingual | Frontend history wasn't sent to backend; no server persistence; no Tamil/Tanglish pipeline. | **Implemented** | Added HMAC-isolated `conversations` repository, follow-up query rewriting, and Tamil/Tanglish detection & search expansion (`stage6`, `stage9-e2e`). |
| **PR-08** | **High** | Clean Knowledge Index Activation | Existing Atlas `website_chunks` (`93` docs) still holds legacy noisy chunks; new `knowledge_chunks` & `knowledge_vector_index` not yet populated on Atlas. | **Pending Staging Cutover** | Intentional per Rule 4 (no automatic deletion/overwrite of live DB). Run `npm run crawl` against staging/prod Atlas after creating `knowledge_vector_index`. |
| **PR-09** | **Medium** | `frontend/NAAC/Statutory Declaration under the Section.pdf` | Scanned image-only PDF (`0` extractable text chars). | **Detected / Pending OCR** | `extractPdfDocument()` detects and reports `scanned-pdf-no-text` cleanly; supply OCR-processed PDF or text equivalent if needed in RAG. |
| **PR-10** | **Medium** | Live Browser Visual QA | No headless browser (`Playwright`/`Puppeteer`) visual run executed in this environment. | **Pending Staging QA** | API, DOM XSS checks, and CSS mobile breakpoints (`max-width: 640px`) verified in code; perform manual desktop + mobile viewport QA in staging. |
| **PR-11** | **Medium** | Institutional ERP / Auth | Personal student attendance/marks (`LIVE_DATA_REQUIRED`) cannot work without official PSG ERP / SSO integration. | **Pending Institutional Approval** | Cleanly abstains and redirects users to `/parentzone.php`; requires official PSG College of Technology API credentials & governance approval. |

---

## 3. Blockers Required Before Official Production Cutover

1. **Rotate MongoDB Atlas credentials** previously stored in `README.md` and provision fresh `ADMIN_API_KEY`, `REVIEWER_API_KEY`, `SESSION_SECRET`, and production `CORS_ORIGINS`.
2. **Create `knowledge_vector_index`** on Atlas `psg_chatbot.knowledge_chunks` (see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)) and execute `npm run crawl` to activate clean, ticker-free HTML & text-PDF chunks.
3. **Complete manual browser & mobile visual QA** across desktop and mobile viewports (`/`).
4. **Obtain formal PSG College of Technology IT & Administrative approval** prior to embedding on `www.psgtech.edu`.
