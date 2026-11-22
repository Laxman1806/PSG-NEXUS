const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const replicaBase = path.resolve(__dirname, '../../frontend/psgtech_offline_replica');
const replicaMain = path.join(replicaBase, 'www.psgtech.edu');

const scanDirs = [
    { dir: replicaMain, prefix: '' },
    { dir: path.join(replicaBase, 'sports.psgtech.ac.in'), prefix: '/sports' },
    { dir: path.join(replicaBase, 'library.psgtech.ac.in'), prefix: '/library' },
    { dir: path.join(replicaBase, 'thebridge.psgtech.ac.in'), prefix: '/thebridge' },
    { dir: path.join(replicaBase, 'academicschedule.psgtech.ac.in'), prefix: '/academicschedule' },
    { dir: path.join(replicaBase, 'iipc.psgtech.ac.in'), prefix: '/iipc' },
    { dir: path.join(replicaBase, 'platinum.psgtech.ac.in'), prefix: '/platinum' },
    { dir: path.join(replicaBase, 'journals.psgtech.ac.in'), prefix: '/journals' }
];

const validPages = [];

for (const { dir, prefix } of scanDirs) {
    if (!fs.existsSync(dir)) continue;

    function walk(curr) {
        for (const item of fs.readdirSync(curr)) {
            const p = path.join(curr, item);
            if (fs.statSync(p).isDirectory()) {
                walk(p);
            } else if (item.endsWith('.html')) {
                const html = fs.readFileSync(p, 'utf8');
                const $ = cheerio.load(html);
                $('script, style, noscript, nav, footer, #chat-window, #fab-btn, .footer, .header').remove();
                const text = $('body').text().replace(/\s+/g, ' ').trim();
                const title = $('title').text().trim() || $('h1').text().trim();

                if (title.includes('404') || text.includes('404 Not Found') || text.length < 150) {
                    continue; // Skip 404 or empty
                }

                validPages.push({
                    file: path.relative(replicaBase, p),
                    title: title.substring(0, 50),
                    length: text.length
                });
            }
        }
    }
    walk(dir);
}

console.log('Total genuinely valid, non-404 pages:', validPages.length);
validPages.sort((a, b) => b.length - a.length);
console.log('Top 20 richest non-404 pages:');
validPages.slice(0, 20).forEach(p => console.log(` - ${p.title} (${p.file}): ${p.length} chars`));
