// db/scripts/test-chat-and-routes.js - Full verification of Express routes, HTML injection, chat controller, and navigation
require('dotenv').config();
const http = require('http');
const app = require('../../backend/app');

function makeRequest(server, path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const addr = server.address();
        const req = http.request({
            hostname: '127.0.0.1',
            port: addr.port,
            path: path,
            method: method,
            headers: body ? { 'Content-Type': 'application/json' } : {}
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: data, headers: res.headers }));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Starting PSG NEXUS Automated Verification Suite...\n');

    const server = http.createServer(app);
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    console.log(`🌐 Test server listening on ephemeral port ${server.address().port}\n`);

    let passed = 0;
    let failed = 0;

    function assert(name, condition, details = '') {
        if (condition) {
            console.log(`✅ [PASS] ${name}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
            failed++;
        }
    }

    try {
        // --- TEST 1: Root route serves HTML with chatbot ---
        const rootRes = await makeRequest(server, '/');
        assert('GET / returns 200', rootRes.status === 200);
        assert('GET / contains chatbot CSS and JS', rootRes.data.includes('chatbot.css') && (rootRes.data.includes('chatbot.js') || rootRes.data.includes('script.js')));

        // --- TEST 2: Static Chatbot assets are served with 200 ---
        const cssRes = await makeRequest(server, '/css/chatbot.css');
        assert('GET /css/chatbot.css returns 200', cssRes.status === 200);
        assert('GET /css/chatbot.css contains psg-confirm-btn', cssRes.data.includes('psg-confirm-btn'));

        const jsRes = await makeRequest(server, '/js/chatbot.js');
        assert('GET /js/chatbot.js returns 200', jsRes.status === 200);
        assert('GET /js/chatbot.js contains persistent session logic', jsRes.data.includes('psg_nexus_chat_history_v2'));

        const scriptRes = await makeRequest(server, '/js/script.js');
        assert('GET /js/script.js returns 200', scriptRes.status === 200);
        assert('GET /js/script.js contains persistent session logic', scriptRes.data.includes('psg_nexus_chat_history_v2'));

        // --- TEST 3: Subpages get automatic Chatbot injection ---
        const subpages = ['/placements', '/admission.php', '/hostel', '/abtcllg.php', '/coe.php'];
        for (const page of subpages) {
            const pageRes = await makeRequest(server, page);
            assert(`GET ${page} returns 200`, pageRes.status === 200);
            assert(`GET ${page} automatically includes chatbot scripts`, pageRes.data.includes('chatbot.js') || pageRes.data.includes('script.js'), `status: ${pageRes.status}`);
            assert(`GET ${page} automatically includes chatbot.css`, pageRes.data.includes('chatbot.css'));
        }

        // --- TEST 4: Chat API standalone greeting ---
        const greetingRes = await makeRequest(server, '/api/chat', 'POST', { message: 'hello' });
        assert('POST /api/chat ("hello") returns 200', greetingRes.status === 200);
        const greetingData = JSON.parse(greetingRes.data);
        assert('POST /api/chat ("hello") returns welcome reply', greetingData.reply && greetingData.reply.includes('PSG Nexus'));

        // --- TEST 5: Chat API greeting prefix WITH question (Bug Fix Verification) ---
        console.log('\n--- Verifying Greeting Bug Fix (Greeting with substantive question) ---');
        const hybridRes = await makeRequest(server, '/api/chat', 'POST', { message: 'hi, how about placement in this college' });
        assert('POST /api/chat ("hi, how about placement...") returns 200', hybridRes.status === 200);
        const hybridData = JSON.parse(hybridRes.data);
        assert('POST /api/chat ("hi, how about placement...") was not trapped by static greeting', !hybridData.reply.includes('I am here to assist:\n* **👨‍🏫 Staff & Faculty'));
        assert('POST /api/chat ("hi, how about placement...") contains placement info', hybridData.reply.toLowerCase().includes('placement') || hybridData.reply.toLowerCase().includes('cdc'));
        assert('POST /api/chat ("hi, how about placement...") suggests navigation to /placements', hybridData.navigation && hybridData.navigation.url === '/placements', JSON.stringify(hybridData.navigation));

        // --- TEST 6: Chat API query specifically for placement navigation ---
        console.log('\n--- Verifying Placements Query & Navigation ---');
        const placementRes = await makeRequest(server, '/api/chat', 'POST', { message: 'how about placement in this college' });
        assert('POST /api/chat ("how about placement in this college") returns 200', placementRes.status === 200);
        const placementData = JSON.parse(placementRes.data);
        assert('Placement response has substantive text', placementData.reply && placementData.reply.length > 50);
        assert('Placement response includes navigation object', !!placementData.navigation);
        assert('Placement navigation target is /placements', placementData.navigation && placementData.navigation.url === '/placements');

        // --- TEST 7: Chat API hostel query ---
        console.log('\n--- Verifying Hostel Query & Navigation ---');
        const hostelRes = await makeRequest(server, '/api/chat', 'POST', { message: 'What are the hostel curfew and facilities?' });
        assert('POST /api/chat ("What are the hostel...") returns 200', hostelRes.status === 200);
        const hostelData = JSON.parse(hostelRes.data);
        assert('Hostel navigation target is /hostel', hostelData.navigation && hostelData.navigation.url === '/hostel');

    } catch (err) {
        console.error('Fatal test error:', err);
        failed++;
    } finally {
        server.close();
    }

    console.log(`\n====================================================`);
    console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`====================================================\n`);

    if (failed > 0) process.exit(1);
}

runTests();
