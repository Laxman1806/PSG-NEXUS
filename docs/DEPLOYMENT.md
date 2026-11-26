# PSG NEXUS — Deployment & Operations Guide

## 1. Production Prerequisites
- **Node.js:** `v18+` (verified on `v22.17.0`).
- **MongoDB Atlas:** Dedicated or M10+ cluster in production with TLS enforced, IP allowlist configured for the application server, and automated daily snapshots enabled.
- **Atlas Vector Search Indexes:**
  - `vector_index` on `website_chunks` (`embedding`, 768 dims, cosine) — existing.
  - `knowledge_vector_index` on `knowledge_chunks` (see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for filter fields).
- **Reverse Proxy (Nginx / Caddy / Cloud Load Balancer):** Terminate TLS/HTTPS externally and forward `X-Forwarded-For` (`app.set('trust proxy', 1)` activates when `NODE_ENV=production`).

## 2. Required Production Environment Variables
```env
NODE_ENV=production
PORT=5000
LOG_LEVEL=info
GEMINI_API_KEY=<secret-manager-value>
GEMINI_MODEL=gemini-3.5-flash-lite
MONGO_URI=<atlas-connection-string>
CORS_ORIGINS=https://www.psgtech.edu,https://psgtech.ac.in
SESSION_SECRET=<64-hex-char-random-secret>
ADMIN_API_KEY=<strong-random-admin-key>
REVIEWER_API_KEY=<strong-random-reviewer-key>
```
Startup fails immediately in production if `SESSION_SECRET` is omitted (`validateConfig()`).

## 3. Liveness, Readiness & Graceful Shutdown
- Configure container/orchestrator **liveness probe** on `GET /api/health`.
- Configure **readiness probe** on `GET /api/ready` (returns `200` when DB/cache + knowledge base are healthy, `503` when degraded).
- `backend/server.js` traps `SIGINT` and `SIGTERM` to drain HTTP connections and close the MongoDB pool cleanly.

## 4. Backup & Rollback Procedures
- **Application rollback:** Deploy previous release artifact / git tag; frontend embedding uses external `/js/*` and `/css/chatbot.css` assets.
- **Knowledge index rollback:** Use `rollbackIngestionRun(runId)` in `db/repositories/knowledgeRepository.js` to revert active `knowledge_chunks` to `previousRunId` without re-embedding.
- **Database backup:** Enable MongoDB Atlas Continuous Cloud Backup / point-in-time recovery before running full production ingestion.

## 5. Deploying to Render (Cloud Hosting)

PSG NEXUS is pre-configured for **Render** via [render.yaml](../render.yaml) (Node `>=20`, `0.0.0.0:$PORT` binding, `/api/health` health check, and automatic CORS allowlisting for `RENDER_EXTERNAL_URL`).

### Step 1 — Allow Render in MongoDB Atlas
1. Open **MongoDB Atlas -> Security -> Network Access**.
2. Click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)** (Render free/starter services use dynamic outbound IPs), keeping strong database user credentials and TLS enabled.
3. Verify your vector index (`vector_index` on `website_chunks`) is active in Atlas.

### Step 2 — Commit & Push Your Changes to GitHub
Render deploys directly from your Git repository, so commit and push your local changes (never commit `.env`):
```bash
git status
git add .
git commit -m "Update chatbot UI and add Render deployment config"
git push origin main
```

### Step 3A — Deploy Using Render Blueprint (`render.yaml`) *(Recommended)*
1. Log in to **Render Dashboard** -> **New +** -> **Blueprint**.
2. Connect your GitHub repository (`PSG-NEXUS`). Render reads `render.yaml` automatically (`buildCommand: npm ci --omit=dev`, `startCommand: npm start`, `healthCheckPath: /api/health`, `SESSION_SECRET` auto-generated).
3. When prompted for environment secrets, paste:
   - `GEMINI_API_KEY`: your Google Gemini API key
   - `MONGO_URI`: your MongoDB Atlas `mongodb+srv://...` connection string
4. Click **Apply** and wait for the service status to turn **Live**.

### Step 3B — Manual Render Web Service Setup
If creating a Web Service manually instead of using Blueprint:
- **Runtime:** `Node`
- **Build Command:** `npm ci --omit=dev`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`
- **Environment Variables:**
  - `NODE_ENV` = `production`
  - `HOST` = `0.0.0.0`
  - `LOG_LEVEL` = `info`
  - `GEMINI_API_KEY` = `<your-gemini-key>`
  - `GEMINI_MODEL` = `gemini-3.5-flash-lite`
  - `MONGO_URI` = `<your-atlas-uri>`
  - `MONGO_CONNECT_TIMEOUT_MS` = `10000`
  - `SESSION_SECRET` = *(click **Generate** or provide a 64-char random hex secret — startup exits in production if missing)*
  - *(Optional)* `CORS_ORIGINS` = `https://www.psgtech.edu,https://psgtech.ac.in` *(your `https://<service>.onrender.com` origin is added automatically from `RENDER_EXTERNAL_URL`)*
  - *(Optional)* `ADMIN_API_KEY` / `REVIEWER_API_KEY` *(if omitted, `/api/admin/*` stays locked fail-closed)*

### Step 4 — Verify Deployment & Operational Notes
- Open `https://<your-service>.onrender.com/` to verify the portal and the updated PSG NEXUS chatbot widget.
- Check `https://<your-service>.onrender.com/api/health` (`200 alive`) and `https://<your-service>.onrender.com/api/ready` (`200 ready` with `database.ok: true` and `database.mode: "atlas"`).
- **Render Free Plan notes:** Services spin down after 15 minutes of inactivity (first request wakes in ~30–50s), and the container filesystem is ephemeral — configure `MONGO_URI` so conversations and feedback persist in MongoDB Atlas across restarts.
