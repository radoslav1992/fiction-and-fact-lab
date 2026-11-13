import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/lib/fact-opinion.mjs';
import { revealHtml, tagHtml } from '../src/lib/fact-opinion-view.mjs';
import { activity, SORT_IDS, MIXED_IDS } from '../src/lib/activities/fact-or-opinion.mjs';

const { STATEMENTS, LEVELS, ROUND_LENGTH } = m;
const strip = html => html.replace(/<sup[^>]*>.*?<\/sup>/g, '').replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

test('the bank: at least 90 statements, 30 or more per level, in the right shape', () => {
  assert.ok(STATEMENTS.length >= 90, `${STATEMENTS.length} statements`);
  assert.deepEqual(LEVELS.map(level => level.id), [1, 2, 3]);
  for (const level of LEVELS) assert.ok(m.statementsFor(level.id).length >= 30, `level ${level.id} has ${m.statementsFor(level.id).length}`);
  for (const s of STATEMENTS) {
    assert.match(s.id, /^[abc]\d\d$/, s.id);
    assert.equal(s.id[0], 'abc'[s.level - 1], `${s.id} is filed under its level`);
    assert.ok(['fact', 'opinion', 'mixed'].includes(s.kind), s.id);
    assert.equal(s.kind === 'mixed', s.level === 3, `${s.id}: mixed sentences are level 3, and level 3 is all mixed`);
    assert.match(s.text, /^[A-Z].{12,110}[.]$/, `${s.id}: one plain sentence`);
    assert.ok(!/\s{2}|\n/.test(s.text), s.id);
    assert.ok(s.text.split(' ').length <= 22, `${s.id} is short enough to read on a phone`);
    if (s.kind !== 'mixed') assert.ok(s.why.length > 15 && s.why.endsWith('.'), `${s.id}: an explanation`);
    if (s.kind === 'fact') assert.equal(s.clues, undefined, `${s.id}: facts have no clue words`);
  }
  // Levels 1 and 2 are evenly split, so a round can always be built with a mix.
  for (const level of [1, 2]) {
    assert.ok(m.statementsFor(level, 'fact').length >= 15, `level ${level} facts`);
    assert.ok(m.statementsFor(level, 'opinion').length >= 15, `level ${level} opinions`);
  }
});

test('no duplicates: every id and every statement appears once', () => {
  assert.equal(new Set(STATEMENTS.map(s => s.id)).size, STATEMENTS.length);
  const normal = s => s.text.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  assert.equal(new Set(STATEMENTS.map(normal)).size, STATEMENTS.length);
  for (const s of STATEMENTS) assert.equal(m.statementById(s.id), s);
});

test('every opinion lists clue words, and each one appears in its text', () => {
  for (const s of STATEMENTS.filter(s => s.kind !== 'fact')) {
    assert.ok(s.clues.length >= 1 && s.clues.length <= 2, s.id);
    for (const clue of s.clues) {
      assert.ok(new RegExp(`(^|[^\\p{L}])${clue}([^\\p{L}]|$)`, 'u').test(s.text), `${s.id}: “${clue}” as a whole word in “${s.text}”`);
      assert.equal(s.text.split(clue).length, 2, `${s.id}: “${clue}” appears exactly once`);
    }
    const ranges = m.clueRanges(s);
    ranges.forEach(([start, end], i) => assert.equal(s.text.slice(start, end), s.clues[i]));
    assert.ok(m.words(s).some(word => word.clue), `${s.id}: at least one word can be tapped as a clue`);
    assert.ok(m.words(s).some(word => !word.clue), `${s.id}: and at least one cannot`);
    assert.equal(m.withClues(s).map(piece => piece.text).join(''), s.text);
    assert.deepEqual(m.withClues(s).filter(piece => piece.clue).map(piece => piece.text), [...s.clues].sort((a, b) => s.text.indexOf(a) - s.text.indexOf(b)));
  }
});

test('every mixed sentence: the opinion part is inside the sentence, with its clue words inside it', () => {
  for (const s of m.statementsFor(3)) {
    const at = s.text.indexOf(s.opinion);
    assert.ok(at >= 0, `${s.id}: “${s.opinion}” is part of the sentence`);
    assert.equal(s.text.indexOf(s.opinion, at + 1), -1, `${s.id}: the opinion part appears once`);
    assert.ok(s.opinion.length < s.text.length - 12, `${s.id}: there is a fact left over`);
    for (const [start, end] of m.clueRanges(s)) assert.ok(start >= at && end <= at + s.opinion.length, `${s.id}: clue inside the opinion part`);
    const pieces = m.parts(s);
    assert.ok(pieces.length === 2 || pieces.length === 3, s.id);
    assert.equal(pieces.filter(part => part.kind === 'opinion').length, 1, s.id);
    assert.equal(pieces.map(part => part.text).join(''), s.text, `${s.id}: the parts make the whole sentence`);
    for (const part of pieces) assert.equal(s.text.slice(part.start, part.start + part.text.length), part.text);
    assert.equal(pieces.find(part => part.kind === 'opinion').text.replace(/[\s,.]+$/, ''), s.opinion);
    assert.equal(strip(revealHtml(s)), s.text);
  }
  // The opinion is not always at the end, so its position gives nothing away.
  const positions = m.statementsFor(3).map(s => m.parts(s).findIndex(part => part.kind === 'opinion'));
  assert.ok(positions.filter(p => p === 0).length >= 5, 'some opinions come first');
  assert.ok(positions.filter(p => p > 0).length >= 5, 'some come later');
});

