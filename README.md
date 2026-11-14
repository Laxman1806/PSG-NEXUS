# 🏛️ PSG NEXUS — Intelligent AI Campus Chatbot for PSG College of Technology

**PSG Nexus** is a unified, full-stack digital campus guide for [PSG College of Technology](https://www.psgtech.edu), Coimbatore. It combines an authentic offline multi-page replica of the official college website with a modern Retrieval-Augmented Generation (RAG) AI assistant powered by **Google Gemini** and **MongoDB Vector Search**.

---

## 👥 Team Details (Team 1)

| Roll No. | Student Name | Role & Module |
| :--- | :--- | :--- |
| **26MX209** | **Laxman B** | Website Replication & Frontend UI Design (`www.psgtech.edu`) |
| **26MX110** | **Karthikeyan S** | Database & Vector Ingestion Pipeline (`psgmaster` / RAG Embeddings) |
| **26MX115** | **Mohamed Abdul Basith A A** | Backend Architecture, API Integration & Official Git Core (`psgnexus`) |

**Faculty Guide:** Mrs. Gowri Thangam J  
**Academic Program:** MCA (Master of Computer Applications), 1st Semester  
**Course:** Web Application Development  

---

## 🚀 Key Features

1. **Complete PSG Tech Web Replica:**
   - Accurate local replica of `psgtech.edu` with full navigation for Admissions, About the College, Hostels, Placements, Academic Programmes, HoD Directory, Contact, and Regulations.
   - Clean, web-optimized asset delivery (over 400 MB of raw media bloat pruned while preserving 100% visual fidelity).

2. **Embedded AI Assistant (PSG Nexus):**
   - Modern glassmorphism floating chat interface with responsive animations, quick prompt chips, and instant restart.
   - Answers questions on any college topic directly from the home page.
   - Transparent citations: Every answer highlights verified sources with direct subpage links.

3. **Hybrid RAG Knowledge Engine:**
   - 71 chunked knowledge documents embedded using **Gemini `gemini-embedding-001` (768 dimensions)**.
   - Multi-tier vector retrieval:
     1. **MongoDB Atlas `$vectorSearch`** (Cloud vector search)
     2. **Local MongoDB vector store** (`mongodb://127.0.0.1:27017/psg_chatbot`)
     3. **In-memory Cosine Similarity Engine** (`data/knowledge_chunks.json` fail-safe backup for zero downtime)
   - Conversational generation powered by **Gemini 3.1 Flash Lite** with fallback to **Gemini 3.8 / 3.5 Flash**.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap, Tailwind CSS, Owl Carousel
- **Backend:** Node.js, Express.js
- **AI & Embeddings:** Google Generative AI SDK (`@google/generative-ai`), `gemini-embedding-001`, `gemini-3.1-flash-lite`
- **Database & Search:** MongoDB Atlas / Local MongoDB, MongoDB Vector Search, In-memory Cosine Vector Similarity
- **Data Ingestion:** Cheerio HTML parser, Crypto SHA-256 chunk hashing

---

## 📦 Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Laxman1806/PSG-NEXUS.git
cd PSG-NEXUS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/psg_chatbot
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite
PORT=3000
```

### 4. (Optional) Run Knowledge Ingestion
If you want to re-crawl or re-embed the website pages:
```bash
npm run ingest
```

### 5. Start the Application
```bash
npm start
```
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📁 Project Structure

```
PSG-NEXUS/
├── data/
│   └── knowledge_chunks.json       # Pre-computed 768d vector embeddings cache
├── scripts/
│   ├── ingest-local-pages.js       # Offline page crawler & embedding generator
│   ├── crawl-and-ingest.js         # Web crawler ingestion pipeline
│   └── demo-rag.js                 # Terminal RAG testing demo
├── src/
│   ├── config/
│   │   └── database.js             # Dual-mode MongoDB connection (Atlas & Local)
│   └── services/
│       ├── chunkService.js         # Text chunking & token window overlapping
│       ├── crawlerService.js       # Webpage scraping utilities
│       ├── embeddingService.js     # 768-dimensional vector generator
│       ├── geminiService.js        # Gemini multi-model response generator
│       ├── ingestionService.js     # MongoDB chunk upsert service
│       └── searchService.js        # Semantic cosine & vector search engine
├── js/
│   ├── script.js                   # Interactive chatbot UI client controller
│   └── ...                         # Website vendor scripts
├── css/                            # Bootstrap & theme stylesheets
├── images/                         # Web-optimized campus images
├── abtcllg.php/                    # About College subpage
├── admission.php/                  # Admissions subpage
├── hostel/                         # Hostels & residential rules subpage
├── placements/                     # Placement division & stats subpage
├── Heads.php/                      # Heads of Departments directory
├── index.html                      # Replicated PSG Tech homepage with AI assistant
├── server.js                       # Express server & API endpoints
├── package.json
└── README.md
```

---

## 🔒 License & Academic Integrity
Developed as an academic project for **PSG College of Technology**, Coimbatore. Intended for educational demonstration and evaluation.
