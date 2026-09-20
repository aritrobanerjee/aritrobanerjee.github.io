# 🎓 Markdown to Harvard Resume Builder

> **Zero-dependency Node.js engine** that compiles a single Markdown file into a strict **1-Page Harvard Format** Word document (`.docx`) and PDF (`.pdf`) in under 1.5 seconds.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20(Pure%20Node.js)-brightgreen.svg)](./package.json)
[![Node Version](https://img.shields.io/badge/Node.js-%3E%3D%2018.0.0-green.svg)](https://nodejs.org)
[![Format](https://img.shields.io/badge/Format-Harvard%201--Page%20ATS-red.svg)](#features)

---

## Why This Exists

Most developers and professionals maintain resumes in LaTeX, Google Docs, or SaaS editors. Each approach has major drawbacks:

| Feature | LaTeX / Overleaf | Puppeteer / HTML-PDF | SaaS Resume Builders | **This Project** |
| :--- | :--- | :--- | :--- | :--- |
| **Dependencies** | ~2 GB TeX Live distribution | ~300 MB Chromium binary | Web app subscription | **0 MB (Pure Node.js built-ins)** |
| **Word / Google Docs Export** | ❌ Broken / impossible | ❌ PDF only | ⚠️ Paywalled / messy | ✅ **Native OpenXML `.docx`** |
| **Build Time** | 5 – 15 seconds | 4 – 8 seconds | Manual web UI | **< 1.5 seconds** |
| **ATS Scannability** | ⚠️ Can drop glyphs / ligatures | ⚠️ Inconsistent OCR | ⚠️ Non-standard divs | ✅ **100% Plain Text & Standard XML** |
| **Version Control** | ✅ `.tex` | ✅ `.html` / `.md` | ❌ Proprietary database | ✅ **Pure Markdown (`resume.md`)** |
| **1-Page Calibration** | ⚠️ Complex geometry hacking | ⚠️ Page break overflow | ⚠️ Manual drag-and-drop | ✅ **Built-in Harvard 1-page budget** |

---

## Key Features

- **Zero NPM Dependencies:** Runs entirely on native Node.js built-in modules (`node:fs`, `node:path`, `node:zlib`, `node:child_process`). No `node_modules` installation, vulnerability alerts, or version drift.
- **Genuine OpenXML `.docx` Generation:** Builds standard Microsoft WordprocessingML from scratch with a custom in-memory PKZip engine. Open directly in Microsoft Word or drag into **Google Drive / Google Docs** with full formatting, right tab-stops, and styles preserved.
- **System Browser Headless PDF:** Automatically detects your local Google Chrome, Microsoft Edge, or Chromium installation to print pixel-perfect PDFs with no heavy Puppeteer download.
- **Harvard Typography Standard:** Strict Times New Roman layout, 0.36in top/bottom and 0.48in left/right margins, 10.4pt section headers with bottom borders, and flush-right date alignment.
- **GitHub Actions CI Ready:** Includes an automated workflow that compiles Word and PDF exports on every push and attaches them as download artifacts.

---

## Directory Structure

```text
resume/
├── resume.md                  # Your personal resume (single source of truth)
├── resume.example.md          # Neutral sample template (Alex Morgan)
├── export.js                  # Unified CLI builder engine
├── docx-generator.js          # Native OpenXML builder & PKZip compressor
├── Aritro_Banerjee_Resume.docx # Compiled Word export (Google Docs ready)
├── Aritro_Banerjee_Resume.pdf  # Compiled 1-page Harvard format PDF
├── package.json               # Standalone package metadata & npm scripts
├── LICENSE                    # Permissive MIT License
├── README.md                  # Documentation & syntax guide
└── dist/                      # Temporary build artifacts (ignored by git)
```

---

## Quick Start (30 Seconds)

### 1. Prerequisites
- **Node.js** >= 18.0.0
- Any Chromium-based browser (Google Chrome, Microsoft Edge, or Brave)

### 2. Run the Build
```bash
# Build default resume (resume.md or resume.example.md)
node resume/export.js

# Build and immediately preview the HTML in your browser
node resume/export.js --preview
```

*(If running inside this directory or as a standalone repo, you can also run `npm start` or `npm run build`).*

---

## CLI Options Reference

```text
Usage:
  node export.js [options]

Options:
  -i, --input <file>    Path to Markdown resume (default: resume.md or resume.example.md)
  -o, --out <dir>       Output directory for generated files (default: current directory & dist/)
  -n, --name <name>     Base name for outputs (default: extracted from # Name in markdown)
  -p, --pages <1|2>     Page layout mode: 1 (compact 1-page fit, default) or 2 (relaxed)
  --preview             Open compiled HTML preview in default browser
  -h, --help            Show help message
```

### Examples

```bash
# Build with the included neutral sample template
node resume/export.js --input=resume/resume.example.md --out=resume/dist/sample

# Custom output file name
node resume/export.js --input=resume/resume.md --name=My_Custom_Resume

# 2-Page mode with relaxed margins and line spacing
node resume/export.js --input=resume/resume.md --pages=2
```

---

## Markdown Syntax Guide

The parser follows standard Markdown formatting with intuitive conventions for resume sections:

```markdown
# FIRSTNAME LASTNAME

City, ST Zip | email@example.com | +1-555-0100 | [linkedin.com/in/handle](https://linkedin.com) | [portfolio.dev](https://portfolio.dev)

## EXPERIENCE

**Company Name**, City, ST
*Job Title* | Month Year – Present
* Action-oriented bullet point with quantified impact metrics and outcomes.
* Spearheaded technical architecture using [tool/technology], reducing latency by 35%.

## EDUCATION

**University Name**, City, ST | Graduation Year
*Degree Name (Major / Concentration) · GPA 3.90 / 4.00*
* Leadership: Club President, Teaching Assistant

## TECHNICAL SKILLS & CERTIFICATIONS

* **Category 1**: Skill A, Skill B, Skill C, Skill D
* **Category 2**: Tool X, Tool Y, Certification Z
```

### Key Formatting Rules:
- `# Name`: Top-level candidate name (rendered in 16pt bold uppercase).
- `Line with | and @`: Automatically formatted as the centered contact header.
- `## SECTION`: Section header (10.4pt bold uppercase with 1px underline).
- `Left | Right`: Splitting a line with `|` will automatically push the right side flush against the right margin (ideal for dates and locations).
- `* Bullet`: Bulleted list item with hanging indentation.
- `**Bold**` and `*Italic*`: Standard bold and italic text.
- `[Text](URL)`: Clickable hyperlinks.

---

## Uploading to Google Drive & Google Docs

1. Go to [Google Drive](https://drive.google.com).
2. Drag and drop the generated `.docx` file (e.g. `Aritro_Banerjee_Resume.docx`) into Google Drive.
3. Double-click the file and select **"Open with Google Docs"**.
4. The document opens in native Google Docs editing mode with exact margins, tab-stops, bullet indentations, and fonts preserved.

---

## Automated CI with GitHub Actions

A ready-to-use GitHub Actions workflow is located at [`.github/workflows/build-resume.yml`](../.github/workflows/build-resume.yml).

Whenever you push changes to `resume/**`, the workflow will:
1. Spin up an Ubuntu runner with Node.js 20 and headless Chromium.
2. Compile both `.docx` and `.pdf` files.
3. Attach them as downloadable build artifacts under the GitHub Actions run summary.

---

## Standalone Repository Setup

If you want to spin this off as its own independent GitHub repository:

```bash
# 1. Copy the resume directory into a new folder
cp -r resume/ my-resume/

# 2. Initialize a new git repository
cd my-resume
git init
git add .
git commit -m "feat: initial commit of markdown harvard resume builder"

# 3. Test and build
node export.js
```

---

## License

This project is open source and available under the [MIT License](./LICENSE). Feel free to fork, adapt, and use it for your personal or professional applications!
