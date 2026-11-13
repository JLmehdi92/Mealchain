import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

const root = execSync('npm root -g').toString().trim();
const { chromium } = createRequire(root + '/')('playwright');
const out = process.argv[2] ?? 'shots/protos';
const lang = process.argv[3] ?? 'fr';
const times = [0.2, 0.7, 1.0, 1.3, 1.7, 2.4, 3.2];
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto('file://' + process.cwd() + '/canvas.html');
await page.evaluate(() => document.fonts.ready);
if (lang === 'en') await page.click('[data-lang="en"]');
await page.waitForTimeout(400);
const ids = await page.$$eval('#proto-lane .frame', (fs) => fs.map((f) => f.id));
for (const id of ids) {
  const el = await page.$(`#${id} .phone`);
  await el.evaluate((n) => { n.scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(300);
  await page.click(`#${id} .replay`);
  const start = Date.now();
  for (const t of times) {
    const wait = t * 1000 - (Date.now() - start);
    if (wait > 0) await page.waitForTimeout(wait);
    await el.screenshot({ path: `${out}/${id}-${String(t).replace('.', '_')}.png` });
  }
}
console.log(ids.join(', '), '|', errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
await browser.close();
