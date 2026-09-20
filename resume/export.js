#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { exec, execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildDocxBuffer } from './docx-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function printHelp() {
  console.log(`
🎓 Markdown to Harvard Resume Builder (Zero-Dependency)

Usage:
  node export.js [options]

Options:
  -i, --input <file>    Path to Markdown resume (default: resume.md or resume.example.md)
  -o, --out <dir>       Output directory for generated files (default: dist/ and working directory)
  -n, --name <name>     Base name for outputs (default: extracted from # Name in markdown)
  -p, --pages <1|2>     Page layout mode: 1 (compact 1-page fit, default) or 2 (relaxed)
  --preview             Open compiled HTML preview in default browser
  -h, --help            Show this help message

Examples:
  node export.js
  node export.js --input=resume.example.md --pages=1
  node export.js --input=resume.md --out=./output --name=My_Resume
  node export.js --preview
`);
}

function parseCliArgs(argv) {
  const args = {
    input: null,
    out: null,
    name: null,
    pages: 1,
    preview: false,
    help: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '-h' || arg === '--help') {
      args.help = true;
    } else if (arg === '--preview') {
      args.preview = true;
    } else if (arg === '-p' || arg === '--pages') {
      args.pages = parseInt(argv[++i], 10) || 1;
    } else if (arg.startsWith('--pages=')) {
      args.pages = parseInt(arg.split('=')[1], 10) || 1;
    } else if (arg === '-i' || arg === '--input') {
      args.input = argv[++i];
    } else if (arg.startsWith('--input=')) {
      args.input = arg.split('=')[1];
    } else if (arg === '-o' || arg === '--out') {
      args.out = argv[++i];
    } else if (arg.startsWith('--out=')) {
      args.out = arg.split('=')[1];
    } else if (arg === '-n' || arg === '--name') {
      args.name = argv[++i];
    } else if (arg.startsWith('--name=')) {
      args.name = arg.split('=')[1];
    }
  }

  return args;
}

function resolveInputPath(customInput) {
  if (customInput) {
    const resolved = path.isAbsolute(customInput) ? customInput : path.resolve(process.cwd(), customInput);
    if (fs.existsSync(resolved)) return resolved;
    console.error(`Error: Specified input file not found: ${customInput}`);
    process.exit(1);
  }

  const defaultPaths = [
    path.join(__dirname, 'resume.md'),
    path.join(process.cwd(), 'resume.md'),
    path.join(__dirname, 'resume.example.md'),
    path.join(process.cwd(), 'resume.example.md')
  ];

  for (const p of defaultPaths) {
    if (fs.existsSync(p)) return p;
  }

  console.error('Error: No resume.md or resume.example.md found.');
  process.exit(1);
}

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

function extractCandidateName(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1].trim();
  }
  return 'Resume';
}

