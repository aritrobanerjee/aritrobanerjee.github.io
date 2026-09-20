import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createZip(files) {
  const fileRecords = [];
  let offset = 0;
  const parts = [];

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8');
    const dataBuf = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, 'utf8');
    const compressedData = zlib.deflateRawSync(dataBuf);
    const crc = zlib.crc32(dataBuf);

    const lfh = Buffer.alloc(30);
    lfh.writeUInt32LE(0x04034b50, 0);
    lfh.writeUInt16LE(20, 4);
    lfh.writeUInt16LE(0, 6);
    lfh.writeUInt16LE(8, 8);
    lfh.writeUInt16LE(0, 10);
    lfh.writeUInt16LE(0, 12);
    lfh.writeUInt32LE(crc, 14);
    lfh.writeUInt32LE(compressedData.length, 18);
    lfh.writeUInt32LE(dataBuf.length, 22);
    lfh.writeUInt16LE(nameBuf.length, 26);
    lfh.writeUInt16LE(0, 28);

    fileRecords.push({
      nameBuf,
      crc,
      compSize: compressedData.length,
      uncompSize: dataBuf.length,
      offset
    });

    parts.push(lfh, nameBuf, compressedData);
    offset += lfh.length + nameBuf.length + compressedData.length;
  }

  const cdStartOffset = offset;
  let cdSize = 0;

  for (const rec of fileRecords) {
    const cdh = Buffer.alloc(46);
    cdh.writeUInt32LE(0x02014b50, 0);
    cdh.writeUInt16LE(20, 4);
    cdh.writeUInt16LE(20, 6);
    cdh.writeUInt16LE(0, 8);
    cdh.writeUInt16LE(8, 10);
    cdh.writeUInt16LE(0, 12);
    cdh.writeUInt16LE(0, 14);
    cdh.writeUInt32LE(rec.crc, 16);
    cdh.writeUInt32LE(rec.compSize, 20);
    cdh.writeUInt32LE(rec.uncompSize, 24);
    cdh.writeUInt16LE(rec.nameBuf.length, 28);
    cdh.writeUInt16LE(0, 30);
    cdh.writeUInt16LE(0, 32);
    cdh.writeUInt16LE(0, 34);
    cdh.writeUInt16LE(0, 36);
    cdh.writeUInt32LE(0, 38);
    cdh.writeUInt32LE(rec.offset, 42);

    parts.push(cdh, rec.nameBuf);
    cdSize += cdh.length + rec.nameBuf.length;
  }

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(fileRecords.length, 8);
  eocd.writeUInt16LE(fileRecords.length, 10);
  eocd.writeUInt32LE(cdSize, 12);
  eocd.writeUInt32LE(cdStartOffset, 16);
  eocd.writeUInt16LE(0, 20);

  parts.push(eocd);
  return Buffer.concat(parts);
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function parseRunsXml(text, defaultSz = 20) {
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match;
  let runsXml = '';

  const addTextRun = (content, isBold = false, isItalic = false) => {
    if (!content) return;
    const bTag = isBold ? '<w:b/>' : '';
    const iTag = isItalic ? '<w:i/>' : '';
    runsXml += `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="${defaultSz}"/><w:szCs w:val="${defaultSz}"/>${bTag}${iTag}</w:rPr><w:t xml:space="preserve">${escapeXml(content)}</w:t></w:r>`;
  };

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      addTextRun(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      addTextRun(token.slice(2, -2), true, false);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      addTextRun(token.slice(1, -1), false, true);
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/\[([^\]]+)\]\([^)]+\)/);
      if (linkMatch) {
        addTextRun(linkMatch[1], false, false);
      }
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    addTextRun(text.substring(lastIndex));
  }

  return runsXml;
}

function isDateOrRightSide(str) {
  const s = str.trim();
  if (/^GPA\s+[\d\.\/]+/i.test(s)) return true;
  if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})/i.test(s)) return true;
  if (/(\b\d{4}\b|\bPresent\b)/i.test(s)) return true;
  return false;
}

