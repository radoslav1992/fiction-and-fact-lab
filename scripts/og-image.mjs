// Renders public/og-image.png (1200×630) from an HTML card with Playwright: `npm run og-image`.
// Playwright is not a project dependency. The script uses an installed copy (`npx playwright install chromium`
// or a preinstalled one); set PLAYWRIGHT_MODULE / CHROMIUM_PATH to point at a specific install.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { libraryCardSvg } from '../src/lib/library-card.mjs';
import { site } from '../src/lib/site.mjs';

const require = createRequire(import.meta.url);
const candidates = [process.env.PLAYWRIGHT_MODULE, 'playwright', '/opt/node-tools/node_modules/playwright'].filter(Boolean);
let chromium;
for (const name of candidates) { try { ({ chromium } = require(name)); break; } catch {} }
if (!chromium) throw new Error('Playwright not found. Install it (npx playwright install chromium) or set PLAYWRIGHT_MODULE.');
const executablePath = process.env.CHROMIUM_PATH ?? (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Literata:opsz,wght@7..72,600;7..72,700&display=block" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0}
  body{width:1200px;height:630px;background:#f7f1e1;font-family:'Atkinson Hyperlegible',system-ui,sans-serif;color:#1d2158;display:grid;grid-template-columns:560px 1fr;overflow:hidden}
  .left{background:#1d2158;color:#fff;padding:56px 50px;display:flex;flex-direction:column;justify-content:space-between;border-right:14px solid #ffe14f}
  .brand{display:flex;align-items:center;gap:16px;font:700 31px 'Literata',Georgia,serif}
  h1{font:700 56px/1.22 'Literata',Georgia,serif}
  h1 span{display:inline-block;background:#ffe14f;color:#1d2158;padding:0 14px 4px;margin-top:8px;border-radius:6px;line-height:1.15}
  .tools{font-size:25px;color:#dfe0f3;margin-top:24px;line-height:1.4}
  .url{font-size:22px;color:#dfe0f3}
  .right{display:flex;align-items:center;justify-content:center;padding:30px 34px}
  .right svg{width:100%;height:auto;filter:drop-shadow(0 14px 26px rgba(29,33,88,.18))}
</style></head><body>
<div class="left">
  <div class="brand"><img src="data:image/svg+xml;base64,${fs.readFileSync(new URL('../public/favicon.svg', import.meta.url)).toString('base64')}" width="58" height="58">${site.name.replace('&', '&amp;')}</div>
  <div><h1>Free reading tools for <span>classrooms</span></h1><p class="tools">Check a reading level. Sort fact from opinion. Print a worksheet.</p></div>
  <p class="url">${new URL(site.url).hostname}</p>
</div>
<div class="right">${libraryCardSvg()}</div>
</body></html>`;

const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'networkidle' }).catch(() => page.setContent(html));
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: new URL('../public/og-image.png', import.meta.url).pathname });
await browser.close();
console.log('Wrote public/og-image.png (1200×630).');
