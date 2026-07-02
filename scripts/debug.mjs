import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new', args: ['--no-sandbox'],
});
const page = await browser.newPage();
page.on('console', m => console.log('[console]', m.type(), m.text().slice(0, 300)));
page.on('pageerror', e => console.log('[pageerror]', e.message.slice(0, 300)));
page.on('requestfailed', r => console.log('[reqfail]', r.url().slice(0, 120), r.failure()?.errorText));
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 8000));
const html = await page.evaluate(() => document.querySelector('.main')?.innerHTML?.slice(0, 500) || document.body.innerHTML.slice(0, 500));
console.log('MAIN HTML:', html);
await page.screenshot({ path: 'scripts/shots/debug.png' });
await browser.close();
