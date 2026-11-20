// backend/app.js - Express Application Factory with Universal Campus Routing
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', chatRoutes);

// Base directories for offline replicas
const frontendPath = path.join(__dirname, '../frontend');
const replicaRoot = path.join(frontendPath, 'psgtech_offline_replica');
const replicaMain = path.join(replicaRoot, 'www.psgtech.edu');

// Determine primary web directory (prefer www.psgtech.edu if available)
const primaryWebDir = fs.existsSync(replicaMain) ? replicaMain : frontendPath;

// Root path serves the replicated homepage with embedded chatbot
app.get('/', (req, res) => {
    const candidates = [
        path.join(primaryWebDir, 'index.html'),
        path.join(frontendPath, 'index.html')
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) return res.sendFile(p);
    }
    res.status(404).send('PSG Tech Replica index.html not found');
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
        app.use(prefix, express.static(subPath));
        app.get(prefix, (req, res) => {
            const idx = path.join(subPath, 'index.html');
            if (fs.existsSync(idx)) return res.sendFile(idx);
            res.redirect(prefix + '/');
        });
    }
});

// Universal Route Resolver for .php subpages, directory indexes, and clean URLs
app.use((req, res, next) => {
    if (req.method !== 'GET') return next();

    const cleanPath = req.path.replace(/^\/+|\/+$/g, '');
    if (!cleanPath) return next();

    const searchDirs = [primaryWebDir, frontendPath, replicaRoot];

    for (const dir of searchDirs) {
        if (!fs.existsSync(dir)) continue;

        // 1. Direct path/index.html (e.g. /facultyDetails.php -> /facultyDetails.php/index.html)
        const directDirIndex = path.join(dir, cleanPath, 'index.html');
        if (fs.existsSync(directDirIndex)) {
            return res.sendFile(directDirIndex);
        }

        // 2. Direct path/index.php/index.html (e.g. /placements -> /placements/index.php/index.html)
        const phpDirIndex = path.join(dir, cleanPath, 'index.php', 'index.html');
        if (fs.existsSync(phpDirIndex)) {
            return res.sendFile(phpDirIndex);
        }

        // 3. Direct path.html (e.g. /about -> /about.html)
        const directHtml = path.join(dir, cleanPath + '.html');
        if (fs.existsSync(directHtml)) {
            return res.sendFile(directHtml);
        }

        // 4. Direct file exists (e.g. /images/logo2.png, /css/main.css)
        const directFile = path.join(dir, cleanPath);
        if (fs.existsSync(directFile) && fs.statSync(directFile).isFile()) {
            return res.sendFile(directFile);
        }
    }

    next();
});

// Serve static assets from primary replica and frontend roots
app.use(express.static(primaryWebDir));
app.use(express.static(frontendPath));

module.exports = app;