test('nothing in the bank breaks the rules for facts', () => {
  // Records that change, and well-known false "facts".
  const banned = /\b(tallest|fastest|largest|biggest|longest|richest|population|president|prime minister|king|queen|god|church|vaccine|medicine|diet|healthy|great wall|goldfish|taste map|10%|ten percent|lightning never|record)\b/i;
  for (const s of STATEMENTS) assert.ok(!banned.test(s.text), `${s.id}: ${s.text}`);
  // Facts carry no judgment words.
  const judgment = /\b(best|worst|better|should|beautiful|boring|too|think|believe|nicest|amazing|awful|delicious)\b/i;
  for (const s of STATEMENTS.filter(s => s.kind === 'fact')) assert.ok(!judgment.test(s.text), `${s.id}: ${s.text}`);
});

test('rounds: ten statements, no repeats, a mix of both kinds, the same for the same seed', () => {
  for (const level of [1, 2, 3]) {
    const seen = new Set();
    for (let seed = 1; seed <= 300; seed++) {
      const round = m.buildRound(level, seed);
      assert.equal(round.length, ROUND_LENGTH);
      assert.equal(new Set(round.map(q => q.item.id)).size, ROUND_LENGTH, `level ${level} seed ${seed}: no repeats`);
      for (const q of round) { assert.equal(q.item.level, level); seen.add(q.item.id); }
      if (level === 3) {
        assert.equal(round.filter(q => q.mode === 'part').length, 5);
        assert.equal(round.filter(q => q.mode === 'clue').length, 5);
      } else {
        const facts = round.filter(q => q.item.kind === 'fact').length;
        assert.ok(facts >= 4 && facts <= 6, `level ${level} seed ${seed}: ${facts} facts`);
        assert.ok(round.every(q => q.mode === 'sort'));
      }
      assert.deepEqual(m.buildRound(level, seed), round, 'the same seed gives the same round');
    }
    assert.equal(seen.size, m.statementsFor(level).length, `level ${level}: every statement turns up`);
  }
  assert.notDeepEqual(m.buildRound(1, 1).map(q => q.item.id), m.buildRound(1, 2).map(q => q.item.id));
  // The order is not "facts first".
  const orders = new Set(Array.from({ length: 50 }, (_, seed) => m.buildRound(2, seed + 1).map(q => q.item.kind[0]).join('')));
  assert.ok(orders.size > 40);
});

test('the seeded random number generator is steady and spread out', () => {
  const a = m.seededRandom(42), b = m.seededRandom(42);
  const first = Array.from({ length: 5 }, a);
  assert.deepEqual(first, Array.from({ length: 5 }, b));
  const many = Array.from({ length: 2000 }, m.seededRandom(7));
  assert.ok(many.every(v => v >= 0 && v < 1));
  const mean = many.reduce((sum, v) => sum + v, 0) / many.length;
  assert.ok(Math.abs(mean - 0.5) < 0.03, `mean ${mean}`);
});

test('checking answers in each mode', () => {
  const sort = id => ({ item: m.statementById(id), mode: 'sort' });
  assert.equal(m.checkAnswer(sort('a01'), 'fact'), true);
  assert.equal(m.checkAnswer(sort('a01'), 'opinion'), false);
  assert.equal(m.checkAnswer(sort('a17'), 'opinion'), true);
  assert.equal(m.checkAnswer(sort('a17'), 'fact'), false);
  assert.equal(m.checkAnswer(sort('a17'), undefined), false);
  // "Mercury, the dullest planet, is the closest planet to the Sun."
  const mercury = m.statementById('c10');
  assert.deepEqual(m.parts(mercury).map(part => part.kind), ['fact', 'opinion', 'fact']);
  assert.deepEqual([0, 1, 2, 3, -1].map(i => m.checkAnswer({ item: mercury, mode: 'part' }, i)), [false, true, false, false, false]);
  const tapped = m.words(mercury).map((word, i) => [word.text, m.checkAnswer({ item: mercury, mode: 'clue' }, i)]);
  assert.deepEqual(tapped.filter(([, right]) => right).map(([word]) => word), ['dullest']);
  // "I think owls are wonderful, and it is true that most owls hunt at night."
  const owls = m.statementById('c08');
  assert.deepEqual(m.words(owls).filter(word => word.clue).map(word => word.text), ['I', 'think', 'wonderful']);
  assert.equal(m.words(owls).find(word => word.text === 'most').clue, false, '“most” in the fact part is not a clue');
  for (const s of STATEMENTS.filter(s => s.kind !== 'mixed')) {
    assert.equal(m.checkAnswer({ item: s, mode: 'sort' }, s.kind), true);
    assert.equal(m.checkAnswer({ item: s, mode: 'sort' }, s.kind === 'fact' ? 'opinion' : 'fact'), false);
  }
});

