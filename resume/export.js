import fs from 'node:fs';
import path from 'node:path';
import { exec, execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildDocxBuffer } from './docx-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESUME_MD_PATH = path.join(__dirname, 'resume.md');
const DIST_DIR = path.join(__dirname, 'dist');

const ROOT_DOCX = path.join(__dirname, 'Aritro_Banerjee_Resume.docx');
const ROOT_PDF = path.join(__dirname, 'Aritro_Banerjee_Resume.pdf');

function openBrowser(url) {
  const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd /c start ""' : 'xdg-open';
  exec(`${start} "${url}"`, () => {});
}

function formatInline(str) {
  return str
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function isDateOrRightSide(str) {
  const s = str.trim();
  if (/^GPA\s+[\d\.\/]+/i.test(s)) return true;
  if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})/i.test(s)) return true;
  if (/(\b\d{4}\b|\bPresent\b)/i.test(s)) return true;
  return false;
}

function markdownToHarvardHtml(md, title = 'Aritro Banerjee - Resume') {
  const lines = md.split('\n');
  let bodyHtml = '';
  let inList = false;

  const closeList = () => {
    if (inList) {
      bodyHtml += '</ul>\n';
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();

    if (!rawLine || rawLine === '---' || rawLine === '***' || rawLine === '___') {
      closeList();
      continue;
    }

    // Name (Header 1)
    if (rawLine.startsWith('# ')) {
      closeList();
      const name = rawLine.substring(2).trim();
      bodyHtml += `<div class="name-header">${formatInline(name)}</div>\n`;
      continue;
    }

    // Contact line
    if (rawLine.includes('aritrobanerjee@gmail.com') || (rawLine.includes('|') && (rawLine.includes('@') || rawLine.includes('linkedin.com')))) {
      closeList();
      bodyHtml += `<div class="contact-line">${formatInline(rawLine)}</div>\n`;
      continue;
    }

    // Section Headers (## EXPERIENCE, ## EDUCATION, etc.)
    if (rawLine.startsWith('## ')) {
      closeList();
      const section = rawLine.substring(3).trim().toUpperCase();
      bodyHtml += `<div class="section-title">${formatInline(section)}</div>\n`;
      continue;
    }

    // Sub-headers (### Company)
    if (rawLine.startsWith('### ')) {
      closeList();
      const sub = rawLine.substring(4).trim();
      bodyHtml += `<div class="company-line">${formatInline(sub)}</div>\n`;
      continue;
    }

    // Bullet points (* or -)
    if (rawLine.startsWith('* ') || rawLine.startsWith('- ')) {
      if (!inList) {
        bodyHtml += '<ul>\n';
        inList = true;
      }
      const itemText = rawLine.substring(2).trim();
      bodyHtml += `  <li>${formatInline(itemText)}</li>\n`;
      continue;
    }

    // Split rows (Left | Right) -> Harvard flush-right date alignment
    if (rawLine.includes('|')) {
      const parts = rawLine.split('|').map(s => s.trim());
      if (parts.length === 2 && (isDateOrRightSide(parts[1]) || parts[0].includes('**') || parts[0].includes('*'))) {
        closeList();
        bodyHtml += `<div class="split-line">
  <span class="left">${formatInline(parts[0])}</span>
  <span class="right">${formatInline(parts[1])}</span>
</div>\n`;
        continue;
      }
    }

    // General paragraph
    closeList();
    bodyHtml += `<div class="entry-line">${formatInline(rawLine)}</div>\n`;
  }

  closeList();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: letter portrait;
      margin: 0.36in 0.48in;
    }
    *, *:before, *:after {
      box-sizing: border-box;
    }
    body {
      font-family: "Times New Roman", Times, Georgia, serif;
      font-size: 9.35pt;
      line-height: 1.21;
      color: #111111;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .name-header {
      font-size: 16pt;
      font-weight: 700;
      text-transform: uppercase;
      text-align: center;
      letter-spacing: 0.75px;
      margin-bottom: 2px;
      color: #000000;
    }
    .contact-line {
      font-size: 8.9pt;
      text-align: center;
      margin-bottom: 7px;
      color: #222222;
      letter-spacing: 0.2px;
    }
    .section-title {
      font-size: 10.4pt;
      font-weight: 700;
      text-transform: uppercase;
      border-bottom: 1.1px solid #000000;
      padding-bottom: 1.5px;
      margin-top: 7px;
      margin-bottom: 3px;
      letter-spacing: 0.35px;
      color: #000000;
    }
    .split-line {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-top: 2.5px;
      margin-bottom: 1.5px;
      font-size: 9.35pt;
    }
    .split-line .left {
      text-align: left;
    }
    .split-line .right {
      text-align: right;
      white-space: nowrap;
      padding-left: 10px;
      font-weight: 400;
      color: #111111;
    }
    .company-line, .entry-line {
      margin-top: 2px;
      margin-bottom: 1px;
    }
    ul {
      margin: 1.5px 0 3px 0;
      padding-left: 17px;
    }
    li {
      margin-bottom: 1.5px;
      line-height: 1.21;
      text-align: left;
    }
    a {
      color: #111111;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    strong {
      font-weight: 700;
      color: #000000;
    }
    em {
      font-style: italic;
    }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function findBrowserPath() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function generatePdf(htmlPath, outputPath) {
  return new Promise((resolve) => {
    const browserPath = findBrowserPath();
    if (!browserPath) {
      console.warn('⚠️  Browser not found for headless PDF generation.');
      return resolve(false);
    }

    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--print-to-pdf=${outputPath}`,
      htmlPath
    ];

    execFile(browserPath, args, (err) => {
      if (err) {
        console.warn(`⚠️  PDF generation warning: ${err.message}`);
        return resolve(false);
      }
      resolve(true);
    });
  });
}

async function buildAll() {
  if (!fs.existsSync(RESUME_MD_PATH)) {
    console.error(`Error: resume.md not found at ${RESUME_MD_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  const mdContent = fs.readFileSync(RESUME_MD_PATH, 'utf8');

  console.log('Generating 1-Page Harvard Format Resume (.docx & .pdf)...\n');

  // 1. Generate Harvard HTML
  const html = markdownToHarvardHtml(mdContent);
  const distHtmlPath = path.join(DIST_DIR, 'resume.html');
  fs.writeFileSync(distHtmlPath, html, 'utf8');
  console.log(`✓ HTML:  ${distHtmlPath}`);

  // 2. Generate Harvard OpenXML DOCX
  const distDocxPath = path.join(DIST_DIR, 'resume.docx');
  const docxBuffer = buildDocxBuffer(mdContent);
  fs.writeFileSync(distDocxPath, docxBuffer);
  fs.writeFileSync(ROOT_DOCX, docxBuffer);
  console.log(`✓ DOCX:  ${ROOT_DOCX}`);

  // 3. Generate Harvard PDF
  const distPdfPath = path.join(DIST_DIR, 'resume.pdf');
  const pdfSuccess = await generatePdf(distHtmlPath, distPdfPath);
  if (pdfSuccess && fs.existsSync(distPdfPath)) {
    fs.copyFileSync(distPdfPath, ROOT_PDF);
    console.log(`✓ PDF:   ${ROOT_PDF}`);
  }

  console.log('\n================================================================');
  console.log('🎓 HARVARD 1-PAGE RESUME BUILD COMPLETE!');
  console.log('================================================================');
  console.log(`  📄 Word Doc:  ${ROOT_DOCX}`);
  console.log(`  📕 PDF File:  ${ROOT_PDF}`);
  console.log(`  🌐 HTML View: ${distHtmlPath}`);
  console.log('================================================================\n');

  return { distHtmlPath, rootDocx: ROOT_DOCX, rootPdf: ROOT_PDF };
}

async function main() {
  const args = process.argv.slice(2);
  const isPreview = args.includes('--preview');

  const { distHtmlPath } = await buildAll();

  if (isPreview) {
    console.log('Opening resume in browser...');
    openBrowser(distHtmlPath);
  }
}

main();
