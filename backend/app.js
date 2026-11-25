// backend/app.js - Express Application Factory with Universal Campus Routing
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const chatRoutes = require('./routes/chatRoutes');
const {
    securityHeaders,
    createCorsOptions,
    notFoundHandler,
    errorHandler
} = require('./middleware/security');

const app = express();

// Security & Core Middleware
app.disable('x-powered-by');
app.use(securityHeaders);
app.use(cors(createCorsOptions()));
app.use(express.json({ limit: '16kb' }));

// API Routes
app.use('/api', chatRoutes);

// Base directories for offline replicas
const frontendPath = path.resolve(__dirname, '../frontend');
const replicaRoot = path.resolve(frontendPath, 'psgtech_offline_replica');
const replicaMain = path.resolve(replicaRoot, 'www.psgtech.edu');

// Determine primary web directory (prefer www.psgtech.edu if available)
const primaryWebDir = fs.existsSync(replicaMain) ? replicaMain : frontendPath;

/**
 * Resolves a candidate path inside baseDir and returns null if traversal escapes baseDir.
 */
function resolveInsideDir(baseDir, ...segments) {
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(resolvedBase, ...segments);
    if (resolvedTarget === resolvedBase || !resolvedTarget.startsWith(resolvedBase + path.sep)) {
        return null;
    }
    return resolvedTarget;
}

/**
 * Safely sends a file inside baseDir without exposing dotfiles or stack traces on error.
 */
function sendSafeFile(res, next, filePath) {
    res.sendFile(filePath, { dotfiles: 'deny' }, (err) => {
        if (err && !res.headersSent) {
            next();
        }
    });
}

// Serve canonical hardened chatbot assets before replica static fallback
app.get('/css/chatbot.css', (req, res, next) => {
    sendSafeFile(res, next, path.join(frontendPath, 'css', 'chatbot.css'));
});
app.get('/js/chatbot.js', (req, res, next) => {
    sendSafeFile(res, next, path.join(frontendPath, 'js', 'chatbot.js'));
});
app.get('/js/script.js', (req, res, next) => {
    sendSafeFile(res, next, path.join(frontendPath, 'js', 'chatbot.js'));
});

// Helper to serve HTML files with guaranteed chatbot script and stylesheet injection
function sendHtmlWithChatbot(res, next, filePath) {
    try {
        let html = fs.readFileSync(filePath, 'utf8');
        if (!html.includes('chatbot.js') && !html.includes('script.js')) {
            const snippet = `
<!-- PSGNEXUS AI Campus Guide & Session Integration -->
<link rel="stylesheet" href="/css/chatbot.css">
<script src="/js/chatbot.js" defer></script>
`;
            if (html.includes('</body>')) {
                html = html.replace('</body>', `${snippet}\n</body>`);
            } else if (html.includes('</html>')) {
                html = html.replace('</html>', `${snippet}\n</html>`);
            } else {
                html += snippet;
            }
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
    } catch (err) {
        return sendSafeFile(res, next, filePath);
    }
}

// Root path serves the replicated homepage with embedded chatbot
app.get('/', (req, res, next) => {
    const candidates = [
        path.join(primaryWebDir, 'index.html'),
        path.join(frontendPath, 'index.html')
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) return sendHtmlWithChatbot(res, next, p);
    }
    return res.status(404).type('text/plain').send('PSG Tech Replica index.html not found');
});

// Subdomain routes (Sports, Library, The Bridge, Academic Schedule, IIPC, Platinum)
const subdomains = [
    { prefix: '/sports', folder: 'sports.psgtech.ac.in' },
    { prefix: '/library', folder: 'library.psgtech.ac.in' },
    { prefix: '/thebridge', folder: 'thebridge.psgtech.ac.in' },
    { prefix: '/academicschedule', folder: 'academicschedule.psgtech.ac.in' },
    { prefix: '/iipc', folder: 'iipc.psgtech.ac.in' },
    { prefix: '/platinum', folder: 'platinum.psgtech.ac.in' },
    { prefix: '/alumni', folder: 'alumni.psgtech.ac.in' },
    { prefix: '/enquiry', folder: 'enquiry.psgtech.ac.in' }
];

subdomains.forEach(({ prefix, folder }) => {
    const subPath = path.join(replicaRoot, folder);
    if (fs.existsSync(subPath)) {
        app.use(prefix, express.static(subPath, { dotfiles: 'deny' }));
        app.get(prefix, (req, res, next) => {
            const idx = path.join(subPath, 'index.html');
            if (fs.existsSync(idx)) return sendHtmlWithChatbot(res, next, idx);
            return res.redirect(prefix + '/');
        });
    }
});

// Universal Route Resolver for .php subpages, directory indexes, and clean URLs
app.use((req, res, next) => {
    if (req.method !== 'GET') return next();

    let decodedPath;
    try {
        decodedPath = decodeURIComponent(req.path);
    } catch {
        return res.status(400).type('text/plain').send('Bad Request');
    }

    if (decodedPath.includes('\0')) {
        return res.status(400).type('text/plain').send('Bad Request');
    }

    const segments = decodedPath.replace(/\\/g, '/').split('/').filter(Boolean);
    if (segments.length === 0) return next();

    // Reject path traversal segments and hidden dotfiles/directories
    if (segments.some((seg) => seg === '.' || seg === '..' || seg.startsWith('.'))) {
        return next();
    }

    const cleanRelPath = segments.join(path.sep);
    const searchDirs = [primaryWebDir, frontendPath, replicaRoot];

    for (const dir of searchDirs) {
        if (!fs.existsSync(dir)) continue;

        // 1. Direct path/index.html (e.g. /facultyDetails.php -> /facultyDetails.php/index.html)
        const directDirIndex = resolveInsideDir(dir, cleanRelPath, 'index.html');
        if (directDirIndex && fs.existsSync(directDirIndex)) {
            return sendHtmlWithChatbot(res, next, directDirIndex);
        }

        // 2. Direct path/index.php/index.html (e.g. /placements -> /placements/index.php/index.html)
        const phpDirIndex = resolveInsideDir(dir, cleanRelPath, 'index.php', 'index.html');
        if (phpDirIndex && fs.existsSync(phpDirIndex)) {
            return sendHtmlWithChatbot(res, next, phpDirIndex);
        }

        // 3. Direct path.html (e.g. /about -> /about.html)
        const directHtml = resolveInsideDir(dir, cleanRelPath + '.html');
        if (directHtml && fs.existsSync(directHtml)) {
            return sendHtmlWithChatbot(res, next, directHtml);
        }

        // 4. Direct file exists (e.g. /images/logo2.png, /css/main.css, or raw HTML)
        const directFile = resolveInsideDir(dir, cleanRelPath);
        if (directFile && fs.existsSync(directFile) && fs.statSync(directFile).isFile()) {
            if (directFile.endsWith('.html') || directFile.endsWith('.htm')) {
                return sendHtmlWithChatbot(res, next, directFile);
            }
            return sendSafeFile(res, next, directFile);
        }
    }

    return next();
});

// Serve static assets from primary replica and frontend roots
app.use(express.static(primaryWebDir, { dotfiles: 'deny' }));
app.use(express.static(frontendPath, { dotfiles: 'deny' }));

// Safe 404 and Error Handlers (prevents stack trace disclosure)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
