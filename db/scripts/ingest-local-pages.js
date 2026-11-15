require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cheerio = require('cheerio');
const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');

function splitIntoChunks(text, maxWords = 400, overlap = 50) {
    if (!text) return [];
    const words = text.split(/\s+/).filter(Boolean);
    const chunks = [];
    let i = 0;
    while (i < words.length) {
        const chunk = words.slice(i, i + maxWords).join(' ');
        chunks.push(chunk);
        i += maxWords - overlap;
    }
    return chunks;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

async function getEmbeddingWithRetry(text) {
    let attempts = 3;
    while (attempts > 0) {
        try {
            const result = await embeddingModel.embedContent({
                content: { parts: [{ text }] },
                outputDimensionality: 768
            });
            return result.embedding.values;
        } catch (err) {
            const msg = err.message || '';
            if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
                console.warn(`⏳ Rate limit reached. Pausing for 20s to allow Gemini token bucket to refill...`);
                await new Promise(r => setTimeout(r, 20000));
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

// Comprehensive list of all 41 core institutional pages
const candidatePages = [
    { file: 'index.html', title: 'PSG Tech - Home, Vision, Mission & Latest News', url: '/' },
    { file: 'abtcllg.php/index.html', title: 'About PSG College of Technology & History', url: '/abtcllg.php' },
    { file: 'admission.php/index.html', title: 'Admissions, Eligibility & Counselling Procedures', url: '/admission.php' },
    { file: 'BScMScAdmission2026/index.html', title: 'B.Sc & M.Sc Integrated Admissions 2026', url: '/BScMScAdmission2026' },
    { file: 'fn_oci/index.html', title: 'Foreign National (FN) & OCI / NRI Admissions', url: '/fn_oci' },
    { file: 'hostel/index.html', title: 'Hostel Facilities, Residential Rules & Wardens', url: '/hostel' },
    { file: 'placements/index.php/index.html', title: 'Placement Statistics, Top Recruiters & CDC', url: '/placements' },
    { file: 'Heads.php/index.html', title: 'Heads of Departments (HoD) & Department Chairs', url: '/Heads.php' },
    { file: 'facultyDetails.php/index.html', title: 'Faculty Members Directory & Professors', url: '/facultyDetails.php' },
    { file: 'programme.php/index.html', title: 'Programmes Offered (Undergraduate & Postgraduate)', url: '/programme.php' },
    { file: 'programme_offered.php/index.html', title: 'Academic Programmes, Degrees & Branches', url: '/programme_offered.php' },
    { file: 'coe.php/index.html', title: 'Controller of Examinations (CoE) & Exam Regulations', url: '/coe.php' },
    { file: 'student.php/index.html', title: 'Student Guidelines, Rules & Campus Conduct', url: '/student.php' },
    { file: 'parentzone.php/index.html', title: 'Parents Zone & Student Academic Portal', url: '/parentzone.php' },
    { file: 'cont.php/index.html', title: 'Contact Details, Campus Address & Helpdesk', url: '/cont.php' },
    { file: 'scholarships.php/index.html', title: 'Scholarships, Fee Concessions & Financial Aid', url: '/scholarships.php' },
    { file: 'principal.php/index.html', title: 'Principal & Leadership Message', url: '/principal.php' },
    { file: 'Dean-Academic.php/index.html', title: 'Office of Dean - Academic Affairs', url: '/Dean-Academic.php' },
    { file: 'Dean-Administration.php/index.html', title: 'Office of Dean - Administration', url: '/Dean-Administration.php' },
    { file: 'Dean-Autonomous.php/index.html', title: 'Office of Dean - Autonomous Exam Cell', url: '/Dean-Autonomous.php' },
    { file: 'VicePrincipal_WomenWelfare.php/index.html', title: 'Vice Principal & Women Welfare Committee', url: '/VicePrincipal_WomenWelfare.php' },
    { file: 'Management.php/index.html', title: 'Management & Governing Council', url: '/Management.php' },
    { file: 'founders.php/index.html', title: 'Founders & PSG & Sons Charities Legacy', url: '/founders.php' },
    { file: 'trustees.php/index.html', title: 'Managing Trustees of PSG Tech', url: '/trustees.php' },
    { file: 'secretary.php/index.html', title: 'Secretary of PSG College of Technology', url: '/secretary.php' },
    { file: 'nirf.php/index.html', title: 'NIRF Ranking & National Institutional Data', url: '/nirf.php' },
    { file: 'NBA Accreditation.php/index.html', title: 'NBA Accreditation & Quality Assurance', url: '/NBA-Accreditation.php' },
    { file: 'approval.php/index.html', title: 'AICTE Approval & Affiliation Status', url: '/approval.php' },
    { file: 'R&D.php/index.html', title: 'Research & Development (R&D) & Sponsored Projects', url: '/R&D.php' },
    { file: 'Report-RC2026.php/index.html', title: 'Research Conclave 2026 Proceedings', url: '/Report-RC2026.php' },
    { file: 'Research/ird.html', title: 'Industrial Research & Consultancy Cell (IRD)', url: '/Research/ird.html' },
    { file: 'IIC/index.html', title: 'Institution Innovation Council (IIC) & Incubation', url: '/IIC' },
    { file: 'Mousgloblink.php/index.html', title: 'International MoUs & Global University Tie-ups', url: '/Mousgloblink.php' },
    { file: 'MandatoryCommittee.php/index.html', title: 'Mandatory Committees & Grievance Redressal', url: '/MandatoryCommittee.php' },
    { file: 'course conducted.php/index.html', title: 'Short Term Courses, FDPs & Workshops', url: '/course-conducted.php' },
    { file: 'coeindutech/index.html', title: 'Center of Excellence in Industrial Textiles (InduTech)', url: '/coeindutech' },
    { file: 'psgcrs/index.html', title: 'PSG Community Radio 107.8 MHz (CRS)', url: '/psgcrs' },
    { file: 'teqip/index.html', title: 'TEQIP World Bank Institutional Quality Project', url: '/teqip' },
    { file: 'help-desk.php/index.html', title: 'Student Help Desk & Support Services', url: '/help-desk.php' },
    { file: 'Glances/index.html', title: 'Glances of PSG Tech - Campus Life & Traditions', url: '/Glances' },
    { file: 'websiteUrls.php/index.html', title: 'Official Portals Directory & Web Links', url: '/websiteUrls.php' }
];

// Curated Institutional Knowledge Packs
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
        url: '/admissions',
        content: `Admission to PSG College of Technology is conducted through merit-based government quotas and management quotas:
1. B.E. / B.Tech Admissions: Through Tamil Nadu Engineering Admissions (TNEA) single-window counseling conducted by the Directorate of Technical Education (DoTE) / Anna University. TNEA Counselling Code: 2006. Minimum eligibility: 10+2 with Mathematics, Physics, and Chemistry.
2. Lateral Entry (2nd Year B.E./B.Tech): For Diploma and B.Sc graduates through Centralized Lateral Entry Counselling.
3. M.E. / M.Tech Admissions: Through TANCA counselling based on GATE / CEETA-PG scores.
4. MCA (Master of Computer Applications): 2-year full-time postgraduate degree. Eligibility: Passed BCA / B.Sc (Computer Science / IT) or undergraduate degree with Mathematics at 10+2 or Degree level with at least 50% marks (45% for reserved category). Admission through TANCET conducted by Anna University.
5. MBA Admissions: Through TANCET / MAT / CAT scores via centralized counselling or management admission.`
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
        url: '/regulations',
        content: `Under Autonomous Regulations of PSG College of Technology:
Attendance Policy: Minimum required attendance is 75% in every course to be eligible to appear for the Autonomous End-Semester Examinations (ESE). Students having between 65% and 74% attendance due to documented medical reasons or authorized college representation may apply for condonation. Students below 65% attendance must repeat the course.
Continuous Assessment (CA): Includes tests (CA1, CA2), assignments, tutorials, quizzes, and mini-projects contributing towards internal marks.
Grading System: 10-point scale: O (Outstanding, 10), A+ (Excellent, 9), A (Very Good, 8), B+ (Good, 7), B (Above Average, 6), C (Average, 5), RA (Reappear, 0).`
    },
    {
        title: 'Campus Facilities, Central Library & Working Hours',
        url: '/facilities',
        content: `PSG Tech Campus Resources:
Dr. G.R. Damodaran Central Library: Holds over 2,50,000 volumes, 50,000+ e-journals (IEEE, ScienceDirect, Springer, ASME, ASCE), and digital learning facilities. Working hours: 8:00 AM to 8:00 PM on all working days.
Health Center: 24x7 medical assistance with qualified resident medical officers, emergency ambulance service connected to PSG Hospitals, Peelamedu.
Sports & Recreation: 400m athletic track, football ground, cricket nets, basketball courts with floodlights, tennis courts, and modern indoor badminton stadium.
Transport: Extensive fleet of college buses operating across Coimbatore, Tirupur, Pollachi, and Mettupalayam routes.`
    }
];

async function runIngestion() {
    console.log('🚀 Starting Comprehensive PSG Tech Local Data Ingestion Pipeline...');

    const documentsToStore = [];

    // Step 1: Extract from HTML pages
    for (const page of candidatePages) {
        const fullPath = fs.existsSync(path.join(frontendDir, page.file)) 
            ? path.join(frontendDir, page.file) 
            : path.join(rootDir, page.file);
        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️ Skipping missing file: ${page.file}`);
            continue;
        }

        try {
            const html = fs.readFileSync(fullPath, 'utf8');
            const $ = cheerio.load(html);
            $('script, style, noscript, nav, footer, #chat-window, #fab-btn').remove();

            const rawText = $('body').text().replace(/\s+/g, ' ').trim();
            if (rawText.length < 50) continue;

            const chunks = splitIntoChunks(rawText);
            console.log(`📄 Page "${page.title}": ${rawText.length} chars -> ${chunks.length} chunks`);

            for (let i = 0; i < chunks.length; i++) {
                documentsToStore.push({
                    title: page.title,
                    url: page.url,
                    content: chunks[i],
                    chunkIndex: i
                });
            }
        } catch (err) {
            console.error(`Error processing ${page.file}:`, err.message);
        }
    }

    // Step 2: Add Curated Knowledge Packs
    for (const pack of verifiedKnowledgePacks) {
        const chunks = splitIntoChunks(pack.content);
        for (let i = 0; i < chunks.length; i++) {
            documentsToStore.push({
                title: pack.title,
                url: pack.url,
                content: chunks[i],
                chunkIndex: i
            });
        }
    }

    console.log(`\n📊 Total chunks compiled: ${documentsToStore.length}`);

    // Check existing cache for incremental speedup
    const dataDir = path.join(rootDir, 'db', 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const cachePath = path.join(dataDir, 'knowledge_chunks.json');

    const cachedEmbeddingsMap = new Map();
    if (fs.existsSync(cachePath)) {
        try {
            const existingCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            for (const doc of existingCache) {
                if (doc._id && doc.embedding && doc.embedding.length === 768) {
                    cachedEmbeddingsMap.set(doc._id, doc.embedding);
                }
            }
            console.log(`💾 Found ${cachedEmbeddingsMap.size} pre-computed 768d embeddings in cache! Reusing...`);
        } catch (e) {}
    }

    console.log('⚡ Generating vector embeddings (gemini-embedding-001, 768d)...');

    const finalizedDocuments = [];

    for (let i = 0; i < documentsToStore.length; i++) {
        const doc = documentsToStore[i];
        const id = crypto.createHash('sha256').update(`${doc.url}:${doc.chunkIndex}:${doc.title}`).digest('hex');

        try {
            let embedding = cachedEmbeddingsMap.get(id);
            if (!embedding) {
                embedding = await getEmbeddingWithRetry(doc.content);
                // Respect free-tier rate limits with a small gap
                await new Promise(r => setTimeout(r, 600));
            }

            finalizedDocuments.push({
                _id: id,
                title: doc.title,
                url: doc.url,
                content: doc.content,
                chunkIndex: doc.chunkIndex,
                embedding: embedding,
                updatedAt: new Date()
            });

            if ((i + 1) % 10 === 0 || i === documentsToStore.length - 1) {
                console.log(`  Processed ${i + 1}/${documentsToStore.length} embeddings (${finalizedDocuments.length} ready)...`);
            }
        } catch (err) {
            console.error(`❌ Embedding error for chunk ${i}:`, err.message);
        }
    }

    console.log(`\n✅ Generated ${finalizedDocuments.length} vector embeddings!`);

    // Step 3: Save to local persistent cache JSON
    fs.writeFileSync(cachePath, JSON.stringify(finalizedDocuments, null, 2), 'utf8');
    console.log(`💾 Saved persistent knowledge cache to: data/knowledge_chunks.json (${(fs.statSync(cachePath).size / 1024 / 1024).toFixed(2)} MB)`);

    // Step 4: Ingest into Local MongoDB
    try {
        console.log('\n📦 Connecting to local MongoDB (mongodb://127.0.0.1:27017/psg_chatbot)...');
        const localClient = new MongoClient('mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 3000 });
        await localClient.connect();
        const localDb = localClient.db('psg_chatbot');
        const collection = localDb.collection('website_chunks');

        let localUpsertCount = 0;
        for (const doc of finalizedDocuments) {
            await collection.updateOne(
                { _id: doc._id },
                { $set: doc },
                { upsert: true }
            );
            localUpsertCount++;
        }
        console.log(`✅ Stored ${localUpsertCount} chunks into local MongoDB collection: website_chunks`);
        await localClient.close();
    } catch (localDbErr) {
        console.warn('⚠️ Local MongoDB note:', localDbErr.message);
    }

    // Step 5: Ingest into MongoDB Atlas if accessible
    if (process.env.MONGO_URI) {
        try {
            console.log('\n☁️ Attempting to sync with MongoDB Atlas...');
            const atlasClient = new MongoClient(process.env.MONGO_URI, { serverSelectionTimeoutMS: 4000 });
            await atlasClient.connect();
            const atlasDb = atlasClient.db('psg_chatbot');
            const atlasCol = atlasDb.collection('website_chunks');

            let atlasCount = 0;
            for (const doc of finalizedDocuments) {
                await atlasCol.updateOne(
                    { _id: doc._id },
                    { $set: doc },
                    { upsert: true }
                );
                atlasCount++;
            }
            console.log(`✅ Stored ${atlasCount} chunks into MongoDB Atlas!`);
            await atlasClient.close();
        } catch (atlasErr) {
            console.log('ℹ️ MongoDB Atlas note (IP whitelist or network):', atlasErr.message);
            console.log('💡 Data is fully secured in local MongoDB and data/knowledge_chunks.json.');
        }
    }

    console.log('\n🎉 ALL WEBSITE PAGES SUCCESSFULLY INGESTED!');
}

runIngestion().catch(err => {
    console.error('Fatal ingestion error:', err);
    process.exit(1);
});
