# PSG NEXUS — API Documentation

All endpoints validate inputs strictly and attach `X-Request-Id` to responses. Error payloads follow `{ "error": { "code", "message", "requestId" } }`.

---

## 1. Public Chat & Health Endpoints

### `POST /api/chat`
Processes a conversational turn using hybrid RAG, memory, and evidence grounding.
- **Headers:** `Content-Type: application/json`, optional `X-Session-Token: <signed-token>`
- **Body:** `{ "message": "string (1..1500 chars)", "conversationId": "optional string", "filters": {} }`
- **Response (`200 OK`):** Also returns `X-Session-Token` header for new sessions.
  ```json
  {
    "conversationId": "conv-...",
    "answer": "Markdown answer...",
    "reply": "Markdown answer...",
    "response": "Markdown answer...",
    "status": "VERIFIED | PARTIAL | INSUFFICIENT | CONFLICTING | OUTDATED | LIVE_DATA_REQUIRED",
    "language": "en | ta | tanglish",
    "intent": "HOSTEL",
    "citations": [
      {
        "citationId": "E1",
        "documentId": "...",
        "title": "Hostels & Residential Facilities",
        "url": "/hostel",
        "sourceType": "html",
        "page": null
      }
    ],
    "sources": [{ "title": "...", "url": "/hostel" }],
    "suggestedQuestions": ["..."],
    "navigation": { "url": "/hostel", "label": "Hostels & Residential Life" },
    "support": null
  }
  ```

### `GET /api/health`
Lightweight liveness check (`{ "status": "alive", "uptimeSeconds", "environment", "databaseMode", "configValid" }`).

### `GET /api/ready`
Verifies live DB ping, knowledge base availability (Atlas vector index + legacy/managed/cache chunk counts), and Gemini configuration (`200 ready` or `503 degraded`).

---

## 2. Session-Isolated Conversation Endpoints (`/api/conversations`)

Requires or issues `X-Session-Token` (HMAC-SHA256 signed). Conversations can only be accessed or deleted by the matching session owner.

- `POST /api/conversations` — Create conversation (`{ "title"?: "string" }`) -> `201 Created`.
- `GET /api/conversations` — List caller's conversations -> `200 OK`.
- `GET /api/conversations/:id` — Fetch messages for owned conversation -> `200 OK` (`404` if missing or owned by another session).
- `DELETE /api/conversations/:id` — Delete owned conversation -> `200 OK`.

---

## 3. Feedback Endpoint

### `POST /api/feedback`
- **Body:** `{ "rating": "up" | "down", "conversationId"?: "string", "messageId"?: "string", "query"?: "string", "comment"?: "string" }`
- **Response (`201 Created`):** `{ "feedbackId": "fb-...", "status": "recorded" }`

---

## 4. Protected Admin Endpoints (`/api/admin`)

Requires `X-Admin-Key: <key>` or `Authorization: Bearer <key>` matching `ADMIN_API_KEY` (`admin` role) or `REVIEWER_API_KEY` (`reviewer` role). Returns `503` if neither key is configured, `401` on invalid/missing credentials, and `403` when a `reviewer` attempts write actions.

- `POST /api/admin/documents` (`admin`) — Multipart file upload (`file`: PDF/DOCX/TXT/HTML, max 10 MB) or approved `url`.
- `GET /api/admin/documents` (`admin`, `reviewer`) — List managed documents (`?status=&category=&limit=`).
- `GET /api/admin/documents/:id` (`admin`, `reviewer`) — Fetch single document metadata.
- `PATCH /api/admin/documents/:id` (`admin`) — Update metadata or status (`rejected`, `archived`, `pending`).
- `POST /api/admin/documents/:id/approve` (`admin`) — Promote staged chunks to `active` and set `lastVerifiedAt`.
- `POST /api/admin/ingestion` (`admin`) — Trigger safe incremental ingestion (`{ "dryRun": true, "embed": false }`).
- `GET /api/admin/ingestion/:id` (`admin`, `reviewer`) — View ingestion run report.
- `POST /api/admin/retrieval-test` (`admin`, `reviewer`) — Inspect language, intent, hybrid scores, evidence assessment, and optional generation.
- `GET /api/admin/analytics/overview` (`admin`, `reviewer`) — Query counts, unanswered count, latency, doc counts, feedback totals.
- `GET /api/admin/analytics/queries` (`admin`, `reviewer`) — Popular queries, recent query telemetry, recent feedback.
- `GET /api/admin/audit-logs` (`admin`, `reviewer`) — Recent administrative audit trail entries.
