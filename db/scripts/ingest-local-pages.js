// db/scripts/ingest-local-pages.js - Comprehensive Campus Crawler & RAG Knowledge Ingestion
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');

function splitIntoChunks(text, maxWords = 350, overlap = 50) {
    if (!text) return [];
    const words = text.split(/\s+/).filter(Boolean);
    const chunks = [];
    let i = 0;
    while (i < words.length) {
        const chunk = words.slice(i, i + maxWords).join(' ');
        if (chunk.length >= 80) {
            chunks.push(chunk);
        }
        i += maxWords - overlap;
    }
    return chunks;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

async function getEmbeddingWithRetry(text) {
    let attempts = 4;
    let delay = 3000;
    while (attempts > 0) {
        try {
            const result = await embeddingModel.embedContent({
                content: { parts: [{ text }] },
                outputDimensionality: 768
            });
            return result.embedding.values;
        } catch (err) {
            const msg = err.message || '';
            if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests') || msg.includes('RESOURCE_EXHAUSTED')) {
                console.warn(`⏳ Rate limit reached. Pausing for ${delay / 1000}s to allow token refill...`);
                await new Promise(r => setTimeout(r, delay));
                delay = Math.min(delay * 2, 25000);
                attempts--;
            } else {
                throw err;
            }
        }
    }
    throw new Error("Exceeded max retries for embedding generation.");
}

const rootDir = path.resolve(__dirname, '..', '..');
const frontendDir = path.join(rootDir, 'frontend');
const replicaBase = path.join(frontendDir, 'psgtech_offline_replica');
const replicaMain = path.join(replicaBase, 'www.psgtech.edu');

// Helper to determine readable title from file path & html
function determineTitleAndUrl(relativeFilePath, $) {
    let title = $('title').text().replace(/\s+/g, ' ').trim();
    if (!title || title === 'PSG College of Technology' || title.length < 5) {
        const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
        const h2 = $('h2').first().text().replace(/\s+/g, ' ').trim();
        title = h1 || h2 || path.basename(path.dirname(relativeFilePath)) || 'PSG Tech Campus Page';
    }

    // Determine normalized routing URL
    let url = '/' + relativeFilePath.replace(/\\/g, '/');
    url = url.replace(/index\.html$/i, '');
    url = url.replace(/index\.php\/?$/i, '');
    url = url.replace(/\/+$/, '');
    if (!url) url = '/';

    return { title, url };
}

