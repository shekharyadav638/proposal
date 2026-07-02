import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new', args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1720, height: 1000 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('.agent-btn', { timeout: 30000 });

// Cancel closes
await page.click('.agent-btn');
await page.waitForSelector('.consent-card');
await page.click('.consent-cancel');
await new Promise(r => setTimeout(r, 400));
console.log('after Cancel, dialog present:', await page.$('.consent-card') !== null);

// Overlay click closes too
await page.click('.agent-btn');
await page.waitForSelector('.consent-card');
await page.mouse.click(200, 500);
await new Promise(r => setTimeout(r, 400));
console.log('after overlay click, dialog present:', await page.$('.consent-card') !== null);

// Accept triggers session start (will fail on mic in headless, but error path must render, not crash)
await page.click('.agent-btn');
await page.waitForSelector('.consent-card');
await page.click('.consent-accept');
await new Promise(r => setTimeout(r, 1500));
const widget = await page.$eval('.agent-widget', el => el.innerText.replace(/\n/g, ' | '));
console.log('widget after Accept (headless, no mic):', widget);
await browser.close();
console.log('DONE');
