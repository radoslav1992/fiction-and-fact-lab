import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/lib/fiction-or-nonfiction.mjs';
import { revealHtml, tagHtml } from '../src/lib/fiction-or-nonfiction-view.mjs';
import { activity, SORT_IDS, FROG_IDS } from '../src/lib/activities/fiction-or-nonfiction.mjs';

const { ITEMS, LEVELS, GENRES, CLUES, OVERLAPS, ROUND_LENGTH } = m;
const strip = html => html.replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const words = text => text.split(/\s+/).length;
// A sentence ends at . ! or ? (and a closing quote) when a capital letter or an opening quote follows.
const sentences = text => text.split(/(?<=[.!?][”"]?)\s+(?=[“"A-Z])/).length;
const genreIds = GENRES.map(g => g.id);

test('the bank: 30 or more items per level, in the right shape', () => {
  assert.deepEqual(LEVELS.map(level => level.id), [1, 2, 3]);
  for (const level of LEVELS) assert.ok(m.itemsFor(level.id).length >= 30, `level ${level.id} has ${m.itemsFor(level.id).length}`);
  for (const item of ITEMS) {
    assert.match(item.id, /^[abc]\d\d$/, item.id);
    assert.equal(item.id[0], 'abc'[item.level - 1], `${item.id} is filed under its level`);
    assert.ok(['passage', 'description'].includes(item.form), item.id);
    assert.match(item.text, /^[“A-Z0-9]/, `${item.id} starts with a capital`);
    assert.match(item.text, /[.!?”]$/, `${item.id} ends with punctuation`);
    assert.ok(!/ {2}|—|\t|\s$|^\s/.test(item.text), `${item.id}: spacing and dashes`);
    assert.ok(!/["']/.test(item.text + item.why), `${item.id}: curly quotes only`);
    assert.ok(item.why.length > 20 && item.why.endsWith('.'), `${item.id}: an explanation`);
    assert.ok(!/—|undefined|NaN/.test(m.explain(item)), item.id);
    if (item.level < 3) {
      assert.ok(['fiction', 'nonfiction'].includes(item.kind), item.id);
      assert.equal(item.genre, undefined, item.id);
    } else {
      assert.ok(genreIds.includes(item.genre), item.id);
      assert.equal(item.kind, undefined, item.id);
    }
  }
});

test('the reading load fits each level', () => {
  for (const item of m.itemsFor(1)) {
    assert.equal(item.form, 'passage', item.id);
    assert.ok(sentences(item.text) <= 2 && words(item.text) <= 20, `${item.id}: one or two short sentences`);
  }
  for (const item of m.itemsFor(2)) {
    const count = sentences(item.text);
    if (item.form === 'passage') assert.ok(count >= 3 && count <= 5, `${item.id}: ${count} sentences`);
    else assert.ok(count <= 2 && /^A /.test(item.text), `${item.id}: a short description of a book`);
    assert.ok(words(item.text) <= 60, `${item.id}: ${words(item.text)} words`);
  }
  for (const item of m.itemsFor(3)) assert.ok(words(item.text) >= 20 && words(item.text) <= 60, `${item.id}: ${words(item.text)} words`);
  // A line break appears only in a poem.
  for (const item of ITEMS) assert.equal(item.text.includes('\n'), item.genre === 'poetry' && item.form === 'passage', item.id);
});

test('no duplicates: every id and every text appears once', () => {
  assert.equal(new Set(ITEMS.map(item => item.id)).size, ITEMS.length);
  const normal = item => item.text.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  assert.equal(new Set(ITEMS.map(normal)).size, ITEMS.length);
  for (const item of ITEMS) assert.equal(m.itemById(item.id), item);
});

test('levels 1 and 2 are balanced between fiction and nonfiction', () => {
  for (const level of [1, 2]) {
    const fiction = m.itemsFor(level, 'fiction').length, nonfiction = m.itemsFor(level, 'nonfiction').length;
    assert.ok(fiction >= 15 && nonfiction >= 15, `level ${level}: ${fiction} fiction, ${nonfiction} nonfiction`);
    assert.ok(Math.abs(fiction - nonfiction) <= 2, `level ${level} is balanced`);
  }
  // Level 1 is clear cases: nothing spoken in nonfiction, and no dates or measurements to weigh up.
  for (const item of m.itemsFor(1, 'nonfiction')) assert.ok(!/[“”]|\bsaid\b|\basked\b/.test(item.text), item.id);
});

test('level 2: every item names its clues, and the giveaway words are in the text', () => {
  for (const item of m.itemsFor(2)) {
    assert.ok(item.clues.length >= 1 && item.clues.length <= 3, item.id);
    assert.equal(new Set(item.clues).size, item.clues.length, item.id);
    for (const key of item.clues) assert.equal(CLUES[key]?.kind, item.kind, `${item.id}: “${key}” is a clue for ${item.kind}`);
    assert.ok(m.explain(item).startsWith(`This is ${item.kind}. Clue${item.clues.length > 1 ? 's' : ''}: ${m.clueNames(item)}. `), item.id);
    assert.ok([undefined, 'realistic', 'true-story'].includes(item.tricky), item.id);
    if (item.tricky === 'realistic') {
      assert.equal(item.kind, 'fiction', item.id);
      assert.ok(!item.clues.includes('impossible'), `${item.id}: a realistic story has nothing impossible in it`);
    }
    if (item.tricky === 'true-story') assert.equal(item.kind, 'nonfiction', item.id);
    // A made-up story with nothing impossible in it is one of the tricky kind, and is marked as such.
    if (item.kind === 'fiction') assert.equal(item.tricky === 'realistic', !item.clues.includes('impossible'), item.id);
  }
  for (const key of Object.keys(CLUES)) assert.ok(m.itemsFor(2).some(item => item.clues.includes(key)), `the clue “${key}” is used`);
  assert.ok(m.itemsFor(2).filter(item => item.tricky === 'realistic').length >= 6, 'realistic fiction');
  assert.ok(m.itemsFor(2).filter(item => item.tricky === 'true-story').length >= 6, 'nonfiction told as a story');
  assert.ok(m.itemsFor(2).filter(item => item.form === 'description').length >= 10, 'book descriptions');
  assert.equal(m.clueNames(m.itemById('b31')), 'diagrams with labels, a glossary and an index');
});

test('giveaway words: each mark is in the text, in order, as whole words', () => {
  for (const item of ITEMS) {
    if (item.level === 1) { assert.equal(item.marks, undefined, item.id); continue; }
    assert.ok(item.marks.length >= 1 && item.marks.length <= 5, item.id);
    let end = 0;
    m.markRanges(item).forEach(([start, stop], i) => {
      assert.ok(start >= end, `${item.id}: “${item.marks[i]}” is in the text, after the mark before it`);
      assert.equal(item.text.slice(start, stop), item.marks[i]);
      assert.ok(!/\p{L}/u.test(item.text[start - 1] ?? ' ') || !/\p{L}/u.test(item.text[start]), `${item.id}: “${item.marks[i]}” starts at a word`);
      assert.ok(!/\p{L}/u.test(item.text[stop] ?? ' ') || !/\p{L}/u.test(item.text[stop - 1]), `${item.id}: “${item.marks[i]}” ends at a word`);
      end = stop;
    });
    assert.equal(m.pieces(item).map(piece => piece.text).join(''), item.text, item.id);
    assert.deepEqual(m.pieces(item).filter(piece => piece.mark).map(piece => piece.text), item.marks, item.id);
    assert.ok(m.pieces(item).some(piece => !piece.mark), `${item.id}: not the whole text`);
  }
  for (const item of ITEMS) assert.equal(strip(revealHtml(item)), item.text, item.id);
});

test('level 3: thirteen genres, each with three or more items and one defensible answer', () => {
  assert.equal(GENRES.length, 13);
  assert.equal(new Set(genreIds).size, 13);
  assert.deepEqual(GENRES.filter(g => g.kind === 'either').map(g => g.id), ['poetry']);
  for (const g of GENRES) {
    assert.ok(['fiction', 'nonfiction', 'either'].includes(g.kind), g.id);
    assert.ok(m.itemsFor(3, g.id).length >= 3, `${g.id} has ${m.itemsFor(3, g.id).length} items`);
    for (const field of ['name', 'as', 'about', 'look']) assert.ok(g[field].length >= 5, `${g.id}.${field}`);
    assert.equal(m.itemById(g.example)?.genre, g.id, `${g.id}: the example is an item of that genre`);
    assert.equal(m.genreById(g.id), g);
  }
  const fiction = m.itemsFor(3).filter(item => m.kindOf(item) === 'fiction').length;
  const nonfiction = m.itemsFor(3).filter(item => m.kindOf(item) === 'nonfiction').length;
  assert.ok(Math.abs(fiction - nonfiction) <= 2, `level 3: ${fiction} fiction, ${nonfiction} nonfiction`);
  for (const [a, b] of OVERLAPS) assert.ok(genreIds.includes(a) && genreIds.includes(b), `${a} / ${b}`);
  const places = new Map();
  for (const item of m.itemsFor(3)) {
    assert.ok(item.options.length >= 4 && item.options.length <= 6, `${item.id}: four to six options`);
    assert.equal(new Set(item.options).size, item.options.length, item.id);
    assert.ok(item.options.every(id => genreIds.includes(id)), item.id);
    assert.ok(item.options.includes(item.genre), `${item.id}: the answer is one of the options`);
    // The options are listed in the order of GENRES, which is the order they are shown in.
    assert.deepEqual(item.options, genreIds.filter(id => item.options.includes(id)), `${item.id}: options in genre order`);
    // Never two genres that could both be defended.
    for (const [a, b] of OVERLAPS) assert.ok(!(item.options.includes(a) && item.options.includes(b)), `${item.id}: offers both ${a} and ${b}`);
    // The other options include at least one from the other side of the library.
    const kinds = new Set(item.options.map(id => m.genreById(id).kind));
    assert.ok(kinds.has('fiction') && kinds.has('nonfiction'), item.id);
    assert.ok(m.explain(item).startsWith(`This is ${m.genreById(item.genre).as}. `), item.id);
    const place = item.options.indexOf(item.genre);
    places.set(place, (places.get(place) ?? 0) + 1);
  }
  // The answer is not always in the same place.
  for (let place = 0; place < 4; place++) assert.ok(places.get(place) >= 4, `the answer is option ${place + 1} in ${places.get(place)} items`);
});

test('level 3: the giveaway features of each genre are written into the text', () => {
  const has = (id, pattern) => { for (const item of m.itemsFor(3, id)) assert.match(item.text, pattern, `${item.id} (${id})`); };
  has('fable', /Moral:|states a lesson/);
  has('fairy-tale', /Once upon a time|Long ago, in a kingdom/);
  has('fantasy', /spell|magic/i);
  has('science-fiction', /robot|time machine|space/i);
  has('historical-fiction', /made-up|invented/);
  has('historical-fiction', /1848|1903|ancient Egypt/);
  has('realistic-fiction', /phone|today|science project/);
  has('mystery', /clue/i);
  has('mystery', /suspect/);
  has('biography', /\breal\b|\btrue\b/);
  has('biography', /written by|The author|\bhe\b/);
  has('autobiography', /own life|I wrote this book/);
  has('autobiography', /\bI\b/);
  has('how-to', /steps|First,|1\./);
  has('persuasive', /should|ought to|urge|argues/);
  for (const item of m.itemsFor(3, 'poetry').filter(poem => poem.form === 'passage')) assert.equal(item.text.split('\n').length, 4, `${item.id}: four lines`);
  // Biographies are written about someone (he, she), autobiographies by someone (I).
  for (const item of m.itemsFor(3, 'biography').filter(entry => entry.form === 'passage')) assert.ok(!/\bI\b/.test(item.text), item.id);
  // No magic in science fiction, realistic fiction, historical fiction or mysteries.
  for (const id of ['science-fiction', 'realistic-fiction', 'historical-fiction', 'mystery']) for (const item of m.itemsFor(3, id)) assert.ok(!/\b(spell|wizard|dragon|fairy|magic wand|enchanted)\b/i.test(item.text), item.id);
});

test('nothing in the bank breaks the rules for facts', () => {
  // Nonfiction items: no records that change, touchy subjects or well-known false "facts".
  const banned = /\b(tallest|fastest|largest|biggest|longest|richest|population|president|prime minister|god|church|vaccine|medicine|diet|healthy|great wall|goldfish|record)\b/i;
  for (const item of ITEMS.filter(entry => m.kindOf(entry) !== 'fiction')) assert.ok(!banned.test(item.text), `${item.id}: ${item.text}`);
  // The only people named in nonfiction are the two in the biographies, both from the 1800s.
  const named = ITEMS.filter(item => m.kindOf(item) === 'nonfiction' && /^[A-Z][a-z]+ [A-Z][a-z]+ was\b/.test(item.text)).map(item => item.id);
  assert.deepEqual(named, ['c26', 'c27']);
  assert.match(m.itemById('c26').text, /^Wilson Bentley .* 1865/);
  assert.match(m.itemById('c27').text, /^Maria Mitchell .* 1818/);
});

test('rounds: ten questions, no repeats, a mix of both kinds, the same for the same seed', () => {
  for (const level of [1, 2, 3]) {
    const seen = new Set();
    for (let seed = 1; seed <= 400; seed++) {
      const round = m.buildRound(level, seed);
      assert.equal(round.length, ROUND_LENGTH);
      assert.equal(new Set(round.map(q => q.item.id)).size, ROUND_LENGTH, `level ${level} seed ${seed}: no repeats`);
      for (const q of round) { assert.equal(q.item.level, level); seen.add(q.item.id); }
      const fiction = round.filter(q => m.kindOf(q.item) === 'fiction').length;
      const nonfiction = round.filter(q => m.kindOf(q.item) === 'nonfiction').length;
      if (level === 3) {
        assert.ok(round.every(q => q.mode === 'genre'));
        assert.equal(new Set(round.map(q => q.item.genre)).size, ROUND_LENGTH, `seed ${seed}: ten different genres`);
        assert.ok(fiction >= 5 && fiction <= 6 && nonfiction >= 4 && nonfiction <= 5, `seed ${seed}: ${fiction} fiction, ${nonfiction} nonfiction`);
        for (const q of round) assert.deepEqual(q.choices, q.item.options, q.item.id);
      } else {
        assert.ok(fiction >= 4 && fiction <= 6 && fiction + nonfiction === ROUND_LENGTH, `level ${level} seed ${seed}: ${fiction} fiction`);
        assert.ok(round.every(q => q.mode === 'sort'));
        for (const q of round) assert.deepEqual(q.choices, ['fiction', 'nonfiction']);
      }
      assert.deepEqual(m.buildRound(level, seed), round, 'the same seed gives the same round');
    }
    assert.equal(seen.size, m.itemsFor(level).length, `level ${level}: every item turns up`);
  }
  assert.notDeepEqual(m.buildRound(1, 1).map(q => q.item.id), m.buildRound(1, 2).map(q => q.item.id));
  // The order is not "fiction first".
  const orders = new Set(Array.from({ length: 50 }, (_, seed) => m.buildRound(2, seed + 1).map(q => q.item.kind[0]).join('')));
  assert.ok(orders.size > 40);
});

test('the seeded random number generator is steady and spread out', () => {
  const a = m.seededRandom(42), b = m.seededRandom(42);
  assert.deepEqual(Array.from({ length: 5 }, a), Array.from({ length: 5 }, b));
  const many = Array.from({ length: 2000 }, m.seededRandom(7));
  assert.ok(many.every(v => v >= 0 && v < 1));
  const mean = many.reduce((sum, v) => sum + v, 0) / many.length;
  assert.ok(Math.abs(mean - 0.5) < 0.03, `mean ${mean}`);
});

test('checking answers', () => {
  const sort = id => ({ item: m.itemById(id), mode: 'sort', choices: ['fiction', 'nonfiction'] });
  assert.equal(m.checkAnswer(sort('a01'), 'fiction'), true);
  assert.equal(m.checkAnswer(sort('a01'), 'nonfiction'), false);
  assert.equal(m.checkAnswer(sort('a17'), 'nonfiction'), true);
  assert.equal(m.checkAnswer(sort('a17'), 'fiction'), false);
  assert.equal(m.checkAnswer(sort('a17'), undefined), false);
  for (const item of ITEMS) {
    const question = { item, mode: item.level === 3 ? 'genre' : 'sort', choices: item.level === 3 ? item.options : ['fiction', 'nonfiction'] };
    const right = question.choices.filter(choice => m.checkAnswer(question, choice));
    assert.deepEqual(right, [m.answerOf(item)], `${item.id}: exactly one choice is right`);
    assert.ok(m.answerName(m.answerOf(item)).length > 3, item.id);
  }
  // A genre that is not offered is never right, even the true one.
  const fable = m.itemById('c01');
  assert.equal(m.checkAnswer({ item: fable, mode: 'genre', choices: ['mystery', 'poetry'] }, 'fable'), false);
  assert.equal(m.answerName('fiction'), 'Fiction');
  assert.equal(m.answerName('how-to'), 'How-to (procedural)');
  assert.equal(m.kindOf(m.itemById('c22')), 'either');
  assert.equal(m.kindOf(fable), 'fiction');
  assert.equal(m.kindOf(m.itemById('c27')), 'nonfiction');
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

test('explanations, definitions and the features table', () => {
  assert.match(m.DEFINITIONS.fiction, /an author made up/);
  assert.match(m.DEFINITIONS.nonfiction, /real world.*true information/);
  assert.equal(m.explain(m.itemById('a01')), 'This is fiction. A real fox cannot talk or wear boots. The author made this up.');
  assert.equal(m.explain(m.itemById('a17')), 'This is nonfiction. This is true information about real frogs. You could check it in a science book.');
  assert.match(m.explain(m.itemById('b01')), /^This is fiction\. Clues: dialogue and a character’s thoughts or feelings\. /);
  assert.match(m.explain(m.itemById('b19')), /^This is nonfiction\. Clue: facts you can check\. /);
  assert.match(m.explain(m.itemById('c01')), /^This is a fable\. /);
  assert.match(m.explain(m.itemById('c29')), /^This is an autobiography\. /);
  assert.ok(m.FEATURES.length >= 6);
  for (const row of m.FEATURES) for (const field of ['look', 'fiction', 'nonfiction']) assert.ok(row[field].length > 5, row.look);
  assert.match(tagHtml('fiction'), /class="fn-tag fiction".*Fiction<\/span>$/);
  assert.match(tagHtml('nonfiction'), /class="fn-tag nonfiction".*Nonfiction<\/span>$/);
  assert.match(revealHtml(m.itemById('c01')), /^<span class="fn-seg fiction">.*<mark class="fn-mark">Moral:<\/mark>/);
  assert.match(revealHtml(m.itemById('c22')), /^<span class="fn-seg either">/);
});

test('the worksheet and its answer key are built from the bank', () => {
  const [remember, sort, yourTurn] = activity.sections;
  assert.equal(sort.type, 'fiction-or-nonfiction');
  const items = SORT_IDS.map(m.itemById);
  assert.equal(new Set(SORT_IDS).size, 10);
  assert.deepEqual(sort.items.map(entry => entry.text), items.map(item => item.text));
  assert.deepEqual(sort.items.map(entry => entry.letter), items.map(item => (item.kind === 'fiction' ? 'F' : 'N')));
  assert.equal(items.filter(item => item.kind === 'fiction').length, 5);
  assert.ok(items.some(item => item.level === 1) && items.some(item => item.level === 2));
  assert.ok(items.every(item => item.level < 3 && !FROG_IDS.includes(item.id)));
  // Not simply alternating F, N, F, N.
  const order = sort.items.map(entry => entry.letter).join('');
  assert.ok(!/^(FN)+$|^(NF)+$/.test(order), order);
  // The key names the answer, the clues and the reason for every item.
  sort.items.forEach((entry, i) => {
    const item = items[i];
    assert.ok(entry.key.startsWith(`${m.KIND_NAME[item.kind]}. `) && entry.key.endsWith(item.why), item.id);
    if (item.level === 2) assert.ok(entry.key.includes(`Clues: ${m.clueNames(item)}. `) || entry.key.includes(`Clue: ${m.clueNames(item)}. `), item.id);
  });
  // Part B: the frog sentences are the bank's, one of each kind.
  const [frogKing, tadpole] = FROG_IDS.map(m.itemById);
  assert.deepEqual([frogKing.kind, tadpole.kind], ['fiction', 'nonfiction']);
  assert.ok(/frog/i.test(frogKing.text) && /frog/i.test(tadpole.text));
  assert.ok(yourTurn.items[0].a.includes(frogKing.text) && yourTurn.items[0].a.includes(tadpole.text));
  assert.ok(activity.lesson.hook.includes(frogKing.text) && activity.lesson.hook.includes(tadpole.text));
  // Question 2 points at the item that reads like a story but is nonfiction.
  const number = Number(yourTurn.items[1].q.match(/^Item (\d+) in Part A/)[1]);
  const pointed = items[number - 1];
  assert.equal(pointed.tricky, 'true-story');
  assert.equal(items.filter(item => item.tricky === 'true-story').length, 1);
  assert.ok(yourTurn.items[1].a.includes(pointed.why) && yourTurn.items[1].a.includes(m.clueNames(pointed)));
  assert.ok(activity.lesson.debrief.includes(`Item ${number} `));
  assert.ok(remember.lines[0].includes(m.DEFINITIONS.fiction) && remember.lines[0].includes(m.DEFINITIONS.nonfiction));
  for (const clue of Object.values(CLUES)) assert.ok(remember.lines.join(' ').includes(clue.name), clue.name);
});
