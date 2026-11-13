import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/lib/reading-speed.mjs';
import { analyze } from '../src/lib/readability.mjs';
import { activities, standards } from '../src/lib/activities.mjs';
import { activity, lines, words, EXAMPLE_SECONDS, COLUMNS } from '../src/lib/activities/reading-speed.mjs';

const { PASSAGES, RECORD_PASSAGE, LEVELS, MODES } = m;
const everyPassage = [...PASSAGES, RECORD_PASSAGE];

test('levels: three, each with at least four passages, half stories and half informational', () => {
  assert.deepEqual(LEVELS.map(level => level.id), [1, 2, 3]);
  assert.deepEqual(LEVELS.map(level => level.grades), ['Grades 2–3', 'Grades 4–5', 'Grades 6–8']);
  assert.deepEqual(LEVELS.map(level => level.words), [[150, 200], [200, 300], [300, 400]]);
  for (const level of LEVELS) {
    const passages = m.passagesFor(level.id);
    assert.ok(passages.length >= 4, `level ${level.id} has ${passages.length} passages`);
    assert.equal(passages.filter(p => p.kind === 'story').length, passages.length / 2, `level ${level.id}: half stories`);
    assert.equal(passages.filter(p => p.kind === 'info').length, passages.length / 2, `level ${level.id}: half informational`);
    assert.equal(m.levelById(level.id), level);
  }
  assert.deepEqual(MODES.map(mode => mode.id), ['silent', 'aloud']);
  assert.equal(m.modeById('aloud').label, 'reading aloud');
});

