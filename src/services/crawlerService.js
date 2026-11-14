
const axios = require("axios");
const cheerio = require("cheerio");
const robotsParser = require("robots-parser");

// Read permitted website domains from .env.
const allowedHosts = (process.env.ALLOWED_HOSTS || "")
    .split(",")
    .map(host => host.trim().toLowerCase())
    .filter(Boolean);

const USER_AGENT = "PSGTechAcademicBot/1.0";

// Check whether a URL belongs to an allowed domain.
function isAllowedHost(url) {
    try {
        const hostname = new URL(url).hostname.toLowerCase();

        return allowedHosts.some(host =>
            hostname === host || hostname.endsWith("." + host)
        );
    } catch {
        return false;
    }
}

// Check robots.txt before requesting a webpage.
async function checkRobots(url) {
    const parsedUrl = new URL(url);
    const robotsUrl = `${parsedUrl.origin}/robots.txt`;

    try {
        const response = await axios.get(robotsUrl, {
            timeout: 10000,
            headers: { "User-Agent": USER_AGENT }
        });

        const robots = robotsParser(robotsUrl, response.data);

        return robots.isAllowed(url, USER_AGENT) !== false;

    } catch (error) {
        // A missing robots.txt (404) means no robots rules were found.
        if (error.response?.status === 404) {
            return true;
        }

        // Do not crawl when robots.txt cannot be checked.
        throw new Error(
            `Could not verify robots.txt for ${robotsUrl}: ${error.message}`
        );
    }
}

// Download and extract readable content from one webpage.
async function fetchPage(url) {
    if (!isAllowedHost(url)) {
        throw new Error(`Website domain is not allowed: ${url}`);
    }

    const permitted = await checkRobots(url);

    if (!permitted) {
        throw new Error(`robots.txt disallows crawling: ${url}`);
    }

    const response = await axios.get(url, {
        timeout: 20000,
        maxRedirects: 5,
        headers: {
            "User-Agent": USER_AGENT,
            "Accept": "text/html"
        }
    });

    // Do not process non-HTML responses.
    const contentType = response.headers["content-type"] || "";

    if (!contentType.includes("text/html")) {
        throw new Error(`Not an HTML page: ${url}`);
    }

    // Parse HTML using Cheerio.
    const $ = cheerio.load(response.data);

    // Remove elements that do not contain useful page information.
    $("script, style, noscript, iframe, svg, nav, footer, header").remove();

    const title = $("title").text().trim() || "Untitled page";

    // Prefer main content, then article, then body.
    const contentElement =
        $("main").first().length ? $("main").first() :
        $("article").first().length ? $("article").first() :
        $("body");

    const content = contentElement.text()
        .replace(/\s+/g, " ")
        .trim();

    // Collect links for optional same-domain crawling.
    const links = [];

    $("a[href]").each((_, element) => {
        const href = $(element).attr("href");

        try {
            const absoluteUrl = new URL(href, url);

            // Ignore fragments, non-HTTP links and external domains.
            if (
                ["http:", "https:"].includes(absoluteUrl.protocol) &&
                isAllowedHost(absoluteUrl.href)
            ) {
                absoluteUrl.hash = "";
                links.push(absoluteUrl.href);
            }
        } catch {
            // Ignore invalid links.
        }
    });

    return {
        title,
        url,
        content,
        links: [...new Set(links)]
    };
}

// Crawl a list of seed URLs and their same-domain links.
// Maximum depth 1 means seed pages plus their direct links.
async function crawlWebsite(seedUrls, maxPages = 30) {
    const visited = new Set();
    const pages = [];

    const queue = seedUrls.map(url => ({
        url,
        depth: 0
    }));

    while (queue.length > 0 && pages.length < maxPages) {
        const current = queue.shift();

        if (visited.has(current.url)) {
            continue;
        }

        visited.add(current.url);

        try {
            console.log(`Crawling: ${current.url}`);

            const page = await fetchPage(current.url);

            // Ignore pages with almost no readable content.
            if (page.content.length >= 50) {
                pages.push(page);
                console.log(`Extracted: ${page.title}`);
            }

            // Discover direct links from the seed pages.
            if (current.depth < 1) {
                for (const link of page.links) {
                    if (!visited.has(link)) {
                        queue.push({
                            url: link,
                            depth: current.depth + 1
                        });
                    }
                }
            }

        } catch (error) {
            console.error(`Crawling failed: ${error.message}`);
        }

        // Respect a delay between requests.
        const delay = Number(process.env.CRAWLER_DELAY_MS || 1200);

        await new Promise(resolve => setTimeout(resolve, delay));
    }

    console.log(`Total pages extracted: ${pages.length}`);

    return pages;
}

module.exports = {
    fetchPage,
    crawlWebsite
};
