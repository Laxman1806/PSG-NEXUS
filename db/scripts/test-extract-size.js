const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const replicaDir = path.resolve(__dirname, '../../frontend/psgtech_offline_replica');
let totalPages = 0;
let totalChars = 0;
const pageList = [];

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir);
    for (const item of list) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            walk(full);
        } else if (item.endsWith('.html')) {
            totalPages++;
            try {
                const html = fs.readFileSync(full, 'utf8');
                const $ = cheerio.load(html);
                $('script, style, noscript, nav, footer, #chat-window, #fab-btn').remove();
                const text = $('body').text().replace(/\s+/g, ' ').trim();
                if (text.length > 50) {
                    totalChars += text.length;
                    pageList.push({
                        file: path.relative(replicaDir, full),
                        length: text.length
                    });
                }
            } catch (e) {}
        }
    }
}

walk(replicaDir);
console.log('Total HTML pages found:', totalPages);
console.log('Valid pages with text:', pageList.length);
console.log('Total clean characters:', totalChars);
console.log('Top 10 largest text pages:');
pageList.sort((a, b) => b.length - a.length);
pageList.slice(0, 10).forEach(p => console.log(` - ${p.file}: ${p.length} chars`));
