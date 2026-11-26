// db/ingestion/extractors.js - Document-Aware Extractors (HTML, PDF, DOCX, TXT, Approved URLs)
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { config } = require('../../backend/config/env');

const ASSET_PATH_REGEX = /\.(png|jpg|jpeg|gif|ico|webp|svg|css|js|ttf|woff|woff2|eot)\//i;
const GENERIC_TITLES = new Set([
    '',
    'psg college of technology',
    'home',
    'index',
    'untitled'
]);

function normalizeWhitespace(text) {
    return String(text || '')
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function stripNewsTickerNoise(text) {
    return String(text || '')
        .replace(/^News:\s*Registration for Redo Courses.*?ISO certified 9001:2015\s*/is, '')
        .trim();
}

function isAssetWrapperHtml(relPath) {
    return ASSET_PATH_REGEX.test(String(relPath || '').replace(/\\/g, '/'));
}

function normalizeHtmlRoute(relativeFilePath, urlPrefix = '') {
    let url = '/' + String(relativeFilePath || '').replace(/\\/g, '/');
    url = url.replace(/index\.html$/i, '');
    url = url.replace(/index\.php\/?$/i, '');
    url = url.replace(/\/+$/, '');
    if (!url) url = '/';
    const combined = urlPrefix ? (url === '/' ? urlPrefix : `${urlPrefix}${url}`) : url;
    return combined || '/';
}

function extractHtmlDocument(htmlContent, { relativePath = '', urlPrefix = '', sourceUrl = null } = {}) {
    if (isAssetWrapperHtml(relativePath)) {
        return { skipped: true, reason: 'asset-wrapper-html' };
    }

    const $ = cheerio.load(String(htmlContent || ''));

    const rawPageTitle = normalizeWhitespace($('title').text());
    const h1Text = normalizeWhitespace($('h1').first().text());
    const h2Text = normalizeWhitespace($('h2').first().text());

    // Strip repeated site navigation, news tickers, headers, footers, and injected widget markup
    $(
        'script, style, noscript, iframe, svg, #tg-header, #tg-footer, .tg-ticker, .tg-breadcrumb, ' +
        'nav, header, footer, #chat-window, #fab-btn, #psg-nexus-root, .modal, .header, .footer'
    ).remove();

    const mainRoot = $('#tg-main').length
        ? $('#tg-main')
        : $('main').length
            ? $('main')
            : $('article').length
                ? $('article')
                : $('body');

    const title = !GENERIC_TITLES.has(rawPageTitle.toLowerCase())
        ? rawPageTitle
        : (h1Text || h2Text || path.basename(path.dirname(relativePath || 'page')) || 'PSG Tech Campus Page');

    const sections = [];
    let currentHeading = title;
    let currentDepartment = null;
    let buffer = [];
    const processedNodes = new Set();

    function markProcessed(el) {
        processedNodes.add(el);
        $(el).find('*').each((_, child) => processedNodes.add(child));
    }

    function flushSection() {
        const text = normalizeWhitespace(buffer.join('\n'));
        if (text.length > 0) {
            sections.push({
                heading: currentHeading,
                department: currentDepartment,
                text
            });
        }
        buffer = [];
    }

    // Walk blocks in reading order to preserve cards, profile boxes, headings, and multi-department tables
    mainRoot
        .find('h1, h2, h3, h4, h5, h6, .well, .tg-shortcodetextbox, .tab-pane, p, li, dt, dd, blockquote, table')
        .each((_, el) => {
            if (processedNodes.has(el)) return;
            const tag = el.tagName?.toLowerCase();
            const $el = $(el);

            // Skip elements nested inside tables (table extractor formats rows atomically)
            if (tag !== 'table' && $el.parents('table').length > 0) return;

            // 1. Directory Cards (e.g., Heads.php: .well with .briefProfile/.department_div or h4/h5 + p)
            if ($el.hasClass('well')) {
                const nameEl = $el.find('.briefProfile, h4, h5, h3').first();
                const deptEl = $el.find('.department_div').first();
                const fallbackDeptEl = deptEl.length ? deptEl : $el.find('p').filter((___, p) => normalizeWhitespace($(p).text()).length > 0).first();
                const name = normalizeWhitespace(nameEl.text());
                const deptName = normalizeWhitespace(fallbackDeptEl.text());
                const deptCode = normalizeWhitespace(deptEl.attr('id') || '');
                if (name && deptName && name !== deptName) {
                    const codePart = deptCode ? ` (${deptCode})` : '';
                    const roleLabel = /heads\.php/i.test(relativePath || sourceUrl || '') || /head of/i.test(currentHeading || '')
                        ? 'Head of Department (HoD)'
                        : (currentHeading || 'Role');
                    buffer.push(`- Department: ${deptName}${codePart} — ${roleLabel}: ${name}`);
                    markProcessed(el);
                    return;
                }
                return;
            }

            // 2. Leadership / Profile boxes (e.g., Dean-*, Secretary, VicePrincipal, Principal, Trustees)
            if ($el.hasClass('tg-shortcodetextbox')) {
                const lines = [];
                $el.find('h1, h2, h3, h4, h5, h6, p, span, a').each((__, child) => {
                    // Only take leaf text nodes or direct headings/paragraphs to avoid nesting duplicates
                    const $child = $(child);
                    if ($child.children('h1,h2,h3,h4,h5,h6,p').length > 0) return;
                    if (child.tagName?.toLowerCase() === 'a' && $child.find('span').length > 0) return;
                    const t = normalizeWhitespace($child.text());
                    if (t && !lines.includes(t)) lines.push(t);
                });
                const combined = lines.join(' — ') || normalizeWhitespace($el.text());
                if (combined) buffer.push(combined);
                markProcessed(el);
                return;
            }

            // 3. Historical / Tabbed bio panes (e.g., Principal / Managing Trustees past tenures)
            if ($el.hasClass('tab-pane')) {
                const text = normalizeWhitespace($el.text());
                if (text) buffer.push(text);
                markProcessed(el);
                return;
            }

            // Skip .well / headings containers that just wrap sub-blocks unless caught above
            if ($el.hasClass('well')) return;

            if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
                const headingText = normalizeWhitespace($el.text());
                if (headingText && headingText.length < 200) {
                    flushSection();
                    currentHeading = headingText;
                }
                return;
            }

            if (tag === 'table') {
                let colHeaders = [];
                let photoColIdx = -1;
                let tableHasDeptHeadings = false;

                $el.find('tr').each((__, tr) => {
                    const $tr = $(tr);
                    if ($tr.hasClass('department-heading')) {
                        tableHasDeptHeadings = true;
                        flushSection();
                        const deptHeading = normalizeWhitespace($tr.text());
                        if (deptHeading) {
                            currentHeading = deptHeading;
                            currentDepartment = deptHeading.replace(/^Department\s+of\s+/i, '').trim();
                        }
                        return;
                    }

                    if ($tr.hasClass('category-heading')) {
                        const catText = normalizeWhitespace($tr.text());
                        if (catText) buffer.push(`Category: ${catText}`);
                        return;
                    }

                    const ths = $tr.find('th');
                    if ($tr.hasClass('column-heading') || (ths.length > 1 && $tr.find('td').length === 0)) {
                        colHeaders = ths.map((___, th) => normalizeWhitespace($(th).text())).get();
                        photoColIdx = colHeaders.findIndex((h) => /^photo$/i.test(h));
                        return;
                    }

                    const rawCells = $tr.find('th, td').map((___, cell) => normalizeWhitespace($(cell).text())).get();
                    const filteredCells = rawCells.filter((_, idx) => idx !== photoColIdx).filter(Boolean);
                    if (filteredCells.length === 0) return;

                    // Format faculty rows cleanly when structured S.No / AU-FIN / AICTE / Name / Designation
                    const nameIdx = colHeaders.findIndex((h) => /faculty name/i.test(h));
                    const desigIdx = colHeaders.findIndex((h) => /designation/i.test(h));
                    if (nameIdx >= 0 && desigIdx >= 0 && rawCells[nameIdx]) {
                        const sno = rawCells[0] || '';
                        const name = rawCells[nameIdx];
                        const desig = rawCells[desigIdx] || '';
                        const extra = [];
                        if (rawCells[1] && rawCells[1] !== 'NA') extra.push(`AU-FIN: ${rawCells[1]}`);
                        if (rawCells[2] && rawCells[2] !== 'NA') extra.push(`AICTE: ${rawCells[2]}`);
                        const suffix = extra.length > 0 ? ` (${extra.join(', ')})` : '';
                        buffer.push(`${sno ? `${sno}. ` : ''}${name} — ${desig}${suffix}`);
                    } else {
                        buffer.push(filteredCells.join(' | '));
                    }
                });

                if (tableHasDeptHeadings) {
                    flushSection();
                    currentDepartment = null;
                }
                markProcessed(el);
                return;
            }

            const txt = normalizeWhitespace($el.text());
            if (txt) {
                buffer.push(tag === 'li' ? `- ${txt}` : txt);
            }
        });
    flushSection();

    // Fallback to raw mainRoot text if page uses non-standard divs instead of structured tags
    if (sections.length === 0) {
        const fallbackText = stripNewsTickerNoise(normalizeWhitespace(mainRoot.text()));
        if (fallbackText) {
            sections.push({ heading: title, department: null, text: fallbackText });
        }
    }

    const fullText = stripNewsTickerNoise(
        normalizeWhitespace(
            sections.map((s) => (s.heading && s.heading !== title ? `${s.heading}\n${s.text}` : s.text)).join('\n\n')
        )
    );

    if (
        rawPageTitle.includes('404') ||
        fullText.includes('404 Not Found') ||
        fullText.length < 40
    ) {
        return { skipped: true, reason: fullText.length < 40 ? 'insufficient-content' : '404-page' };
    }

    const resolvedUrl = sourceUrl || normalizeHtmlRoute(relativePath, urlPrefix);
    return {
        skipped: false,
        title,
        sourceUrl: resolvedUrl,
        sourceType: 'html',
        rawText: fullText,
        sections,
        warnings: []
    };
}

