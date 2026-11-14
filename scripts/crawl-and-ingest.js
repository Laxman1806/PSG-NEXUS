
require("dotenv").config();

const { connectDB } = require("../src/config/database");
const { crawlWebsite } = require("../src/services/crawlerService");
const { ingestPages } = require("../src/services/ingestionService");

async function main() {
    try {
        console.log("Starting PSG Tech website ingestion...");

        // Connect to MongoDB before storing content.
        await connectDB();

        // Read seed URLs from the environment file.
        const seedUrls = (process.env.SEED_URLS || "")
            .split(",")
            .map(url => url.trim())
            .filter(Boolean);

        if (seedUrls.length === 0) {
            throw new Error("No SEED_URLS configured in .env");
        }

        // Crawl the configured webpages.
        const maxPages = Number(process.env.CRAWLER_MAX_PAGES || 30);

        const pages = await crawlWebsite(seedUrls, maxPages);

        if (pages.length === 0) {
            throw new Error("No webpages were successfully extracted.");
        }

        // Generate embeddings and store the content.
        await ingestPages(pages);

        console.log("Website ingestion completed successfully!");

    } catch (error) {
        console.error("Ingestion failed:", error.message);
        process.exitCode = 1;
    }
}

main();
