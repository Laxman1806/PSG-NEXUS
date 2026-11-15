// db/scripts/test-frontend-assets.js
const http = require('http');

const endpoints = [
    '/',
    '/css/bootstrap.min.css',
    '/css/main.css',
    '/css/owl.carousel.css',
    '/css/chatbot.css',
    '/js/chatbot.js',
    '/js/vendor/jquery-library.js',
    '/images/logo.png',
    '/images/slider/foundationday_2026.jpg',
    '/images/slider/Interactivesession_jains.jpg',
    '/images/slider/Orientation_2026.jpg',
    '/abtcllg.php',
    '/admission.php',
    '/hostel',
    '/placements',
    '/api/health'
];

function checkUrl(urlPath) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:5000${urlPath}`, (res) => {
            resolve({ path: urlPath, status: res.statusCode, contentType: res.headers['content-type'] });
        });
        req.on('error', (err) => resolve({ path: urlPath, error: err.message }));
    });
}

async function run() {
    console.log("=== Verifying Frontend Assets & Endpoints ===");
    for (const ep of endpoints) {
        const result = await checkUrl(ep);
        if (result.status === 200) {
            console.log(`✅ [200 OK] ${ep} (${result.contentType})`);
        } else {
            console.log(`❌ [${result.status || 'ERR'}] ${ep} - ${result.error || ''}`);
        }
    }
}

run();