test('every passage: well-formed, the right length for its level, and no duplicates', () => {
  assert.equal(new Set(everyPassage.map(p => p.id)).size, everyPassage.length, 'ids are unique');
  assert.equal(new Set(everyPassage.map(p => p.title)).size, everyPassage.length, 'titles are unique');
  assert.equal(new Set(everyPassage.map(p => p.text)).size, everyPassage.length, 'texts are unique');
  for (const p of everyPassage) {
    assert.match(p.id, /^[a-z]+$/, p.id);
    assert.ok(Object.hasOwn(m.KINDS, p.kind), p.id);
    assert.ok(p.title.length >= 8 && p.title.length <= 40, p.id);
    const paragraphs = m.paragraphs(p);
    assert.ok(paragraphs.length >= 3, `${p.id}: at least three paragraphs`);
    for (const paragraph of paragraphs) {
      assert.match(paragraph, /^[“A-Z].*[.!?”]$/s, `${p.id}: ${paragraph.slice(0, 30)}`);
      assert.ok(!/\n|\s{2}|^\s|\s$/.test(paragraph), `${p.id}: stray white space`);
    }
    // Typographic quotes only, no dashes and no ellipses: nothing a young reader has to puzzle over.
    assert.ok(!/["'—–…]/.test(p.text), `${p.id}: straight quotes or dashes`);
    assert.equal((p.text.match(/“/g) ?? []).length, (p.text.match(/”/g) ?? []).length, `${p.id}: quotation marks pair up`);
    assert.equal(m.wordCount(p), analyze(p.text).counts.words, `${p.id}: counted by the Reading Level Checker's model`);
  }
  for (const p of PASSAGES) {
    const [min, max] = m.levelById(p.level).words;
    assert.ok(m.wordCount(p) >= min && m.wordCount(p) <= max, `${p.id}: ${m.wordCount(p)} words, level ${p.level} wants ${min} to ${max}`);
    assert.equal(m.passageById(p.id), p);
  }
  assert.equal(m.passageById(RECORD_PASSAGE.id), undefined, 'the record sheet passage is not one of the test passages');
});

test('every passage reads at the level it is offered at', () => {
  // The grade is the Reading Level Checker's consensus grade. Each level's band is its grades, half a grade
  // either side: grades 2–3 means 2.0 to 3.99, so 1.5 to 4.5 is allowed.
  assert.deepEqual(LEVELS.map(level => level.grade), [[1.5, 4.5], [3.5, 6.5], [5.5, 9.5]]);
  for (const p of everyPassage) {
    const [low, high] = m.levelById(p.level).grade;
    const grade = m.readingGrade(p);
    assert.ok(grade >= low && grade <= high, `${p.id}: grade ${grade.toFixed(1)}, level ${p.level} wants ${low} to ${high}`);
  }
  const mean = level => m.passagesFor(level).reduce((sum, p) => sum + m.readingGrade(p), 0) / m.passagesFor(level).length;
  assert.ok(mean(1) + 1 < mean(2) && mean(2) + 1 < mean(3), 'each level is at least a grade harder than the one before');
  // Every level 1 passage is easier than every level 3 passage.
  assert.ok(Math.max(...m.passagesFor(1).map(m.readingGrade)) < Math.min(...m.passagesFor(3).map(m.readingGrade)));
});

test('nothing in a passage breaks the rules for facts', () => {
  // Records that change, and subjects the site keeps away from.
  const banned = /\b(tallest|fastest|largest|biggest|longest|richest|oldest|population|president|prime minister|king|queen of|god|church|vaccine|medicine|diet|healthy|record|world war|dollars?)\b/i;
  for (const p of everyPassage) assert.ok(!banned.test(p.text), `${p.id}: ${p.text.match(banned)?.[0]}`);
  // US spelling.
  for (const p of everyPassage) assert.ok(!/\b(colour|grey|metre|litre|centre|travell|favourite|neighbour)/i.test(p.text), p.id);
});

test('questions: five for every passage, four options each, the first one right, with an explanation', () => {
  const seen = new Set();
  for (const p of PASSAGES) {
    assert.equal(p.questions.length, m.QUESTIONS_PER_PASSAGE, p.id);
    for (const question of p.questions) {
      assert.match(question.q, /^[A-Z].{12,110}\?$/, `${p.id}: ${question.q}`);
      assert.ok(!seen.has(question.q), `duplicate question: ${question.q}`);
      seen.add(question.q);
      assert.equal(question.options.length, 4, question.q);
      assert.equal(new Set(question.options.map(option => option.toLowerCase())).size, 4, `${question.q}: options differ`);
      for (const option of question.options) {
        assert.match(option, /^[A-Z].{1,80}[^.\s]$/, `${question.q}: ${option}`);
        assert.ok(!/all of the above|none of the above|both of the above|\b[A-D] and [A-D]\b/i.test(option), `${question.q}: no trick options`);
      }
      assert.ok(question.why.length >= 30 && /[.”]$/.test(question.why), `${question.q}: an explanation that points at the text`);
      assert.ok(!/^(not|never|except)\b/i.test(question.q) && !/\b(NOT|EXCEPT)\b/.test(question.q), `${question.q}: no negative questions`);
    }
  }
  assert.equal(RECORD_PASSAGE.questions, undefined, 'the record sheet passage has no questions');
  // The right answer cannot be guessed from its length.
  const all = PASSAGES.flatMap(p => p.questions);
  const longest = all.filter(({ options: [right, ...rest] }) => rest.every(option => option.length < right.length)).length;
  const shortest = all.filter(({ options: [right, ...rest] }) => rest.every(option => option.length > right.length)).length;
  assert.ok(longest <= all.length * 0.35, `the right answer is the longest option in ${longest} of ${all.length} questions`);
  assert.ok(shortest <= all.length * 0.35, `the right answer is the shortest option in ${shortest} of ${all.length} questions`);
});

test('explanations quote the passage: every quotation in a “why” is in the text', () => {
  // Speech inside a passage has its own quotation marks, so compare the words only.
  const plain = text => text.replace(/[“”]/g, '').replace(/\s+/g, ' ');
  let quotations = 0;
  for (const p of PASSAGES) {
    for (const question of p.questions) {
      for (const [, quoted] of question.why.matchAll(/“([^”]{12,})”/g)) {
        assert.ok(plain(p.text).includes(plain(quoted).replace(/[.,]$/, '')), `${p.id}: “${quoted}” is not in the passage`);
        quotations++;
      }
    }
  }
  assert.ok(quotations >= 12, `${quotations} quotations checked`);
});

test('questionsFor: the options in a mixed order that never changes, with the answer tracked', () => {
  const positions = [0, 0, 0, 0];
  for (const p of PASSAGES) {
    const shown = m.questionsFor(p);
    assert.deepEqual(m.questionsFor(p), shown, 'the same order every time');
    shown.forEach((question, i) => {
      const source = p.questions[i];
      assert.equal(question.q, source.q);
      assert.equal(question.why, source.why);
      assert.deepEqual([...question.options].sort(), [...source.options].sort(), 'the same four options');
      assert.equal(question.options[question.answer], source.options[0], 'the answer is the first option in the source');
      positions[question.answer]++;
    });
  }
  const total = PASSAGES.length * m.QUESTIONS_PER_PASSAGE;
  for (const count of positions) assert.ok(count >= total * 0.15 && count <= total * 0.35, `answer positions are spread out: ${positions}`);
});

test('scoreAnswers marks each answer', () => {
  const p = m.passageById('water');
  const key = m.questionsFor(p).map(question => question.answer);
  assert.deepEqual(m.scoreAnswers(p, key), { correct: 5, total: 5, right: [true, true, true, true, true] });
  const oneWrong = key.map((answer, i) => (i === 2 ? (answer + 1) % 4 : answer));
  assert.deepEqual(m.scoreAnswers(p, oneWrong), { correct: 4, total: 5, right: [true, true, false, true, true] });
  assert.equal(m.scoreAnswers(p, []).correct, 0);
  assert.equal(m.scoreAnswers(p, key.map(String)).correct, 0, 'answers are positions, not text');
});

test('words per minute and reading times', () => {
  assert.equal(m.wordsPerMinute(200, 60000), 200);
  assert.equal(m.wordsPerMinute(155, 93000), 100);
  assert.equal(m.wordsPerMinute(170, 85000), 120);
  assert.equal(m.wordsPerMinute(100, 45000), 133, 'rounded to a whole number');
  assert.equal(m.wordsPerMinute(100, 0), 0);
  assert.equal(m.formatTime(2000), '2 seconds');
  assert.equal(m.formatTime(1000), '1 second');
  assert.equal(m.formatTime(60000), '1 minute');
  assert.equal(m.formatTime(93000), '1 minute 33 seconds');
  assert.equal(m.formatTime(125400), '2 minutes 5 seconds');
  assert.equal(m.formatTime(0), '0 seconds');
});

test('impossible timings do not count', () => {
  const words = m.wordCount(m.passageById('mitten'));
  // Done pressed after two seconds.
  const twoSeconds = m.judgeTiming(words, 2000);
  assert.equal(twoSeconds.counts, false);
  assert.equal(twoSeconds.reason, 'too-fast');
  assert.match(twoSeconds.message, /^That was 2 seconds for \d+ words\. .*does not count/);
  assert.equal(m.judgeTiming(words, m.MIN_SECONDS * 1000 - 1).counts, false);
  // Faster than anyone reads every word.
  assert.equal(m.judgeTiming(350, 20000).reason, 'too-fast', '1050 words a minute');
  assert.equal(m.judgeTiming(350, 30000).counts, true, '700 words a minute is the limit');
  assert.equal(m.judgeTiming(350, 29000).counts, false);
  // The timer left running.
  const left = m.judgeTiming(words, 40 * 60000);
  assert.equal(left.reason, 'too-slow');
  assert.match(left.message, /left running.*does not count/);
  // Ordinary readings count, from a slow reader to a quick one.
  for (const wpm of [25, 60, 120, 250, 400]) assert.deepEqual(m.judgeTiming(words, (words / wpm) * 60000), { counts: true }, `${wpm} words a minute`);
  assert.ok(m.MIN_SECONDS >= 3 && m.MAX_WPM >= 500 && m.MIN_WPM <= 15);
});

test('the stopwatch runs on any forward-moving clock and does not count paused time', () => {
  let now = 1000;
  const watch = m.createStopwatch(() => now);
  assert.equal(watch.running, false);
  watch.start();
  now += 30000;
  assert.deepEqual(watch.stop(), { ms: 30000, pauses: 0 });
  // A tab hidden for a minute in the middle of the reading.
  watch.start();
  now += 20000; watch.pause();
  assert.equal(watch.running, false);
  now += 60000; watch.resume();
  assert.equal(watch.running, true);
  now += 25000;
  assert.deepEqual(watch.stop(), { ms: 45000, pauses: 1 });
  // Pausing twice in a row, or resuming while running, changes nothing.
  watch.start();
  now += 1000; watch.pause(); watch.pause();
  now += 5000; watch.resume(); watch.resume();
  now += 1000; watch.pause();
  now += 9000;
  assert.deepEqual(watch.stop(), { ms: 2000, pauses: 2 }, 'stopped while paused');
  // Start clears the last run; resume before start does nothing.
  const fresh = m.createStopwatch(() => now);
  fresh.resume();
  assert.equal(fresh.running, false);
  assert.deepEqual(fresh.stop(), { ms: 0, pauses: 0 });
  watch.start(); now += 500;
  assert.deepEqual(watch.stop(), { ms: 500, pauses: 0 });
});

test('interpret: understanding first, and “slow down” only for a quick reading with a low score', () => {
  const kind = (wpm, correct, mode) => m.interpret({ wpm, correct, total: 5, mode }).kind;
  assert.equal(kind(150, 5), 'understood');
  assert.equal(kind(150, 4), 'understood');
  assert.equal(kind(150, 3), 'mostly');
  assert.equal(kind(300, 3), 'mostly');
  assert.equal(kind(m.QUICK_WPM.silent, 2), 'slow-down');
  assert.equal(kind(m.QUICK_WPM.silent - 1, 2), 'too-hard');
  assert.equal(kind(350, 0), 'slow-down');
  assert.equal(kind(60, 1), 'too-hard');
  // Reading aloud is slower, so "quick" starts lower.
  assert.equal(kind(170, 2, 'aloud'), 'slow-down');
  assert.equal(kind(170, 2, 'silent'), 'too-hard');
  assert.ok(m.QUICK_WPM.aloud < m.QUICK_WPM.silent);
  const slow = m.interpret({ wpm: 260, correct: 2, total: 5 });
  assert.equal(slow.title, 'Slow down a little.');
  assert.match(slow.text, /260 words a minute.*2 of 5 questions right.*more slowly/);
  assert.equal(slow.text, `${slow.summary} ${slow.advice}`);
  assert.match(m.interpret({ wpm: 120, correct: 5, total: 5, mode: 'aloud' }).text, /read aloud at 120 words a minute.*5 of 5.*groups of words/);
  assert.match(m.interpret({ wpm: 120, correct: 5, total: 5 }).text, /this speed works for you/);
  assert.match(m.interpret({ wpm: 80, correct: 1, total: 5 }).text, /Speed is not the problem.*easier level/);
  // No result ever tells a reader to speed up, and none compares them with an average.
  for (const wpm of [40, 120, 220, 400]) {
    for (let correct = 0; correct <= 5; correct++) {
      for (const mode of ['silent', 'aloud']) {
        const result = m.interpret({ wpm, correct, total: 5, mode });
        assert.ok(result.title.length > 10 && result.advice.length > 30);
        assert.ok(!/faster|speed up|average|grade|normal|typical|undefined|NaN/i.test(result.text.replace('Reading fast only helps', '')), result.text);
      }
    }
  }
});

test('saved results: newest first, trimmed, cleaned and compared with the reader’s own earlier ones', () => {
  const result = (passage, wpm, extra = {}) => ({ at: 1, passage, mode: 'silent', wpm, correct: 4, total: 5, ...extra });
  let history = [];
  for (let i = 0; i < m.HISTORY_LIMIT + 5; i++) history = m.addResult(history, result('water', 100 + i));
  assert.equal(history.length, m.HISTORY_LIMIT);
  assert.equal(history[0].wpm, 100 + m.HISTORY_LIMIT + 4, 'newest first');
  assert.ok(m.HISTORY_SHOWN <= m.HISTORY_LIMIT);
  // Anything that is not a result is dropped.
  const good = result('moon', 140);
  assert.deepEqual(m.cleanHistory([good, null, 'x', { passage: 'nope', mode: 'silent', wpm: 100, correct: 1, total: 5 }, result('moon', -5), result('moon', 100, { mode: 'shouting' }), result('moon', 100, { correct: 9 }), result('moon', NaN)]), [good]);
  assert.deepEqual(m.cleanHistory('nonsense'), []);
  assert.deepEqual(m.cleanHistory(null), []);
  // Compared only with the same level and the same way of reading.
  const earlier = [result('water', 150), result('moon', 130), result('mitten', 90), result('bridge', 200, { mode: 'aloud' })];
  assert.equal(m.compareWithEarlier(result('salt', 180), earlier), null, 'no earlier level 3 results');
  const compared = m.compareWithEarlier(result('wind', 160), earlier);
  assert.deepEqual([compared.count, compared.average, compared.difference], [2, 140, 20]);
  assert.equal(compared.text, 'That is 20 words a minute faster than the average of your last 2 tests on Level 2 passages (silent reading), which was 140 words a minute.');
  assert.match(m.compareWithEarlier(result('wind', 120), earlier).text, /20 words a minute slower than/);
  assert.match(m.compareWithEarlier(result('wind', 143), earlier).text, /about the same as/);
  assert.match(m.compareWithEarlier(result('wind', 190, { mode: 'aloud' }), earlier).text, /your last test on Level 2 passages \(reading aloud\), which was 200/);
  assert.equal(m.historyLine(result('water', 148)), 'The Water Cycle (Level 2, silent reading): 148 words a minute, 4 of 5 right');
  assert.match(m.historyLine(result('echo', 210, { mode: 'aloud', paused: true })), /Seeing with Sound \(Level 3, reading aloud\): 210 words a minute, 4 of 5 right, timer paused$/);
});

test('counted lines: the passage cut into lines with a running word count', () => {
  for (const p of everyPassage) {
    const cut = m.countedLines(p);
    assert.equal(cut.map(line => line.text).join(' '), p.text.replace(/\n\n/g, ' '), `${p.id}: the lines are the passage`);
    assert.equal(cut.filter(line => line.first).length, m.paragraphs(p).length, `${p.id}: one first line per paragraph`);
    assert.equal(cut.at(-1).count, m.wordCount(p), `${p.id}: the last number is the word count`);
    let running = 0;
    for (const line of cut) {
      assert.ok(line.text.length <= m.LINE_WIDTH, `${p.id}: “${line.text}” is too long`);
      assert.ok(line.words >= 1);
      running += line.words;
      assert.equal(line.count, running);
      assert.equal(analyze(line.text).counts.words, line.words);
    }
  }
  assert.ok(m.countedLines(RECORD_PASSAGE, 40).length > m.countedLines(RECORD_PASSAGE).length, 'a narrower column gives more lines');
});

test('the phrasing example is the first sentence of the record sheet passage', () => {
  assert.ok(RECORD_PASSAGE.text.startsWith(`${m.PHRASE_EXAMPLE.join(' ')} `));
  assert.equal(m.PHRASE_EXAMPLE.length, 3);
});

test('the fluency record sheet and its answer key are built from the model', () => {
  assert.ok(activities.includes(activity));
  assert.equal(activity.tool, 'reading-speed');
  assert.deepEqual(activity.standards, ['RF.4.4']);
  assert.match(standards['RF.4.4'], /accuracy and fluency to support comprehension/);
  const [passage, table, questions] = activity.sections;
  // The passage with word counts in the margin.
  assert.equal(passage.type, 'reading-speed');
  assert.equal(passage.heading, `The passage: ${RECORD_PASSAGE.title}`);
  assert.deepEqual(passage.lines, m.countedLines(RECORD_PASSAGE));
  assert.equal(lines.at(-1).count, words);
  assert.equal(words, m.wordCount(RECORD_PASSAGE));
  assert.ok(lines.length >= 10 && lines.length <= 18, `${lines.length} lines fit on the page`);
  assert.ok(activity.steps.some(step => step.includes(`The whole passage is ${words} words.`)));
  // The table: blank for students, a worked example in the key.
  assert.equal(table.type, 'table');
  assert.match(table.intro, /^Words per minute = words read ÷ seconds × 60$/);
  assert.deepEqual(table.columns, COLUMNS);
  assert.deepEqual(table.rows.map(row => row.label), ['Reading 1', 'Reading 2', 'Reading 3']);
  table.rows.forEach((row, i) => {
    const seconds = EXAMPLE_SECONDS[i];
    assert.deepEqual(row.values, { 'Words read': String(words), 'Seconds': String(seconds), 'Words per minute': String(m.wordsPerMinute(words, seconds * 1000)) });
    // The printed formula gives the printed answer.
    assert.equal(Math.round((Number(row.values['Words read']) / Number(row.values['Seconds'])) * 60), Number(row.values['Words per minute']));
  });
  const wpms = table.rows.map(row => Number(row.values['Words per minute']));
  assert.ok(wpms[0] < wpms[1] && wpms[1] < wpms[2], 'the example reader gets quicker');
  assert.ok(wpms.every(wpm => m.judgeTiming(words, (words / wpm) * 60000).counts), 'and every example reading would count');
  assert.ok(table.keyNote.includes(`${words} ÷ ${EXAMPLE_SECONDS[0]} × 60 = ${wpms[0]} words per minute`));
  // The reader who stops after a minute: the margin number is the words per minute.
  const [, line, count, wpm] = table.keyNote.match(/end of line (\d+) has read (\d+) words, which is (\d+) words per minute/);
  assert.equal(lines[Number(line) - 1].count, Number(count));
  assert.equal(Number(wpm), Number(count));
  // Two reflection questions.
  assert.equal(questions.type, 'questions');
  assert.equal(questions.items.length, 2);
  assert.ok(questions.items[0].a.includes(`from ${wpms[0]} to ${wpms[2]} words per minute`));
  assert.ok(questions.items.every(item => Array.isArray(item.checks)));
});
