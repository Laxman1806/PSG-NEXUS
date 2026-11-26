// db/scripts/sync-local-mongodb.js - Add deterministic _id and sync all 107 chunks
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');

async function syncAll() {
    const jsonPath = path.resolve(__dirname, '../data/knowledge_chunks.json');
    const chunks = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Add _id if missing
    for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i];
        if (!c._id) {
            c._id = crypto.createHash('sha256').update(`${c.url || ''}:${c.chunkIndex ?? i}:${c.title || ''}`).digest('hex');
        }
    }
    fs.writeFileSync(jsonPath, JSON.stringify(chunks, null, 2), 'utf8');
    console.log(`Updated knowledge_chunks.json with _ids. Total chunks: ${chunks.length}`);

    const client = new MongoClient('mongodb://127.0.0.1:27017/psg_chatbot', { serverSelectionTimeoutMS: 3000 });
    try {
        await client.connect();
        const db = client.db('psg_chatbot');
        const col = db.collection('website_chunks');
        
        // Remove null _id document if any
        await col.deleteOne({ _id: null });

        for (const c of chunks) {
            await col.updateOne({ _id: c._id }, { $set: c }, { upsert: true });
        }

        const total = await col.countDocuments();
        console.log(`✅ MongoDB website_chunks count now: ${total}`);
    } catch (e) {
        console.warn('MongoDB connection note:', e.message);
    } finally {
        await client.close();
    }
}

syncAll();
