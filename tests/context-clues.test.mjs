import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/lib/context-clues.mjs';
import { sentenceHtml, revealHtml, againHtml, typeTagHtml } from '../src/lib/context-clues-view.mjs';
import { activity, standards, MEANING_IDS, TYPES_FROM, WRITE_IDS } from '../src/lib/activities/context-clues.mjs';

const { ITEMS, LEVELS, CLUE_TYPES, ROUND_LENGTH } = m;
const strip = html => html.replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const wordCount = text => text.split(/\s+/).length;
const count = (text, phrase) => {
  let n = 0;
  for (let at = 0; ;) {
    const found = m.findPhrase(text.slice(at), phrase);
    if (!found) return n;
    n++;
    at += found[1];
  }
};
const TYPES = CLUE_TYPES.map(type => type.id);

test('the bank: at least 90 sentences, 30 or more per level, in the right shape', () => {
  assert.ok(ITEMS.length >= 90, `${ITEMS.length} sentences`);
  assert.deepEqual(LEVELS.map(level => level.id), [1, 2, 3]);
  for (const level of LEVELS) assert.ok(m.itemsFor(level.id).length >= 30, `level ${level.id} has ${m.itemsFor(level.id).length}`);
  const maxWords = { 1: 16, 2: 18, 3: 24 };
  for (const s of ITEMS) {
    assert.match(s.id, /^[abc]\d\d$/, s.id);
    assert.equal(s.id[0], 'abc'[s.level - 1], `${s.id} is filed under its level`);
    assert.ok(TYPES.includes(s.type), s.id);
    assert.ok(LEVELS[s.level - 1].types.includes(s.type), `${s.id}: ${s.type} clues are not used at level ${s.level}`);
    assert.match(s.text, /^[A-Z].{20,130}[.]$/, `${s.id}: one or two plain sentences`);
    assert.ok(!/\s{2}|\n|—/.test(s.text + s.again), `${s.id}: no double spaces, line breaks or em dashes`);
    assert.ok(wordCount(s.text) <= maxWords[s.level], `${s.id} has ${wordCount(s.text)} words, too long for level ${s.level}`);
    assert.match(s.word, /^[a-z]+$/, `${s.id}: the target is one word`);
    assert.match(s.again, /^[A-Z].{12,80}[.?]$/, `${s.id}: one more sentence`);
    assert.ok(wordCount(s.again) <= 14, `${s.id}: the extra sentence is short`);
  }
  // Every clue type its level uses has enough sentences to fill a round.
  for (const level of LEVELS) for (const type of level.types) assert.ok(m.itemsFor(level.id, type).length >= 6, `level ${level.id} ${type}: ${m.itemsFor(level.id, type).length}`);
});

test('no duplicates: every id, sentence and target word appears once', () => {
  for (const pick of [s => s.id, s => s.text.toLowerCase(), s => s.word, s => s.again.toLowerCase()]) assert.equal(new Set(ITEMS.map(pick)).size, ITEMS.length);
  for (const s of ITEMS) assert.equal(m.itemById(s.id), s);
});

test('every sentence holds its target word once, and its clue and signal exactly as written', () => {
  for (const s of ITEMS) {
    assert.equal(count(s.text, s.word), 1, `${s.id}: “${s.word}” appears once, as a whole word`);
    assert.equal(count(s.again, s.word), 1, `${s.id}: the extra sentence uses “${s.word}” once`);
    assert.notEqual(s.again, s.text, s.id);
    assert.ok(s.clues.length >= 1 && s.clues.length <= 2, s.id);
    for (const clue of s.clues) {
      assert.ok(s.text.includes(clue), `${s.id}: the clue “${clue}” is in the sentence, letter for letter`);
      assert.equal(count(s.text, clue), 1, `${s.id}: “${clue}” appears once`);
    }
    const type = m.clueType(s.type);
    if (s.signal) {
      assert.ok(s.text.includes(s.signal), `${s.id}: the signal “${s.signal}” is in the sentence, letter for letter`);
      assert.equal(count(s.text, s.signal), 1, `${s.id}: “${s.signal}” appears once as whole words`);
      assert.ok(type.signals.includes(s.signal.toLowerCase()), `${s.id}: “${s.signal}” is a listed ${s.type} signal`);
    }
    if (s.type === 'inference') assert.equal(s.signal, '', `${s.id}: an inference clue has no signal word`);
    if (s.type === 'antonym' || s.type === 'example') assert.ok(s.signal, `${s.id}: ${s.type} clues carry a signal word`);
    // The marked stretches do not overlap.
    const marked = m.ranges(s);
    assert.equal(marked.length, 1 + s.clues.length + (s.signal ? 1 : 0));
    marked.forEach((range, i) => { if (i) assert.ok(range.start >= marked[i - 1].end, `${s.id}: the word, clue and signal do not overlap`); });
    // No signal words of another kind of clue in an inference sentence.
    if (s.type === 'inference') for (const signal of ['which means', 'that is', 'such as', 'for example', 'including', 'unlike', 'however', 'but']) assert.equal(count(s.text, signal), 0, `${s.id}: “${signal}” in an inference sentence`);
  }
});

