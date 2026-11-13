// Post-build checks on dist/: run `npm run build && npm run check`.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { activities } from '../src/lib/activities.mjs';
import { tools } from '../src/lib/labs.mjs';
import { FABLES, fablePath } from '../src/lib/fables.mjs';
import { site } from '../src/lib/site.mjs';

const root = path.resolve('dist');
const pages = fs.readdirSync(root, { recursive: true }).filter(file => file.endsWith('.html'));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const decode = text => text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) =>
  code[0] === '#'
    ? String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1)))
    : ENTITIES[code.toLowerCase()] ?? match);
const PROPRIETARY = new RegExp(['lex', 'ile'].join(''), 'i');
const titles = new Map();
const h1s = new Map();
let links = 0, structured = 0;

for (const file of pages) {
  const html = read(file);
  const h1 = [...html.matchAll(/<h1[\s>][\s\S]*?<\/h1>/g)];
  assert.equal(h1.length, 1, `${file}: exactly one H1`);
  const h1Text = h1[0][0].replace(/<[^>]+>/g, '').trim();
  assert.ok(!h1s.has(h1Text), `${file}: H1 "${h1Text}" also used on ${h1s.get(h1Text)}`);
  h1s.set(h1Text, file);

  const allTitles = [...html.matchAll(/<title>(.*?)<\/title>/gs)];
  assert.equal(allTitles.length, 1, `${file}: exactly one title`);
  const title = decode(allTitles[0][1]);
  assert.ok(!titles.has(title), `${file}: title "${title}" also used on ${titles.get(title)}`);
  titles.set(title, file);
  assert.ok(title.length >= 15 && title.length <= 65, `${file}: title is ${title.length} characters: ${title}`);
  const descriptions = [...html.matchAll(/<meta name="description" content="([^"]*)"/g)];
  assert.equal(descriptions.length, 1, `${file}: exactly one meta description`);
  const description = decode(descriptions[0][1]);
  assert.ok(description.length >= 120 && description.length <= 155, `${file}: description is ${description.length} characters: ${description}`);
  assert.equal([...html.matchAll(/<link rel="canonical" href="https:\/\/fictionandfactlibrary\.com\/[^"]*"/g)].length, 1, `${file}: one canonical link`);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, `${file}: duplicate IDs`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    const data = JSON.parse(m[1]);
    assert.equal(data['@context'], 'https://schema.org', `${file}: JSON-LD context`);
    structured++;
  }
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
    const target = decodeURIComponent(m[1]);
    if (target.startsWith('//')) continue;
    assert.ok(target.endsWith('/') || /\.[a-z0-9]+$/.test(target), `${file}: link without a trailing slash: ${target}`);
    const resolved = path.join(root, target);
    assert.ok(fs.existsSync(resolved) && (!fs.statSync(resolved).isDirectory() || fs.existsSync(path.join(resolved, 'index.html'))), `${file}: broken link ${target}`);
    links++;
  }
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '');
  assert.ok(!/NaN|undefined/.test(text), `${file}: NaN or undefined in rendered text`);
  // One trademarked, proprietary reading measure is neither reported nor named anywhere on the site.
  assert.ok(!PROPRIETARY.test(html), `${file}: names a proprietary reading measure`);
  // The site shows no ads: no ad slots, no ad networks.
  assert.ok(!/class="ad-|adsbygoogle|googlesyndication|doubleclick|adsterra/i.test(html), `${file}: ad markup`);
  // The Google tag renders only once an analytics ID is configured; the consent defaults always run.
  assert.equal(html.includes('googletagmanager.com/gtag/js'), Boolean(site.analyticsId), `${file}: Google tag must match site.analyticsId`);
  assert.ok(html.includes("gtag('consent', 'default'"), `${file}: consent defaults`);
}

// Teacher answer keys: noindex and out of the sitemap.
const keys = pages.filter(file => file.startsWith(`teachers${path.sep}answers${path.sep}`));
assert.equal(keys.length, activities.length, 'one answer key per activity');
const noindex = /<meta name="robots" content="noindex"/;
for (const file of keys) assert.match(read(file), noindex, `${file}: noindex`);
assert.match(read('404.html'), noindex, '404: noindex');
// The audiobook player and the saved shelf have no content of their own: noindex and out of the sitemap.
for (const page of ['book', 'favorites']) assert.match(read(path.join(page, 'index.html')), noindex, `/${page}/: noindex`);
assert.doesNotMatch(read(path.join('listen', 'index.html')), noindex, '/listen/ is indexed');
const sitemap = fs.readFileSync(path.join(root, 'sitemap-0.xml'), 'utf8');
assert.ok(!sitemap.includes('/teachers/answers/'), 'answer keys must stay out of the sitemap');
assert.ok(!sitemap.includes('/404'), '404 must stay out of the sitemap');
assert.ok(!sitemap.includes('/book/') && !sitemap.includes('/favorites/'), 'the player and the saved shelf must stay out of the sitemap');
const listed = ['/', '/tools/', ...tools.flatMap(tool => [`/tools/${tool.slug}/`, `/tools/${tool.slug}/activity/`]), '/listen/', '/teachers/', '/about/', '/privacy/'];
// Fables Read-Along has a page for each fable as well.
if (tools.some(tool => tool.slug === 'fables')) listed.push(...FABLES.map(fablePath));
for (const page of listed) assert.ok(sitemap.includes(`<loc>${site.url}${page}</loc>`), `sitemap lists ${page}`);
assert.equal((sitemap.match(/<loc>/g) ?? []).length, listed.length, 'the sitemap lists exactly the indexable pages');
for (const file of ['robots.txt', 'llms.txt', 'favicon.svg', 'og-image.png', '_headers']) assert.ok(fs.existsSync(path.join(root, file)), `dist/${file}`);

console.log(`Verified ${pages.length} pages: unique titles and H1s, title and description lengths, ${structured} JSON-LD blocks, unique IDs, ${links} local links/assets; answer keys, player and saved shelf noindex and out of the sitemap; no ads.`);
