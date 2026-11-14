require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

async function cleanDatabase() {
    console.log('🧹 Clearing PSG Nexus Database...');

    // 1. Clear Local MongoDB
    try {
        const localClient = new MongoClient('mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 3000 });
        await localClient.connect();
        const localDb = localClient.db('psg_chatbot');
        const res = await localDb.collection('website_chunks').deleteMany({});
        console.log(`✅ Cleared local MongoDB (psg_chatbot.website_chunks): Removed ${res.deletedCount} documents.`);
        await localClient.close();
    } catch (err) {
        console.warn('⚠️ Local MongoDB note:', err.message);
    }

    // 2. Clear MongoDB Atlas if connected
    if (process.env.MONGO_URI) {
        try {
            const atlasClient = new MongoClient(process.env.MONGO_URI, { serverSelectionTimeoutMS: 4000 });
            await atlasClient.connect();
            const atlasDb = atlasClient.db('psg_chatbot');
            const res = await atlasDb.collection('website_chunks').deleteMany({});
            console.log(`✅ Cleared MongoDB Atlas (psg_chatbot.website_chunks): Removed ${res.deletedCount} documents.`);
            await atlasClient.close();
        } catch (err) {
            console.warn('⚠️ MongoDB Atlas note:', err.message);
        }
    }

    // 3. Reset local cache file
    const cachePath = path.join(__dirname, '..', 'data', 'knowledge_chunks.json');
    if (fs.existsSync(cachePath)) {
        fs.writeFileSync(cachePath, JSON.stringify([], null, 2), 'utf8');
        console.log('✅ Cleared data/knowledge_chunks.json (reset to empty array).');
    }

    console.log('\n🎯 Database is now completely empty!');
    console.log('👉 To crawl and populate with website pages whenever needed, run:');
    console.log('   npm run crawl\n');
}

cleanDatabase().catch(err => {
    console.error('Error cleaning database:', err);
    process.exit(1);
});
