import puppeteer from 'puppeteer-core';
import fs from 'fs';
fs.mkdirSync('./scripts/shots', { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new', args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1720, height: 1000 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('.page-wrap canvas', { timeout: 60000 });

// AES case study: must highlight ONLY page 11 and scroll there
const r = await page.evaluate(() => window.__proposal.current.highlightSection({ section: 'AES case study' }));
console.log('tool result:', r);
await new Promise(res => setTimeout(res, 3000));
const highlighted = await page.$$eval('.page-wrap.highlighted', els => els.map(e => e.dataset.page));
console.log('highlighted pages:', highlighted.join(', '));
const cur = await page.evaluate(() => window.__proposal.current.getCurrentPage());
console.log('viewport now at:', cur);
await page.screenshot({ path: 'scripts/shots/5-aes-only.png' });

// Allianz must highlight only page 10
const r2 = await page.evaluate(() => window.__proposal.current.highlightSection({ section: 'Allianz' }));
await new Promise(res => setTimeout(res, 2500));
const h2 = await page.$$eval('.page-wrap.highlighted', els => els.map(e => e.dataset.page));
console.log('Allianz →', r2.split('.')[0], '| highlighted:', h2.join(', '));

// SPC FAME must highlight only page 12
const r3 = await page.evaluate(() => window.__proposal.current.highlightSection({ section: 'SPC FAME case study' }));
await new Promise(res => setTimeout(res, 2500));
const h3 = await page.$$eval('.page-wrap.highlighted', els => els.map(e => e.dataset.page));
console.log('SPC FAME →', r3.split('.')[0], '| highlighted:', h3.join(', '));

await browser.close();
console.log(highlighted.length === 1 && highlighted[0] === '11' && h2.join() === '10' && h3.join() === '12' ? 'ALL PASS' : 'FAIL');
