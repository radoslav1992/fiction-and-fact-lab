import test from 'node:test';
import assert from 'node:assert/strict';
import { activities } from '../src/lib/activities.mjs';
import { analyze, gradeLabel } from '../src/lib/readability.mjs';
import { fmt } from '../src/lib/readability-view.mjs';
import { WORKSHEET_PASSAGE, WORKSHEET_REWRITE } from '../src/lib/reading-samples.mjs';
import { COLUMNS } from '../src/lib/activities/reading-level.mjs';

const byTool = tool => activities.find(act => act.tool === tool);
const questions = act => act.sections.filter(section => section.type === 'questions').flatMap(section => section.items);
const number = printed => Number(printed.replace('−', '-'));

test('every number printed in an answer is checked against the model', () => {
  for (const act of activities) {
    for (const item of questions(act)) {
      const checked = new Set();
      for (const [printed, value] of item.checks) {
        const decimals = (printed.split('.')[1] ?? '').length;
        assert.ok(Math.abs(number(printed) - value) <= 0.5 * 10 ** -decimals + 1e-9, `${act.tool}: printed ${printed} vs model ${value}`);
        assert.ok(item.a.includes(printed), `${act.tool}: ${printed} is checked but not printed`);
        checked.add(printed);
      }
      // No number in an answer may skip the check.
      for (const printed of item.a.match(/−?\d+(?:\.\d+)?/g) ?? []) assert.ok(checked.has(printed), `${act.tool}: unchecked number ${printed} in: ${item.a}`);
    }
  }
});

test('every activity has blank lines for the student and an answer for the teacher', () => {
  for (const act of activities) {
    const items = questions(act);
    assert.ok(items.length >= 4, act.tool);
    for (const item of items) {
      assert.ok(item.q.length > 20 && item.a.length > 20, `${act.tool}: ${item.q}`);
      assert.ok(item.lines >= 1 && item.lines <= 8, `${act.tool}: ${item.q}`);
    }
  }
});

test('reading level worksheet: the table is what the checker shows for the passage and for the sample rewrite', () => {
  const act = byTool('reading-level');
  const passage = act.sections.find(section => section.type === 'passage');
  assert.equal(passage.text, WORKSHEET_PASSAGE.text, 'the printed passage is the sample the checker loads');
  const table = act.sections.find(section => section.type === 'table');
  assert.deepEqual(table.columns, COLUMNS);
  assert.equal(table.rows.length, 2);
  for (const [row, text] of [[table.rows[0], WORKSHEET_PASSAGE.text], [table.rows[1], WORKSHEET_REWRITE]]) {
    const a = analyze(text);
    assert.deepEqual(row.values, {
      'Words': String(a.counts.words),
      'Sentences': String(a.counts.sentences),
      'Words per sentence': fmt(a.counts.wordsPerSentence),
      'Syllables per word': fmt(a.counts.syllablesPerWord, 2),
      'Flesch Reading Ease': fmt(a.scores.readingEase),
      'Reading level': gradeLabel(a.grade),
    });
    for (const column of table.columns) assert.ok(row.values[column], column);
  }
  // The printed averages are the printed totals divided.
  for (const row of table.rows) assert.equal(row.values['Words per sentence'], (Number(row.values['Words']) / Number(row.values['Sentences'])).toFixed(1));
});

test('reading level worksheet: the answers describe the passage', () => {
  const act = byTool('reading-level');
  const [longest, longWords, rewrite, compare] = questions(act);
  const before = analyze(WORKSHEET_PASSAGE.text), after = analyze(WORKSHEET_REWRITE);
  const sentence = before.sentences.reduce((a, b) => (b.words > a.words ? b : a));
  assert.ok(longest.a.includes(`“${sentence.text.split(' ').slice(0, 3).join(' ')} …” has ${sentence.words} words`));
  assert.equal(before.sentences.filter(s => s.long).length, 1, 'the passage has exactly one long sentence');
  assert.ok(longest.a.includes('only this sentence'));
  // Each word the key suggests swapping is one the checker really marks as long.
  const marked = before.words.filter(w => w.long).map(w => w.text.toLowerCase());
  for (const [, word] of longWords.a.matchAll(/(\w+) →/g)) assert.ok(marked.includes(word), `${word} is marked as long`);
  assert.ok(marked.includes('chlorophyll'));
  assert.ok(rewrite.a.includes(WORKSHEET_REWRITE));
  assert.ok(rewrite.a.includes(`checks as ${gradeLabel(after.grade)}.`));
  assert.ok(compare.a.includes(`from ${gradeLabel(before.grade)} to ${gradeLabel(after.grade)}`));
  assert.ok(act.steps[0].includes(`“${WORKSHEET_PASSAGE.label}”`));
});
