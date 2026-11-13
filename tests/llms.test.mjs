// public/llms.txt is the plain-text guide AI assistants read. It is generated from the built pages
// by `npm run build && npm run llms`; this test catches a tool that was added without regenerating it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { site } from '../src/lib/site.mjs';
import { tools, toolCount } from '../src/lib/labs.mjs';
import { learningApps } from '../src/lib/learning-apps.mjs';

const text = readFileSync(new URL('../public/llms.txt', import.meta.url), 'utf8');

test('llms.txt names the site, summarises it and lists every tool and worksheet', () => {
  assert.ok(text.startsWith(`# ${site.name}\n\n> `), 'starts with the site name and a one-paragraph summary');
  assert.ok(text.includes(`: ${toolCount} interactive tool`), 'counts the tools the way the pages do: run npm run build && npm run llms');
  for (const href of ['/tools/', '/teachers/', ...tools.flatMap(tool => [`/tools/${tool.slug}/`, `/tools/${tool.slug}/activity/`])]) {
    assert.ok(text.includes(`](${site.url}${href}): `), `${href} is missing: run npm run build && npm run llms`);
  }
  assert.ok(!text.includes('/teachers/answers/'), 'answer keys are not listed');
});

test('llms.txt links only to this site and its sister apps, each line with a description', () => {
  const hosts = learningApps.map(app => new URL(app.url).hostname);
  for (const [, url] of text.matchAll(/\]\((https?:\/\/[^)]+)\)/g)) {
    assert.ok(url.startsWith('https://') && hosts.includes(new URL(url).hostname), url);
  }
  for (const line of text.split('\n').filter(l => l.startsWith('- [') && l.includes(site.url))) {
    assert.ok(/\): \S.{30,}$/.test(line), `no description: ${line.slice(0, 80)}`);
  }
});