function markdownToHarvardHtml(md, options = {}) {
  const isOnePage = options.pages !== 2;
  const candidateName = extractCandidateName(md);
  const title = `${candidateName} - Resume`;

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
    if (rawLine.includes('|') && (rawLine.includes('@') || rawLine.includes('linkedin.com') || rawLine.includes('github.io'))) {
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

  const pageMargin = isOnePage ? '0.36in 0.48in' : '0.55in 0.6in';
  const bodyFontSize = isOnePage ? '9.35pt' : '10pt';
  const bodyLineHeight = isOnePage ? '1.21' : '1.35';
  const sectionMarginTop = isOnePage ? '7px' : '10px';
  const sectionMarginBottom = isOnePage ? '3px' : '4px';
  const sectionFontSize = isOnePage ? '10.4pt' : '11pt';
  const contactMarginBottom = isOnePage ? '7px' : '10px';
  const splitLineFontSize = isOnePage ? '9.35pt' : '10pt';
  const liMarginBottom = isOnePage ? '1.5px' : '2.5px';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: letter portrait;
      margin: ${pageMargin};
    }
    *, *:before, *:after {
      box-sizing: border-box;
    }
    body {
      font-family: "Times New Roman", Times, Georgia, serif;
      font-size: ${bodyFontSize};
      line-height: ${bodyLineHeight};
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
      margin-bottom: ${contactMarginBottom};
      color: #222222;
      letter-spacing: 0.2px;
    }
    .section-title {
      font-size: ${sectionFontSize};
      font-weight: 700;
      text-transform: uppercase;
      border-bottom: 1.1px solid #000000;
      padding-bottom: 1.5px;
      margin-top: ${sectionMarginTop};
      margin-bottom: ${sectionMarginBottom};
      letter-spacing: 0.35px;
      color: #000000;
    }
    .split-line {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-top: 2.5px;
      margin-bottom: 1.5px;
      font-size: ${splitLineFontSize};
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
      margin-bottom: ${liMarginBottom};
      line-height: ${bodyLineHeight};
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
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
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
      console.warn('⚠️  Headless browser (Chrome/Edge/Chromium) not found. Skipping PDF generation.');
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

function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

function sanitizeBaseName(name) {
  return toTitleCase(name.trim()).replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
}

async function buildResume(cliOptions) {
  const inputPath = resolveInputPath(cliOptions.input);
  const mdContent = fs.readFileSync(inputPath, 'utf8');

  const candidateName = extractCandidateName(mdContent);
  const baseName = cliOptions.name || (candidateName ? `${sanitizeBaseName(candidateName)}_Resume` : path.basename(inputPath, '.md'));

  // Output directories:
  const inputDir = path.dirname(inputPath);
  const targetDir = cliOptions.out ? (path.isAbsolute(cliOptions.out) ? cliOptions.out : path.resolve(process.cwd(), cliOptions.out)) : inputDir;
  const distDir = cliOptions.out ? targetDir : path.join(targetDir, 'dist');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const modeLabel = cliOptions.pages === 2 ? '2-Page Relaxed' : '1-Page Harvard Fit';
  console.log(`\nBuilding ${modeLabel} Resume for "${candidateName}"...`);
  console.log(`  Source: ${inputPath}\n`);

  // 1. Generate Harvard HTML
  const html = markdownToHarvardHtml(mdContent, { pages: cliOptions.pages });
  const distHtmlPath = path.join(distDir, `${baseName}.html`);
  fs.writeFileSync(distHtmlPath, html, 'utf8');
  console.log(`✓ HTML:  ${distHtmlPath}`);

  // 2. Generate OpenXML DOCX
  const distDocxPath = path.join(distDir, `${baseName}.docx`);
  const rootDocxPath = path.join(targetDir, `${baseName}.docx`);
  const docxBuffer = buildDocxBuffer(mdContent, { pages: cliOptions.pages });
  fs.writeFileSync(distDocxPath, docxBuffer);
  fs.writeFileSync(rootDocxPath, docxBuffer);
  console.log(`✓ DOCX:  ${rootDocxPath}`);

  // 3. Generate PDF
  const distPdfPath = path.join(distDir, `${baseName}.pdf`);
  const rootPdfPath = path.join(targetDir, `${baseName}.pdf`);
  const pdfSuccess = await generatePdf(distHtmlPath, distPdfPath);
  if (pdfSuccess && fs.existsSync(distPdfPath)) {
    fs.copyFileSync(distPdfPath, rootPdfPath);
    console.log(`✓ PDF:   ${rootPdfPath}`);
  }

  console.log('\n================================================================');
  console.log(`🎓 RESUME BUILD COMPLETE (${modeLabel.toUpperCase()})!`);
  console.log('================================================================');
  console.log(`  📄 Word Doc:  ${rootDocxPath}`);
  console.log(`  📕 PDF File:  ${rootPdfPath}`);
  console.log(`  🌐 HTML View: ${distHtmlPath}`);
  console.log('================================================================\n');

  return { distHtmlPath, rootDocxPath, rootPdfPath };
}

async function main() {
  const cliOptions = parseCliArgs(process.argv.slice(2));

  if (cliOptions.help) {
    printHelp();
    process.exit(0);
  }

  const { distHtmlPath } = await buildResume(cliOptions);

  if (cliOptions.preview) {
    console.log('Opening resume preview in browser...');
    openBrowser(distHtmlPath);
  }
}

main();
