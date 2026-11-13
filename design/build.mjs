import { readFileSync, writeFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(p, import.meta.url));
const dataUrl = (p, type) => `data:${type};base64,${read(p).toString('base64')}`;

const css = read('canvas.css').toString().replace(/url\("([^"]+)"\)/g, (_, p) =>
  `url("${dataUrl(p, p.endsWith('.woff2') ? 'font/woff2' : 'font/ttf')}")`);

const html = read('canvas.html').toString()
  .replace('<link rel="stylesheet" href="canvas.css">', () => `<style>${css}</style>`)
  .replace(/<script src="([^"]+)"><\/script>/g, (_, p) => `<script>${read(p).toString().replace(/<\/script/g, '<\\/script')}</script>`)
  .replace('src="brand/wordmark-light.svg"', () => `src="${dataUrl('brand/wordmark-light.svg', 'image/svg+xml')}"`);

writeFileSync(new URL('canvas-standalone.html', import.meta.url), html);
console.log(`canvas-standalone.html ${(html.length / 1024).toFixed(0)} KB`);
