# PSG NEXUS — Official-Grade AI Campus Assistant for PSG College of Technology

**PSG NEXUS** is an evidence-grounded, multilingual Retrieval-Augmented Generation (RAG) digital campus assistant built for evaluation and integration with **PSG College of Technology**, Coimbatore.

> **Evaluation Status Notice:** PSG NEXUS has been engineered to be ready for technical evaluation and staging review. It is **not** claimed to be officially endorsed, approved, or deployed on `www.psgtech.edu` unless and until PSG College of Technology IT/Administration grants formal authorization.

---

## Key Capabilities

- **Hybrid RAG Engine (`db/searchService.js`, `backend/services/retrievalService.js`, `backend/services/rerankingService.js`):** Combines MongoDB Atlas `$vectorSearch` (768-dim `gemini-embedding-001`), IDF-weighted lexical search, campus synonym expansion, Reciprocal Rank Fusion (RRF), metadata filtering, and multi-signal reranking.
- **Evidence Grounding & Citations (`backend/services/answerValidationService.js`, `backend/services/citationService.js`):** Enforces strict retrieval-backed answering, detects conflicting or historical records, abstains on unverified or live-record queries (`VERIFIED`, `PARTIAL`, `INSUFFICIENT`, `CONFLICTING`, `OUTDATED`, `LIVE_DATA_REQUIRED`), and validates all citations against retrieved evidence.
- **Safe Incremental Ingestion (`db/ingestion/`):** Extracts HTML (`#tg-main`-aware chrome removal), text-based PDFs with page numbers (and scanned-PDF detection), DOCX, TXT notices, and allowlisted institutional URLs into staging collections with versioned activation and rollback — without deleting active production chunks.
- **Multilingual & Multi-Turn Orchestration (`backend/services/chatOrchestrator.js`):** Supports English, Tamil (`[\u0B80-\u0BFF]`), and Tanglish with follow-up query rewriting, explicit navigation intent separation, and HMAC-isolated server-side conversations.
- **Institutional UI (`frontend/`):** Accessible, responsive chat launcher (`frontend/js/chatbot.js`, `frontend/css/chatbot.css`) using safe DOM node rendering (no `innerHTML` on model text, no inline `onclick`), paired with protected Knowledge Administration REST APIs (`/api/admin/*`) for document upload/approval, retrieval inspection, analytics, and audit logs.
- **Security Hardening (`backend/middleware/`):** `helmet` CSP headers, allowlisted CORS, request ID correlation, `express-rate-limit`, input length/type validation, SSRF host allowlisting, path-traversal guards, timing-safe admin key verification, and log secret redaction.

---

## Architecture Overview

```text
PSG-NEXUS/
├── backend/
│   ├── app.js                     # Express 5 app, Helmet, CORS, asset & route wiring
│   ├── server.js                  # Startup validation, DB pool init, graceful shutdown
│   ├── config/{env,modelConfig}.js
│   ├── routes/{chat,conversation,feedback,admin}Routes.js
│   ├── controllers/{chat,conversation,feedback,document}Controller.js
│   ├── services/                  # Orchestrator, RAG, validation, Gemini, memory, i18n
│   ├── middleware/                # Auth, RBAC, rate limits, validation, error handler
│   └── utils/                     # Structured redacted logger, typed errors, formatters
├── db/
│   ├── connection.js              # Singleton MongoDB Atlas -> Local -> Cache pool
│   ├── searchService.js           # Hybrid vector + lexical + RRF search
│   ├── schemas/knowledgeSchemas.js
│   ├── repositories/              # Knowledge (staging/rollback), conversations, feedback
│   ├── ingestion/                 # Extractors (HTML/PDF/DOCX/TXT/URL), chunker, pipeline
│   ├── data/                      # Offline vector cache & local dev snapshot
│   └── scripts/                   # CLI tools (safe incremental ingest, inspect, etc.)
├── frontend/
│   ├── index.html                 # Replicated portal homepage (external chatbot bundle)
│   ├── css/chatbot.css
│   └── js/{chat-api,conversation-manager,chatbot}.js
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── rag/                       # Retrieval tests + 200-question eval runner
│   ├── security/
│   └── e2e/
└── docs/                          # Full engineering, audit, security & integration docs
```

---

## Quick Start

1. **Install dependencies** (Node.js `v18+`, tested on `v22.17.0`):
   ```bash
   npm install
   ```
2. **Configure environment:** Copy `.env.example` to `.env` and populate `GEMINI_API_KEY`, `MONGO_URI`, `SESSION_SECRET`, and `ADMIN_API_KEY`. Never commit `.env` or place secrets in documentation.
3. **Run automated checks:**
   ```bash
   npm test
   npm run eval:rag
   ```
4. **Dry-run incremental ingestion (safe, read-only):**
   ```bash
   node db/scripts/ingest-local-pages.js --dry-run --no-embed
   ```
5. **Start the server:**
   ```bash
   npm start
   ```
   Open `http://localhost:5000/` for the portal + chatbot widget. Administrative operations remain available via protected `/api/admin/*` endpoints (see [docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md)).

---

## Documentation Index

- [Project Audit](docs/PROJECT_AUDIT.md)
- [Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [RAG Pipeline](docs/RAG_PIPELINE.md)
- [Knowledge Ingestion](docs/KNOWLEDGE_INGESTION.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Security Guide](docs/SECURITY.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Admin Guide](docs/ADMIN_GUIDE.md)
- [Testing & RAG Evaluation](docs/TESTING.md)
- [Official Website Integration Guide](docs/WEBSITE_INTEGRATION.md)
- [Production Readiness Report](docs/PRODUCTION_READINESS_REPORT.md)
