import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { site } from '../src/lib/site.mjs';
import { learningApps, currentApp } from '../src/lib/learning-apps.mjs';
import { toolGroups, tools, toolBySection, toolCount, ToolCount } from '../src/lib/labs.mjs';
import { activities, standards } from '../src/lib/activities.mjs';

test('site settings', () => {
  assert.equal(site.name, 'Fiction & Fact Library');
  assert.equal(site.url, 'https://fictionandfactlibrary.com');
  assert.equal(site.analyticsId, 'G-5YF12LL7N3');
  assert.match(site.contactEmail, /@fictionandfactlibrary\.com$/);
});

test('learning apps: Interactive Periodic Table first, canonical https URLs, this app current', () => {
  assert.equal(currentApp, 'reading');
  assert.equal(learningApps[0].name, 'Interactive Periodic Table');
  assert.deepEqual(learningApps.map(app => app.id), ['chemistry', 'physics', 'biology', 'astronomy', 'geometry', 'kids', 'earth', 'spreadsheets', 'reading']);
  for (const app of learningApps) assert.match(app.url, /^https:\/\/[a-z.]+$/, app.name);
  const self = learningApps.find(app => app.id === currentApp);
  assert.equal(self.url, site.url);
  assert.equal(self.name, site.name);
  assert.equal(self.subject, 'Reading');
});

test('tools: complete entries, each with an activity', () => {
  assert.equal(toolCount, ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'][tools.length]);
  assert.equal(ToolCount[0], ToolCount[0].toUpperCase());
  assert.deepEqual(tools.map(tool => tool.slug), activities.map(act => act.tool));
  for (const tool of tools) {
    for (const field of ['slug', 'name', 'section', 'topic', 'kind', 'blurb']) assert.ok(tool[field]?.length > 3, `${tool.slug}.${field}`);
    assert.equal(toolBySection(tool.section), tool);
    assert.equal(activities.find(act => act.tool === tool.slug).toolName, tool.name);
  }
  assert.equal(new Set(tools.map(tool => tool.kind)).size, tools.length, 'kinds are unique');
});

test('activities: metadata, standards and page titles', () => {
  for (const act of activities) {
    assert.match(act.grade, /^Grades \d–\d$/, act.tool);
    assert.ok(act.minutes >= 10 && act.minutes <= 30, act.tool);
    assert.ok(act.standards.length > 0, act.tool);
    for (const code of act.standards) assert.ok(standards[code]?.length > 20, code);
    assert.ok(act.pageTitle.length <= 60, `${act.tool}: title is ${act.pageTitle.length} characters`);
    assert.ok(act.pageDescription.length >= 120 && act.pageDescription.length <= 155, `${act.tool}: description is ${act.pageDescription.length} characters`);
    for (const field of ['hook', 'debrief', 'tip']) assert.ok(act.lesson[field].length > 20, `${act.tool}.lesson.${field}`);
    assert.ok(act.steps.length >= 3 && act.sections.length >= 2, act.tool);
  }
});

test('tool groups: every live tool is in exactly one group', () => {
  const grouped = toolGroups.flatMap(group => group.tools.map(tool => tool.slug));
  assert.deepEqual([...grouped].sort(), tools.map(tool => tool.slug).sort());
  for (const group of toolGroups) assert.ok(group.name && group.about, group.id);
});

test('home page title and description say what the site is', () => {
  assert.ok(site.defaultTitle.startsWith(site.name));
  assert.ok(site.defaultTitle.length <= 60, 'title fits a search result');
  assert.match(site.defaultTitle, /reading tools/i);
  assert.match(site.tagline, /free reading tools for classrooms/i);
  assert.ok(site.defaultDescription.length >= 120 && site.defaultDescription.length <= 155, `description is ${site.defaultDescription.length} characters`);
});

test('no ads: nothing in the source loads or reserves space for an ad', () => {
  const files = fs.readdirSync(new URL('../src', import.meta.url), { recursive: true }).filter(file => /\.(astro|mjs|ts|js|css)$/.test(file));
  for (const file of files) {
    const source = fs.readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8');
    assert.ok(!/AdSlot|AdFree|ads\.mjs|adFreeUntil|ad-slot|classroom=1/.test(source), file);
  }
});
