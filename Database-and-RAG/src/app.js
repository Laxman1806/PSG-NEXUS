
// Load environment variables from the .env file
require("dotenv").config();

const express = require("express");
const path = require("path");
const helmet = require("helmet");

const { connectDB } = require("./config/database");

// Create the Express application
const app = express();

// Read JSON data sent by the frontend
app.use(express.json({ limit: "1mb" }));

// Read form data
app.use(express.urlencoded({ extended: true }));

// Add basic HTTP security headers
app.use(helmet());

// Serve HTML, CSS and JavaScript files from public
app.use(express.static(path.join(__dirname, "../public")));

// Tell the crawler that there are no additional robots.txt restrictions
// This is only for our local sample website.
app.get("/robots.txt", (req, res) => {
    res.type("text/plain").send("User-agent: *\nAllow: /\n");
});

// Health-check route to verify that the server is running
app.get("/health", (req, res) => {
    res.json({
        status: "success",
        message: "PSG Tech chatbot server is running"
    });
});

// Start the server only after MongoDB connects
async function startServer() {
    try {
        await connectDB();

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log("----------------------------------");
            console.log("PSG Tech RAG Chatbot Server Started");
            console.log(`Website: http://localhost:${PORT}`);
            console.log(`Health:  http://localhost:${PORT}/health`);
            console.log("----------------------------------");
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
}

startServer();