test('scoring: points, best streak and the message', () => {
  assert.deepEqual(m.scoreRound([]), { correct: 0, total: 0, bestStreak: 0, perfect: false });
  assert.deepEqual(m.scoreRound([true, true, false, true, true, true, false, true, true, true]), { correct: 8, total: 10, bestStreak: 3, perfect: false });
  assert.deepEqual(m.scoreRound(Array(10).fill(true)), { correct: 10, total: 10, bestStreak: 10, perfect: true });
  assert.deepEqual(m.scoreRound(Array(10).fill(false)), { correct: 0, total: 10, bestStreak: 0, perfect: false });
  const messages = [10, 8, 5, 4].map(correct => m.resultMessage({ correct, total: 10 }));
  assert.equal(new Set(messages).size, 4);
  assert.match(messages[0], /perfect/i);
  assert.equal(m.resultMessage({ correct: 9, total: 10 }), messages[1]);
});

test('explanations use the definitions and name the clue words', () => {
  assert.match(m.DEFINITIONS.fact, /can be checked and shown to be true/);
  assert.match(m.DEFINITIONS.opinion, /thinks, feels or believes.*disagree/);
  assert.equal(m.explain(m.statementById('a01')), 'This is a fact. You can count the sides.');
  assert.equal(m.explain(m.statementById('a17')), 'This is an opinion. The clue word is “best”. Someone else might say cats or fish are the best pets.');
  assert.match(m.explain(m.statementById('a28')), /The clue words are “I think” and “greatest”\./);
  assert.equal(m.explain(m.statementById('c05')), 'The opinion is “Saturday is the best one”. The clue word is “best”. People can disagree about it. The rest of the sentence can be checked.');
  for (const s of STATEMENTS) {
    assert.ok(!/undefined|NaN/.test(m.explain(s)), s.id);
    assert.equal(strip(revealHtml(s)), s.text, s.id);
  }
  // The clue-word table's examples are statements from the bank, and each uses one of its row's words.
  for (const group of m.CLUE_WORDS) {
    const statement = STATEMENTS.find(s => s.text === group.example);
    assert.ok(statement && statement.kind === 'opinion', group.example);
    assert.ok(group.words.some(word => statement.clues.some(clue => clue.includes(word))), group.job);
  }
  assert.match(tagHtml('fact'), /class="tag fact".*Fact<\/span>$/);
  assert.match(tagHtml('opinion'), /class="tag opinion".*Opinion<\/span>$/);
});

test('the worksheet and its answer key are built from the bank', () => {
  const [, sort, mixed, yourTurn] = activity.sections;
  assert.deepEqual(sort.items, SORT_IDS.map(m.statementById));
  assert.deepEqual(mixed.items, MIXED_IDS.map(m.statementById));
  assert.equal(sort.items.length, 10);
  assert.equal(sort.items.filter(s => s.kind === 'fact').length, 5);
  assert.equal(sort.items.filter(s => s.kind === 'opinion').length, 5);
  assert.ok(sort.items.some(s => s.level === 1) && sort.items.some(s => s.level === 2));
  // Not simply alternating F, O, F, O.
  const order = sort.items.map(s => s.kind[0]).join('');
  assert.ok(!/^(fo)+$|^(of)+$/.test(order), order);
  assert.equal(mixed.items.length, 4);
  assert.ok(mixed.items.every(s => s.kind === 'mixed'));
  assert.equal(new Set([...SORT_IDS, ...MIXED_IDS]).size, 14);
  // Question 2 points at the statement that has a number in it but is an opinion.
  const number = Number(yourTurn.items[1].q.match(/statement (\d+) in Part A/)[1]);
  const pointed = sort.items[number - 1];
  assert.equal(pointed.kind, 'opinion');
  assert.match(pointed.text, /\d/);
  assert.ok(yourTurn.items[1].a.includes(pointed.text.replace(/\.$/, '')) && yourTurn.items[1].a.includes(pointed.why));
  assert.ok(activity.sections[0].lines[0].includes(m.DEFINITIONS.fact) && activity.sections[0].lines[0].includes(m.DEFINITIONS.opinion));
});