test('a definition sits beside its word; other clues do not use a defining phrase', () => {
  for (const s of ITEMS) {
    const marked = m.ranges(s);
    const word = marked.find(range => range.kind === 'word'), clue = marked.find(range => range.kind === 'clue');
    if (s.type === 'definition') {
      assert.ok(clue.start > word.end && clue.start - word.end <= 30, `${s.id}: the definition follows the word closely`);
      assert.ok(s.signal || /[(,–]/.test(s.text.slice(word.end, clue.start)), `${s.id}: set apart by a signal or by punctuation`);
    } else {
      for (const phrase of ['which means', 'that means', 'that is', 'meaning']) assert.equal(count(s.text, phrase), 0, `${s.id}: “${phrase}” would make this a definition clue`);
      assert.ok(!/[(–]/.test(s.text), `${s.id}: parentheses and dashes are for definition clues`);
    }
    // A synonym or antonym clue is a short word or phrase, not an explanation.
    if (s.type === 'synonym') assert.ok(s.clues.length === 1 && wordCount(s.clues[0]) <= 3, `${s.id}: a synonym is a word or a short phrase`);
    if (s.type === 'example') assert.ok(s.clues[0].split(/, | and | or /).length === 3, `${s.id}: three examples`);
  }
});

test('four meanings for every sentence: one right, three wrong, none giving the answer away', () => {
  for (const s of ITEMS) {
    assert.equal(s.wrong.length, 3, s.id);
    const all = [s.meaning, ...s.wrong];
    assert.equal(new Set(all.map(text => text.toLowerCase())).size, 4, `${s.id}: four different meanings`);
    for (const option of all) {
      assert.match(option, /^[a-z][^.!?]{2,60}$/, `${s.id}: “${option}” is a short phrase with no capital or full stop`);
      assert.equal(count(option, s.word), 0, `${s.id}: “${option}” uses the word itself`);
    }
    // The right meaning is in other words than the clue, so it cannot be matched by eye.
    assert.ok(!s.text.toLowerCase().includes(s.meaning.toLowerCase()), `${s.id}: the meaning “${s.meaning}” is copied from the sentence`);
    for (const clue of s.clues) assert.notEqual(s.meaning.toLowerCase(), clue.toLowerCase(), s.id);
    for (const option of s.wrong) for (const clue of s.clues) assert.ok(!option.toLowerCase().includes(clue.toLowerCase()), `${s.id}: the wrong meaning “${option}” contains the clue`);
  }
});

test('nothing in the bank breaks the content rules', () => {
  const banned = /\b(tallest|fastest|largest|biggest|longest|richest|population|president|prime minister|king|queen|god|church|vaccine|medicine|diet|healthy|war|kill|dead|died|blood|gun)\b/i;
  for (const s of ITEMS) for (const text of [s.text, s.again, s.meaning, ...s.wrong]) assert.ok(!banned.test(text), `${s.id}: ${text}`);
});

test('pieces, words and the HTML views all rebuild the sentence', () => {
  for (const s of ITEMS) {
    assert.equal(m.pieces(s).map(piece => piece.text).join(''), s.text, s.id);
    assert.equal(m.pieces(s, false).map(piece => piece.text).join(''), s.text, s.id);
    assert.deepEqual(m.pieces(s, false).filter(piece => piece.kind).map(piece => piece.kind), ['word']);
    assert.equal(m.pieces(s).filter(piece => piece.kind === 'word')[0].text.toLowerCase(), s.word);
    assert.deepEqual(m.pieces(s).filter(piece => piece.kind === 'clue').map(piece => piece.text).sort(), [...s.clues].sort());
    const tokens = m.words(s);
    assert.deepEqual(tokens.filter(word => word.target).map(word => word.text.toLowerCase()), [s.word], `${s.id}: one target word`);
    assert.ok(tokens.some(word => word.clue), `${s.id}: at least one word can be tapped as a clue`);
    assert.ok(tokens.some(word => !word.clue && !word.target), `${s.id}: and at least one cannot`);
    assert.ok(!tokens.some(word => word.clue && word.target), s.id);
    for (const word of tokens) assert.equal(s.text.slice(word.start, word.end), word.text);
    const clueWords = tokens.filter(word => word.clue).map(word => word.text).join(' ');
    for (const clue of s.clues) for (const part of clue.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)) assert.ok(clueWords.includes(part), `${s.id}: “${part}” can be tapped`);
    assert.equal(strip(sentenceHtml(s)), s.text, s.id);
    assert.equal(strip(revealHtml(s)), s.text, s.id);
    assert.equal(strip(againHtml(s)), s.again, s.id);
    assert.equal((sentenceHtml(s).match(/<strong class="cc-word">/g) ?? []).length, 1);
    assert.ok(!sentenceHtml(s).includes('<mark'), `${s.id}: the clue is not shown before the answer`);
    assert.equal((revealHtml(s).match(/<mark class="cc-clue">/g) ?? []).length, s.clues.length);
    assert.equal((revealHtml(s).match(/<mark class="cc-signal">/g) ?? []).length, s.signal ? 1 : 0);
    assert.equal((againHtml(s).match(/<strong class="cc-word">/g) ?? []).length, 1);
  }
});

test('the clue types: five, each with signals and two examples from the bank', () => {
  assert.deepEqual(TYPES, ['definition', 'synonym', 'antonym', 'example', 'inference']);
  assert.deepEqual(LEVELS.map(level => level.types.length), [2, 4, 5]);
  for (const type of CLUE_TYPES) {
    assert.equal(m.clueType(type.id), type);
    assert.ok(type.what.length > 20 && type.look.length > 20, type.id);
    assert.equal(type.signals.length > 0, type.id !== 'inference');
    assert.equal(type.examples.length, 2);
    for (const id of type.examples) assert.equal(m.itemById(id).type, type.id, `${id} is an example of ${type.id}`);
    // Every listed signal is used by a sentence in the bank.
    for (const signal of type.signals) assert.ok(ITEMS.some(s => s.type === type.id && s.signal.toLowerCase() === signal), `no ${type.id} sentence uses “${signal}”`);
    assert.match(typeTagHtml(type.id), new RegExp(`^<span class="cc-type">${type.name}</span>$`));
  }
  // No signal word belongs to two types.
  const all = CLUE_TYPES.flatMap(type => type.signals);
  assert.equal(new Set(all).size, all.length);
  assert.match(m.DEFINITION, /words around an unknown word/);
});

test('explanations: the meaning, the type of clue, how the clue works and one more sentence', () => {
  assert.equal(m.meaningSentence(m.itemById('a01')), '“enormous” means very large.');
  assert.equal(m.clueNote(m.itemById('a01')), 'The sentence tells you the meaning: “very big”. The signal is “or”.');
  assert.equal(m.clueNote(m.itemById('a07')), 'The sentence tells you the meaning: “one that runs very fast”. The commas set it apart.');
  assert.equal(m.clueNote(m.itemById('a15')), 'The sentence tells you the meaning: “went out of sight”. The parentheses set it apart.');
  assert.equal(m.clueNote(m.itemById('b03')), 'The sentence tells you the meaning: “a long time with almost no rain”. The comma sets it apart.');
  assert.equal(m.clueNote(m.itemById('b07')), 'The sentence tells you the meaning: “it bends easily without breaking”. The dash sets it apart.');
  assert.equal(m.clueNote(m.itemById('c06')), 'The sentence tells you the meaning: “work together”. The dashes set it apart.');
  assert.equal(m.clueNote(m.itemById('a18')), '“tired” means nearly the same as “exhausted”. The signal is “just as”.');
  assert.equal(m.clueNote(m.itemById('a17')), '“huge” means nearly the same as “gigantic”.');
  assert.equal(m.clueNote(m.itemById('b19')), '“selfish” is the opposite idea. The signal is “Unlike”.');
  assert.equal(m.clueNote(m.itemById('b26')), 'The examples show what kind of thing is meant: “lemonade, milk and iced tea”. The signal is “such as”.');
  assert.equal(m.clueNote(m.itemById('c29')), 'There is no signal word. The clue is what is happening: “skipped breakfast and lunch” and “ate three sandwiches in a row”.');
  assert.equal(m.explain(m.itemById('c15')), '“reluctant” means unwilling and holding back. Clue type: antonym or contrast. “eager” is the opposite idea. The signal is “but”. One more sentence: The reluctant puppy would not step into the bath.');
  for (const s of ITEMS) {
    assert.ok(!/undefined|NaN/.test(m.explain(s)), s.id);
    assert.ok(m.explain(s).includes(s.meaning) && m.explain(s).includes(s.again) && m.explain(s).includes(m.clueNote(s)), s.id);
    // Definitions with no signal word are set apart by punctuation the note can name.
    if (s.type === 'definition' && !s.signal) assert.match(m.clueNote(s), /The (parentheses|dashes|commas) set it apart\.$|The (dash|comma) sets it apart\.$/, s.id);
  }
});

test('rounds: ten sentences, no repeats, a mix of clue types and question kinds, the same for the same seed', () => {
  const kinds = { 1: { meaning: 10 }, 2: { meaning: 6, clue: 4 }, 3: { meaning: 4, clue: 3, type: 3 } };
  for (const level of [1, 2, 3]) {
    const seen = new Set(), positions = new Set(), asked = new Set();
    for (let seed = 1; seed <= 300; seed++) {
      const round = m.buildRound(level, seed);
      assert.equal(round.length, ROUND_LENGTH);
      assert.equal(new Set(round.map(q => q.item.id)).size, ROUND_LENGTH, `level ${level} seed ${seed}: no repeats`);
      const modes = {};
      for (const q of round) {
        assert.equal(q.item.level, level);
        seen.add(q.item.id);
        asked.add(`${q.item.id}:${q.mode}`);
        modes[q.mode] = (modes[q.mode] ?? 0) + 1;
        assert.deepEqual([...q.options].sort(), [q.item.meaning, ...q.item.wrong].sort(), 'the four meanings, shuffled');
        positions.add(q.options.indexOf(q.item.meaning));
        if (q.item.type === 'inference') assert.notEqual(q.mode, 'clue', 'an inference clue is never a tap-the-clue question');
      }
      assert.deepEqual(modes, kinds[level], `level ${level} seed ${seed}`);
      const perType = LEVELS[level - 1].types.map(type => round.filter(q => q.item.type === type).length);
      if (level === 1) assert.ok(perType.every(n => n >= 4 && n <= 6), `level 1 seed ${seed}: ${perType}`);
      if (level === 2) assert.deepEqual([...perType].sort(), [2, 2, 3, 3], `level 2 seed ${seed}: ${perType}`);
      if (level === 3) assert.deepEqual(perType, [2, 2, 2, 2, 2], `level 3 seed ${seed}: ${perType}`);
      assert.deepEqual(m.buildRound(level, seed), round, 'the same seed gives the same round');
    }
    assert.equal(seen.size, m.itemsFor(level).length, `level ${level}: every sentence turns up`);
    assert.equal(positions.size, 4, 'the right meaning turns up in every position');
    // Every sentence is asked in every way its level allows.
    for (const s of m.itemsFor(level)) for (const mode of Object.keys(kinds[level])) if (!(mode === 'clue' && s.type === 'inference')) assert.ok(asked.has(`${s.id}:${mode}`), `${s.id} is never asked as “${mode}”`);
  }
  assert.notDeepEqual(m.buildRound(1, 1).map(q => q.item.id), m.buildRound(1, 2).map(q => q.item.id));
  const orders = new Set(Array.from({ length: 50 }, (_, seed) => m.buildRound(2, seed + 1).map(q => q.mode[0]).join('')));
  assert.ok(orders.size > 40, 'the kinds of question come in a different order each round');
});

test('the seeded random number generator is steady and spread out', () => {
  const a = m.seededRandom(42), b = m.seededRandom(42);
  assert.deepEqual(Array.from({ length: 5 }, a), Array.from({ length: 5 }, b));
  const many = Array.from({ length: 2000 }, m.seededRandom(7));
  assert.ok(many.every(v => v >= 0 && v < 1));
  const mean = many.reduce((sum, v) => sum + v, 0) / many.length;
  assert.ok(Math.abs(mean - 0.5) < 0.03, `mean ${mean}`);
});

test('checking answers in each kind of question', () => {
  const enormous = m.itemById('a01');
  const options = ['very old', 'very large', 'very noisy', 'very friendly'];
  assert.deepEqual([0, 1, 2, 3, 4, -1, undefined].map(i => m.checkAnswer({ item: enormous, mode: 'meaning', options }, i)), [false, true, false, false, false, false, false]);
  // "Unlike his selfish cousin, Raj is generous with his toys."
  const generous = m.itemById('b19');
  const tapped = m.words(generous).map((word, i) => [word.text, m.checkAnswer({ item: generous, mode: 'clue', options: [] }, i)]);
  assert.deepEqual(tapped.filter(([, right]) => right).map(([word]) => word), ['Unlike', 'selfish']);
  assert.equal(m.checkAnswer({ item: generous, mode: 'clue', options: [] }, m.words(generous).findIndex(word => word.target)), false, 'the word itself is not its own clue');
  assert.equal(m.checkAnswer({ item: generous, mode: 'clue', options: [] }, 99), false);
  // "Precipitation, for example rain, snow or hail, fills the rivers."
  assert.deepEqual(m.words(m.itemById('b28')).filter(word => word.clue).map(word => word.text), ['for', 'example', 'rain', 'snow', 'or', 'hail']);
  for (const s of ITEMS) {
    for (const type of TYPES) assert.equal(m.checkAnswer({ item: s, mode: 'type', options: [] }, type), type === s.type, s.id);
    const all = [s.meaning, ...s.wrong];
    assert.deepEqual(all.map((_, i) => m.checkAnswer({ item: s, mode: 'meaning', options: all }, i)), [true, false, false, false], s.id);
  }
});

test('scoring: points, best streak and the message', () => {
  assert.deepEqual(m.scoreRound([]), { correct: 0, total: 0, bestStreak: 0, perfect: false });
  assert.deepEqual(m.scoreRound([true, true, false, true, true, true, false, true, true, true]), { correct: 8, total: 10, bestStreak: 3, perfect: false });
  assert.deepEqual(m.scoreRound(Array(10).fill(true)), { correct: 10, total: 10, bestStreak: 10, perfect: true });
  const messages = [10, 8, 5, 4].map(correct => m.resultMessage({ correct, total: 10 }));
  assert.equal(new Set(messages).size, 4);
  assert.match(messages[0], /perfect/i);
  assert.equal(m.resultMessage({ correct: 9, total: 10 }), messages[1]);
});

test('the worksheet and its answer key are built from the bank', () => {
  const [remember, meanings, types, yourTurn] = activity.sections;
  assert.ok(remember.lines[0].includes(m.DEFINITION));
  assert.deepEqual(meanings.items, MEANING_IDS.map(m.itemById));
  assert.equal(meanings.items.length, 8);
  assert.equal(new Set(MEANING_IDS).size, 8);
  // Every type of clue is on the sheet, and all three levels.
  assert.deepEqual([...new Set(meanings.items.map(s => s.type))].sort(), [...TYPES].sort());
  assert.deepEqual([...new Set(meanings.items.map(s => s.level))].sort(), [1, 2, 3]);
  // Part B asks for the type of the last four sentences, by their numbers on the sheet.
  assert.equal(types.start, TYPES_FROM);
  assert.deepEqual(types.items, meanings.items.slice(TYPES_FROM - 1));
  assert.equal(types.items.length, 4);
  assert.equal(new Set(types.items.map(s => s.type)).size, 4, 'four different types to name');
  assert.ok(types.intro.includes(`sentences ${TYPES_FROM} to 8`));
  // Part C: the two words, with the bank's own sentence as the model answer.
  assert.equal(yourTurn.items.length, 2);
  WRITE_IDS.map(m.itemById).forEach((s, i) => {
    assert.ok(!MEANING_IDS.includes(s.id), 'a word that is not already on the sheet');
    assert.ok(yourTurn.items[i].q.includes(`“${s.word}”`));
    assert.ok(yourTurn.items[i].a.includes(s.text) && yourTurn.items[i].a.includes(m.meaningSentence(s)));
  });
  assert.deepEqual(activity.standards, Object.keys(standards));
  assert.equal(activity.tool, 'context-clues');
});
