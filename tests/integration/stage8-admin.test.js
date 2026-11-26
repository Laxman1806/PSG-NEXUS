// tests/integration/stage8-admin.test.js
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('fs');
const os = require('os');
const path = require('path');

describe('Stage 8: Admin Authentication, Role Authorization, Upload & Retrieval Inspector', () => {
    let server;
    let baseUrl;
    const prevAdminKey = process.env.ADMIN_API_KEY;
    const prevReviewerKey = process.env.REVIEWER_API_KEY;
    const tempSnapshot = path.join(os.tmpdir(), `psg-nexus-stage8-snap-${process.pid}.json`);
    let knowledgeRepo;
    const uploadedDocIds = [];

    before(async () => {
        process.env.KNOWLEDGE_SNAPSHOT_PATH = tempSnapshot;
        process.env.ADMIN_API_KEY = 'test-admin-key-xyz-999';
        process.env.REVIEWER_API_KEY = 'test-reviewer-key-xyz-111';
        delete require.cache[require.resolve('../../backend/config/env')];
        delete require.cache[require.resolve('../../backend/middleware/authenticate')];
        delete require.cache[require.resolve('../../backend/app')];

        knowledgeRepo = require('../../db/repositories/knowledgeRepository');
        const app = require('../../backend/app');
        server = http.createServer(app);
        await new Promise((r) => server.listen(0, '127.0.0.1', r));
        baseUrl = `http://127.0.0.1:${server.address().port}`;
    });

    after(async () => {
        if (server) await new Promise((r) => server.close(r));
        if (fs.existsSync(tempSnapshot)) {
            fs.unlinkSync(tempSnapshot);
        }
        delete process.env.KNOWLEDGE_SNAPSHOT_PATH;
        if (prevAdminKey === undefined) delete process.env.ADMIN_API_KEY;
        else process.env.ADMIN_API_KEY = prevAdminKey;
        if (prevReviewerKey === undefined) delete process.env.REVIEWER_API_KEY;
        else process.env.REVIEWER_API_KEY = prevReviewerKey;
    });

    it('blocks unauthenticated requests (401) and reviewer write actions (403)', async () => {
        const noAuth = await fetch(`${baseUrl}/api/admin/documents`);
        assert.equal(noAuth.status, 401);

        const revRead = await fetch(`${baseUrl}/api/admin/documents`, {
            headers: { 'X-Admin-Key': 'test-reviewer-key-xyz-111' }
        });
        assert.equal(revRead.status, 200);

        const revWrite = await fetch(`${baseUrl}/api/admin/ingestion`, {
            method: 'POST',
            headers: {
                'X-Admin-Key': 'test-reviewer-key-xyz-111',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dryRun: true })
        });
        assert.equal(revWrite.status, 403);
    });

    it('uploads a TXT notice, approves it, and inspects retrieval diagnostics', async () => {
        const fd = new FormData();
        const blob = new Blob([
            'Title: PSG Tech Hostel Notice 2026\nDepartment: Hostel Office\nHostel admission forms are issued after TNEA allotment verification.'
        ], { type: 'text/plain' });
        fd.append('file', blob, 'hostel-notice.txt');
        fd.append('skipEmbed', 'true');
        fd.append('category', 'hostel');

        const uploadRes = await fetch(`${baseUrl}/api/admin/documents`, {
            method: 'POST',
            headers: { 'X-Admin-Key': 'test-admin-key-xyz-999' },
            body: fd
        });
        assert.equal(uploadRes.status, 201);
        const upBody = await uploadRes.json();
        assert.equal(upBody.document.status, 'pending');
        uploadedDocIds.push(upBody.document.documentId);

        const approveRes = await fetch(`${baseUrl}/api/admin/documents/${upBody.document.documentId}/approve`, {
            method: 'POST',
            headers: { 'X-Admin-Key': 'test-admin-key-xyz-999' }
        });
        assert.equal(approveRes.status, 200);
        const appBody = await approveRes.json();
        assert.equal(appBody.status, 'active');

        const testRes = await fetch(`${baseUrl}/api/admin/retrieval-test`, {
            method: 'POST',
            headers: {
                'X-Admin-Key': 'test-admin-key-xyz-999',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: 'hostel admission forms', skipEmbedding: true })
        });
        assert.equal(testRes.status, 200);
        const retBody = await testRes.json();
        assert.ok(retBody.evidence.length > 0);

        const analytics = await fetch(`${baseUrl}/api/admin/analytics/overview`, {
            headers: { 'X-Admin-Key': 'test-admin-key-xyz-999' }
        });
        assert.equal(analytics.status, 200);
    });
});
