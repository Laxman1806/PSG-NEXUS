// backend/services/intentService.js - Fine-Grained Intent Classification
const INTENTS = Object.freeze({
    GREETING: 'GREETING',
    CAMPUS_NAVIGATION: 'CAMPUS_NAVIGATION',
    LIVE_INFORMATION: 'LIVE_INFORMATION',
    PERSONAL_STUDENT_SERVICE: 'PERSONAL_STUDENT_SERVICE',
    HUMAN_SUPPORT: 'HUMAN_SUPPORT',
    OUT_OF_SCOPE: 'OUT_OF_SCOPE',
    ADMISSIONS: 'ADMISSIONS',
    ACADEMICS: 'ACADEMICS',
    FACULTY_SEARCH: 'FACULTY_SEARCH',
    PLACEMENTS: 'PLACEMENTS',
    HOSTEL: 'HOSTEL',
    SCHOLARSHIP: 'SCHOLARSHIP',
    EXAMINATION: 'EXAMINATION',
    NOTICE_SEARCH: 'NOTICE_SEARCH',
    CONTACT_LOOKUP: 'CONTACT_LOOKUP',
    GENERAL_COLLEGE_QUESTION: 'GENERAL_COLLEGE_QUESTION'
});

const GREETING_REGEX = /^(hi|hello|hey|hey there|greetings|vanakkam|வணக்கம்|good\s*(morning|afternoon|evening)|who\s*are\s*you|what\s*can\s*you\s*do)[\s!.,?]*$/i;
const EXPLICIT_NAV_REGEX = /\b(open|go to|take me|navigate|redirect|visit|launch)\b|\b(show me the|where is the)\s+.*\b(page|portal|section|directory|site)\b/i;
const PERSONAL_SERVICE_REGEX = /\b(my attendance|my marks|my grade|my cgpa|my result|my fee|my hall ticket|my bonafide|my roll number|login to my)\b/i;
const LIVE_INFO_REGEX = /\b(right now|today'?s bus|vacant seats|current vacancy|live seat|happening today)\b/i;
const HUMAN_SUPPORT_REGEX = /\b(talk to (a )?(human|person|staff|officer|counselor|admin)|speak with someone|speak with a human|human support|grievance|complaint)\b/i;
const OUT_OF_SCOPE_REGEX = /\b(chocolate cake|recipe|bitcoin|stock price|ipl|cricket match|weather in london|write python code|bubble sort|horoscope)\b/i;

function classifyIntent(query, expandedQuery = '') {
    const text = String(query || '').trim();
    const combined = `${text} ${expandedQuery}`.toLowerCase();

    if (!text) return INTENTS.GENERAL_COLLEGE_QUESTION;
    if (GREETING_REGEX.test(text)) return INTENTS.GREETING;
    if (PERSONAL_SERVICE_REGEX.test(text)) return INTENTS.PERSONAL_STUDENT_SERVICE;
    if (LIVE_INFO_REGEX.test(text)) return INTENTS.LIVE_INFORMATION;
    if (HUMAN_SUPPORT_REGEX.test(text)) return INTENTS.HUMAN_SUPPORT;
    if (EXPLICIT_NAV_REGEX.test(text)) return INTENTS.CAMPUS_NAVIGATION;
    if (OUT_OF_SCOPE_REGEX.test(text)) return INTENTS.OUT_OF_SCOPE;

    // Check explicit Admissions first (handles "entrance exam for MCA/M.E./MBA admissions", "10+2", "TANCET", "GATE", "CEETA")
    if (/\b(admissions?|tnea|tanca|tancet|ceeta|gate|cat|mat|counselling|lateral entry|cutoff|nri|oci|10\+2|admit|eligibility)\b|சேர்க்கை|விண்ணப்ப/i.test(text)) {
        return INTENTS.ADMISSIONS;
    }

    // Check Examination & Academic Regulations before generic apply/programmes
    if (/\b(coe|exams?|examinations?|attendance|condonation|revaluation|regulations?|timetables?|hall tickets?|grading|continuous assessment|ca1|ca2|ese|cgpa|ra grade|conduct rules|tutorials and mini-projects)\b|தேர்வு|வருகை/i.test(text)) {
        return INTENTS.EXAMINATION;
    }

    if (/\b(hostels?|mess|wardens?|curfews?|accommodation|dorms?|rooms?)\b|விடுதி/i.test(text)) {
        return INTENTS.HOSTEL;
    }

    if (/\b(scholarships?|concessions?|waivers?|financial aid|endowments?|pragati|saksham|centenary|quota fees)\b|உதவித்தொகை/i.test(text)) {
        return INTENTS.SCHOLARSHIP;
    }

    if (/\b(placements?|recruiters?|recruit|packages?|salary|cdc|internships?|companies|iipc)\b|வேலைவாய்ப்பு/i.test(text)) {
        return INTENTS.PLACEMENTS;
    }

    if (/\b(faculty|professors?|staff|hods?|head of|lecturers?)\b|பேராசிரியர்/i.test(text) && !/\bprofessor of practice\b/i.test(text)) {
        return INTENTS.FACULTY_SEARCH;
    }

    if (/\b(contacts?|phone|emails?|located|location|directions|airport|railway|guest house|reach|helpline|helpdesk|address)\b|தொடர்பு|முகவரி/i.test(text)) {
        return INTENTS.CONTACT_LOOKUP;
    }

    if (/\b(notices?|circulars?|announcements?|calendars?|brochures?|schedules?)\b/i.test(text)) {
        return INTENTS.NOTICE_SEARCH;
    }

    if (/\b(programmes?|programs?|courses?|syllabus|curriculum|degrees?|branches|b\.?e|b\.?tech|m\.?e|m\.?tech|mca|mba|m\.?sc|sandwich|departments?|library|sports|gym|athletic|fdps?|robotics|biomedical|biotechnology|textile|fashion|metallurgical|production|instrumentation|automobile|civil|research|r&d|ird|iic|psg-step|indutech|radio|bridge|portals|web urls|databases|ieee|sciencedirect)\b|பாடத்திட்டம்|நூலகம்|விளையாட்டு|படிப்பு/i.test(combined)) {
        return INTENTS.ACADEMICS;
    }

    return INTENTS.GENERAL_COLLEGE_QUESTION;
}

const INTENT_TO_CATEGORY = Object.freeze({
    [INTENTS.ADMISSIONS]: 'admissions',
    [INTENTS.ACADEMICS]: null,
    [INTENTS.FACULTY_SEARCH]: 'faculty',
    [INTENTS.PLACEMENTS]: 'placements',
    [INTENTS.HOSTEL]: 'hostel',
    [INTENTS.SCHOLARSHIP]: 'scholarships',
    [INTENTS.EXAMINATION]: null,
    [INTENTS.NOTICE_SEARCH]: null,
    [INTENTS.CONTACT_LOOKUP]: 'contact_directory'
});

module.exports = {
    INTENTS,
    GREETING_REGEX,
    classifyIntent,
    INTENT_TO_CATEGORY
};