async function extractPdfDocument(bufferOrPath, { title = null, sourceUrl = '' } = {}) {
    const buffer = Buffer.isBuffer(bufferOrPath) ? bufferOrPath : fs.readFileSync(bufferOrPath);
    const pages = [];

    const options = {
        pagerender: async (pageData) => {
            const textContent = await pageData.getTextContent();
            let lastY = null;
            let text = '';
            for (const item of textContent.items) {
                if (lastY !== null && Math.abs(lastY - item.transform[5]) > 4) {
                    text += '\n';
                }
                text += item.str;
                lastY = item.transform[5];
            }
            const cleaned = normalizeWhitespace(text);
            pages.push({ pageNumber: pages.length + 1, text: cleaned });
            return text;
        }
    };

    let parsed;
    const origLog = console.log;
    console.log = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('Warning: TT: undefined function')) return;
        origLog(...args);
    };
    try {
        parsed = await pdfParse(buffer, options);
    } finally {
        console.log = origLog;
    }
    const warnings = [];
    const nonEmptyPages = pages.filter((p) => p.text.length >= 20);
    const scannedPages = pages.filter((p) => p.text.length < 20).map((p) => p.pageNumber);

    if (parsed.numpages > 0 && nonEmptyPages.length === 0) {
        warnings.push(`Scanned or image-only PDF detected (${parsed.numpages} pages with no extractable text). OCR required.`);
        return {
            skipped: true,
            reason: 'scanned-pdf-no-text',
            isScanned: true,
            numPages: parsed.numpages,
            warnings
        };
    }

    if (scannedPages.length > 0) {
        warnings.push(`Pages with minimal/no extractable text (possibly scanned): ${scannedPages.join(', ')}`);
    }

    const derivedTitle =
        title ||
        normalizeWhitespace(parsed.info?.Title || '') ||
        (sourceUrl ? path.basename(sourceUrl, path.extname(sourceUrl)) : 'PSG Tech PDF Document');

    const rawText = normalizeWhitespace(nonEmptyPages.map((p) => p.text).join('\n\n'));
    return {
        skipped: false,
        title: derivedTitle,
        sourceUrl,
        sourceType: 'pdf',
        numPages: parsed.numpages,
        pages: nonEmptyPages,
        rawText,
        warnings
    };
}

