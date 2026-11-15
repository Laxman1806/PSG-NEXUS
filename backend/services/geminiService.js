// backend/services/geminiService.js - Official SDK Text Generation with Model Fallback
const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODELS_PRIORITY = [
    process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview"
];

const MODEL_TIMEOUT_MS = 10000; // 10s timeout per model

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

// Format direct contextual answer when remote API is unreachable
function formatContextualFallback(question, context) {
    if (!context || !context.trim()) {
        return "I am PSG Nexus, your campus guide for PSG College of Technology. For detailed inquiries, please visit our official website at [https://www.psgtech.edu](https://www.psgtech.edu) or contact the college administration.";
    }

    // Extract cleanest parts of the verified context
    const cleanLines = context
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && !l.startsWith('===') && !l.startsWith('[Source'));

    const intro = "Here is the verified information regarding your query from the PSG College of Technology campus repository:\n\n";
    const body = cleanLines.slice(0, 15).map(l => {
        if (l.match(/^\d+\./) || l.startsWith('*') || l.startsWith('-')) return l;
        return `* ${l}`;
    }).join('\n');

    const footer = "\n\nFor additional details or official documentation, please refer to the official portal at [https://www.psgtech.edu](https://www.psgtech.edu).";
    return intro + body + footer;
}

async function generateAnswer(question, context = "") {
    const ai = getGenAI();

    const systemPrompt = `You are PSG Nexus, the official intelligent AI campus assistant for PSG College of Technology, Coimbatore.
You assist students, parents, alumni, and visitors with accurate information about admissions, courses, hostels, placements, departments, campus life, and facilities.

Guidelines:
- Tone: Professional, welcoming, encouraging, and clear.
- Formatting: Use markdown (bold headings, bullet points, clean lists) to make information readable.
- Knowledge Priority: Base your answers strictly on the verified website information provided below.
- Completeness: Provide exact figures (packages, attendance percentages, eligibility, entrance tests) present in the verified context.
- Guidance: If specific details are unavailable, guide the user to official PSG Tech resources (https://www.psgtech.edu) or the relevant office.

${context ? `=== VERIFIED PSG TECH WEBSITE CONTEXT ===\n${context}\n=========================================` : "Use verified institutional facts regarding PSG College of Technology, Coimbatore."}

User Question: ${question}
`;

    let lastError = null;
    for (const modelName of MODELS_PRIORITY) {
        try {
            console.log(`🤖 Querying Gemini with model: ${modelName}`);
            const model = ai.getGenerativeModel({ model: modelName });
            
            // Timeout wrapper to avoid long hangs
            const generatePromise = model.generateContent(systemPrompt);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Timeout after ${MODEL_TIMEOUT_MS / 1000}s`)), MODEL_TIMEOUT_MS)
            );

            const result = await Promise.race([generatePromise, timeoutPromise]);
            const answer = result.response.text();
            if (answer && answer.trim()) {
                return answer.trim();
            }
        } catch (err) {
            console.warn(`⚠️ Model ${modelName} failed (${err.message}), trying next candidate...`);
            lastError = err;
        }
    }

    // If all remote models fail, provide verified context directly to guarantee 100% uptime
    if (context && context.trim()) {
        console.warn("⚠️ Remote models unavailable. Serving verified institutional context fallback.");
        return formatContextualFallback(question, context);
    }

    throw lastError || new Error("All Gemini models failed to generate response.");
}

module.exports = { generateAnswer };
