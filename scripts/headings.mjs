import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

const data = new Uint8Array(fs.readFileSync('./public/proposal.pdf'));
const doc = await getDocument({ data, useSystemFonts: true }).promise;

const out = [];
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const tc = await page.getTextContent();
  // find max font size on page
  let maxH = 0;
  for (const it of tc.items) {
    if (!it.str.trim()) continue;
    const h = Math.abs(it.transform[3]);
    if (h > maxH) maxH = h;
  }
  // collect items within 85% of max size, in reading order
  const picks = tc.items
    .filter(it => it.str.trim() && Math.abs(it.transform[3]) >= maxH * 0.85)
    .map(it => ({ str: it.str.trim(), y: it.transform[5], x: it.transform[4] }));
  picks.sort((a, b) => b.y - a.y || a.x - b.x);
  const title = picks.map(p => p.str).join(' ').replace(/\s+/g, ' ').slice(0, 90);
  out.push({ page: i, title, size: Math.round(maxH) });
  console.log(`p${i} [${Math.round(maxH)}]: ${title}`);
}
fs.writeFileSync('./scripts/headings.json', JSON.stringify(out, null, 2));
