// src/services/geminiService.js - Official SDK Text Generation with Model Fallback
const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODELS_PRIORITY = [
    process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.8-flash"
];

let genAI = null;
function getGenAI() {
    if (!genAI) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing from environment variables.");
        }
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
}

async function generateAnswer(question, context = "") {
    const ai = getGenAI();

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
            const model = ai.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(systemPrompt);
            const answer = result.response.text();
            if (answer && answer.trim()) {
                return answer.trim();
            }
        } catch (err) {
            console.warn(`⚠️ Model ${modelName} failed (${err.message}), trying next model...`);
            lastError = err;
        }
    }

    throw lastError || new Error("All Gemini models failed to generate response.");
}

module.exports = { generateAnswer };
