# PSG NEXUS — Testing & RAG Evaluation Guide

## 1. Automated Test Suites (Node.js Test Runner)

Run the complete test suite:
```bash
npm test
```

Targeted suites:
- `npm run test:unit` — Config validation, model deduplication, logger secret redaction, HMAC session tokens, admin RBAC, navigation allowlist, HTML/PDF/DOCX/TXT extraction, staging/rollback, prompt-injection & citation checks (`tests/unit/`).
- `npm run test:integration` — Express routes, security headers, subdomain injection (`/sports`, `/library`), session-isolated conversations, feedback API, admin auth & retrieval inspector (`tests/integration/`).
- `npm run test:rag` — Cosine similarity safety, multilingual query expansion, RRF fusion, historical dampening, hybrid retrieval recall (`tests/rag/`).
- `npm run test:security` — SSRF prevention, `429` rate limiting, malformed/oversized JSON handling, MongoDB operator rejection, frontend XSS & CORS origin enforcement (`tests/security/`).
- `npm run test:e2e` — End-to-end live server, `/api/ready`, Atlas Vector Search + Gemini multi-turn conversation, follow-up query, feedback, explicit navigation, Tamil & Tanglish queries, and out-of-scope abstention (`tests/e2e/`).

### Observed Verification Results (Post-Implementation)
- **Full `npm test` run:** `54` tests across `11` suites — **`54` passed, `0` failed**.
- **`npm audit --omit=dev`:** **`0` vulnerabilities**.
- **Safe HTML dry-run (`node db/scripts/ingest-local-pages.js --dry-run --no-embed --no-pdfs`):** `78` HTML files discovered, `51` valid content pages extracted, `327` staged chunks computed, `0` failures, existing `website_chunks` untouched (`93` Atlas docs verified intact).

---

## 2. 200-Question RAG & Guardrail Evaluation

Dataset: `tests/rag/eval-dataset-200.json` (200 questions covering admissions, programmes, regulations/CoE, placements, hostels, scholarships, faculty/administration, campus facilities/contacts, Tamil Unicode, Tanglish, follow-ups, historical queries, out-of-scope/live-data queries, and prompt injection).

Run offline hybrid benchmark:
```bash
npm run eval:rag
```

Optional run with live Gemini embeddings + Atlas:
```bash
node tests/rag/eval-rag.js --live-embed
```

### Observed Benchmark Output (`npm run eval:rag` — `hybrid-lexical-rerank-offline`)
- **Total Questions Evaluated:** `200` (`183` retrieval-targeted queries)
- **Language Detection Accuracy:** `100%`
- **Intent Classification Accuracy:** `86.5%`
- **Baseline Keyword Retrieval:** `Recall@5 = 98.36%`, `Recall@10 = 98.91%`, `Precision@5 = 0.416`
- **Hybrid + Reranked Retrieval:** `Recall@5 = 97.81%`, `Recall@10 = 98.91%`, `Precision@5 = 0.413`
- **Prompt Injection Block Rate:** `100%`
- **Unsupported / Live-Data Abstention Accuracy:** `91.67%`
- **Average Retrieval + Validation Latency:** `12 ms`