export function markdownToDocxBody(markdown) {
  const lines = markdown.split('\n');
  let bodyXml = '';
  // 12240 width - 2 * 720 margin = 10800 twips (7.5 in)
  const rightTabPos = 10800;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    if (rawLine === '---' || rawLine === '***' || rawLine === '___') {
      continue;
    }

    // Name (Header 1)
    if (rawLine.startsWith('# ')) {
      const title = rawLine.substring(2).trim();
      bodyXml += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="40" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:sz w:val="32"/><w:szCs w:val="32"/><w:color w:val="000000"/></w:rPr><w:t>${escapeXml(title)}</w:t></w:r></w:p>`;
      continue;
    }

    // Contact line
    if (rawLine.includes('|') && (rawLine.includes('@') || rawLine.includes('linkedin.com') || rawLine.includes('github.io'))) {
      bodyXml += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="160" w:line="240" w:lineRule="auto"/></w:pPr>${parseRunsXml(rawLine, 19)}</w:p>`;
      continue;
    }

    // Section Headings (## EXPERIENCE, ## EDUCATION, etc.)
    if (rawLine.startsWith('## ')) {
      const section = rawLine.substring(3).trim().toUpperCase();
      bodyXml += `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="10" w:space="2" w:color="000000"/></w:pBdr><w:spacing w:before="180" w:after="50" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:sz w:val="22"/><w:szCs w:val="22"/><w:color w:val="000000"/></w:rPr><w:t>${escapeXml(section)}</w:t></w:r></w:p>`;
      continue;
    }

    // Bullet points (* or -)
    if (rawLine.startsWith('* ') || rawLine.startsWith('- ')) {
      const bulletText = rawLine.substring(2).trim();
      bodyXml += `<w:p><w:pPr><w:ind w:left="400" w:hanging="200"/><w:spacing w:before="20" w:after="30" w:line="235" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">• </w:t></w:r>${parseRunsXml(bulletText, 20)}</w:p>`;
      continue;
    }

    // Line with split (Left | Right)
    if (rawLine.includes('|')) {
      const pipeParts = rawLine.split('|').map(s => s.trim());
      if (pipeParts.length === 2 && (isDateOrRightSide(pipeParts[1]) || pipeParts[0].includes('**') || pipeParts[0].includes('*'))) {
        const leftSide = pipeParts[0];
        const rightSide = pipeParts[1];

        bodyXml += `<w:p><w:pPr><w:tabs><w:tab w:val="right" w:leader="none" w:pos="${rightTabPos}"/></w:tabs><w:spacing w:before="60" w:after="25" w:line="240" w:lineRule="auto"/></w:pPr>${parseRunsXml(leftSide, 20)}<w:r><w:tab/></w:r>${parseRunsXml(rightSide, 20)}</w:p>`;
        continue;
      }
    }

    bodyXml += `<w:p><w:pPr><w:spacing w:before="40" w:after="20" w:line="240" w:lineRule="auto"/></w:pPr>${parseRunsXml(rawLine, 20)}</w:p>`;
  }

  return bodyXml;
}

export function buildDocxBuffer(markdown) {
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:sz w:val="20"/>
        <w:szCs w:val="20"/>
        <w:color w:val="000000"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:line="240" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
</w:styles>`;

  const bodyXml = markdownToDocxBody(markdown);

  // 0.5 in margins = 720 twips
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="360" w:footer="360" w:gutter="0"/>
      <w:cols w:space="720"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  return createZip([
    { name: '[Content_Types].xml', data: contentTypesXml },
    { name: '_rels/.rels', data: rootRelsXml },
    { name: 'word/_rels/document.xml.rels', data: docRelsXml },
    { name: 'word/styles.xml', data: stylesXml },
    { name: 'word/document.xml', data: documentXml }
  ]);
}
