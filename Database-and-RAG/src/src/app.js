require("dotenv").config();

const express = require("express");
const path = require("path");
const helmet = require("helmet");

const { connectDB, isDBConnected } = require("./config/database");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const publicDirectory = path.join(__dirname, "../public");

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// The downloaded PSG Tech website uses inline scripts/styles and external
// fonts/scripts. Disable only Helmet's default CSP so the mirrored pages work;
// the other Helmet security headers remain enabled.
app.use(helmet({ contentSecurityPolicy: false }));

app.get("/robots.txt", (req, res) => {
    res.type("text/plain").send("User-agent: *\nAllow: /\n");
});

app.get("/health", (req, res) => {
    const connected = isDBConnected();
    res.status(connected ? 200 : 503).json({
        status: connected ? "success" : "degraded",
        message: connected
            ? "PSG Nexus website and MongoDB are available."
            : "PSG Nexus website is available, but MongoDB is not connected.",
        database: connected ? "connected" : "disconnected"
    });
});

// Serve the downloaded PSG Tech website and its local assets.
app.use(express.static(publicDirectory, {
    extensions: ["html"],
    index: ["index.html"]
}));

// Start the website independently of MongoDB. A temporary Atlas SSL/network
// issue should not prevent users from opening the local PSG Tech website.
const server = app.listen(PORT, () => {
    console.log("----------------------------------");
    console.log("       PSG NEXUS SERVER");
    console.log("----------------------------------");
    console.log(`Website: http://localhost:${PORT}`);
    console.log(`Health:  http://localhost:${PORT}/health`);
    console.log("MongoDB connection is being checked in the background.");
});

connectDB().catch(error => {
    console.error("MongoDB is currently unavailable:", error.message);
    console.error("The local website will remain available. Check Atlas Network Access and your network.");
});

process.on("SIGINT", () => {
    server.close(() => process.exit(0));
});
