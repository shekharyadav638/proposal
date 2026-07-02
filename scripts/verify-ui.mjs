import puppeteer from 'puppeteer-core';
import fs from 'fs';
fs.mkdirSync('./scripts/shots', { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new', args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1720, height: 1000 });
const errors = [];
page.on('pageerror', e => errors.push(e.message.slice(0, 200)));
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('.page-wrap canvas', { timeout: 60000 });
await new Promise(r => setTimeout(r, 1000));

// 1. Content-box spotlight on AES (text page)
await page.evaluate(() => window.__proposal.current.highlightSection({ section: 'AES case study' }));
await new Promise(r => setTimeout(r, 3000));
const box = await page.$eval('.spotlight-box', el => {
  const r = el.getBoundingClientRect();
  const p = el.closest('.page-wrap').getBoundingClientRect();
  return { wFrac: (r.width / p.width).toFixed(2), hFrac: (r.height / p.height).toFixed(2) };
});
console.log('spotlight box vs page:', JSON.stringify(box), '(must be < 1.00 = not whole page)');
const chip = await page.$eval('.section-chip', el => el.textContent);
console.log('chip:', chip);
await page.screenshot({ path: 'scripts/shots/6-content-spotlight.png' });

// 2. Consent dialog appears on click, Accept path wired
await page.click('.agent-btn');
await page.waitForSelector('.consent-card', { timeout: 5000 });
const consentTitle = await page.$eval('.consent-card h2', el => el.textContent);
console.log('consent dialog:', consentTitle);
await page.screenshot({ path: 'scripts/shots/7-consent.png' });
const cancelWorks = await page.evaluate(() => {
  document.querySelector('.consent-cancel').click();
  return !document.querySelector('.consent-card');
});
console.log('cancel closes dialog:', cancelWorks);

// 3. Idle widget layout
const widgetText = await page.$eval('.agent-widget', el => el.innerText.replace(/\n/g, ' | '));
console.log('widget:', widgetText);
await page.screenshot({ path: 'scripts/shots/8-widget-idle.png', clip: { x: 1380, y: 780, width: 340, height: 220 } });

console.log('JS errors:', errors.length ? errors : 'none');
await browser.close();
console.log('DONE');
