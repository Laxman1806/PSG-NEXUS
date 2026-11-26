// backend/app.js - Hardened Express Application Factory with Canonical Chatbot Asset Serving
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const { config } = require('./config/env');
const { AuthorizationError } = require('./utils/errors');
const requestIdMiddleware = require('./middleware/requestId');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const chatRoutes = require('./routes/chatRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Trust single proxy hop when deployed behind Nginx / load balancer
if (config.isProduction) {
    app.set('trust proxy', 1);
}

// Correlation IDs & Security Headers
app.use(requestIdMiddleware);
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com'],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'", ...config.security.corsOrigins],
                objectSrc: ["'none'"],
                baseUri: ["'self'"],
                frameAncestors: ["'self'"]
            }
        },
        crossOriginEmbedderPolicy: false
    })
);

// Restricted CORS (allows same-origin / non-browser tools and explicit allowlisted origins)
const allowedOrigins = new Set(config.security.corsOrigins);
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.has(origin)) {
                return callback(null, true);
            }
            return callback(new AuthorizationError(`Origin ${origin} not allowed by CORS policy`));
        },
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key', 'X-Session-Token', 'X-Request-Id'],
        exposedHeaders: ['X-Session-Token', 'X-Request-Id']
    })
);

app.use(express.json({ limit: config.security.maxBodySize }));
app.use(express.urlencoded({ extended: false, limit: config.security.maxBodySize }));

// Directories for frontend & offline website replica
const frontendPath = path.resolve(__dirname, '../frontend');
const replicaRoot = path.join(frontendPath, 'psgtech_offline_replica');
const replicaMain = path.join(replicaRoot, 'www.psgtech.edu');
const primaryWebDir = fs.existsSync(replicaMain) ? replicaMain : frontendPath;

// Safe path containment check to prevent directory traversal
function resolveInsideDir(baseDir, unsafeRelPath) {
    const normalizedBase = path.resolve(baseDir);
    let decoded = '';
    try {
        decoded = decodeURIComponent(unsafeRelPath || '');
    } catch (_e) {
        return null;
    }
    const candidate = path.resolve(normalizedBase, decoded);
    if (candidate !== normalizedBase && !candidate.startsWith(normalizedBase + path.sep)) {
        return null;
    }
    return candidate;
}

// Serve canonical chatbot frontend assets ahead of any replicated website directories
const chatbotAssetRoutes = {
    '/css/chatbot.css': path.join(frontendPath, 'css', 'chatbot.css'),
    '/js/chatbot.js': path.join(frontendPath, 'js', 'chatbot.js'),
    '/js/script.js': path.join(frontendPath, 'js', 'chatbot.js'),
    '/js/chat-api.js': path.join(frontendPath, 'js', 'chat-api.js'),
    '/js/conversation-manager.js': path.join(frontendPath, 'js', 'conversation-manager.js')
};

Object.entries(chatbotAssetRoutes).forEach(([routePath, filePath]) => {
    app.get(routePath, (req, res, next) => {
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        }
        return next();
    });
});

