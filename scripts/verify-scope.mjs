import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new', args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('.page-wrap canvas', { timeout: 60000 });

// In-proposal query (German content, English question words)
const r1 = await page.evaluate(() => window.__proposal.current.search({ query: 'Delivery' }));
console.log('search("Delivery"):', r1.split('\n')[0]);
const r2 = await page.evaluate(() => window.__proposal.current.search({ query: 'Ansprechpartner' }));
console.log('search("Ansprechpartner"):', r2.split('\n')[0]);
// Token fallback: phrase not present verbatim but words are
const r3 = await page.evaluate(() => window.__proposal.current.search({ query: 'delivery framework engines' }));
console.log('token fallback:', r3.split('\n')[0]);
// Truly out of scope → must instruct out-of-scope reply
const r4 = await page.evaluate(() => window.__proposal.current.search({ query: 'cryptocurrency blockchain pizza' }));
console.log('out-of-scope:', r4.slice(0, 120));
await browser.close();
console.log('DONE');