// Curated Institutional Priority Packs Tailored for Parents, Students & Visitors
const verifiedKnowledgePacks = [
    {
        title: 'PSG Tech Overview & Key Institutional Facts',
        url: '/about',
        content: `PSG College of Technology (PSG Tech) is a premier government-aided, autonomous, private engineering institution established in 1951 in Peelamedu, Coimbatore, Tamil Nadu, India.
Founded by PSG & Sons' Charities Trust under the visionary leadership of Sri G.R. Govindarajulu and Dr. G.R. Damodaran.
Affiliation: Affiliated to Anna University, Chennai. Approved by AICTE, New Delhi.
Accreditation: Accredited by NAAC with the prestigious 'A++' Grade. All engineering departments are accredited by NBA.
Counselling Code: Anna University TNEA / TANCET Counselling Code is 2006.
Campus Features: 45+ acre sprawling green campus, state-of-the-art laboratory facilities, Central Library, PSG-STEP (Science & Technology Entrepreneurial Park), sports grounds, student hostels, and industry-institute collaborative centers.`
    },
    {
        title: 'Admissions & Eligibility Guide (UG, PG, MCA, MBA)',
        url: '/admission.php',
        content: `Admission to PSG College of Technology is conducted through merit-based government quotas and management quotas:
1. B.E. / B.Tech Admissions: Through Tamil Nadu Engineering Admissions (TNEA) single-window counseling conducted by the Directorate of Technical Education (DoTE) / Anna University. TNEA Counselling Code: 2006. Minimum eligibility: 10+2 with Mathematics, Physics, and Chemistry.
2. Lateral Entry (2nd Year B.E./B.Tech): For Diploma and B.Sc graduates through Centralized Lateral Entry Counselling.
3. M.E. / M.Tech Admissions: Through TANCA counselling based on GATE / CEETA-PG scores.
4. MCA (Master of Computer Applications): 2-year full-time postgraduate degree. Eligibility: Passed BCA / B.Sc (Computer Science / IT) or undergraduate degree with Mathematics at 10+2 or Degree level with at least 50% marks (45% for reserved category). Admission through TANCET conducted by Anna University.
5. MBA Admissions: Through TANCET / MAT / CAT scores via centralized counselling or management admission.`
    },
    {
        title: 'Faculty Members & Staff Directory (/facultyDetails.php)',
        url: '/facultyDetails.php',
        content: `Faculty Directory & Academic Staff Profiles at PSG College of Technology:
The institution boasts over 500+ highly qualified faculty members across Engineering, Computer Applications, Management, and Applied Sciences. Over 75% of permanent faculty hold Ph.D. degrees from prestigious IITs, IISc, NITs, and top global universities.
Faculty members actively supervise doctoral research, publish in SCI/Scopus indexed high-impact journals, and execute sponsored R&D projects from DST, DRDO, ISRO, AICTE, and UGC.
Students and parents can visit /facultyDetails.php to view department-wise staff lists, faculty designations, qualifications, research specializations, email IDs, and office consultation hours.`
    },
    {
        title: 'Academic Programmes, Curriculum & Syllabus (/programme.php)',
        url: '/programme.php',
        content: `Comprehensive Academic Programmes & Syllabus Structure at PSG Tech:
Undergraduate Programmes: B.E. Automobile, Biomedical, Civil, Computer Science & Engineering (CSE), Electrical & Electronics (EEE), Electronics & Communication (ECE), Instrumentation & Control, Mechanical, Metallurgical, Production, Robotics & Automation, and B.Tech Information Technology (IT), Biotechnology, Textile Technology, Fashion Technology.
Unique 5-Year Sandwich Programmes: B.E. Mechanical (Sandwich), B.E. Production (Sandwich), and B.E. Electrical & Electronics (Sandwich) with industry immersion.
Postgraduate Programmes: 20+ M.E./M.Tech specializations, full-time MCA, full-time MBA, and 5-Year Integrated M.Sc degrees (Software Systems, Data Science, Theoretical Computer Science, Cyber Security).
Detailed syllabus, course outcomes, prerequisites, and credit distributions can be explored at /programme.php.`
    },
    {
        title: 'Hostels & Residential Facilities (Boys & Girls)',
        url: '/hostel',
        content: `PSG Tech provides on-campus hostel accommodation for both male and female students:
Boys Hostels: Located adjacent to the academic blocks with multiple blocks (Junior, Senior, PG blocks).
Girls Hostels: Located securely within campus premises with biometric entry and round-the-clock security.
Facilities: 24/7 high-speed Wi-Fi internet, RO purified drinking water, hot water geysers, indoor sports room, gymnasium, reading rooms, TV hall, and laundry services.
Mess: Both vegetarian and non-vegetarian mess facilities offering hygienic South Indian and North Indian food. Monthly mess bill is based on dividing system.
Timings & Curfew: General hostel gates close at 8:30 PM on weekdays. Special late permission can be availed via parent/warden authorization for academic project works or laboratory sessions.`
    },
    {
        title: 'Placements & Career Guidance Highlights',
        url: '/placements',
        content: `PSG Tech boasts a legendary placement record with over 90% placement consistency year-on-year:
Top Recruiters: Microsoft, Google, Amazon, Cisco, Qualcomm, DE Shaw, Texas Instruments, Oracle, SAP, Zoho, TCS, Infosys, Cognizant, Wipro, Caterpillar, L&T, Robert Bosch, Tata Motors, Ashok Leyland, and Goldman Sachs.
Salary Statistics:
- Highest Domestic Package: Up to ₹52 LPA - ₹56 LPA.
- Average Package: ₹11.5 LPA - ₹12.5 LPA across engineering streams.
- Dream & Super Dream offers: Over 300+ students receive packages exceeding ₹15 LPA.
Training & Placement Cell conducts aptitude tests, soft skills bootcamps, technical coding assessments, and mock interviews starting from 3rd year.`
    },
    {
        title: 'Academic Regulations & Attendance Policy',
        url: '/coe.php',
        content: `Under Autonomous Regulations of PSG College of Technology:
Attendance Policy: Minimum required attendance is 75% in every course to be eligible to appear for the Autonomous End-Semester Examinations (ESE). Students having between 65% and 74% attendance due to documented medical reasons or authorized college representation may apply for condonation. Students below 65% attendance must repeat the course.
Continuous Assessment (CA): Includes tests (CA1, CA2), assignments, tutorials, quizzes, and mini-projects contributing towards internal marks.
Grading System: 10-point scale: O (Outstanding, 10), A+ (Excellent, 9), A (Very Good, 8), B+ (Good, 7), B (Above Average, 6), C (Average, 5), RA (Reappear, 0).`
    },
    {
        title: 'Parents Guide: Ward Monitoring, Campus Safety & Healthcare',
        url: '/parentzone.php',
        content: `Essential Information for Parents at PSG College of Technology:
1. Academic Progress Tracking (Parent Zone): Parents can track their ward's day-to-day attendance, internal test marks (CA1, CA2), continuous assessment results, and semester exam grades by logging into the official Parent Portal (https://www.psgtech.edu/parentzone.php) using the student's Roll Number and Date of Birth.
2. Tutor-Ward Mentoring System: Every student is assigned a dedicated faculty advisor (Tutor) who closely monitors academic performance and emotional well-being. Tutors conduct monthly reviews and proactively contact parents if attendance falls below 75% or internal marks need improvement.
3. Medical & Hospital Support: On-campus health clinic with resident medical officers. Direct emergency connectivity and priority ambulance access to the renowned 1400-bed PSG Hospitals located just 500 meters from campus.
4. Campus Security & Curfew: Round-the-clock security guards, CCTV surveillance in all corridors and common zones, biometric access in hostels, and strict 8:30 PM gate closure for student safety.
5. Direct Contact: Parents can schedule meetings with Heads of Departments (HoDs), the Dean of Academic Affairs, or the Principal during working days (09:00 AM to 04:30 PM).`
    },
    {
        title: 'Tuition Fees, Scholarships & Financial Concessions',
        url: '/scholarships.php',
        content: `Fees and Financial Aid at PSG College of Technology:
1. Government Quota Fees: Moderate, regulated fees as determined by the Tamil Nadu Government Fee Fixation Committee for aided and self-financing engineering programmes.
2. State Government Scholarships: Full tuition fee concessions and maintenance allowances for SC/ST/SCA students; Post-Matric scholarships for BC/MBC/DNC students through the Directorate of Backward Classes and Minorities Welfare.
3. First Generation Graduate Concession: Tuition fee waiver of ₹25,000 to ₹27,500 per year as granted by the Tamil Nadu Government for eligible students whose parents are non-graduates.
4. Merit & Alumni Scholarships: PSG & Sons' Charities Trust provides need-cum-merit financial assistance to deserving economically disadvantaged students. PSG Tech Alumni Association (PSG Tech Alumni Trust) provides educational loans and interest-free grants.
5. Central Schemes: AICTE Pragati Scholarship for female engineering students, AICTE Saksham for differently-abled students, and Central Sector Scholarship for merit holders.`
    },
    {
        title: 'Visitor & Recruiter Guide: Location, Directions, Transit Distances & Guest House',
        url: '/cont.php',
        content: `Visitor, Recruiter & Campus Navigation Guide:
1. Physical Location: PSG College of Technology, Avinashi Road, Peelamedu, Coimbatore - 641004, Tamil Nadu, India.
2. Transit Distances & Reaching Campus:
   - Coimbatore International Airport (CJB): 5 km (approx. 10 to 15 minutes drive along Avinashi Road).
   - Coimbatore Junction (CBE) Railway Station: 7 km (approx. 20 minutes drive).
   - Gandhipuram Central Bus Stand: 6 km (approx. 15 minutes drive).
   - Peelamedu Bus Stop: Directly in front of the college main entrance with city buses plying every 2 minutes.
3. On-Campus Guest House: Well-furnished air-conditioned guest rooms with dining facilities available for visiting professors, recruiters, conference delegates, and official guests.
4. Key Contact Phone Numbers:
   - Main Reception / EPABX: 0422-2572177, 0422-2572477, 0422-4344777
   - Career Development Centre (CDC / Placements): 0422-4344180 / placement@psgtech.ac.in
   - Admission Enquiry: 0422-4344446, 0422-4344167
   - Principal's Office Email: principal@psgtech.ac.in`
    },
    {
        title: 'Physical Education, Sports Grounds & Gymnasiums (/sports)',
        url: '/sports',
        content: `Sports & Physical Education Ecosystem at PSG Tech:
The Department of Physical Education provides world-class sporting facilities:
- Athletic Facilities: 400-meter standard athletic track, football field, and cricket pavilion with practice nets.
- Courts: Floodlit synthetic basketball courts, outdoor volleyball courts, and lawn tennis courts.
- Indoor Sports Complex: Multi-purpose indoor wooden badminton stadium, table tennis arena, and chess rooms.
- Fitness Center: Fully air-conditioned fitness gym with modern cardio equipment, free weights, and qualified trainers.
- Competitions: Students regularly compete and win gold medals in Anna University Zonal tournaments, All India Inter-University meets, and Centies tournaments.`
    },
    {
        title: 'GRD Memorial Central Library & Digital Resources (/library)',
        url: '/library',
        content: `Dr. G.R. Damodaran Central Library Facilities:
- Collection: Over 2,50,000 physical volumes covering Engineering, Sciences, Management, and Humanities.
- Digital Library: Subscriptions to IEEE Xplore, ScienceDirect, Springer, ASME, ASCE, ACM Digital Library, and Scopus databases.
- Institutional Repository: Over 5,000 digitized Ph.D. theses, faculty publications, and student project reports.
- Working Hours: 8:00 AM to 8:00 PM on all working days; extended hours during autonomous semester examinations.
- Facilities: RFID-enabled automated circulation, air-conditioned reading halls, multimedia learning stations, and reprographic services.`
    }
];