async function extractDocxDocument(bufferOrPath, { title = null, sourceUrl = '' } = {}) {
    const input = Buffer.isBuffer(bufferOrPath) ? { buffer: bufferOrPath } : { path: bufferOrPath };
    const result = await mammoth.extractRawText(input);
    const rawText = normalizeWhitespace(result.value);
    const warnings = (result.messages || []).map((m) => m.message);

    if (rawText.length < 40) {
        return { skipped: true, reason: 'insufficient-content', warnings };
    }

    return {
        skipped: false,
        title: title || (sourceUrl ? path.basename(sourceUrl, path.extname(sourceUrl)) : 'PSG Tech DOCX Document'),
        sourceUrl,
        sourceType: 'docx',
        rawText,
        sections: [{ heading: title || 'Document', text: rawText }],
        warnings
    };
}

function extractTxtDocument(bufferOrString, { title = null, sourceUrl = '' } = {}) {
    const raw = Buffer.isBuffer(bufferOrString) ? bufferOrString.toString('utf8') : String(bufferOrString || '');
    const rawText = normalizeWhitespace(raw);
    if (rawText.length < 40) {
        return { skipped: true, reason: 'insufficient-content', warnings: [] };
    }

    // Parse optional notice headers (Title:, Date:, Department:)
    const titleMatch = rawText.match(/^Title:\s*(.+)$/im);
    const dateMatch = rawText.match(/^Date:\s*(.+)$/im);
    const deptMatch = rawText.match(/^Department:\s*(.+)$/im);

    return {
        skipped: false,
        title: title || (titleMatch ? titleMatch[1].trim() : path.basename(sourceUrl || 'notice.txt', path.extname(sourceUrl || 'notice.txt'))),
        sourceUrl,
        sourceType: titleMatch || dateMatch ? 'notice' : 'txt',
        publishedAt: dateMatch ? dateMatch[1].trim() : null,
        department: deptMatch ? deptMatch[1].trim() : null,
        rawText,
        sections: [{ heading: title || 'Notice', text: rawText }],
        warnings: []
    };
}

