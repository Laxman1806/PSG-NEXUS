
const crypto = require("crypto");

const { getDB } = require("../config/database");
const { generateEmbedding } = require("./embeddingservice");
const { splitIntoChunks } = require("./chunkService");

// Store webpage content and its vector embeddings in MongoDB.
async function ingestPages(pages) {
    const db = getDB();

    const collection = db.collection(
        process.env.MONGODB_COLLECTION || "website_chunks"
    );

    let storedCount = 0;

    for (const page of pages) {
        const chunks = splitIntoChunks(page.content);

        console.log(`Processing ${page.title}: ${chunks.length} chunks`);

        for (let i = 0; i < chunks.length; i++) {
            const content = chunks[i];

            // Generate a 768-dimensional vector for this text chunk.
            const embedding = await generateEmbedding(content);

            // Generate a stable ID to prevent duplicate records.
            const id = crypto
                .createHash("sha256")
                .update(`${page.url}:${i}`)
                .digest("hex");

            const document = {
                _id: id,
                title: page.title,
                url: page.url,
                content,
                chunkIndex: i,
                embedding,
                updatedAt: new Date()
            };

            await collection.updateOne(
                { _id: id },
                { $set: document },
                { upsert: true }
            );

            storedCount++;

            console.log(`Stored chunk ${i + 1}/${chunks.length}`);
        }
    }

    console.log(`Total chunks stored or updated: ${storedCount}`);

    return storedCount;
}

module.exports = { ingestPages };
