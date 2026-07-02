import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

const data = new Uint8Array(fs.readFileSync('./public/proposal.pdf'));
const doc = await getDocument({ data, useSystemFonts: true }).promise;

const pages = [];
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const tc = await page.getTextContent();
  const text = tc.items.map(x => x.str).join(' ').replace(/\s+/g, ' ').trim();
  pages.push(text);
}
fs.writeFileSync('./lib/pageText.json', JSON.stringify(pages));
console.log('Wrote', pages.length, 'pages of text');
