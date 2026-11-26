// backend/services/languageService.js - English, Tamil & Tanglish Detection & Search Expansion

const TAMIL_UNICODE_REGEX = /[\u0B80-\u0BFF]/;

const TANGLISH_PATTERNS = [
    /\b(evlo|evvalavu|enna|epdi|eppadi|enga|engay|eppo|eppothu|yaar|ippo|ethana|iruka|irukku|irukaa|venum|venuma|sollunga|sollu|kidaikuma|pannanum|pannungala|theriyuma|pathi|pathu|pogalam|poganum|varum|mudiyuma|pakkurathu)\b/i,
    /\b(fees|hostel|admission|attendance|exam|library|bus|campus|scholarship)\s+(la|ku|kku|oda|pathi|evlo|enna|epdi)\b/i
];

const BILINGUAL_SEARCH_MAP = [
    // Tamil Unicode -> English retrieval equivalents
    { pattern: /சேர்க்கை|அட்மிஷன்|விண்ணப்ப/i, keywords: ['admission', 'apply', 'eligibility', 'tnea', 'counselling'] },
    { pattern: /விடுதி|ஹாஸ்டல்|தங்குமிடம்/i, keywords: ['hostel', 'accommodation', 'mess', 'warden', 'residential'] },
    { pattern: /கட்டணம்|ஃபீஸ்/i, keywords: ['fee', 'fees', 'tuition', 'concession'] },
    { pattern: /உதவித்தொகை|ஸ்காலர்ஷிப்/i, keywords: ['scholarship', 'concession', 'financial', 'aid'] },
    { pattern: /வேலைவாய்ப்பு|பிளேஸ்மென்ட்/i, keywords: ['placement', 'recruiters', 'career', 'cdc'] },
    { pattern: /வருகை|அட்டெண்டன்ஸ்/i, keywords: ['attendance', 'minimum', 'percentage', 'condonation', 'coe'] },
    { pattern: /தேர்வு|பரீட்சை/i, keywords: ['examination', 'coe', 'autonomous', 'revaluation'] },
    { pattern: /பாடத்திட்டம்|சிலபஸ்|படிப்பு/i, keywords: ['programme', 'syllabus', 'curriculum', 'courses'] },
    { pattern: /நூலகம்|லைப்ரரி/i, keywords: ['library', 'grd', 'books', 'digital'] },
    { pattern: /விளையாட்டு|ஸ்போர்ட்ஸ்/i, keywords: ['sports', 'physical', 'education', 'ground'] },
    { pattern: /பேராசிரியர்|ஆசிரியர்|துறைத்தலைவர்/i, keywords: ['faculty', 'staff', 'professor', 'hod'] },
    { pattern: /முதல்வர்|பிரின்சிபால்/i, keywords: ['principal', 'thilagavathi'] },
    { pattern: /தொடர்பு|முகவரி|போன்/i, keywords: ['contact', 'cont', 'address', 'email', 'phone'] },
    { pattern: /பெற்றோர்கள்|பெற்றோர்|மதிப்பெண்/i, keywords: ['parent', 'parents', 'parentzone', 'ward', 'marks', 'attendance'] },
    // Tanglish -> English retrieval equivalents
    { pattern: /\b(evlo|evvalavu)\b/i, keywords: ['fees', 'amount', 'percentage', 'details'] },
    { pattern: /\b(epdi|eppadi|pannanum)\b/i, keywords: ['how', 'procedure', 'apply', 'process'] },
    { pattern: /\b(enna|sollunga)\b/i, keywords: ['what', 'details', 'rules', 'information'] },
    { pattern: /\b(enga|engay)\b/i, keywords: ['where', 'location', 'address', 'campus'] },
    { pattern: /\b(kidaikuma|iruka|irukku|irukaa)\b/i, keywords: ['available', 'eligibility', 'facilities'] },
    { pattern: /\b(serththu|sernthu|padikka)\b/i, keywords: ['admission', 'programme', 'study'] }
];

function detectLanguage(text) {
    const input = String(text || '').trim();
    if (!input) return 'en';
    if (TAMIL_UNICODE_REGEX.test(input)) return 'ta';
    if (TANGLISH_PATTERNS.some((re) => re.test(input))) return 'tanglish';
    return 'en';
}

function expandMultilingualQuery(text, detectedLang = null) {
    const input = String(text || '').trim();
    const lang = detectedLang || detectLanguage(input);
    const extraTerms = new Set();

    for (const rule of BILINGUAL_SEARCH_MAP) {
        if (rule.pattern.test(input)) {
            rule.keywords.forEach((kw) => extraTerms.add(kw));
        }
    }

    const searchQuery = extraTerms.size > 0
        ? `${input} ${[...extraTerms].join(' ')}`
        : input;

    return {
        language: lang,
        originalQuery: input,
        expandedQuery: searchQuery,
        addedKeywords: [...extraTerms]
    };
}

module.exports = {
    detectLanguage,
    expandMultilingualQuery
};
