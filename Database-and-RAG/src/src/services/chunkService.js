
// Split webpage content into smaller pieces.
// Smaller chunks help vector search find relevant information.

function splitIntoChunks(text) {
    const chunkSize = Number(process.env.CHUNK_SIZE || 1000);
    const overlap = Number(process.env.CHUNK_OVERLAP || 150);

    if (chunkSize <= 0 || overlap < 0 || overlap >= chunkSize) {
        throw new Error("Invalid chunk size or overlap configuration.");
    }

    const chunks = [];

    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);

        const chunk = text.slice(start, end).trim();

        if (chunk.length > 0) {
            chunks.push(chunk);
        }

        if (end === text.length) {
            break;
        }

        // Overlap preserves context between consecutive chunks.
        start = end - overlap;
    }

    return chunks;
}

module.exports = { splitIntoChunks };
