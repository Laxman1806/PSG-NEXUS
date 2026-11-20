// db/scripts/test-server-routes.js
const app = require('../../backend/app');

const testRoutes = [
    { path: '/', label: 'Homepage Replica' },
    { path: '/facultyDetails.php', label: 'Faculty & Staff Directory' },
    { path: '/programme.php', label: 'Programmes & Syllabus' },
    { path: '/admission.php', label: 'Admissions Portal' },
    { path: '/hostel', label: 'Hostels' },
    { path: '/placements', label: 'Placements' },
    { path: '/abtcllg.php', label: 'About College' },
    { path: '/cont.php', label: 'Contact & Location' },
    { path: '/coe.php', label: 'Controller of Examinations' },
    { path: '/scholarships.php', label: 'Scholarships' },
    { path: '/sports', label: 'Sports Subdomain' },
    { path: '/library', label: 'Library Subdomain' },
    { path: '/css/chatbot.css', label: 'Chatbot Stylesheet' },
    { path: '/js/script.js', label: 'Chatbot Script' }
];

async function run() {
    const server = app.listen(0);
    const port = server.address().port;
    console.log(`Testing Express routes on port ${port}...`);

    let passed = 0;
    for (const r of testRoutes) {
        try {
            const res = await fetch(`http://localhost:${port}${r.path}`);
            if (res.ok) {
                console.log(`✅ [${res.status}] ${r.label} (${r.path}) -> OK (${res.headers.get('content-type')})`);
                passed++;
            } else {
                console.error(`❌ [${res.status}] ${r.label} (${r.path}) -> Failed!`);
            }
        } catch (e) {
            console.error(`❌ ${r.label} (${r.path}) -> Network error: ${e.message}`);
        }
    }

    server.close();
    console.log(`\nResults: ${passed}/${testRoutes.length} routes passed!`);
}

run().catch(console.error);
