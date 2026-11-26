# PSG NEXUS — Retrieval-Augmented Generation (RAG) Pipeline

## 1. Hybrid Retrieval Design (`db/searchService.js`)

Single-signal vector search misses exact institutional identifiers (e.g., `2006`, `TANCET`, `Dr. G. Thilagavathi`, `CA1/CA2`), while pure keyword matching misses paraphrases (e.g., `"accommodation"` vs `"hostel"`). PSG NEXUS executes a hybrid pipeline:

1. **Query Preparation:**
   - Multilingual expansion (`backend/services/languageService.js`) maps Tamil Unicode and Tanglish terms into English search terms alongside the original query.
   - Follow-up rewriting (`backend/services/queryRewriteService.js`) prepends the prior topic anchor for elliptical questions (e.g., `"What about first-year students?"`).
2. **Vector Branch:**
   - Embeds query using `gemini-embedding-001` (`768` dimensions) via `backend/services/embeddingService.js`.
   - When connected to MongoDB Atlas, runs `$vectorSearch` against `knowledge_chunks` (`knowledge_vector_index`) and `website_chunks` (`vector_index`).
   - When offline or on local Community MongoDB (which does not support `$vectorSearch`), computes cosine similarity against in-memory active vectors (`score >= 0.30`).
3. **Lexical Branch:**
   - Computes Inverse Document Frequency (`IDF = log(1 + (N - df + 0.5) / (df + 0.5))`) over the active pool so high-frequency campus boilerplate (e.g., `"college"`, `"technology"`, `"coimbatore"`) never drowns out entity-specific words like `"principal"` or `"tancet"`.
   - Applies campus domain synonym expansions (`accommodation -> hostel`, `evlo -> fees`, etc.).
4. **Reciprocal Rank Fusion (RRF) & Deduplication:**
   - Combines vector ranks (`weight = 1.0`) and lexical ranks (`weight = 0.85`) with `k = 60`, deduplicating overlapping normalized URL + content prefixes.
5. **Multi-Signal Reranking (`backend/services/rerankingService.js`):**
   - Scores each candidate using weighted normalized RRF (`0.38`), lexical query coverage (`0.40`), vector score (`0.22`), source authority weight, title/URL entity alignment, niche-page dampening (`fn_oci` unless user asks for FN/OCI/NRI), and historical dampening (`-0.18` unless query references historical years).

## 2. Evidence Assessment & Grounded Generation

Before invoking Gemini, `backend/services/answerValidationService.js` classifies evidence into one of six explicit statuses:

- `VERIFIED`: Strong lexical/vector alignment across retrieved passages.
- `PARTIAL`: Partial evidence coverage.
- `INSUFFICIENT`: No relevant evidence or unverified hyper-specific sub-query -> triggers safe abstention without calling Gemini.
- `CONFLICTING`: Numeric disagreement detected across retrieved sources (e.g., differing attendance percentages or 4-digit counselling codes).
- `OUTDATED`: Only historical sources matched a present-tense query -> model explicitly labels historical status.
- `LIVE_DATA_REQUIRED`: Query asks for personal student records or real-time operational state (`my attendance`, `vacant seats right now`, `yesterday`) -> directs user to authenticated portals (`/parentzone.php`).

`backend/services/citationService.js` binds `[E1..En]` tags to verified source metadata and rejects any citation ID not present in the retrieved evidence set.
