// db/scripts/test-security.js
// PSG-NEXUS Security Test Suite
// Tests path traversal, XSS protections, input validation, rate limiting,
// security headers, CORS, and sanitization helpers.
//
// Usage: node db/scripts/test-security.js
// Requires the server to NOT be already running (starts its own isolated instance).
//
// To run against an already-running server:
//   TEST_PORT=5055 SKIP_SERVER_START=1 node db/scripts/test-security.js

'use strict';
require('dotenv').config();

const http = require('http');
const { sanitizeInternalPath, sanitizeNavigation } = require('../../backend/controllers/chatController');

const PORT = Number(process.env.TEST_PORT) || 5099;
const BASE = `http://127.0.0.1:${PORT}`;

// ─── Lightweight HTTP helper ───────────────────────────────────────────────────
function req(method, path, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: '127.0.0.1',
            port: PORT,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
                ...headers
            }
        };
        const r = http.request(options, (res) => {
            let raw = '';
            res.on('data', c => (raw += c));
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(raw); } catch { parsed = raw; }
                resolve({ status: res.statusCode, headers: res.headers, body: parsed, raw });
            });
        });
        r.on('error', reject);
        if (payload) r.write(payload);
        r.end();
    });
}

// ─── Test runner ──────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const failures = [];

function test(name, fn) {
    return Promise.resolve().then(fn).then(() => {
        console.log(`  ✅ PASS  ${name}`);
        passed++;
    }).catch(err => {
        console.log(`  ❌ FAIL  ${name}: ${err.message}`);
        failures.push({ name, error: err.message });
        failed++;
    });
}

function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
}

// ─── Unit tests: sanitizer helpers (no server needed) ─────────────────────────
async function runUnitTests() {
    console.log('\n📋 Unit Tests — sanitizeInternalPath()');

    await test('allows valid relative path', () => {
        assert(sanitizeInternalPath('/placements') === '/placements');
    });
    await test('allows /abtcllg.php', () => {
        assert(sanitizeInternalPath('/abtcllg.php') === '/abtcllg.php');
    });
    await test('maps /about -> /abtcllg.php', () => {
        assert(sanitizeInternalPath('/about') === '/abtcllg.php');
    });
    await test('rejects javascript: URI', () => {
        assert(sanitizeInternalPath('javascript:alert(1)') === null);
    });
    await test('rejects data: URI', () => {
        assert(sanitizeInternalPath('data:text/html,<h1>XSS</h1>') === null);
    });
    await test('rejects protocol-relative URL', () => {
        assert(sanitizeInternalPath('//evil.com/xss') === null);
    });
    await test('rejects path traversal with ..', () => {
        assert(sanitizeInternalPath('/../.env') === null);
    });
    await test('rejects backslash traversal', () => {
        assert(sanitizeInternalPath('/..\\backend\\app.js') === null);
    });
    await test('rejects http:// URL', () => {
        assert(sanitizeInternalPath('http://evil.com') === null);
    });
    await test('rejects null', () => {
        assert(sanitizeInternalPath(null) === null);
    });
    await test('rejects empty string', () => {
        assert(sanitizeInternalPath('') === null);
    });
    await test('strips trailing slash', () => {
        const r = sanitizeInternalPath('/placements/');
        assert(r === '/placements', `got ${r}`);
    });

    console.log('\n📋 Unit Tests — sanitizeNavigation()');

    await test('allows allowlisted URL', () => {
        const r = sanitizeNavigation('/placements', 'Career Portal');
        assert(r !== null && r.url === '/placements');
    });
    await test('rejects non-allowlisted URL', () => {
        assert(sanitizeNavigation('/evil-external-route', 'Hacked') === null);
    });
    await test('rejects javascript: in navigation', () => {
        assert(sanitizeNavigation('javascript:alert(1)', 'XSS') === null);
    });
    await test('sanitizes label control chars', () => {
        const r = sanitizeNavigation('/placements', 'Label\u0000\u001F');
        assert(r !== null && !r.label.includes('\u0000'));
    });
    await test('truncates label to 80 chars', () => {
        const r = sanitizeNavigation('/placements', 'A'.repeat(100));
        assert(r !== null && r.label.length === 80);
    });
}

