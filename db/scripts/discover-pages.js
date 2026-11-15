const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const frontendDir = path.resolve(__dirname, '../../frontend');

function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const full = path.join(dir, f);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            findHtmlFiles(full, fileList);
        } else if (f.endsWith('.html') || f.endsWith('.htm')) {
            fileList.push(full);
        }
    }
    return fileList;
}

const allHtml = findHtmlFiles(frontendDir);
console.log(`Total HTML files found in frontend/: ${allHtml.length}`);

const validPages = [];
for (const file of allHtml) {
    const rel = path.relative(frontendDir, file).replace(/\\/g, '/');
    
    // Skip obvious assets masquerading as index.html (like png/index.html, css/index.html, etc.)
    if (rel.match(/\.(png|jpg|jpeg|gif|ico|webp|svg|css|js|ttf|woff|woff2|eot)\//i)) {
        continue;
    }

    try {
        const content = fs.readFileSync(file, 'utf8');
        const $ = cheerio.load(content);
        $('script, style, noscript, nav, footer, #chat-window, #fab-btn').remove();
        const text = $('body').text().replace(/\s+/g, ' ').trim();
        const title = $('title').text().trim() || path.basename(path.dirname(file));

        if (text.length > 250) {
            validPages.push({ rel, title, textLength: text.length });
        }
    } catch (e) {}
}

console.log(`\nValid Content Pages (${validPages.length} pages):`);
validPages.forEach((p, idx) => {
    console.log(`${(idx + 1).toString().padStart(2, ' ')}. [${p.textLength} chars] ${p.rel} ("${p.title}")`);
});
