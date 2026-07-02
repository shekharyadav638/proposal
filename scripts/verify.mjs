import puppeteer from 'puppeteer-core';

const SHOTS = process.env.SHOTS_DIR || './scripts/shots';
import fs from 'fs';
fs.mkdirSync(SHOTS, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--window-size=1720,1000'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1720, height: 1000 });

const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

console.log('1. Loading app…');
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 60000 });

// Wait for first canvas (PDF page rendered)
await page.waitForSelector('.page-wrap canvas', { timeout: 60000 });
console.log('   ✓ PDF canvas rendered');
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: `${SHOTS}/1-initial.png` });

// Sidebar sections present?
const sectionCount = await page.$$eval('.section-item', els => els.length);
console.log(`   ✓ Sidebar sections: ${sectionCount}`);

// 2. Controller tools
console.log('2. Testing controller tools…');
const list = await page.evaluate(() => window.__proposal.current.listSections());
console.log('   listSections →', list.split('\n')[0], '…');

const search = await page.evaluate(() => window.__proposal.current.search({ query: 'FlowEngage' }));
console.log('   search("FlowEngage") →', search.split('\n')[0]);

// 3. highlightSection: scroll + spotlight
console.log('3. Testing highlight flow…');
const hl = await page.evaluate(() => window.__proposal.current.highlightSection({ section: 'FlowEngage' }));
console.log('   highlightSection →', hl);
await new Promise(r => setTimeout(r, 2500)); // let smooth scroll settle + lazy pages render
const highlighted = await page.$$eval('.page-wrap.highlighted', els => els.map(e => e.dataset.page));
console.log('   ✓ highlighted pages:', highlighted.join(', ') || 'NONE!');
const chip = await page.$eval('.section-chip', el => el.textContent).catch(() => null);
console.log('   ✓ chip label:', chip);
const cur = await page.evaluate(() => window.__proposal.current.getCurrentPage());
console.log('   getCurrentPage →', cur);
await page.screenshot({ path: `${SHOTS}/2-highlight-flowengage.png` });

// 4. Another section far away (tests lazy render + long scroll)
const hl2 = await page.evaluate(() => window.__proposal.current.highlightSection({ section: 'Projektplan' }));
console.log('   highlightSection(Projektplan) →', hl2);
await new Promise(r => setTimeout(r, 3500));
const cur2 = await page.evaluate(() => window.__proposal.current.getCurrentPage());
console.log('   getCurrentPage →', cur2);
await page.screenshot({ path: `${SHOTS}/3-highlight-projektplan.png` });

// 5. Fuzzy match — the agent may say loose names
const fuzzy = await page.evaluate(() => window.__proposal.current.highlightSection({ section: 'management summary' }));
console.log('   fuzzy "management summary" →', fuzzy);
const fuzzy2 = await page.evaluate(() => window.__proposal.current.gotoSection({ section: 'page 25' }));
console.log('   goto "page 25" →', fuzzy2);
const bad = await page.evaluate(() => window.__proposal.current.highlightSection({ section: 'zzz nonsense' }));
console.log('   bad name →', bad.split('\n')[0]);

// 6. clearHighlight
const cleared = await page.evaluate(() => window.__proposal.current.clearHighlight());
await new Promise(r => setTimeout(r, 800));
const stillHl = await page.$$eval('.page-wrap.highlighted', els => els.length);
console.log('   clearHighlight →', cleared, '| remaining highlighted:', stillHl);

// 7. Sidebar click flow
await page.evaluate(() => { document.querySelectorAll('.section-item')[8].click(); }); // FlowEngage
await new Promise(r => setTimeout(r, 2500));
await page.screenshot({ path: `${SHOTS}/4-sidebar-click.png` });
const spotlit = await page.$eval('.section-item.spotlit', el => el.textContent).catch(() => 'NONE');
console.log('   ✓ sidebar click spotlit:', spotlit);

// 8. Voice widget present
const btn = await page.$eval('.agent-btn', el => el.textContent).catch(() => null);
console.log('   ✓ voice widget button:', btn);

console.log('\nJS errors:', errors.length ? errors.slice(0, 5) : 'none');
await browser.close();
console.log('DONE');
