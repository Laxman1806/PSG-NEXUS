// db/scripts/list-gemini-models.js
require('dotenv').config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
        console.log(`Found ${data.models.length} models:`);
        const supported = data.models
            .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
            .map(m => m.name.replace('models/', ''));
        console.log("Supported generateContent models:\n", supported);
    } else {
        console.log("Response:", data);
    }
}

listModels().catch(console.error);
