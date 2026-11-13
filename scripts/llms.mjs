// Writes public/llms.txt, the plain-text guide to this site for AI assistants
// (https://llmstxt.org). ChatGPT is one of the family's main sources of visitors,
// and it can only recommend a tool it can read a description of.
//
// Every line comes from a built page: its <title> and meta description, for
// each URL in the sitemap. Run it after changing titles or descriptions:
//
//   npm run build && npm run llms
//
// tests/llms.test.mjs fails if a tool or worksheet is missing from the file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from '../src/lib/site.mjs';
import { toolCount } from '../src/lib/labs.mjs';
import { learningApps, currentApp } from '../src/lib/learning-apps.mjs';

const INTRO = `Free reading and English tools for students in grades 2–8 (ages about 7–14) and their teachers: ${toolCount} interactive tools, each with a short lesson, a printable one-page worksheet and a teacher answer key. Everything runs in the browser with no sign-up and no ads. From the makers of Interactive Periodic Table.`;
const SISTERS = learningApps.filter(app => app.id !== currentApp).map(app => [app.name, app.url + '/']);

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');
const sitemap = path.join(dist, 'sitemap-0.xml');
if (!fs.existsSync(sitemap)) throw new Error('Run `npm run build` first: dist/sitemap-0.xml is missing.');

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = text => text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) =>
  code[0] === '#'
    ? String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1)))
    : ENTITIES[code.toLowerCase()] ?? match);
const brand = ` | ${site.name}`;

const urls = [...fs.readFileSync(sitemap, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
const origin = new URL(urls[0]).origin;
const pages = urls.map(url => {
  const route = new URL(url).pathname;
  const html = fs.readFileSync(path.join(dist, route, 'index.html'), 'utf8');
  const full = decode(html.match(/<title>([\s\S]*?)<\/title>/)[1]).trim();
  const title = full.endsWith(brand) ? full.slice(0, -brand.length) : full;
  const description = decode(html.match(/<meta name="description" content="([\s\S]*?)"/)[1]).trim();
  return { route, title, description };
});

// Which heading a page goes under. Anything not matched is a tool.
function section(route) {
  if (route === '/') return null;
  if (route.endsWith('/activity/') || route.startsWith('/teachers/')) return 'Classroom';
  if (/^\/(about|privacy)\//.test(route)) return 'About';
  return 'Tools';
}

const order = ['Tools', 'Classroom', 'About'];
const depth = route => route.split('/').length;
const lines = [`# ${site.name}`, '', `> ${INTRO}`, ''];
for (const heading of order) {
  // Hub pages first, then alphabetical by path.
  const group = pages.filter(p => section(p.route) === heading)
    .sort((a, b) => depth(a.route) - depth(b.route) || (a.route < b.route ? -1 : a.route > b.route ? 1 : 0));
  if (!group.length) continue;
  lines.push(`## ${heading}`, '');
  for (const p of group) lines.push(`- [${p.title}](${origin}${p.route}): ${p.description}`);
  if (heading === 'About') lines.push(`- Contact: ${site.contactEmail}`);
  lines.push('');
}
lines.push('## Optional', '', `- ${SISTERS.map(([name, url]) => `[${name}](${url})`).join(', ')}: Sister learning apps from the same makers.`, '');

fs.writeFileSync(path.join(root, 'public', 'llms.txt'), lines.join('\n'));
console.log(`Wrote public/llms.txt: ${pages.length} pages from the sitemap.`);
