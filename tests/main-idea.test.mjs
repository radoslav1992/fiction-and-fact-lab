import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/lib/main-idea.mjs';
import { paragraphHtml, kindTagHtml } from '../src/lib/main-idea-view.mjs';
import { analyze } from '../src/lib/readability.mjs';
import { activities, standards } from '../src/lib/activities.mjs';
import { activity, PARTS, DETAILS_ID } from '../src/lib/activities/main-idea.mjs';

const { PARAGRAPHS, LEVELS, ROUND_LENGTH, SORT_SUPPORTS } = m;
const KINDS = ['main', 'detail', 'broad', 'off'];
const strip = html => html.replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const normal = text => text.toLowerCase().replace(/[^a-z0-9 ]/g, '');
const contentWords = text => new Set(normal(text).split(' ').filter(word => word.length >= 4));
const shared = (a, b) => [...contentWords(a)].filter(word => contentWords(b).has(word)).length;

test('the bank: at least 12 paragraphs per level, each 50 to 120 words, in the right shape', () => {
  assert.deepEqual(LEVELS.map(level => level.id), [1, 2, 3]);
  assert.deepEqual(LEVELS.map(level => level.grades), ['Grades 2–3', 'Grades 4–5', 'Grades 6–8']);
  for (const level of LEVELS) {
    assert.ok(m.paragraphsFor(level.id).length >= 12, `level ${level.id} has ${m.paragraphsFor(level.id).length}`);
    assert.equal(m.levelById(level.id), level);
    // Every level covers every kind of subject.
    assert.deepEqual([...new Set(m.paragraphsFor(level.id).map(item => item.category))].sort(), [...m.CATEGORIES].sort(), `level ${level.id} categories`);
  }
  for (const item of PARAGRAPHS) {
    assert.match(item.id, /^[abc]\d\d$/, item.id);
    assert.equal(item.id[0], 'abc'[item.level - 1], `${item.id} is filed under its level`);
    assert.ok(m.CATEGORIES.includes(item.category), item.id);
    assert.match(item.topic, /^[a-zA-Z][a-zA-Z ,]{3,40}$/, `${item.id}: a topic is a word or a phrase, not a sentence`);
    assert.ok(item.sentences.length >= 4 && item.sentences.length <= 8, item.id);
    for (const sentence of item.sentences) {
      assert.match(sentence, /^[A-Z].{10,160}\.$/, `${item.id}: ${sentence}`);
      assert.ok(!/\s{2}|\n|["'—–]/.test(sentence), `${item.id}: ${sentence}`);
    }
    const words = analyze(m.paragraphText(item)).counts.words;
    assert.ok(words >= 50 && words <= 120, `${item.id} has ${words} words`);
    assert.equal(analyze(m.paragraphText(item)).counts.sentences, item.sentences.length, `${item.id}: one sentence per entry`);
    assert.equal(m.paragraphById(item.id), item);
  }
});

test('no duplicates: every id, topic, sentence, option and extra sentence appears once', () => {
  assert.equal(new Set(PARAGRAPHS.map(item => item.id)).size, PARAGRAPHS.length);
  assert.equal(new Set(PARAGRAPHS.map(item => item.topic)).size, PARAGRAPHS.length);
  // Every piece of text in the bank, with the paragraph it belongs to and the job it does there.
  const pieces = PARAGRAPHS.flatMap(item => [
    ...item.sentences.map(text => ({ text, id: item.id, role: 'sentence' })),
    ...Object.entries(item.options).map(([role, text]) => ({ text, id: item.id, role })),
    ...item.extras.map(text => ({ text, id: item.id, role: 'extra' })),
  ]);
  const byText = new Map();
  for (const piece of pieces) byText.set(normal(piece.text), [...(byText.get(normal(piece.text)) ?? []), piece]);
  for (const [text, uses] of byText) {
    if (uses.length === 1) continue;
    // The only repeat allowed: a main idea or detail option that is a sentence of its own paragraph, word for word.
    const [a, b] = uses;
    assert.ok(uses.length === 2 && a.id === b.id && a.role === 'sentence' && ['main', 'detail'].includes(b.role), `repeated: ${text}`);
  }
});

test('where the main idea is: first sentence at level 1, middle or end at level 2, implied at level 3', () => {
  for (const item of m.paragraphsFor(1)) {
    assert.equal(item.stated, 0, item.id);
    assert.equal(m.whereStated(item), 'first');
  }
  for (const item of m.paragraphsFor(2)) {
    assert.ok(Number.isInteger(item.stated) && item.stated >= 1 && item.stated < item.sentences.length, item.id);
    assert.ok(['middle', 'last'].includes(m.whereStated(item)), item.id);
  }
  const places = m.paragraphsFor(2).map(m.whereStated);
  assert.ok(places.filter(place => place === 'middle').length >= 4, 'some level 2 main ideas are in the middle');
  assert.ok(places.filter(place => place === 'last').length >= 4, 'and some are at the end');
  for (const item of [...m.paragraphsFor(1), ...m.paragraphsFor(2)]) {
    // The right option says what the stated sentence says.
    assert.ok(shared(item.options.main, m.statedSentence(item)) >= 3, `${item.id}: “${item.options.main}” against “${m.statedSentence(item)}”`);
    assert.equal(m.supportingSentences(item).length, item.sentences.length - 1);
    assert.ok(!m.supportingSentences(item).includes(m.statedSentence(item)));
  }
  for (const item of m.paragraphsFor(3)) {
    assert.equal(item.stated, null, item.id);
    assert.equal(m.whereStated(item), 'implied');
    assert.equal(m.statedSentence(item), null);
    assert.deepEqual(m.supportingSentences(item), item.sentences, `${item.id}: every sentence is a detail`);
    // Never stated word for word: no sentence contains the main idea, or is contained in it.
    for (const sentence of item.sentences) {
      assert.ok(!normal(sentence).includes(normal(item.options.main)) && !normal(item.options.main).includes(normal(sentence)), `${item.id}: ${sentence}`);
      // Nor does any one sentence share most of its wording.
      assert.ok(shared(item.options.main, sentence) <= contentWords(item.options.main).size / 2, `${item.id}: “${sentence}” nearly states the main idea`);
    }
  }
});

test('options: exactly one main idea, one detail, one too broad and one off topic', () => {
  for (const item of PARAGRAPHS) {
    assert.deepEqual(Object.keys(item.options), KINDS, item.id);
    assert.equal(new Set(Object.values(item.options).map(normal)).size, 4, `${item.id}: four different options`);
    for (const text of Object.values(item.options)) assert.match(text, /^[A-Z].{12,100}\.$/, `${item.id}: ${text}`);
    const paragraph = normal(m.paragraphText(item));
    // The detail comes from the paragraph: it shares words with one supporting sentence, and it is not the main idea sentence.
    assert.ok(m.supportingSentences(item).some(sentence => shared(item.options.detail, sentence) >= 1), `${item.id}: the detail option is not in the paragraph`);
    assert.ok(shared(item.options.detail, m.paragraphText(item)) >= 2, `${item.id}: the detail option is not in the paragraph`);
    if (item.stated !== null) assert.ok(shared(item.options.detail, m.statedSentence(item)) < contentWords(item.options.detail).size, `${item.id}: the detail option restates the main idea`);
    // The too-broad and off-topic options are not sentences of the paragraph.
    for (const kind of ['broad', 'off']) assert.ok(!paragraph.includes(normal(item.options[kind])), `${item.id}: ${kind}`);
    // The off-topic option really is about something else: it shares almost nothing with the paragraph.
    assert.ok(shared(item.options.off, m.paragraphText(item)) <= contentWords(item.options.off).size / 2, `${item.id}: the off-topic option is too close to the paragraph`);
    // Too broad: it never names the paragraph's own topic more narrowly than the main idea does.
    assert.notEqual(normal(item.options.broad), normal(item.options.main));
  }
  // The main idea cannot be guessed from its length.
  const longest = PARAGRAPHS.filter(({ options }) => KINDS.slice(1).every(kind => options[kind].length < options.main.length)).length;
  const shortest = PARAGRAPHS.filter(({ options }) => KINDS.slice(1).every(kind => options[kind].length > options.main.length)).length;
  assert.ok(longest <= PARAGRAPHS.length * 0.4, `the main idea is the longest option in ${longest} of ${PARAGRAPHS.length}`);
  assert.ok(shortest <= PARAGRAPHS.length * 0.4, `the main idea is the shortest option in ${shortest} of ${PARAGRAPHS.length}`);
});

test('sorting: at least three supporting sentences, and two extras that are not in the paragraph', () => {
  for (const item of PARAGRAPHS) {
    assert.ok(m.supportingSentences(item).length >= SORT_SUPPORTS, `${item.id} has ${m.supportingSentences(item).length} supporting sentences`);
    assert.equal(item.extras.length, 2, item.id);
    for (const extra of item.extras) {
      assert.match(extra, /^[A-Z].{10,90}\.$/, `${item.id}: ${extra}`);
      assert.ok(!item.sentences.includes(extra), `${item.id}: ${extra}`);
      assert.ok(!Object.values(item.options).includes(extra), `${item.id}: ${extra}`);
    }
  }
});

test('nothing in the bank breaks the rules for facts', () => {
  // Records that change, and subjects the site keeps away from.
  const banned = /\b(tallest|fastest|largest|biggest|longest|richest|population|president|prime minister|king|queen of|god|church|vaccine|medicine|diet|healthy|record|great wall|goldfish|10%|ten percent|war)\b/i;
  for (const item of PARAGRAPHS) {
    for (const text of [...item.sentences, ...Object.values(item.options), ...item.extras]) assert.ok(!banned.test(text), `${item.id}: ${text}`);
  }
  // Informational paragraphs carry no judgment words.
  const judgment = /\b(best|worst|should|beautiful|boring|amazing|awful|delicious|wonderful)\b/i;
  for (const item of PARAGRAPHS) assert.ok(!judgment.test(m.paragraphText(item)), item.id);
});

test('each paragraph reads at about the level it is offered at', () => {
  // Short paragraphs give rough grades, so the bands are the level's grades and half a grade either side.
  const bands = { 1: [1.5, 4.5], 2: [3.5, 6.5], 3: [5.5, 9.5] };
  const grades = { 1: [], 2: [], 3: [] };
  for (const item of PARAGRAPHS) {
    const grade = analyze(m.paragraphText(item)).grade;
    const [low, high] = bands[item.level];
    assert.ok(grade >= low && grade <= high, `${item.id}: grade ${grade.toFixed(1)}, level ${item.level} wants ${low} to ${high}`);
    grades[item.level].push(grade);
  }
  const mean = level => grades[level].reduce((sum, grade) => sum + grade, 0) / grades[level].length;
  assert.ok(mean(1) + 1 < mean(2) && mean(2) + 1 < mean(3), `each level is harder than the one before: ${[1, 2, 3].map(level => mean(level).toFixed(1))}`);
});

test('rounds: five paragraphs, mixed options, four or five sentences to sort, the same for the same seed', () => {
  for (const level of [1, 2, 3]) {
    const seen = new Set(), extrasSeen = new Set(), supportsSeen = new Set();
    const sizes = new Set();
    const mainAt = [0, 0, 0, 0];
    for (let seed = 1; seed <= 400; seed++) {
      const round = m.buildRound(level, seed);
      assert.equal(round.length, ROUND_LENGTH);
      assert.equal(new Set(round.map(question => question.item.id)).size, ROUND_LENGTH, `level ${level} seed ${seed}: no repeats`);
      for (const { item, options, sort } of round) {
        assert.equal(item.level, level);
        seen.add(item.id);
        assert.deepEqual(options.map(option => option.kind).sort(), [...KINDS].sort());
        for (const option of options) assert.equal(option.text, item.options[option.kind]);
        mainAt[options.findIndex(option => option.kind === 'main')]++;
        // Three details from the paragraph, in the order they have there, and one or two that do not belong.
        const supports = sort.filter(sentence => sentence.belongs).map(sentence => sentence.text);
        const extras = sort.filter(sentence => !sentence.belongs).map(sentence => sentence.text);
        assert.equal(supports.length, SORT_SUPPORTS);
        assert.ok(extras.length === 1 || extras.length === 2);
        assert.ok(sort.length === 4 || sort.length === 5);
        sizes.add(sort.length);
        assert.equal(new Set(sort.map(sentence => sentence.text)).size, sort.length);
        const places = supports.map(text => m.supportingSentences(item).indexOf(text));
        assert.ok(places.every(place => place >= 0), 'supporting sentences come from the paragraph');
        assert.deepEqual(places, [...places].sort((a, b) => a - b), 'in paragraph order');
        for (const extra of extras) { assert.ok(item.extras.includes(extra)); extrasSeen.add(extra); }
        for (const text of supports) supportsSeen.add(text);
      }
      assert.deepEqual(m.buildRound(level, seed), round, 'the same seed gives the same round');
    }
    assert.equal(seen.size, m.paragraphsFor(level).length, `level ${level}: every paragraph turns up`);
    assert.equal(extrasSeen.size, m.paragraphsFor(level).length * 2, `level ${level}: every extra sentence turns up`);
    assert.equal(supportsSeen.size, m.paragraphsFor(level).flatMap(m.supportingSentences).length, `level ${level}: every supporting sentence turns up`);
    assert.deepEqual([...sizes].sort(), [4, 5]);
    for (const count of mainAt) assert.ok(count > 400 * ROUND_LENGTH * 0.2, `level ${level}: the main idea is not always in the same place: ${mainAt}`);
  }
  assert.notDeepEqual(m.buildRound(1, 1).map(q => q.item.id), m.buildRound(1, 2).map(q => q.item.id));
  // The sentence that does not belong is not always last.
  const lastIsExtra = Array.from({ length: 200 }, (_, seed) => m.buildRound(2, seed + 1)[0].sort.at(-1).belongs).filter(belongs => !belongs).length;
  assert.ok(lastIsExtra > 30 && lastIsExtra < 170, `${lastIsExtra} of 200`);
});

test('checking answers and scoring', () => {
  const [question] = m.buildRound(2, 7);
  const mainAt = question.options.findIndex(option => option.kind === 'main');
  assert.equal(m.checkMain(question, mainAt), true);
  for (let i = 0; i < 4; i++) assert.equal(m.checkMain(question, i), i === mainAt);
  assert.equal(m.checkMain(question, 7), false);
  assert.equal(m.checkMain(question, undefined), false);
  const key = question.sort.map(sentence => sentence.belongs);
  assert.deepEqual(m.checkSort(question, key), { right: key.map(() => true), correct: key.length, total: key.length, all: true });
  const oneWrong = key.map((belongs, i) => (i === 0 ? !belongs : belongs));
  const marked = m.checkSort(question, oneWrong);
  assert.deepEqual([marked.correct, marked.total, marked.all, marked.right[0]], [key.length - 1, key.length, false, false]);
  assert.equal(m.checkSort(question, []).correct, 0, 'unanswered sentences are wrong');

  assert.equal(m.ROUND_POINTS, 10);
  assert.deepEqual(m.scoreRound([]), { main: 0, sort: 0, points: 0, total: 0, paragraphs: 0, perfect: false });
  const both = { main: true, sort: true }, mainOnly = { main: true, sort: false }, sortOnly = { main: false, sort: true }, neither = { main: false, sort: false };
  assert.deepEqual(m.scoreRound([both, both, mainOnly, sortOnly, neither]), { main: 3, sort: 3, points: 6, total: 10, paragraphs: 5, perfect: false });
  assert.equal(m.scoreRound(Array(5).fill(both)).perfect, true);
  const message = results => m.resultMessage(m.scoreRound(results));
  assert.match(message(Array(5).fill(both)), /perfect/i);
  assert.match(message([both, both, both, both, mainOnly]), /Great work/);
  assert.match(message([sortOnly, sortOnly, sortOnly, both, both]), /does this cover the whole paragraph/);
  assert.match(message([both, both, mainOnly, mainOnly, neither]), /Good start/);
  assert.match(message([mainOnly, neither, neither, neither, neither]), /Keep going/);
});

test('explanations say where the main idea is and why each wrong option is wrong', () => {
  assert.match(m.DEFINITIONS.topic, /word or a short phrase/);
  assert.match(m.DEFINITIONS.mainIdea, /most important thing the paragraph says about its topic/);
  assert.match(m.DEFINITIONS.detail, /fact or an example/);
  assert.equal(m.explainMain(m.paragraphById('a01')), 'The first sentence states the main idea. Every sentence after it is a detail that tells you more about it.');
  assert.equal(m.explainMain(m.paragraphById('b01')), 'The last sentence states the main idea: “Everything about an owl makes it a skilled night hunter.” The sentences before it are the details that lead up to it.');
  assert.match(m.explainMain(m.paragraphById('b05')), /^A sentence in the middle states the main idea: “The delay happens because light travels much faster than sound\.”/);
  assert.equal(m.explainMain(m.paragraphById('c11')), 'No sentence states the main idea. Each sentence is a detail, and together they all show one thing: Sounds are made when something vibrates.');
  assert.equal(m.whyNot(m.paragraphById('a01'), 'broad'), 'Too broad. The paragraph is only about camels, and this says much more than that.');
  assert.match(m.whyNot(m.paragraphById('a01'), 'detail'), /^Too narrow\. This is one detail\./);
  assert.match(m.whyNot(m.paragraphById('a01'), 'off'), /^Off topic\./);
  assert.match(m.explainSentence(m.paragraphById('a01'), true), /^Supports the main idea\./);
  assert.match(m.explainSentence(m.paragraphById('a01'), false), /^Does not belong\. It is true/);
  for (const item of PARAGRAPHS) {
    for (const kind of KINDS) assert.ok(!/undefined|NaN/.test(m.whyNot(item, kind)), item.id);
    assert.ok(m.whyNot(item, 'broad').includes(`only about ${item.topic},`));
  }
  assert.deepEqual(Object.keys(m.OPTION_KINDS), KINDS);
  assert.match(kindTagHtml('main'), /class="mi-tag is-main".*Main idea<\/span>$/);
  assert.match(kindTagHtml('broad'), /class="mi-tag is-not".*Too broad<\/span>$/);
  assert.match(kindTagHtml('detail'), /A detail: too narrow<\/span>$/);
  assert.match(kindTagHtml('off'), /Off topic<\/span>$/);
});

test('the paragraph as HTML: the stated main idea is marked, and only that', () => {
  for (const item of PARAGRAPHS) {
    assert.equal(strip(paragraphHtml(item)), m.paragraphText(item), item.id);
    assert.ok(!paragraphHtml(item).includes('<mark'), `${item.id}: nothing is marked before the answer`);
    const marked = [...paragraphHtml(item, true).matchAll(/<mark class="mi-stated">(.*?)<\/mark>/g)].map(match => strip(match[1]));
    assert.deepEqual(marked, item.stated === null ? [] : [m.statedSentence(item)], item.id);
    assert.equal(strip(paragraphHtml(item, true)), m.paragraphText(item), item.id);
  }
});

test('the examples the page is written around', () => {
  // The page explains these paragraphs in its own words, so pin what it relies on.
  const camels = m.paragraphById('a01');
  assert.equal(camels.topic, 'camels');
  assert.match(m.supportingSentences(camels)[0], /^Its wide feet/);
  assert.match(m.supportingSentences(camels)[1], /eyelashes/);
  assert.match(camels.extras[0], /calf/);
  assert.ok(!/camel/i.test(camels.extras[1]));
  assert.equal(m.whereStated(m.paragraphById('b01')), 'last');
  assert.equal(m.whereStated(m.paragraphById('b05')), 'middle');
  assert.equal(m.whereStated(m.paragraphById('b12')), 'last');
  const sounds = m.paragraphById('c11');
  assert.equal(sounds.topic, 'how sounds are made');
  ['guitar string', 'throat', 'drum', 'bell'].forEach((word, i) => assert.ok(sounds.sentences[i].includes(word), word));
  assert.ok(!m.paragraphText(sounds).includes('vibrat'), 'the paragraph never uses the word');
  assert.match(sounds.options.main, /vibrates/);
});

test('the worksheet and its answer key are built from the bank', () => {
  assert.ok(activities.includes(activity));
  assert.equal(activity.tool, 'main-idea');
  assert.deepEqual(activity.standards, ['RI.3.2', 'RI.4.2']);
  for (const code of activity.standards) assert.match(standards[code], /main idea/);
  const [remember, partA, partB, partC] = activity.sections;
  for (const definition of Object.values(m.DEFINITIONS)) assert.ok(remember.lines[0].includes(definition));

  // Parts A and B: a paragraph from the bank with one sentence that does not belong slipped in.
  [partA, partB].forEach((part, i) => {
    const spec = PARTS[i];
    const item = m.paragraphById(spec.id);
    assert.equal(part.type, 'main-idea');
    assert.equal(part.item, item);
    assert.deepEqual(part.sentences, m.withIntruder(item, spec.extra, spec.after));
    assert.equal(part.sentences.length, item.sentences.length + 1);
    assert.equal(part.sentences.filter(sentence => sentence.role === 'main').length, 1);
    assert.equal(part.sentences.filter(sentence => sentence.role === 'extra').length, 1);
    assert.deepEqual(part.sentences.filter(sentence => sentence.role !== 'extra').map(sentence => sentence.text), item.sentences, 'the paragraph is otherwise unchanged');
    const main = part.sentences.find(sentence => sentence.role === 'main'), extra = part.sentences.find(sentence => sentence.role === 'extra');
    assert.equal(main.text, m.statedSentence(item));
    assert.equal(extra.text, item.extras[spec.extra]);
    // The extra sentence sits inside the paragraph, not at either end, and not right after the main idea.
    const at = part.sentences.indexOf(extra);
    assert.ok(at > 0 && at < part.sentences.length - 1);
    assert.equal(part.start, 1 + i * 3);
    const [topic, mainIdea, belongs] = part.items;
    assert.equal(topic.a, `The topic is ${item.topic}.`);
    assert.ok(mainIdea.a.includes(`“${main.text}”`));
    assert.ok(mainIdea.a.includes(`Any three of the other ${m.supportingSentences(item).length} sentences`) && mainIdea.a.includes(`“${m.supportingSentences(item)[0]}”`));
    assert.ok(!mainIdea.a.includes(extra.text), 'the sentence that does not belong is not offered as a detail');
    assert.ok(belongs.a.includes(`“${extra.text}”`));
    const ordinal = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'][at];
    assert.ok(belongs.a.includes(`Cross out the ${ordinal} sentence:`));
    for (const question of part.items) assert.ok(question.q.length > 20 && question.a.length > 15 && question.lines >= 0 && question.lines <= 3);
    assert.deepEqual(part.items.map(question => question.lines), [1, 3, 0], 'a line for the topic, three for the details, none for crossing out');
  });
  assert.equal(m.paragraphById(PARTS[0].id).level, 1);
  assert.ok(partA.items[1].a.includes('The main idea is the first sentence:'));
  assert.equal(m.paragraphById(PARTS[1].id).level, 2);
  assert.ok(partB.items[1].a.includes('The main idea is the last sentence:'));

  // Part C: details in, main idea out.
  const details = m.paragraphById(DETAILS_ID);
  assert.equal(details.level, 3);
  assert.equal(partC.type, 'questions');
  assert.equal(partC.start, 7);
  const [write, trap] = partC.items;
  for (const sentence of details.sentences) assert.ok(write.q.includes(sentence));
  assert.ok(!write.q.includes(details.options.main), 'the question does not give the answer away');
  assert.ok(write.a.includes(`“${details.options.main}”`));
  const owls = m.paragraphById(PARTS[1].id);
  assert.ok(trap.q.includes(`“${owls.options.detail}”`));
  assert.ok(trap.a.startsWith(m.whyNot(owls, 'detail')) && trap.a.includes(`“${owls.options.main}”`));
  // The three paragraphs on the page are different ones.
  assert.equal(new Set([...PARTS.map(spec => spec.id), DETAILS_ID]).size, 3);
});
