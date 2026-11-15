const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const frontendDir = path.resolve(__dirname, '../../frontend');

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

// 51 Clean Pages with human-friendly descriptive titles & URLs
const comprehensivePages = [
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

let totalChars = 0;
let totalChunks = 0;

for (const p of comprehensivePages) {
    const full = path.join(frontendDir, p.file);
    if (!fs.existsSync(full)) {
        console.warn(`File missing: ${p.file}`);
        continue;
    }
    const html = fs.readFileSync(full, 'utf8');
    const $ = cheerio.load(html);
    $('script, style, noscript, nav, footer, #chat-window, #fab-btn').remove();
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    const chunks = splitIntoChunks(text);
    totalChars += text.length;
    totalChunks += chunks.length;
    console.log(`- ${p.title} (${text.length} chars) -> ${chunks.length} chunks`);
}

console.log(`\n========================================`);
console.log(`Total Extracted Text: ${(totalChars / 1024).toFixed(1)} KB`);
console.log(`Total Compiled Chunks: ${totalChunks} chunks (up from 38)`);
console.log(`========================================`);
