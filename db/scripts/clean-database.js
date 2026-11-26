const { connectDB, closeDB } = require('../connection');

async function dropEntireDatabase() {
    const db = await connectDB();

    if (!db) {
        console.error('Could not connect to MongoDB Atlas.');
        process.exitCode = 1;
        return;
    }

    try {
        // Prevent accidentally deleting a different database.
        if (db.databaseName !== 'psg_chatbot') {
            throw new Error(
                `Wrong database connected: ${db.databaseName}. Expected psg_chatbot.`
            );
        }

        console.log('Connected to:', db.databaseName);
        console.log('Deleting the entire psg_chatbot database...');

        await db.dropDatabase();

        console.log('Successfully deleted the psg_chatbot database.');
    } finally {
        await closeDB();
    }
}

dropEntireDatabase().catch((error) => {
    console.error('Database deletion failed:', error.message);
    process.exitCode = 1;
});