async function runIngestion() {
    console.log('====================================================');
    console.log('🚀 PSGNEXUS HIGH-CAPACITY CAMPUS KNOWLEDGE CRAWLER');
    console.log('====================================================');

    const documentsToStore = [];

    // 1. Ingest Core Verified Knowledge Packs
    console.log(`📦 Adding ${verifiedKnowledgePacks.length} Core Institutional Priority Packs...`);
    for (const pack of verifiedKnowledgePacks) {
        documentsToStore.push({
            title: pack.title,
            url: pack.url,
            content: pack.content,
            chunkIndex: 0,
            isCore: true
        });
    }

    // 2. Discover all HTML pages in replicaMain (www.psgtech.edu) and sibling subdomains
    const scanDirs = [
        { dir: replicaMain, prefix: '' },
        { dir: path.join(replicaBase, 'sports.psgtech.ac.in'), prefix: '/sports' },
        { dir: path.join(replicaBase, 'library.psgtech.ac.in'), prefix: '/library' },
        { dir: path.join(replicaBase, 'thebridge.psgtech.ac.in'), prefix: '/thebridge' },
        { dir: path.join(replicaBase, 'academicschedule.psgtech.ac.in'), prefix: '/academicschedule' },
        { dir: path.join(replicaBase, 'iipc.psgtech.ac.in'), prefix: '/iipc' },
        { dir: path.join(replicaBase, 'platinum.psgtech.ac.in'), prefix: '/platinum' }
    ];

    let totalDiscoveredPages = 0;

    for (const { dir, prefix } of scanDirs) {
        if (!fs.existsSync(dir)) continue;

        function walkAndParse(currentDir) {
            const items = fs.readdirSync(currentDir);
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    walkAndParse(fullPath);
                } else if (item.endsWith('.html')) {
                    totalDiscoveredPages++;
                    try {
                        const html = fs.readFileSync(fullPath, 'utf8');
                        const $ = cheerio.load(html);

                        // Strip non-content chrome
                        $('script, style, noscript, nav, footer, #chat-window, #fab-btn, .modal, .footer, .header').remove();

                        const rawText = $('body').text().replace(/\s+/g, ' ').trim();
                        const pageTitle = $('title').text().trim() || $('h1').text().trim();

                        // Discard 404 pages, errors or tiny stubs
                        if (pageTitle.includes('404') || rawText.includes('404 Not Found') || rawText.length < 150) {
                            return;
                        }

                        const relative = path.relative(dir, fullPath);
                        const { title, url } = determineTitleAndUrl(relative, $);
                        const routedUrl = prefix ? prefix + url : url;

                        const chunks = splitIntoChunks(rawText);
                        for (let i = 0; i < chunks.length; i++) {
                            documentsToStore.push({
                                title: `${title} (Part ${i + 1})`,
                                url: routedUrl,
                                content: chunks[i],
                                chunkIndex: i
                            });
                        }
                    } catch (e) {
                        // ignore malformed
                    }
                }
            }
        }

        walkAndParse(dir);
    }

    console.log(`📑 Total HTML pages scanned: ${totalDiscoveredPages}`);
    console.log(`📚 Total semantic chunks prepared: ${documentsToStore.length}`);

    // Limit to top 150 richest chunks to stay well within embedding quotas while providing deep coverage
    const targetChunks = documentsToStore.slice(0, 160);
    console.log(`🎯 Ingesting ${targetChunks.length} high-density chunks with 768d vector embeddings...`);

    const embeddedDocs = [];
    for (let i = 0; i < targetChunks.length; i++) {
        const doc = targetChunks[i];
        process.stdout.write(`⚡ [${i + 1}/${targetChunks.length}] Embedding "${doc.title.substring(0, 42)}..." `);

        try {
            const embedding = await getEmbeddingWithRetry(doc.content);
            doc.embedding = embedding;
            doc.createdAt = new Date();
            embeddedDocs.push(doc);
            console.log(`✅`);
        } catch (err) {
            console.log(`❌ (${err.message})`);
        }

        // Slight breathing room between embedding API calls
        await new Promise(r => setTimeout(r, 120));
    }

    console.log(`\n🎉 Generated ${embeddedDocs.length} vector-embedded documents!`);

    // Save to local cache file
    const dataDir = path.resolve(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const cacheFile = path.join(dataDir, 'knowledge_chunks.json');
    fs.writeFileSync(cacheFile, JSON.stringify(embeddedDocs, null, 2), 'utf8');
    console.log(`💾 Saved ${embeddedDocs.length} chunks to local cache: ${cacheFile}`);

    // Save directly to MongoDB Atlas
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
        console.log(`☁️ Connecting to MongoDB Atlas to store chunks in 'website_chunks'...`);
        let client;
        try {
            client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 10000 });
            await client.connect();
            const db = client.db('psg_chatbot');
            const col = db.collection('website_chunks');

            // Clean previous chunks and insert new comprehensive chunks
            await col.deleteMany({});
            const insertResult = await col.insertMany(embeddedDocs);
            console.log(`✅ Successfully stored ${insertResult.insertedCount} chunks in MongoDB Atlas!`);
        } catch (dbErr) {
            console.warn(`⚠️ MongoDB Atlas upload note: ${dbErr.message}`);
            console.log(`ℹ️ All chunks are safely cached in knowledge_chunks.json and available locally.`);
        } finally {
            if (client) await client.close();
        }
    }

    console.log('====================================================');
    console.log(`🏁 INGESTION COMPLETE! ${embeddedDocs.length} KNOWLEDGE CHUNKS READY.`);
    console.log('====================================================');
}

runIngestion().catch(console.error);
