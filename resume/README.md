# Resume System (.md ➔ .docx / .pdf ➔ Google Drive)

This directory contains the single source of truth for your resume in Markdown, with a one-command build pipeline that outputs both **Word (`.docx`)** and **PDF (`.pdf`)** files formatted for easy upload or import into Google Drive and Google Docs.

---

## Directory Structure

```text
resume/
├── resume.md                     # Single source of truth (edit this to update your resume)
├── export.js                     # Unified build engine (zero dependencies)
├── docx-generator.js             # Native OpenXML Word (.docx) builder
├── Aritro_Banerjee_Resume.docx   # Ready-to-upload Word document
├── Aritro_Banerjee_Resume.pdf    # Pixel-perfect 2-page PDF
├── README.md                     # This documentation
└── dist/                         # Build artifacts (HTML, DOCX, PDF, MD)
```

---

## Quick Start: One-Command Build

Whenever you edit [`resume.md`](./resume.md), simply run:

```bash
npm run resume:build
```

This immediately compiles:
- 📄 [`Aritro_Banerjee_Resume.docx`](./Aritro_Banerjee_Resume.docx): Genuine OpenXML Word Document ready to open in MS Word or drag straight into Google Drive (where it opens as a native Google Doc).
- 📕 [`Aritro_Banerjee_Resume.pdf`](./Aritro_Banerjee_Resume.pdf): Formatted 2-page PDF with executive typography and 0.45-inch margins.
- 🌐 `resume/dist/resume.html`: Printable HTML preview.

To build and automatically launch the browser preview:
```bash
npm run resume:preview
```

---

## Uploading to Google Drive / Google Docs

1. Go to your [Google Drive](https://drive.google.com).
2. Drag and drop [`Aritro_Banerjee_Resume.docx`](./Aritro_Banerjee_Resume.docx) into any folder in Google Drive.
3. Double-click the uploaded file, then click **"Open with Google Docs"**.
4. All formatting, bullet points, headers, and hyperlinks are preserved seamlessly!
