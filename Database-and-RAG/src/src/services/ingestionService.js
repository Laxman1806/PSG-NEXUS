const crypto = require("crypto");

const { getDB, getClient } = require("../config/database");
const { generateEmbedding } = require("./embeddingservice");
const { splitIntoChunks } = require("./chunkService");

// Generate every new embedding first. Only after all embeddings are ready do
// we replace the collection contents inside a MongoDB transaction. This avoids
// deleting the current knowledge base when crawling or Gemini fails midway.
async function ingestPages(pages, options = {}) {
    const { replaceAll = false } = options;
    const db = getDB();
    const collectionName = process.env.MONGODB_COLLECTION || "website_chunks";
    const collection = db.collection(collectionName);

    if (!Array.isArray(pages) || pages.length === 0) {
        throw new Error("No pages were supplied for ingestion.");
    }

    const documents = [];
    const dimensions = Number(process.env.VECTOR_DIMENSIONS || 768);

    for (const page of pages) {
        if (!page.url || !page.content || page.content.trim().length < 50) {
            throw new Error(`Page has missing or insufficient content: ${page.url || "unknown URL"}`);
        }

        const chunks = splitIntoChunks(page.content);
        console.log(`Processing ${page.title}: ${chunks.length} chunks`);

        for (let i = 0; i < chunks.length; i++) {
            const content = chunks[i];
            const embedding = await generateEmbedding(content);

            if (!Array.isArray(embedding) || embedding.length !== dimensions) {
                throw new Error(
                    `Invalid embedding for ${page.url}, chunk ${i}. ` +
                    `Expected ${dimensions} dimensions, received ${embedding?.length || 0}.`
                );
            }

            const id = crypto
                .createHash("sha256")
                .update(`${page.url}:${i}`)
                .digest("hex");

            documents.push({
                _id: id,
                title: page.title || "PSG Tech Website",
                url: page.url,
                content,
                chunkIndex: i,
                embedding,
                updatedAt: new Date()
            });

            console.log(`Prepared chunk ${i + 1}/${chunks.length}`);
        }
    }

    if (documents.length === 0) {
        throw new Error("No content chunks were generated. Existing MongoDB data was not changed.");
    }

    console.log(`Prepared ${documents.length} chunks from ${pages.length} pages.`);

    if (replaceAll) {
        const session = getClient().startSession();
        try {
            await session.withTransaction(async () => {
                await collection.deleteMany({}, { session });

                // Insert all refreshed chunks in the same transaction. If the
                // insert fails, MongoDB rolls back the deletion as well.
                await collection.insertMany(documents, {
                    ordered: true,
                    session
                });
            }, {
                readPreference: "primary",
                readConcern: { level: "snapshot" },
                writeConcern: { w: "majority" }
            });
        } finally {
            await session.endSession();
        }
    } else {
        const operations = documents.map(document => ({
            replaceOne: {
                filter: { _id: document._id },
                replacement: document,
                upsert: true
            }
        }));

        for (let start = 0; start < operations.length; start += 100) {
            await collection.bulkWrite(operations.slice(start, start + 100), { ordered: true });
        }
    }

    console.log(`Successfully stored ${documents.length} chunks in '${collectionName}'.`);
    return documents.length;
}

module.exports = { ingestPages };
