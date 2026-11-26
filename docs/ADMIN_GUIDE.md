# PSG NEXUS — Knowledge Administration Guide

## 1. Authentication & API Access
1. Configure `ADMIN_API_KEY` (full read/write/approval) and optionally `REVIEWER_API_KEY` (read-only inspection) in `.env`.
2. Send authenticated requests directly to `https://<your-host>/api/admin/*` (`http://localhost:5000/api/admin/*` locally) using the `X-Admin-Key` header (the standalone `/admin` web UI has been removed).
3. Keep `ADMIN_API_KEY` and `REVIEWER_API_KEY` strictly on the server or in secure administrative scripts—never hardcode or commit keys to source control.

## 2. Document Review & Approval Workflow
1. **Upload:** Upload a PDF, DOCX, TXT, or HTML file (up to 10 MB), or provide an approved institutional URL (`ALLOWED_FETCH_HOSTS`).
2. **Preview & Warnings:** Inspect extracted text and check for warnings (such as scanned/image-only PDFs that require OCR).
3. **Approve (`POST /api/admin/documents/:id/approve`):** Promotes staged chunks from `knowledge_chunks_staging` into `knowledge_chunks` as `active`, updates `lastVerifiedAt`, invalidates the public query cache, and logs an entry in `audit_logs`.
4. **Archive / Reject (`PATCH /api/admin/documents/:id`):** Marks outdated or rejected documents `archived`/`rejected` so they are excluded from active retrieval.

## 3. Retrieval & Grounding Inspector
Use `POST /api/admin/retrieval-test` (with `X-Admin-Key`) to enter any English, Tamil, or Tanglish query and inspect:
- Detected language and classified intent.
- Vector vs lexical scores, coverage ratio, and final rerank score per chunk.
- Evidence validation outcome (`VERIFIED`, `PARTIAL`, `INSUFFICIENT`, `CONFLICTING`, `OUTDATED`, `LIVE_DATA_REQUIRED`).
- Optional grounded Gemini response and validated citations.

## 4. Analytics & Audit Trail
- View total queries, unanswered/insufficient query counts, average response latency, and feedback counts (`up`/`down`) via `/api/admin/analytics/overview` and `/api/admin/analytics/queries`.
- Audit every upload, approval, status update, and ingestion run via `/api/admin/audit-logs`.