async function fetchApprovedUrl(targetUrl, options = {}) {
    let parsed;
    try {
        parsed = new URL(targetUrl);
    } catch (_e) {
        throw new Error('Invalid URL provided.');
    }

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        throw new Error(`Unsupported URL protocol: ${parsed.protocol}`);
    }

    const allowedHosts = new Set(options.allowedHosts || config.security.allowedFetchHosts);
    if (!allowedHosts.has(parsed.hostname.toLowerCase())) {
        throw new Error(`Host '${parsed.hostname}' is not in the approved institutional URL allowlist.`);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs || 10000);
    try {
        const res = await fetch(parsed.toString(), {
            signal: controller.signal,
            headers: { 'User-Agent': 'PSG-NEXUS-Indexer/1.0' }
        });
        if (!res.ok) {
            throw new Error(`HTTP ${res.status} fetching ${parsed.toString()}`);
        }
        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        const arrayBuf = await res.arrayBuffer();
        const maxBytes = options.maxBytes || 10 * 1024 * 1024;
        if (arrayBuf.byteLength > maxBytes) {
            throw new Error(`Fetched resource exceeds max allowed size (${maxBytes} bytes).`);
        }
        const buf = Buffer.from(arrayBuf);
        if (contentType.includes('application/pdf') || parsed.pathname.toLowerCase().endsWith('.pdf')) {
            return extractPdfDocument(buf, { sourceUrl: parsed.toString(), title: options.title });
        }
        if (contentType.includes('text/plain') || parsed.pathname.toLowerCase().endsWith('.txt')) {
            return extractTxtDocument(buf, { sourceUrl: parsed.toString(), title: options.title });
        }
        return extractHtmlDocument(buf.toString('utf8'), { sourceUrl: parsed.toString() });
    } finally {
        clearTimeout(timer);
    }
}

module.exports = {
    isAssetWrapperHtml,
    normalizeHtmlRoute,
    normalizeWhitespace,
    stripNewsTickerNoise,
    extractHtmlDocument,
    extractPdfDocument,
    extractDocxDocument,
    extractTxtDocument,
    fetchApprovedUrl
};
