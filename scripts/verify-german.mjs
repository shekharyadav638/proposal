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

console.log('sidebar title:', await page.$eval('.sidebar-head h1', el => el.textContent));
console.log('subtitle:', await page.$eval('.subtitle', el => el.textContent));
console.log('ready:', await page.$eval('.ready', el => el.textContent));
console.log('widget:', await page.$eval('.agent-widget', el => el.innerText.replace(/\n/g, ' | ')));
await page.screenshot({ path: 'scripts/shots/9-german-idle.png', clip: { x: 0, y: 0, width: 420, height: 200 } });
await page.screenshot({ path: 'scripts/shots/10-german-widget.png', clip: { x: 1370, y: 770, width: 350, height: 230 } });

await page.click('.agent-btn');
await page.waitForSelector('.consent-card');
console.log('consent title:', await page.$eval('.consent-card h2', el => el.textContent));
console.log('consent buttons:', await page.$$eval('.consent-actions button', els => els.map(e => e.textContent).join(' / ')));
await page.screenshot({ path: 'scripts/shots/11-german-consent.png' });

// tools still work
await page.click('.consent-cancel');
await new Promise(r => setTimeout(r, 400));
const hl = await page.evaluate(() => window.__proposal.current.highlightSection({ section: 'AES case study' }));
console.log('tool check:', hl.split('.')[0]);
await browser.close();
console.log('DONE');
