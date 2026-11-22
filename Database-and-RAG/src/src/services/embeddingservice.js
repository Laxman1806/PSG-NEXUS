async function generateEmbedding(text) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from the .env file.");
    }

    const model = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({
                model: `models/${model}`,
                content: { parts: [{ text }] },
                outputDimensionality: Number(process.env.VECTOR_DIMENSIONS || 768)
            }),
            signal: AbortSignal.timeout(45000)
        }
    );

    const result = await response.json();

    if (!response.ok) {
        const message = result.error?.message || JSON.stringify(result);
        throw new Error(`Gemini embedding request failed (${response.status}): ${message}`);
    }

    const values = result.embedding?.values;
    if (!Array.isArray(values)) {
        throw new Error("Gemini returned an invalid embedding response.");
    }

    return values;
}

module.exports = { generateEmbedding };
