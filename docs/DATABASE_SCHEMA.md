# PSG NEXUS — Database Schema & Atlas Vector Index Specification

Database Name: `psg_chatbot` (configurable via `MONGODB_DB_NAME`).

## 1. Collections

1. **`website_chunks` (Legacy / Preserved Read-Compatible Collection):**
   - Currently stores pre-existing crawled vectors (`93` documents in Atlas with `vector_index` READY at `768` cosine dimensions). Preserved untouched during migrations.
2. **`knowledge_documents` (Managed Document Registry):**
   - Fields: `documentId` (SHA-256 prefix), `title`, `sourceUrl`, `sourceType` (`html|pdf|docx|txt|url|notice|regulation`), `category`, `department`, `academicYear`, `publishedAt`, `effectiveFrom`, `effectiveTo`, `lastVerifiedAt`, `language`, `authority`, `documentVersion`, `contentHash`, `isHistorical`, `status` (`pending|staging|active|archived|rejected|historical`), `extractionWarnings`, `chunkCount`, `ingestionRunId`, `updatedAt`.
3. **`knowledge_chunks` & `knowledge_chunks_staging` (Versioned Vector Chunks):**
   - Fields: `documentId`, `chunkId`, `title`, `content`, `sourceUrl`, `sourceType`, `category`, `department`, `academicYear`, `publishedAt`, `effectiveFrom`, `effectiveTo`, `lastVerifiedAt`, `language`, `authority`, `documentVersion`, `chunkIndex`, `pageNumber`, `sectionHeading`, `embeddingModel` (`gemini-embedding-001`), `embeddingDimensions` (`768`), `embedding` (`[Number]`), `contentHash`, `isHistorical`, `status`, `ingestionRunId`, `supersededByRunId`, `createdAt`, `activatedAt`.
4. **`ingestion_runs`:** Tracks `runId`, `dryRun`, `status`, `previousRunId`, `discoveredCount`, `changedOrNewCount`, `unchangedCount`, `failedDocuments`, `deletedDocumentIds`, `activatedChunkCount`.
5. **`conversations`:** Tracks `conversationId`, `ownerSessionId`, `title`, `summary`, bounded `messages[]`, `createdAt`, `updatedAt`, `expiresAt`.
6. **`feedback`:** Tracks `feedbackId`, `conversationId`, `messageId`, `ownerSessionId`, `rating` (`up|down`), `comment`, `query`, `createdAt`.
7. **`audit_logs`:** Tracks `auditId`, `timestamp`, `actorId`, `role`, `action`, `documentId` / `runId`, `updates`.

## 2. Recommended Atlas Vector Search Index for `knowledge_chunks`

Create an Atlas Vector Search index named `knowledge_vector_index` on `psg_chatbot.knowledge_chunks` so metadata pre-filtering works natively in `$vectorSearch`:

```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 768, "similarity": "cosine" },
    { "type": "filter", "path": "status" },
    { "type": "filter", "path": "category" },
    { "type": "filter", "path": "department" },
    { "type": "filter", "path": "academicYear" },
    { "type": "filter", "path": "language" },
    { "type": "filter", "path": "sourceType" }
  ]
}
```
