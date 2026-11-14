
async function generateEmbedding(text) {
    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({
                model: "models/gemini-embedding-001",
                content: {
                    parts: [{ text }]
                },
                outputDimensionality: 768
            })
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(JSON.stringify(result));
    }

    return result.embedding.values;
}

module.exports = { generateEmbedding };
