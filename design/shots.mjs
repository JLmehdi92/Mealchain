import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
const { chromium } = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright');

const out = process.argv[2] ?? 'shots';
const only = process.argv[3];
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto('file://' + process.cwd() + '/canvas.html');
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);
const frames = await page.$$('figure.frame');
let i = 0;
for (const f of frames) {
  const name = await f.getAttribute('data-screen');
  const lang = await f.$eval('figcaption', (c) => c.textContent.slice(-2));
  const dark = await f.$('.phone.dark');
  const file = `${out}/${String(i++).padStart(2, '0')}-${name}-${lang}${dark ? '-dark' : ''}.png`;
  if (only && !file.includes(only)) continue;
  await (await f.$('.phone')).screenshot({ path: file });
}
console.log(frames.length, 'frames;', errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
await browser.close();