// API Routes
app.use('/api', apiLimiter, chatRoutes);
app.use('/api/conversations', apiLimiter, conversationRoutes);
app.use('/api/feedback', apiLimiter, feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Helper to serve HTML files with guaranteed chatbot script and stylesheet injection
function sendHtmlWithChatbot(res, filePath) {
    try {
        let html = fs.readFileSync(filePath, 'utf8');
        const hasChatbotWidget =
            html.includes('/js/chatbot.js') ||
            html.includes('id="psg-nexus-root"');

        if (!hasChatbotWidget) {
            const snippet = `
<!-- PSGNEXUS AI Campus Assistant Integration -->
<link rel="stylesheet" href="/css/chatbot.css">
<script src="/js/chat-api.js" defer></script>
<script src="/js/conversation-manager.js" defer></script>
<script src="/js/chatbot.js" defer></script>
`;
            if (html.includes('</body>')) {
                html = html.replace('</body>', `${snippet}\n</body>`);
            } else if (html.includes('</html>')) {
                html = html.replace('</html>', `${snippet}\n</html>`);
            } else {
                html += snippet;
            }
        } else if (!html.includes('chatbot.css')) {
            const cssTag = '<link rel="stylesheet" href="/css/chatbot.css">\n';
            if (html.includes('</head>')) {
                html = html.replace('</head>', `${cssTag}</head>`);
            }
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
    } catch (_err) {
        return res.sendFile(filePath);
    }
}

// Root homepage
app.get('/', (_req, res) => {
    const candidates = [
        path.join(primaryWebDir, 'index.html'),
        path.join(frontendPath, 'index.html')
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) return sendHtmlWithChatbot(res, p);
    }
    return res.status(404).send('PSG Tech Replica index.html not found');
});

// Subdomain routes: intercept HTML/index requests via sendHtmlWithChatbot BEFORE static assets
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
    if (!fs.existsSync(subPath)) return;

    app.get([prefix, `${prefix}/`], (_req, res) => {
        const idx = path.join(subPath, 'index.html');
        if (fs.existsSync(idx)) return sendHtmlWithChatbot(res, idx);
        return res.status(404).send('Page not found');
    });

    app.use(prefix, (req, res, next) => {
        if (req.method !== 'GET') return next();
        const rel = req.path.replace(/^\/+/, '');
        if (!rel) return next();
        const target = resolveInsideDir(subPath, rel);
        if (!target) return res.status(400).send('Invalid path');

        if (fs.existsSync(target) && fs.statSync(target).isFile()) {
            if (target.endsWith('.html') || target.endsWith('.htm')) {
                return sendHtmlWithChatbot(res, target);
            }
            return res.sendFile(target);
        }
        const dirIndex = path.join(target, 'index.html');
        if (fs.existsSync(dirIndex) && fs.statSync(dirIndex).isFile()) {
            return sendHtmlWithChatbot(res, dirIndex);
        }
        return next();
    });

    app.use(prefix, express.static(subPath, { index: false }));
});

// Universal Route Resolver for .php subpages, directory indexes, and clean URLs
app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();

    const cleanPath = req.path.replace(/^\/+|\/+$/g, '');
    if (!cleanPath) return next();

    const searchDirs = [primaryWebDir, frontendPath, replicaRoot];

    for (const dir of searchDirs) {
        if (!fs.existsSync(dir)) continue;

        const baseTarget = resolveInsideDir(dir, cleanPath);
        if (!baseTarget) return res.status(400).send('Invalid path');

        // 1. Direct path/index.html
        const directDirIndex = path.join(baseTarget, 'index.html');
        if (fs.existsSync(directDirIndex) && fs.statSync(directDirIndex).isFile()) {
            return sendHtmlWithChatbot(res, directDirIndex);
        }

        // 2. Direct path/index.php/index.html
        const phpDirIndex = path.join(baseTarget, 'index.php', 'index.html');
        if (fs.existsSync(phpDirIndex) && fs.statSync(phpDirIndex).isFile()) {
            return sendHtmlWithChatbot(res, phpDirIndex);
        }

        // 3. Direct path.html
        const directHtml = resolveInsideDir(dir, cleanPath + '.html');
        if (directHtml && fs.existsSync(directHtml) && fs.statSync(directHtml).isFile()) {
            return sendHtmlWithChatbot(res, directHtml);
        }

        // 4. Direct file exists
        if (fs.existsSync(baseTarget) && fs.statSync(baseTarget).isFile()) {
            if (baseTarget.endsWith('.html') || baseTarget.endsWith('.htm')) {
                return sendHtmlWithChatbot(res, baseTarget);
            }
            return res.sendFile(baseTarget);
        }
    }

    return next();
});

// Serve static assets from primary replica and frontend roots (HTML handled above)
app.use(express.static(primaryWebDir, { index: false }));
app.use(express.static(frontendPath, { index: false }));

// API 404 & Centralized Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
