# 🏛️ PSG NEXUS — AI-Powered Campus Assistant & Web Portal

**PSG Nexus** is a secure, production-ready full-stack web application for [PSG College of Technology](https://www.psgtech.edu), Coimbatore.

It combines an **offline replica of the official college website** with an **AI chatbot** powered by Google Gemini and MongoDB Atlas Vector Search — letting students, parents, and faculty explore campus information and get instant, context-grounded answers.

> 🚀 **Live on Render:** Deploy in minutes using the included `render.yaml` blueprint.

---

## 👥 Team — MCA Web Application Development (Team 1)

| Roll No. | Name | Responsibility |
|:---|:---|:---|
| **26MX209** | Laxman B | Frontend — Website Replica & Chatbot Interface |
| **26MX115** | Mohamed Abdul Basith A A | Backend — Express API, Routes & Gemini AI |
| **26MX110** | Karthikeyan S | Database — MongoDB Atlas, Vector Embeddings & RAG |

**Faculty Guide:** Mrs. Gowri Thangam J · **Programme:** MCA 1st Semester · **Course:** Web Application Development

---

## ✨ Features

| Feature | Description |
|:---|:---|
| 🌐 **PSG Tech Web Replica** | Offline multi-page replica of www.psgtech.edu — Admissions, Hostels, Placements, Programmes, COE, Sports, Library |
| 🤖 **AI Campus Chatbot** | Floating chat widget backed by Google Gemini with RAG context |
| 🔍 **Hybrid RAG Search** | MongoDB Atlas `$vectorSearch` → local cosine similarity → keyword fallback |
| 🧭 **Smart Navigation** | AI-suggested campus page cards for direct navigation |
| 🔒 **Security Hardened** | Path traversal blocked, XSS protected, rate limited, CORS restricted, CSP headers |
| 📱 **Responsive Design** | Works on mobile, tablet, and desktop |
| ☁️ **Render-Ready** | Included `render.yaml` blueprint for one-click deployment |

---

## 🏗️ Architecture

```text
PSG-NEXUS/
│
├── server.js                      ← Root entry point (npm start)
├── render.yaml                    ← Render deployment blueprint
├── .env.example                   ← Environment variable template
│
├── frontend/                      ← PRESENTATION LAYER
│   ├── index.html                 ← PSG Tech portal with embedded chatbot
│   ├── css/
│   │   ├── chatbot.css            ← Chatbot widget styles
│   │   └── ...                    ← Campus site stylesheets
│   ├── js/
│   │   ├── chatbot.js             ← Chatbot client (DOM-safe, XSS-protected)
│   │   ├── script.js              ← Site interaction scripts
│   │   └── vendor/                ← Local jQuery, Owl Carousel, etc.
│   ├── images/                    ← College logos, banners, galleries
│   ├── fonts/                     ← Web fonts & icon libraries
│   └── psgtech_offline_replica/   ← Full offline campus website replica
│       └── www.psgtech.edu/       ← Mirrored pages (HTML, CSS, JS, assets)
│
├── backend/                       ← BUSINESS LOGIC & API LAYER
│   ├── app.js                     ← Express app: security middleware, static routes
│   ├── server.js                  ← HTTP listener, DB startup, graceful shutdown
│   ├── middleware/
│   │   └── security.js            ← CSP, CORS, rate limiter, error handler
│   ├── routes/
│   │   └── chatRoutes.js          ← POST /api/chat, GET /api/health, GET /api/ready
│   ├── controllers/
│   │   └── chatController.js      ← Input validation, navigation, context assembly
│   └── services/
│       ├── geminiService.js       ← Gemini text generation, multi-model fallback
│       └── embeddingService.js    ← 768-dim embedding generation
│
└── db/                            ← DATA & SEARCH LAYER
    ├── connection.js              ← Atlas → local MongoDB → JSON fallback
    ├── searchService.js           ← $vectorSearch + cosine similarity fallback
    ├── data/
    │   └── knowledge_chunks.json  ← 107 pre-embedded fallback chunks (768d)
    └── scripts/                   ← Ingestion & test utilities
        ├── ingest-local-pages.js  ← Crawl, chunk & embed replica pages → Atlas
        ├── test-security.js       ← Security test suite (path traversal, XSS, headers)
        ├── test-chat-and-routes.js← Full chatbot & route tests
        ├── test-chat-accuracy.js  ← Topic accuracy tests
        ├── test-edge-cases.js     ← Edge case & boundary tests
        └── clean-database.js      ← Reset Atlas collection
```

---

## 🛠️ Local Development Setup

### Prerequisites

| Tool | Version |
|:---|:---|
| Node.js | v18 or higher (v22 recommended) |
| npm | v9 or higher |
| Google Gemini API Key | [Get one free](https://aistudio.google.com/app/apikey) |
| MongoDB Atlas (optional) | For vector search; app works without it via local fallback |

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/PSG-NEXUS.git
cd PSG-NEXUS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-lite
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/psg_chatbot
MONGODB_COLLECTION=website_chunks
VECTOR_INDEX_NAME=vector_index
```

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.

### 4. Start the development server

```bash
npm start
```

Open **http://localhost:5000** in your browser. Click the floating shield icon (bottom-right) to open PSG Nexus.

---

## 🗄️ MongoDB Atlas Setup (Vector Search)

The chatbot works in **local fallback mode** without Atlas, but for full semantic vector search:

### Step 1 — Create Cluster

1. Sign in at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free **M0 cluster** (Shared, Singapore region recommended)
3. Create a database user with read/write permissions
4. Add your IP (or `0.0.0.0/0` for Render deployment) to the **Network Access** list

### Step 2 — Create Database & Collection

- **Database:** `psg_chatbot`
- **Collection:** `website_chunks`

### Step 3 — Create Vector Search Index

In Atlas → Search → Create Search Index → **Atlas Vector Search** (JSON editor):

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    }
  ]
}
```

**Index name:** `vector_index`

### Step 4 — Ingest Campus Pages

Run the ingestion script to crawl, chunk, and embed the offline replica pages:

```bash
npm run ingest
```

This generates 768-dimensional embeddings using `gemini-embedding-001` and stores them in Atlas.

---

## 🔌 API Endpoints

| Method | Path | Description |
|:---|:---|:---|
| `POST` | `/api/chat` | Submit a question; returns AI answer, sources, and navigation |
| `GET` | `/api/health` | Lightweight health ping (always 200 when server is up) |
| `GET` | `/api/ready` | Readiness check with DB status, AI key status, fallback status |

### POST /api/chat

**Request:**
```json
{ "message": "What are the placement statistics at PSG Tech?" }
```

**Response:**
```json
{
  "reply": "PSG College of Technology has consistently strong placement records...",
  "sources": [
    { "title": "Career Development Centre", "url": "/placements", "score": 0.891 }
  ],
  "navigation": { "url": "/placements", "label": "Career & Placements Portal" }
}
```

**Error responses:**
- `400` — Missing or invalid message (not a string, empty, or over 1000 characters)
- `429` — Rate limit exceeded (60 requests/min per IP by default)
- `500` — Server error (safe message, no stack trace)

### GET /api/ready

```json
{
  "ready": true,
  "timestamp": "2026-11-25T18:00:00.000Z",
  "services": {
    "server": "up",
    "database": {
      "status": "mongodb-atlas-connected",
      "details": "MongoDB Atlas connected — vector search enabled"
    },
    "ai": {
      "status": "api-key-configured",
      "model": "gemini-2.0-flash-lite"
    },
    "fallback": {
      "status": "available",
      "chunks": 107,
      "source": "db/data/knowledge_chunks.json"
    }
  }
}
```

---

## 🧪 Testing

Run the test suites (server must be stopped first — tests start their own isolated instance):

```bash
# Security tests: path traversal, XSS, headers, rate limiting, CORS, input validation
node db/scripts/test-security.js

# Full chatbot & route tests (35 cases)
node db/scripts/test-chat-and-routes.js

# Chat accuracy tests (placements, admissions, hostel, MCA, Principal)
node db/scripts/test-chat-accuracy.js

# Edge case tests (empty input, long message, special characters)
node db/scripts/test-edge-cases.js

# Frontend asset tests (HTML, CSS, JS presence)
node db/scripts/test-frontend-assets.js
```

---

## ☁️ Deploy to Render

### 1. Push to GitHub

```bash
git add -A
git commit -m "feat: production-ready PSG-NEXUS"
git push origin main
```

### 2. Create Render Web Service

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repository
3. Render auto-detects `render.yaml` — click **Apply**

### 3. Set Environment Variables in Render Dashboard

Go to **Environment** → **Add Secret Variable**:

| Key | Value |
|:---|:---|
| `MONGO_URI` | Your Atlas connection string |
| `GEMINI_API_KEY` | Your Gemini API key |
| `SITE_URL` | `https://your-app-name.onrender.com` |
| `ALLOWED_ORIGINS` | `https://your-app-name.onrender.com` |

> `NODE_ENV`, `GEMINI_MODEL`, `MONGODB_COLLECTION`, `VECTOR_INDEX_NAME` are pre-set in `render.yaml`.

### 4. Update MongoDB Atlas Network Access

Add `0.0.0.0/0` to Atlas **Network Access** to allow Render's dynamic IPs.

### Build & Start Commands

| Setting | Value |
|:---|:---|
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

---

## 🔒 Security Overview

| Protection | Implementation |
|:---|:---|
| **Path traversal** | `resolveInsideDir()` — rejects any path escaping frontend roots |
| **XSS** | Navigation cards built with `document.createElement` + `textContent`; no innerHTML |
| **Input validation** | `typeof message === 'string'`, max 1000 chars, control char stripping |
| **SQL/NoSQL injection** | MongoDB parameterized queries only; no string interpolation into queries |
| **CORS** | Allowlist-based; rejects unknown origins in production |
| **Rate limiting** | 60 req/min per IP on `/api/chat` (30 in production via `render.yaml`) |
| **Security headers** | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `CSP`, `Permissions-Policy` |
| **Error handling** | Stack traces and file paths never reach clients |
| **Credentials** | Only in `.env` (gitignored); `.env.example` has placeholders only |
| **Prompt injection** | Gemini system prompt separated from user input; navigation URLs validated against allowlist |

---

## 🛠️ Available Scripts

| Command | Action |
|:---|:---|
| `npm start` | Start server on `http://localhost:5000` |
| `npm run dev` | Start with `--watch` for auto-reload on file changes |
| `npm run ingest` | Re-crawl, chunk & embed replica pages into MongoDB Atlas |
| `npm run clean:db` | Clear all knowledge chunks from the Atlas collection |

---

## 🔧 Troubleshooting

### MongoDB Atlas SSL error (`ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR`)
- Check **Network Access** in Atlas — your IP or `0.0.0.0/0` must be whitelisted
- Verify the connection string in `.env` matches the Atlas cluster name exactly
- App automatically falls back to local 107-chunk JSON cache when Atlas is unreachable

### Gemini API 503 errors
- Google Gemini experiences occasional high demand; the app retries with a model fallback cascade
- Fallback order: `gemini-2.0-flash-lite` → `gemini-2.0-flash` → `gemini-1.5-flash` → `gemini-1.5-flash-8b` → keyword-based local answer

### Server not responding after `npm start`
- Check if port 5000 is already in use: `netstat -ano | findstr :5000` (Windows)
- Kill existing process: `Stop-Process -Id <PID>` (Windows) or `kill <PID>` (Linux/Mac)

### Chatbot gives irrelevant answers
- Run `npm run ingest` to repopulate Atlas with fresh embeddings from the latest replica pages
- Verify Atlas vector index is active: Atlas → Search → check `vector_index` status is "Active"

---

## 📋 Environment Variables Reference

| Variable | Required | Default | Description |
|:---|:---|:---|:---|
| `PORT` | No | `5000` | Server port (auto-set by Render) |
| `NODE_ENV` | No | — | Set to `production` on Render |
| `GEMINI_API_KEY` | **Yes** | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-2.0-flash-lite` | Primary Gemini model |
| `MONGO_URI` | No | — | MongoDB Atlas connection string |
| `MONGODB_COLLECTION` | No | `website_chunks` | Atlas collection name |
| `VECTOR_INDEX_NAME` | No | `vector_index` | Atlas vector search index name |
| `SITE_URL` | No | — | Deployed URL (fixes CSP `connect-src`) |
| `ALLOWED_ORIGINS` | No | — | Extra CORS origins (comma-separated) |
| `CHAT_RATE_LIMIT_MAX` | No | `60` | Max chat requests per IP per minute |

---

## 📄 License

This project was developed for academic purposes as part of the MCA Web Application Development course at PSG College of Technology, Coimbatore.

---

*Built with ❤️ by Team 1, MCA Batch 2026, PSG College of Technology*
