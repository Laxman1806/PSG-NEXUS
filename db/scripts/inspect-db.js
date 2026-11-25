// db/scripts/inspect-db.js
require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("--- 1. Checking MongoDB Atlas ---");
    const atlasUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!atlasUri) {
        console.error("Missing MONGO_URI / MONGODB_URI in .env");
        return;
    }

    const client = new MongoClient(atlasUri, { serverSelectionTimeoutMS: 5000 });
    try {
        await client.connect();
        const db = client.db('psg_chatbot');
        const collections = await db.listCollections().toArray();
        console.log("Atlas collections:", collections.map(c => c.name));

        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(` - ${col.name}: ${count} documents`);
        }

        const chunkCol = db.collection('website_chunks');
        const count = await chunkCol.countDocuments();
        if (count > 0) {
            const sample = await chunkCol.findOne();
            console.log(`Sample doc in Atlas website_chunks:`);
            console.log(` - title: ${sample.title}`);
            console.log(` - url: ${sample.url}`);
            console.log(` - content length: ${sample.content ? sample.content.length : 0}`);
            console.log(` - embedding length: ${sample.embedding ? sample.embedding.length : 'none'}`);

            // Check if all chunks have 768d embeddings
            const withoutEmbed = await chunkCol.countDocuments({ embedding: { $exists: false } });
            const wrongDim = await chunkCol.countDocuments({ "embedding.767": { $exists: false } });
            const has768 = await chunkCol.countDocuments({ "embedding.767": { $exists: true }, "embedding.768": { $exists: false } });
            console.log(` - Chunks with exactly 768 dims: ${has768} / ${count}`);
            console.log(` - Chunks missing embedding: ${withoutEmbed}`);
            if (wrongDim > 0) {
                console.log(` - Chunks with wrong dimension: ${wrongDim}`);
            }

            // List unique titles/pages in Atlas
            const titles = await chunkCol.distinct("title");
            console.log(`\nAtlas unique page titles (${titles.length}):`);
            titles.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
        }
    } catch (err) {
        console.error("Atlas inspection error:", err.message);
    } finally {
        await client.close();
    }

    console.log("\n--- 2. Checking Local JSON Cache ---");
    const jsonPath = path.resolve(__dirname, '../data/knowledge_chunks.json');
    if (fs.existsSync(jsonPath)) {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`knowledge_chunks.json has ${data.length} chunks.`);
        if (data.length > 0) {
            console.log(`Sample chunk title: "${data[0].title}", embed dim: ${data[0].embedding ? data[0].embedding.length : 0}`);
            const uniqueJsonTitles = [...new Set(data.map(d => d.title))];
            console.log(`Unique titles in JSON cache (${uniqueJsonTitles.length}):`);
            uniqueJsonTitles.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
        }
    } else {
        console.log("knowledge_chunks.json NOT found.");
    }

    console.log("\n--- 3. Checking Local MongoDB (127.0.0.1:27017) ---");
    try {
        const localClient = new MongoClient("mongodb://127.0.0.1:27017/psg_chatbot", { serverSelectionTimeoutMS: 2000 });
        await localClient.connect();
        const localDb = localClient.db("psg_chatbot");
        const localCols = await localDb.listCollections().toArray();
        console.log("Local collections:", localCols.map(c => c.name));
        for (const col of localCols) {
            const count = await localDb.collection(col.name).countDocuments();
            console.log(` - local ${col.name}: ${count} documents`);
        }
        await localClient.close();
    } catch (e) {
        console.log("Local MongoDB not reachable or:", e.message);
    }
}

main();
