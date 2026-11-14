// src/services/geminiService.js - Gemini Text Generation with Model Fallback

const MODELS_PRIORITY = [
    process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-3.5-flash"
];

async function callGeminiApi(modelName, prompt) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 1024
                    }
                }),
                signal: controller.signal
            }
        );

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(`[${response.status}] ${errBody.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
        if (!text) throw new Error("Gemini returned empty text candidate.");
        return text;
    } finally {
        clearTimeout(timeout);
    }
}

async function generateAnswer(question, context = "") {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from environment variables.");
    }

    const systemPrompt = `You are PSG Nexus, the official intelligent AI campus assistant for PSG College of Technology, Coimbatore.
You assist students, parents, alumni, and visitors with accurate information about admissions, courses, hostels, placements, departments, campus life, and facilities.

Guidelines:
- Tone: Professional, welcoming, encouraging, and clear.
- Formatting: Use markdown (bold headings, bullet points, clean lists) to make information readable.
- Knowledge Priority: Base your answers on the verified website information provided below whenever relevant.
- Completeness: Provide exact figures (e.g., packages, attendance percentages, eligibility) present in the verified context.
- Guidance: If specific details are unavailable, guide the user to official PSG Tech resources (https://www.psgtech.edu) or the relevant office.

${context ? `=== VERIFIED PSG TECH WEBSITE CONTEXT ===\n${context}\n=========================================` : "Use verified institutional facts regarding PSG College of Technology, Coimbatore."}

User Question: ${question}
`;

    let lastError = null;
    for (const modelName of MODELS_PRIORITY) {
        try {
            console.log(`🤖 Querying Gemini with model: ${modelName}`);
            const answer = await callGeminiApi(modelName, systemPrompt);
            return answer;
        } catch (err) {
            console.warn(`⚠️ Model ${modelName} failed (${err.message}), trying next model...`);
            lastError = err;
        }
    }

    throw lastError || new Error("All Gemini models failed to generate response.");
}

module.exports = { generateAnswer };
