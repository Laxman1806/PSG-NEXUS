# 🏛️ PSG NEXUS — Intelligent AI Campus Chatbot for PSG College of Technology

**PSG Nexus** is a unified, full-stack digital campus guide for [PSG College of Technology](https://www.psgtech.edu), Coimbatore. It combines an authentic offline multi-page replica of the official college website with a modern Retrieval-Augmented Generation (RAG) AI assistant powered by **Google Gemini** and **MongoDB Atlas Vector Search**.

---

## 👥 Team Details (Team 1)

| Roll No. | Student Name | Role & Architecture Module |
| :--- | :--- | :--- |
| **26MX209** | **Laxman B** | **Frontend UI:** Website Replication & Chatbot Interface (`frontend/`) |
| **26MX115** | **Mohamed Abdul Basith A A** | **Backend Architecture:** Express Server, Routes & Gemini AI (`backend/`) |
| **26MX110** | **Karthikeyan S** | **Database & RAG:** MongoDB Atlas, Vector Embeddings & Search (`db/`) |

**Faculty Guide:** Mrs. Gowri Thangam J  
**Academic Program:** MCA (Master of Computer Applications), 1st Semester  
**Course:** Web Application Development  

---

## 📁 Clean 3-Tier Project Architecture

The project is structured into three clean, self-contained layers so anyone can immediately understand the codebase:

```text
PSG-NEXUS/
│
├── frontend/                     # 🌐 PRESENTATION LAYER (Laxman B)
│   ├── index.html                # PSG Tech portal with embedded PSG Nexus AI
│   ├── about.html                # About PSG Tech subpage
│   ├── programmes.html           # Academic programmes subpage
│   ├── faculty.html              # Faculty directory subpage
│   ├── placements.html           # Placement overview subpage
│   ├── css/
│   │   ├── chatbot.css           # Isolated styles for floating chat & animations
│   │   └── ...                   # Replicated site stylesheets (bootstrap, main, etc.)
│   ├── js/
│   │   ├── chatbot.js            # Chatbot client controller & API communicator
│   │   └── ...                   # Replicated site scripts (vendor, owl, etc.)
│   ├── images/                   # College logos, banners, and photo galleries
│   ├── fonts/                    # Replicated web fonts & icon libraries
│   ├── files/                    # Official college forms, notices, and PDFs
│   └── [subpages]                # abtcllg.php, admission.php, hostel, placements, etc.
│
├── backend/                      # ⚙️ BUSINESS LOGIC & AI LAYER (Mohamed Abdul Basith)
│   ├── app.js                    # Express app factory, CORS, static routes & middleware
│   ├── server.js                 # Server listener & startup lifecycle
│   ├── routes/
│   │   └── chatRoutes.js         # API endpoints: POST /api/chat, GET /api/health
│   ├── controllers/
│   │   └── chatController.js     # Query validation, greeting checks, context assembly
│   └── services/
│       ├── geminiService.js      # Gemini text generation with multi-model fallback
│       └── embeddingService.js   # Official Google SDK 768-dim vector generator
│
├── db/                           # 🗄️ DATA & SEARCH ENGINE (Karthikeyan S)
│   ├── connection.js             # MongoDB Atlas / local connection manager
│   ├── searchService.js          # Atlas $vectorSearch (768d) & local semantic search
│   ├── data/
│   │   └── knowledge_chunks.json # Cached knowledge base chunks (offline fallback)
│   └── scripts/                  # Data ingestion & database maintenance utilities
│       ├── demo-rag.js           # CLI demonstration runner for the RAG pipeline
│       ├── ingest-local-pages.js # Extracts, chunks & embeds local website pages
│       └── clean-database.js     # Safely cleans collections & resets cache
│
├── .env                          # Environment variables (API keys, URIs, PORT)
├── .env.example                  # Template configuration for team members
├── .gitignore                    # Git rules (excludes node_modules, .env, *.log)
├── package.json                  # Dependencies & npm scripts
└── server.js                     # Root launcher (executes backend/server.js)
```

---

## 🚀 Key Features

1. **Clean 3-Tier Architecture:**  
   Distinct separation between `frontend/`, `backend/`, and `db/` ensures modularity, high maintainability, and clear ownership.

2. **Complete Offline PSG Tech Web Replica:**  
   Accurate multi-page replica of `www.psgtech.edu` with full navigation for Admissions, Hostels, Placements, Academic Programmes, and Regulations.

3. **Embedded AI Assistant (PSG Nexus):**  
   - Modern glassmorphism floating chat modal with responsive animations, quick prompt chips, and conversation reset.
   - Answers questions on admissions, hostels, syllabus, fees, and placements.
   - Shows transparent citations and source links for every response.

4. **Hybrid RAG Knowledge Engine:**  
   - Knowledge chunks embedded using **Gemini `gemini-embedding-001` (768 dimensions)**.
   - Multi-tier retrieval:
     1. **MongoDB Atlas `$vectorSearch`** on `vector_index` (768 dimensions).
     2. **Local Semantic Cosine Similarity** fallback (`db/data/knowledge_chunks.json`).
     3. **Keyword relevance matching** fallback for 100% uptime.
   - Conversational generation powered by **Gemini 3.1 Flash Lite** with automatic fallback to **Gemini 3.5 Flash** and **Gemini 3.8 Flash**.

---

## 🛠️ Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on v22)
- **npm** v9+
- A valid **Google Gemini API Key** (set in `.env`)

### 2. Configuration (`.env`)
Copy `.env.example` to `.env` at the root and configure your own credentials:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/psg_chatbot
MONGODB_COLLECTION=website_chunks
VECTOR_INDEX_NAME=vector_index
```

### 3. Start the Application
From the project root:
```bash
npm start
```

Open your browser at:
```
http://localhost:5000/
```
Click the floating shield icon in the bottom-right corner to interact with **PSG Nexus**!

---

## 🧪 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm start` | Starts the unified server on `http://localhost:5000` |
| `npm run dev` | Starts the server with `--watch` for automatic reloads |
| `node db/scripts/demo-rag.js` | Runs a CLI test of the RAG pipeline with sample questions |
| `npm run crawl` | Re-crawls and embeds all local pages into the database |
| `npm run clean:db` | Clears all knowledge chunks from the database |
