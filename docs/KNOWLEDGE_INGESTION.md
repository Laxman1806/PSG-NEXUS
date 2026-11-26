# PSG NEXUS — Knowledge Ingestion & Versioning Guide

## 1. Overview (`db/ingestion/`)

The ingestion pipeline converts approved institutional sources into versioned documents and chunks **without touching or wiping the existing legacy `website_chunks` collection**.

### Supported Formats (`db/ingestion/extractors.js`)
- **HTML:** Removes site chrome (`#tg-header`, `#tg-footer`, `.tg-ticker`, `.tg-breadcrumb`, `nav`, `footer`, scripts, styles), prioritizes `#tg-main` / `main`, preserves heading hierarchy and table structure, and skips asset-wrapper HTML stubs (`*.png/index.html`, etc.).
- **PDF (`pdf-parse`):** Extracts page-by-page text with `pageNumber` metadata and detects image-only / scanned PDFs (flagging them in `failedDocuments` rather than silently ignoring them).
- **DOCX (`mammoth`):** Extracts clean text and conversion warnings.
- **TXT / Notices:** Parses optional `Title:`, `Date:`, and `Department:` headers.
- **Approved Public URLs:** Fetches only `http:`/`https:` URLs whose hostnames appear in `ALLOWED_FETCH_HOSTS`.

### Document-Aware Chunking (`db/ingestion/chunker.js`)
- Configurable profiles per source type (`html`, `pdf`, `docx`, `txt`, `notice`, `regulation`, `url`), preserving `pageNumber` and `sectionHeading`.
- Infers domain `category` (across 24 campus domains), `academicYear`, and `isHistorical`.

## 2. Safe Staging & Rollback (`db/repositories/knowledgeRepository.js`)

1. Computes SHA-256 `contentHash` per extracted document; unchanged `active` documents are skipped in incremental runs.
2. Writes candidate chunks into `knowledge_chunks_staging` (`status: 'staging'`).
3. Validates non-empty chunk count and embedding vector dimensions (`768`).
4. Marks only superseded chunks of updated documents as `archived` (keeping `supersededByRunId` pointer) and inserts active chunks into `knowledge_chunks`.
5. Records full run report in `ingestion_runs`; `rollbackIngestionRun(runId)` restores prior active chunks if needed.

## 3. CLI Usage

```bash
# Safe dry-run scan of all local HTML + PDFs (zero DB writes, zero embedding API calls)
node db/scripts/ingest-local-pages.js --dry-run --no-embed

# Incremental ingestion with Gemini embeddings into versioned knowledge_chunks
npm run crawl

# Protected cleanup of staging/managed collections (never deletes legacy website_chunks)
node db/scripts/clean-database.js --confirm-clean
```
