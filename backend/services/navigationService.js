// backend/services/navigationService.js - Allowlisted Campus Route Resolver

const APPROVED_CAMPUS_ROUTES = Object.freeze([
    { url: '/', label: 'PSG Tech Home Portal', keywords: ['home', 'homepage', 'main page'] },
    { url: '/facultyDetails.php', label: 'Faculty & Staff Directory', keywords: ['faculty', 'staff', 'professor', 'lecturer', 'faculty profile'] },
    { url: '/Heads.php', label: 'Heads of Departments (HoDs)', keywords: ['hod', 'head of department', 'heads'] },
    { url: '/programme.php', label: 'Academic Programmes & Syllabus', keywords: ['programme', 'programmes', 'syllabus', 'curriculum', 'courses'] },
    { url: '/programme_offered.php', label: 'Programmes Offered', keywords: ['programmes offered', 'degrees', 'branches'] },
    { url: '/admission.php', label: 'Admissions & Eligibility Portal', keywords: ['admission', 'admissions', 'tnea', 'counselling', 'eligibility'] },
    { url: '/BScMScAdmission2026', label: 'B.Sc & M.Sc Admissions', keywords: ['bsc', 'msc', 'integrated msc'] },
    { url: '/fn_oci', label: 'Foreign National & OCI Admissions', keywords: ['foreign national', 'oci', 'nri'] },
    { url: '/placements', label: 'Career & Placements Portal', keywords: ['placement', 'placements', 'recruiters', 'cdc', 'career'] },
    { url: '/hostel', label: 'Hostels & Residential Life', keywords: ['hostel', 'hostels', 'accommodation', 'mess', 'warden'] },
    { url: '/scholarships.php', label: 'Scholarships & Concessions', keywords: ['scholarship', 'scholarships', 'financial aid', 'concession'] },
    { url: '/coe.php', label: 'Controller of Examinations (CoE)', keywords: ['coe', 'exam', 'examination', 'revaluation', 'timetable'] },
    { url: '/student.php', label: 'Student Zone & Conduct Rules', keywords: ['student zone', 'student guidelines', 'conduct'] },
    { url: '/parentzone.php', label: 'Parents Zone & Academic Portal', keywords: ['parent zone', 'parent portal', 'parents'] },
    { url: '/cont.php', label: 'Campus Contact & Location', keywords: ['contact', 'address', 'email', 'phone', 'location'] },
    { url: '/abtcllg.php', label: 'About PSG College of Technology', keywords: ['about', 'history', 'college profile'] },
    { url: '/principal.php', label: 'Principal Office', keywords: ['principal'] },
    { url: '/nirf.php', label: 'NIRF Ranking & Data', keywords: ['nirf', 'ranking'] },
    { url: '/R&D.php', label: 'Research & Development', keywords: ['research', 'r&d'] },
    { url: '/sports', label: 'Physical Education & Sports', keywords: ['sports', 'gym', 'ground', 'athletic'] },
    { url: '/library', label: 'GRD Memorial Library', keywords: ['library', 'grd library', 'digital library'] },
    { url: '/thebridge', label: 'The Bridge Campus Magazine', keywords: ['the bridge', 'magazine'] },
    { url: '/academicschedule', label: 'Academic Schedule', keywords: ['academic schedule', 'calendar'] },
    { url: '/iipc', label: 'Industry Institute Partnership Cell (IIPC)', keywords: ['iipc', 'industry cell'] },
    { url: '/platinum', label: 'Platinum Jubilee Celebrations', keywords: ['platinum jubilee'] },
    { url: '/alumni', label: 'PSG Tech Alumni Portal', keywords: ['alumni'] },
    { url: '/enquiry', label: 'Enquiry Portal', keywords: ['enquiry'] }
]);

const ALLOWED_ROUTE_MAP = new Map(APPROVED_CAMPUS_ROUTES.map((r) => [r.url, r]));

function validateNavigationTarget(nav) {
    if (!nav || typeof nav.url !== 'string') return null;
    const clean = nav.url.trim();
    const matched = ALLOWED_ROUTE_MAP.get(clean);
    if (!matched) return null;
    return {
        url: matched.url,
        label: matched.label
    };
}

function resolveNavigationForIntent(query, intent, citations = []) {
    const lower = String(query || '').toLowerCase();
    const isExplicitNav = intent === 'CAMPUS_NAVIGATION' ||
        /\b(open|go to|take me|navigate|redirect|visit)\b/i.test(lower);

    if (!isExplicitNav) return null;

    for (const route of APPROVED_CAMPUS_ROUTES) {
        if (route.url === '/') continue;
        for (const kw of route.keywords) {
            const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (new RegExp(`\\b${escaped}\\b`, 'i').test(lower)) {
                return { url: route.url, label: route.label };
            }
        }
    }

    // Fallback to top cited internal route only when user explicitly asked to navigate
    for (const cite of citations) {
        const valid = validateNavigationTarget({ url: cite.url });
        if (valid && valid.url !== '/') return valid;
    }

    return null;
}

module.exports = {
    APPROVED_CAMPUS_ROUTES,
    validateNavigationTarget,
    resolveNavigationForIntent
};
