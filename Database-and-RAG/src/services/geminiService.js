
async function generateAnswer(question, context) {

    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from .env");
    }

    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    const prompt = `
You are the PSG Tech college information assistant.

Answer using ONLY the website information provided below.
Do not invent facts or add information from outside sources.

If the information does not contain the answer, say:
"I couldn't find this information on the PSG Tech website."

Website information:
${context}

Student question:
${question}

Provide a clear and helpful answer.
`;

    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {

        // Create a timeout controller for this request
        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 45000);

        try {
            console.log(`Gemini request: attempt ${attempt}`);
            console.log(`Using model: ${model}`);

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-goog-api-key": process.env.GEMINI_API_KEY
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text: prompt }]
                            }
                        ],
                        generationConfig: {
                            temperature: 0.2,
                            maxOutputTokens: 1024
                        }
                    }),
                    signal: controller.signal
                }
            );

            console.log("Gemini HTTP status:", response.status);

            const result = await response.json();

            if (!response.ok) {
                const error = new Error(
                    result.error?.message || "Gemini API request failed"
                );

                error.status = response.status;
                throw error;
            }

            const answer = result.candidates?.[0]?.content?.parts
                ?.map(part => part.text || "")
                .join("")
                .trim();

            if (!answer) {
                throw new Error(
                    "Gemini returned no text. Check candidate finish reason or safety feedback."
                );
            }

            console.log("Gemini answer generated successfully!");

            return answer;

        } catch (error) {

            if (error.name === "AbortError") {
                console.error("Gemini request timed out after 45 seconds.");
            } else {
                console.error("Gemini error:", error.message);
            }

            const retryable =
                error.name === "AbortError" ||
                [408, 429, 500, 502, 503, 504].includes(error.status);

            if (!retryable || attempt === maxRetries) {
                throw error;
            }

            const delay = 1000 * Math.pow(2, attempt - 1);

            console.log(`Retrying in ${delay / 1000} seconds...`);

            await new Promise(resolve =>
                setTimeout(resolve, delay)
            );

        } finally {
            clearTimeout(timeout);
        }
    }
}

module.exports = { generateAnswer };
