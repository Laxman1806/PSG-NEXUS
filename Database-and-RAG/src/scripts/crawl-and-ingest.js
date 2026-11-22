require("dotenv").config();

const fs = require("fs").promises;
const path = require("path");
const { connectDB } = require("../src/config/database");
const { crawlWebsite } = require("../src/services/crawlerService");
const { ingestPages } = require("../src/services/ingestionService");

const publicDirectory = path.join(__dirname, "../public");

// Find actual website pages. The downloaded mirror also contains a few
// artificial index.html files inside image/font folders; those are not pages.
async function findWebsitePages(directory, relativeDirectory = "") {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const pages = [];

    for (const entry of entries) {
        const absolutePath = path.join(directory, entry.name);
        const relativePath = path.join(relativeDirectory, entry.name);

        if (entry.isDirectory()) {
            // Keep real PHP-style route folders (for example abtcllg.php),
            // but skip folders that are actually file names (for example .png).
            if (entry.name.includes(".") && !entry.name.toLowerCase().endsWith(".php")) {
                continue;
            }
            pages.push(...await findWebsitePages(absolutePath, relativePath));
            continue;
        }

        if (entry.isFile() && /\.html?$/i.test(entry.name)) {
            const html = await fs.readFile(absolutePath, "utf8");

            // Some archived routes are only redirect stubs to live PHP pages
            // that were not included in the download. Do not ingest empty stubs.
            if (
                /http-equiv\s*=\s*["']?refresh/i.test(html) ||
                /<title>\s*404\s+Not\s+Found/i.test(html) ||
                /<h1>\s*Not\s+Found\s*<\/h1>/i.test(html)
            ) {
                continue;
            }

            pages.push(relativePath);
        }
    }

    return pages;
}

function toLocalUrl(relativeFile, baseUrl) {
    const segments = relativeFile.split(path.sep).map(segment => encodeURIComponent(segment));
    const encodedPath = segments.join("/");
    const route = relativeFile.toLowerCase() === "index.html"
        ? "/"
        : `/${encodedPath}`;

    return new URL(route, baseUrl).toString();
}

async function main() {
    try {
        console.log("============================================");
        console.log(" PSG NEXUS - FULL WEBSITE CONTENT REFRESH");
        console.log("============================================");

        // The website server must be running in another terminal.
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        const base = new URL(baseUrl);
        const allowedHosts = (process.env.ALLOWED_HOSTS || "localhost,127.0.0.1")
            .split(",").map(value => value.trim().toLowerCase()).filter(Boolean);

        if (!allowedHosts.includes(base.hostname.toLowerCase())) {
            throw new Error(
                `BASE_URL host '${base.hostname}' is not listed in ALLOWED_HOSTS. ` +
                "For local ingestion, use BASE_URL=http://localhost:3000 and ALLOWED_HOSTS=localhost,127.0.0.1."
            );
        }

        const websiteFiles = (await findWebsitePages(publicDirectory)).sort();
        if (websiteFiles.length === 0) {
            throw new Error("No HTML pages were found inside the public folder.");
        }

        const seedUrls = websiteFiles.map(file => toLocalUrl(file, baseUrl));
        console.log(`Found ${websiteFiles.length} local HTML pages.`);
        console.log(`Website source: ${baseUrl}`);

        await connectDB();

        // All discovered pages are supplied as seeds. Disable link discovery
        // here so the crawler processes exactly this validated local page list.
        const pages = await crawlWebsite(seedUrls, websiteFiles.length, {
            discoverLinks: false
        });

        if (pages.length !== websiteFiles.length) {
            throw new Error(
                `Only ${pages.length} of ${websiteFiles.length} local HTML pages were extracted. ` +
                "MongoDB was not changed. Check the crawl errors above before retrying."
            );
        }

        const totalCharacters = pages.reduce((sum, page) => sum + page.content.length, 0);
        if (totalCharacters < 1000) {
            throw new Error("Extracted website content is unexpectedly small. MongoDB was not changed.");
        }

        console.log(`Validated ${pages.length} pages (${totalCharacters.toLocaleString()} text characters).`);
        console.log("Generating embeddings before replacing the existing MongoDB content...");

        const storedCount = await ingestPages(pages, { replaceAll: true });

        console.log("============================================");
        console.log("WEBSITE REFRESH COMPLETED");
        console.log(`Pages processed: ${pages.length}`);
        console.log(`Chunks stored:   ${storedCount}`);
        console.log("Old/stale website chunks were replaced.");
        console.log("============================================");
    } catch (error) {
        console.error("\nWEBSITE REFRESH FAILED:");
        console.error(error.message);
        process.exitCode = 1;
    }
}

main();
