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
        return "I am PSG Nexus, your official AI campus guide for PSG College of Technology. For detailed inquiries, please visit our official website at [https://www.psgtech.edu](https://www.psgtech.edu) or contact the college administration at 0422-2572177.";
    }

    const cleanLines = context
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && !l.startsWith('===') && !l.startsWith('[Source'));

    const intro = "Here is verified information regarding your query from the PSG College of Technology campus repository:\n\n";
    const body = cleanLines.slice(0, 16).map(l => {
        if (l.match(/^\d+\./) || l.startsWith('*') || l.startsWith('-')) return l;
        return `* ${l}`;
    }).join('\n');

    const footer = "\n\nFor official documentation or assistance, please refer to the official portal at [https://www.psgtech.edu](https://www.psgtech.edu).";
    return intro + body + footer;
}

async function generateAnswer(question, context = "") {
    const ai = getGenAI();

    const systemPrompt = `You are PSG Nexus, the official intelligent AI campus assistant for PSG College of Technology, Coimbatore.
Your mission is to provide accurate, reassuring, and highly structured information specifically designed for three core groups:

1. FOR PARENTS:
   - Prioritize reassurance regarding student safety, 24/7 campus security, biometric hostel entry, and strict 8:30 PM curfews.
   - Explain the Parent Portal (parentzone.php) where parents can log in using their ward's Roll Number & DOB to track attendance, CA1/CA2 test marks, and semester results.
   - Highlight the Tutor-Ward mentoring system, on-campus health clinic, emergency connectivity to the 1400-bed PSG Hospitals, fees transparency, and government/trust scholarships.

2. FOR STUDENTS (PROSPECTIVE & CURRENT):
   - Guide them on TNEA Counselling Code 2006, cutoff trends (195+ for top branches), admissions procedures, and lateral entry.
   - Detail unique offerings like the flagship 5-Year B.E. Sandwich programmes (Mechanical, Production, EEE) with PSG Industrial Institute and 5-Year Integrated M.Sc degrees.
   - Clearly explain academic regulations: mandatory 75% attendance rule (condonation 65%-74%, repeat below 65%), continuous assessment (CA 50%), and end-semester exams (ESE 50%).
   - Highlight placement stats (average ₹11.5–₹12.5 LPA, highest ₹52–₹56 LPA, 300+ dream offers >₹15 LPA) and Career Development Centre (CDC) training.

3. FOR VISITORS, GUESTS & RECRUITERS:
   - Provide exact location details: Avinashi Road, Peelamedu, Coimbatore - 641004.
   - Provide transit distances: 5 km from Coimbatore International Airport (CJB), 7 km from Coimbatore Junction (CBE) Railway Station, 6 km from Gandhipuram Central Bus Stand.
   - Explain on-campus air-conditioned Guest House amenities and direct contact numbers for placement/admissions.

Formatting & Style Rules:
- Tone: Professional, welcoming, encouraging, empathetic, and clear.
- Formatting: Use markdown (bold headings, bullet points, clean lists).
- Accuracy: Cite exact figures, phone numbers (0422-4344446 / 0422-4344167), percentages, and official links from the verified context below.
- Campus Navigation Trigger: If the user expresses an intent to view, go to, or navigate to a campus page (e.g., staff profiles, faculty directory, syllabus, admissions, placements, hostel, contact, etc.), conclude your message with the dedicated navigation tag:
  [[NAVIGATE:/target-url|Button Label]]
  Examples:
  - For faculty / staff: [[NAVIGATE:/facultyDetails.php|Faculty & Staff Directory]]
  - For syllabus / courses: [[NAVIGATE:/programme.php|Academic Programmes & Syllabus]]
  - For admissions: [[NAVIGATE:/admission.php|Admissions & Eligibility Portal]]
  - For placements: [[NAVIGATE:/placements|Career & Placements Portal]]
  - For hostels: [[NAVIGATE:/hostel|Hostels & Residential Life]]

${context ? `=== VERIFIED PSG TECH WEBSITE CONTEXT ===\n${context}\n=========================================` : "Use verified institutional facts regarding PSG College of Technology, Coimbatore."}

User Question: ${question}
`;

    let lastError = null;
    for (const modelName of MODELS_PRIORITY) {
        try {
            console.log(`🤖 Querying Gemini with model: ${modelName}`);
            const model = ai.getGenerativeModel({ model: modelName });
            
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

    // Direct context fallback for 100% uptime
    if (context && context.trim()) {
        console.warn("⚠️ Remote models unavailable. Serving verified institutional context fallback.");
        return formatContextualFallback(question, context);
    }

    throw lastError || new Error("All Gemini models failed to generate response.");
}

module.exports = { generateAnswer };
