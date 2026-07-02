import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

const data = new Uint8Array(fs.readFileSync('./public/proposal.pdf'));
const doc = await getDocument({ data, useSystemFonts: true }).promise;

const FALLBACK = { x: 0.03, y: 0.04, w: 0.94, h: 0.92 };
const bounds = [];

for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const vp = page.getViewport({ scale: 1 });
  const tc = await page.getTextContent();

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const it of tc.items) {
    if (!it.str || !it.str.trim()) continue;
    const x = it.transform[4];
    const y = it.transform[5]; // baseline, PDF coords (origin bottom-left)
    const h = Math.abs(it.transform[3]) || it.height || 10;
    // skip footer strip (page numbers etc.) in the bottom 4% of the page
    if (y / vp.height < 0.04 && it.str.trim().length <= 10) continue;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + (it.width || 0));
    minY = Math.min(minY, y - h * 0.25);
    maxY = Math.max(maxY, y + h);
  }

  if (!isFinite(minX)) { bounds.push(FALLBACK); continue; }

  // pad and convert to top-left normalized CSS coords
  const padX = vp.width * 0.015, padY = vp.height * 0.02;
  minX = Math.max(0, minX - padX);
  maxX = Math.min(vp.width, maxX + padX);
  minY = Math.max(0, minY - padY);
  maxY = Math.min(vp.height, maxY + padY);

  const box = {
    x: +(minX / vp.width).toFixed(4),
    y: +((vp.height - maxY) / vp.height).toFixed(4),
    w: +((maxX - minX) / vp.width).toFixed(4),
    h: +((maxY - minY) / vp.height).toFixed(4),
  };
  // image-heavy pages with little text: highlight the content area instead
  bounds.push(box.w * box.h < 0.3 ? FALLBACK : box);
}

fs.writeFileSync('./lib/pageBounds.json', JSON.stringify(bounds));
console.log('Wrote bounds for', bounds.length, 'pages');
bounds.forEach((b, i) => { if (b === FALLBACK) console.log('  fallback on page', i + 1); });
