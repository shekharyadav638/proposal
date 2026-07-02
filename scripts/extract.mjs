import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

const data = new Uint8Array(fs.readFileSync('./public/proposal.pdf'));
const doc = await getDocument({ data, useSystemFonts: true }).promise;

console.log('PAGES:', doc.numPages);

const outline = await doc.getOutline();
if (outline && outline.length) {
  console.log('OUTLINE:');
  async function walk(items, depth) {
    for (const it of items) {
      let pageNum = null;
      try {
        let dest = it.dest;
        if (typeof dest === 'string') dest = await doc.getDestination(dest);
        if (Array.isArray(dest) && dest[0]) {
          pageNum = (await doc.getPageIndex(dest[0])) + 1;
        }
      } catch (e) {}
      console.log(`${'  '.repeat(depth)}- [p${pageNum}] ${it.title}`);
      if (it.items && it.items.length) await walk(it.items, depth + 1);
    }
  }
  await walk(outline, 0);
} else {
  console.log('NO OUTLINE — extracting first line of each page:');
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    const text = tc.items.map(x => x.str).join(' ').replace(/\s+/g, ' ').trim().slice(0, 120);
    console.log(`p${i}: ${text}`);
  }
}