// ─── Integration tests (require running server) ───────────────────────────────
async function runIntegrationTests() {
    console.log('\n🔒 Integration Tests — Security Headers');

    await test('X-Powered-By absent', async () => {
        const r = await req('GET', '/api/health');
        assert(!r.headers['x-powered-by'], `X-Powered-By present: ${r.headers['x-powered-by']}`);
    });
    await test('X-Content-Type-Options: nosniff present', async () => {
        const r = await req('GET', '/api/health');
        assert(r.headers['x-content-type-options'] === 'nosniff');
    });
    await test('X-Frame-Options: SAMEORIGIN present', async () => {
        const r = await req('GET', '/api/health');
        assert(r.headers['x-frame-options'] === 'SAMEORIGIN');
    });
    await test('CSP object-src none present', async () => {
        const r = await req('GET', '/api/health');
        const csp = r.headers['content-security-policy'] || '';
        assert(csp.includes("object-src 'none'"), `CSP missing object-src 'none': ${csp}`);
    });

    console.log('\n🔒 Integration Tests — Path Traversal Blocking');

    await test('GET /../README.md returns 404', async () => {
        const r = await req('GET', '/../README.md');
        assert(r.status === 404, `expected 404, got ${r.status}`);
    });
    await test('GET /..%2fREADME.md returns 404 (encoded traversal)', async () => {
        const r = await req('GET', '/..%2fREADME.md');
        assert(r.status === 404, `expected 404, got ${r.status}`);
    });
    await test('GET /../backend/app.js returns 404', async () => {
        const r = await req('GET', '/../backend/app.js');
        assert(r.status === 404, `expected 404, got ${r.status}`);
    });
    await test('GET /../.env returns 404', async () => {
        const r = await req('GET', '/../.env');
        assert(r.status === 404, `expected 404, got ${r.status}`);
    });
    await test('No stack trace in 404 body for .env', async () => {
        const r = await req('GET', '/../.env');
        const body = typeof r.body === 'string' ? r.body : JSON.stringify(r.body);
        assert(!body.includes('NotFoundError') && !body.includes('E:\\\\'), `Stack trace leaked: ${body.slice(0, 200)}`);
    });
    await test('GET /../package.json returns 404', async () => {
        const r = await req('GET', '/../package.json');
        assert(r.status === 404, `expected 404, got ${r.status}`);
    });

    console.log('\n🔒 Integration Tests — Input Validation');

    await test('POST /api/chat with no body returns 400', async () => {
        const r = await req('POST', '/api/chat', null);
        assert(r.status === 400, `expected 400, got ${r.status}`);
    });
    await test('POST /api/chat with empty message returns 400', async () => {
        const r = await req('POST', '/api/chat', { message: '' });
        assert(r.status === 400, `expected 400, got ${r.status}`);
    });
    await test('POST /api/chat with object message returns 400', async () => {
        const r = await req('POST', '/api/chat', { message: { '$ne': '' } });
        assert(r.status === 400, `expected 400, got ${r.status}`);
    });
    await test('POST /api/chat with number message returns 400', async () => {
        const r = await req('POST', '/api/chat', { message: 42 });
        assert(r.status === 400, `expected 400, got ${r.status}`);
    });
    await test('POST /api/chat message over 1000 chars returns 400', async () => {
        const r = await req('POST', '/api/chat', { message: 'A'.repeat(1001) });
        assert(r.status === 400, `expected 400, got ${r.status}`);
    });
    await test('POST /api/chat with malformed JSON returns 400 JSON', async () => {
        const r = await new Promise((resolve, reject) => {
            const payload = '{"message": BAD JSON}';
            const options = {
                hostname: '127.0.0.1', port: PORT, path: '/api/chat', method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
            };
            const req2 = http.request(options, res => {
                let raw = '';
                res.on('data', c => raw += c);
                res.on('end', () => resolve({ status: res.statusCode, raw }));
            });
            req2.on('error', reject);
            req2.write(payload);
            req2.end();
        });
        assert(r.status === 400, `expected 400, got ${r.status}`);
        assert(!r.raw.includes('SyntaxError'), `SyntaxError leaked: ${r.raw.slice(0, 200)}`);
    });
    await test('POST /api/chat valid message returns 200', async () => {
        const r = await req('POST', '/api/chat', { message: 'hello' });
        assert(r.status === 200, `expected 200, got ${r.status}`);
    });
    await test('Valid chat response has X-RateLimit-Limit header', async () => {
        const r = await req('POST', '/api/chat', { message: 'hello' });
        assert(r.headers['x-ratelimit-limit'], 'X-RateLimit-Limit header missing');
    });

    console.log('\n🔒 Integration Tests — CORS');

    await test('Allowed origin (localhost:5000) accepted', async () => {
        const r = await req('OPTIONS', '/api/chat', null, { Origin: 'http://localhost:5000' });
        const allow = r.headers['access-control-allow-origin'];
        assert(allow === 'http://localhost:5000' || allow === '*', `Unexpected: ${allow}`);
    });
    await test('Unknown external origin blocked', async () => {
        const r = await req('OPTIONS', '/api/chat', null, { Origin: 'http://evil.example.com' });
        const allow = r.headers['access-control-allow-origin'];
        assert(!allow || allow === 'false', `Origin should be blocked, got: ${allow}`);
    });

    console.log('\n🔒 Integration Tests — API Endpoints');

    await test('GET /api/health returns status online', async () => {
        const r = await req('GET', '/api/health');
        assert(r.status === 200, `got ${r.status}`);
        assert(typeof r.body === 'object' && r.body.status === 'online');
    });
    await test('GET /api/ready returns ready:true with service statuses', async () => {
        const r = await req('GET', '/api/ready');
        assert(r.status === 200, `got ${r.status}`);
        assert(r.body && r.body.ready === true, 'ready not true');
        assert(r.body.services && r.body.services.database, 'services.database missing');
        assert(r.body.services.ai, 'services.ai missing');
    });

    console.log('\n🔒 Integration Tests — XSS in Navigation');

    await test('javascript: in message does not cause navigate to javascript:', async () => {
        const r = await req('POST', '/api/chat', { message: 'go to javascript:alert(1)' });
        if (r.status === 200 && r.body && r.body.navigation) {
            const nav = r.body.navigation;
            assert(!nav.url || !nav.url.startsWith('javascript:'),
                `javascript: leaked into navigation.url: ${nav.url}`);
        }
        // 400 or no navigation are both fine
    });
    await test('<script> in message treated as text, not executed', async () => {
        const r = await req('POST', '/api/chat', { message: '<script>alert("XSS")</script>' });
        // 200 (Gemini available), 400 (validation reject), or 500 (Gemini unavailable) are all acceptable.
        // 500 must still return a safe JSON message with no stack trace.
        assert([200, 400, 500].includes(r.status), `Unexpected status ${r.status}`);
        if (r.status === 500) {
            const body = typeof r.body === 'object' ? JSON.stringify(r.body) : r.body;
            assert(!body.includes('Error:') || !body.includes('at '), 'Stack trace leaked in 500 body');
        }
    });

    console.log('\n🔒 Integration Tests — README credentials check');
    const fs = require('fs');
    const path = require('path');
    const projectRoot = path.join(__dirname, '..', '..');
    const readmePath = path.join(projectRoot, 'README.md');

    await test('README does not contain karthi2005', () => {
        const content = fs.readFileSync(readmePath, 'utf8');
        assert(!content.includes('karthi2005'), 'Real password found in README.md!');
    });
    await test('.env.example exists', () => {
        assert(fs.existsSync(path.join(projectRoot, '.env.example')), '.env.example missing');
    });
    await test('.gitignore contains .env', () => {
        const gi = fs.readFileSync(path.join(projectRoot, '.gitignore'), 'utf8');
        assert(gi.includes('.env'), '.env not in .gitignore');
    });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  PSG-NEXUS Security Test Suite');
    console.log('═══════════════════════════════════════════════════════');

    // Unit tests (no server needed)
    await runUnitTests();

    // Start server if not told to skip
    let serverProcess = null;
    if (!process.env.SKIP_SERVER_START) {
        const { spawn } = require('child_process');
        const path = require('path');
        const projectRoot = path.join(__dirname, '..', '..');
        serverProcess = spawn(process.execPath, ['server.js'], {
            cwd: projectRoot,
            env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test' },
            stdio: 'pipe'
        });
        // Wait for server ready
        await new Promise((resolve) => {
            let buf = '';
            serverProcess.stdout.on('data', d => {
                buf += d.toString();
                if (buf.includes('Server active') || buf.includes('running on')) resolve();
            });
            serverProcess.stderr.on('data', () => {});
            setTimeout(resolve, 4000);
        });
    }

    try {
        await runIntegrationTests();
    } finally {
        if (serverProcess) {
            serverProcess.kill('SIGTERM');
        }
    }

    // Report
    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`  Results: ${passed + failed} tests — ✅ ${passed} passed, ❌ ${failed} failed`);
    if (failures.length) {
        console.log('\n  Failures:');
        for (const f of failures) {
            console.log(`    • ${f.name}: ${f.error}`);
        }
    }
    console.log('═══════════════════════════════════════════════════════');

    process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
    console.error('Test runner crashed:', err);
    process.exit(1);
});
