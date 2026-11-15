// backend/app.js - Express Application Factory
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

// Path to frontend assets
const frontendPath = path.join(__dirname, '../frontend');

// Root path serves the replicated homepage with embedded chatbot
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Route helper to serve directory index.html for .php subpages or clean URLs without redirect
app.use((req, res, next) => {
    if (req.method !== 'GET') return next();

    const cleanPath = req.path.replace(/^\/+|\/+$/g, '');
    if (!cleanPath) return next();

    // 1. Direct path/index.html (e.g. /abtcllg.php -> /abtcllg.php/index.html)
    const directDirIndex = path.join(frontendPath, cleanPath, 'index.html');
    if (fs.existsSync(directDirIndex)) {
        return res.sendFile(directDirIndex);
    }

    // 2. Direct path/index.php/index.html (e.g. /placements -> /placements/index.php/index.html)
    const phpDirIndex = path.join(frontendPath, cleanPath, 'index.php', 'index.html');
    if (fs.existsSync(phpDirIndex)) {
        return res.sendFile(phpDirIndex);
    }

    // 3. Direct path.html (e.g. /placements -> /placements.html, /about -> /about.html)
    const directHtml = path.join(frontendPath, cleanPath + '.html');
    if (fs.existsSync(directHtml)) {
        return res.sendFile(directHtml);
    }

    next();
});

// Serve all static website replica files (CSS, JS, images, fonts)
app.use(express.static(frontendPath));

module.exports = app;
