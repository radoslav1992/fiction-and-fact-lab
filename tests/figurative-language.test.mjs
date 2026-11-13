import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/lib/figurative-language.mjs';
import { revealHtml } from '../src/lib/figurative-language-view.mjs';
import { activity, LABEL_IDS, REWRITE_IDS, IDIOM_IDS } from '../src/lib/activities/figurative-language.mjs';

const { ITEMS, LEVELS, DEVICES, LEVEL_DEVICES, ROUND_LENGTH } = m;
const strip = html => html.replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const wordsOf = text => text.match(/\p{L}+(?:[’-]\p{L}+)*/gu);
const count = (level, device) => m.itemsFor(level, device).length;

test('the bank: 30 or more sentences per level, in the right shape', () => {
  assert.deepEqual(LEVELS.map(level => level.id), [1, 2, 3]);
  for (const level of LEVELS) assert.ok(count(level.id) >= 30, `level ${level.id} has ${count(level.id)}`);
  for (const item of ITEMS) {
    assert.match(item.id, /^[abc]\d\d$/, item.id);
    assert.equal(item.id[0], 'abc'[item.level - 1], `${item.id} is filed under its level`);
    assert.ok(LEVEL_DEVICES[item.level].includes(item.device), `${item.id}: ${item.device} is a choice at level ${item.level}`);
    assert.match(item.text, /^[A-Z][^\n]{12,90}[.!]$/, `${item.id}: one or two plain sentences`);
    assert.ok(wordsOf(item.text).length <= 16, `${item.id} is short enough to read on a phone`);
    assert.ok(!/ {2}|—|["']/.test(item.text + item.why), `${item.id}: spacing, dashes and curly quotes`);
    assert.ok(item.why.length > 20 && item.why.endsWith('.'), `${item.id}: an explanation`);
    assert.ok(!/undefined|NaN/.test(m.explain(item)), item.id);
    assert.equal(m.explain(item), `This is ${m.deviceById(item.device).as}. ${item.why}`);
    assert.equal(strip(revealHtml(item)), item.text, item.id);
  }
  // Each level has enough of every kind to build a round with a mix.
  for (const device of LEVEL_DEVICES[1]) assert.ok(count(1, device) >= 10, `level 1 ${device}: ${count(1, device)}`);
  for (const device of LEVEL_DEVICES[2]) assert.ok(count(2, device) >= 8, `level 2 ${device}: ${count(2, device)}`);
  for (const device of LEVEL_DEVICES[3]) assert.ok(count(3, device) >= 4, `level 3 ${device}: ${count(3, device)}`);
});

test('no duplicates: every id and every sentence appears once', () => {
  assert.equal(new Set(ITEMS.map(item => item.id)).size, ITEMS.length);
  const normal = item => item.text.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  assert.equal(new Set(ITEMS.map(normal)).size, ITEMS.length);
  for (const item of ITEMS) assert.equal(m.itemById(item.id), item);
});

test('signal words: each one is in the sentence, in order, as whole words', () => {
  for (const item of ITEMS) {
    if (item.device !== 'literal') assert.ok(item.signal.length >= 1, `${item.id} names its signal`);
    let end = 0;
    m.signalRanges(item).forEach(([start, stop], i) => {
      assert.ok(start >= end, `${item.id}: “${item.signal[i]}” is in the sentence, after the signal before it`);
      assert.equal(item.text.slice(start, stop), item.signal[i]);
      assert.ok(!/\p{L}/u.test(item.text[start - 1] ?? ' '), `${item.id}: “${item.signal[i]}” starts at a word`);
      assert.ok(!/\p{L}/u.test(item.text[stop] ?? ' '), `${item.id}: “${item.signal[i]}” ends at a word`);
      end = stop;
    });
    assert.equal(m.pieces(item).map(piece => piece.text).join(''), item.text, item.id);
    assert.deepEqual(m.pieces(item).filter(piece => piece.mark).map(piece => piece.text), item.signal, item.id);
    assert.ok(m.pieces(item).some(piece => !piece.mark), `${item.id}: not the whole sentence`);
  }
});

test('each device shows its own signal, and only its own', () => {
  const likeOrAs = /\b(like|as)\b/gi;
  for (const item of ITEMS) {
    const found = item.text.match(likeOrAs) ?? [];
    if (item.device === 'simile') {
      // One comparison: "like" once, or "as … as".
      assert.match(item.signal[0], /^(like|as \w+ as)$/, item.id);
      assert.deepEqual(found.map(word => word.toLowerCase()), item.signal[0] === 'like' ? ['like'] : ['as', 'as'], item.id);
      assert.ok(item.why.includes(`“${item.signal[0]}”`), `${item.id}: the explanation names the signal`);
    } else if (item.device === 'literal') {
      // A literal sentence may use "like" or "as" for another job; the explanation says which.
      if (found.length) {
        assert.equal(found.length, 1, item.id);
        assert.deepEqual(item.signal, found, item.id);
        assert.match(item.why, new RegExp(`^Here “${found[0].toLowerCase()}” (means|tells)`), item.id);
      }
    } else {
      assert.equal(found.length, 0, `${item.id}: “like” or “as” outside a simile`);
    }
    if (item.device === 'metaphor') {
      assert.match(item.signal[0], /^(is|was|were) (an? |the |two )?[a-z]/, `${item.id}: one thing is called another`);
      assert.match(item.why, /^It calls .+, without using “like” or “as”\.$/, item.id);
    }
    if (item.device === 'personification') assert.match(item.why, / cannot really .+\. That is something a person does\.$/, item.id);
    if (item.device === 'hyperbole') assert.ok(item.why.startsWith(`“${item.signal[0]}” is far too much to be true.`), item.id);
    if (item.device === 'idiom') assert.ok(item.why.startsWith(`The words “${item.signal[0]}” do not mean what they say.`), item.id);
    if (item.device === 'onomatopoeia') assert.ok(item.why.toLowerCase().startsWith(`“${item.signal[0].toLowerCase()}” is a sound word.`), item.id);
  }
  // A literal "is a" sentence is marked too, so the page can show why it is not a metaphor.
  assert.ok(m.itemsFor(1, 'literal').filter(item => /^is an? /.test(item.signal[0] ?? '')).length >= 3);
  assert.ok(m.itemsFor(1, 'literal').filter(item => /^(like|as)$/i.test(item.signal[0] ?? '')).length >= 4);
});

// Function words that do not count when looking for repeated beginning sounds.
const STOP = new Set('a an the of in on at to for from by with and or but so as like is are was were be been am it its his her my our your their this that these those i we he she they you me us him them not no do does did have has had will would could can up down out over into onto past than then when if just too very all one two more about after before under through across during between every each any some there here'.split(' '));
// The beginning sound of a word, near enough: ch, sh, th, hard and soft c, ph, wh, kn, qu.
function beginning(word) {
  const w = word.toLowerCase();
  if (/^(ch|sh|th)/.test(w)) return w.slice(0, 2);
  if (w.startsWith('ph')) return 'f';
  if (w.startsWith('kn')) return 'n';
  if (w[0] === 'c') return /^c[eiy]/.test(w) ? 's' : 'k';
  if (w[0] === 'q') return 'k';
  return w[0];
}
const SOUND_WORDS = /\b(buzz|splash|bang|crunch|beep|hiss|pop|boom|creak|purr|whisper|sizzl|crash|thud|clang|drip|howl|groan|snor|rang\b|ring\b|tick|whoosh|click|clap|roar|squeak|rustl|crackl|hum\b|murmur|zip\b|zoom|moo\b|meow|chirp|thump|slam|clatter|rumbl|grumbl|sigh|cough|gurgl|whistl|snap|fizz|honk|toot|knock|tap\b|sang\b|sing\b|scream|shout|yell)/i;

test('one device per sentence: no accidental alliteration and no stray sound words', () => {
  for (const item of ITEMS) {
    const content = wordsOf(item.text).filter(word => !STOP.has(word.toLowerCase()));
    const starts = content.map(beginning);
    if (item.device === 'alliteration') {
      // Four or more marked words, all with the same beginning sound, and they are most of the sentence.
      assert.ok(item.signal.length >= 4, item.id);
      assert.equal(new Set(item.signal.map(beginning)).size, 1, `${item.id}: ${item.signal.join(' ')}`);
      assert.ok(item.signal.length >= content.length - 1, `${item.id}: nearly every word joins in`);
      assert.ok(item.why.startsWith(`${item.signal.length} words close together begin with the same `), item.id);
    } else {
      // No two content words in a row, and no three in the sentence, begin with the same consonant sound.
      for (let i = 1; i < starts.length; i++) assert.ok(starts[i] !== starts[i - 1] || /^[aeiou]/.test(starts[i]), `${item.id}: “${content[i - 1]} ${content[i]}” alliterates`);
      for (const sound of new Set(starts.filter(s => !/^[aeiou]/.test(s)))) assert.ok(starts.filter(s => s === sound).length < 3, `${item.id}: three words begin with “${sound}”`);
    }
    if (item.device === 'onomatopoeia') {
      assert.equal(item.signal.length, 1, item.id);
      assert.match(item.signal[0], SOUND_WORDS, `${item.id}: the signal is a sound word`);
    } else {
      assert.ok(!SOUND_WORDS.test(item.text), `${item.id}: a sound word in a sentence that is not onomatopoeia: ${item.text}`);
    }
    // Exaggerations with numbers belong to hyperbole only.
    if (item.device !== 'hyperbole') assert.ok(!/\b(hundred|thousand|million|billion|zillion|forever|never|always)\b/i.test(item.text), `${item.id}: sounds like an exaggeration`);
  }
});

test('meanings: every idiom, and every level 3 hyperbole, has three choices with the right one first', () => {
  for (const item of ITEMS) {
    const wanted = item.device === 'idiom' || (item.device === 'hyperbole' && item.level === 3);
    assert.equal(Array.isArray(item.meanings), wanted, item.id);
    if (!wanted) continue;
    assert.equal(item.meanings.length, 3, item.id);
    assert.equal(new Set(item.meanings).size, 3, item.id);
    for (const meaning of item.meanings) assert.match(meaning, /^[A-Z].{10,70}\.$/, `${item.id}: ${meaning}`);
    assert.ok(!item.meanings[0].includes(item.signal[0]), `${item.id}: the right choice repeats the phrase it explains`);
  }
  // The explanation and the right choice say the same thing.
  const spill = m.itemById('c01');
  assert.equal(spill.meanings[0], 'Please don’t tell anyone the secret.');
  assert.equal(m.explain(spill), 'This is an idiom. The words “spill the beans” do not mean what they say. Here they mean “tell the secret”.');
  assert.ok(count(3, 'idiom') >= 8 && count(3, 'hyperbole') >= 6);
});

test('devices: eight entries, each defined, with two examples from the bank', () => {
  assert.deepEqual(DEVICES.map(device => device.id), ['simile', 'metaphor', 'personification', 'hyperbole', 'idiom', 'alliteration', 'onomatopoeia', 'literal']);
  for (const device of DEVICES) {
    for (const field of ['name', 'as', 'about', 'signal', 'ask']) assert.ok(device[field].length >= 5, `${device.id}.${field}`);
    assert.ok(device.ask.endsWith('?'), device.id);
    assert.equal(device.examples.length, 2, device.id);
    for (const id of device.examples) assert.equal(m.itemById(id)?.device, device.id, `${device.id}: ${id} is an example of it`);
    assert.equal(m.deviceById(device.id), device);
  }
  assert.deepEqual(LEVEL_DEVICES[1], ['simile', 'metaphor', 'literal']);
  assert.deepEqual(LEVEL_DEVICES[2], ['simile', 'metaphor', 'personification', 'hyperbole']);
  assert.deepEqual(LEVEL_DEVICES[3], DEVICES.map(device => device.id).filter(id => id !== 'literal'));
});

test('rounds: ten questions, no repeats, every kind in the mix, the same for the same seed', () => {
  for (const level of [1, 2, 3]) {
    const seen = new Set(), rightPlaces = new Set();
    for (let seed = 1; seed <= 400; seed++) {
      const round = m.buildRound(level, seed);
      assert.equal(round.length, ROUND_LENGTH);
      assert.equal(new Set(round.map(q => q.item.id)).size, ROUND_LENGTH, `level ${level} seed ${seed}: no repeats`);
      for (const q of round) { assert.equal(q.item.level, level); seen.add(q.item.id); }
      const named = round.filter(q => q.mode === 'device');
      const tally = device => named.filter(q => q.item.device === device).length;
      for (const q of named) assert.deepEqual(q.choices, LEVEL_DEVICES[level]);
      if (level === 1) for (const device of LEVEL_DEVICES[1]) assert.ok(tally(device) >= 3 && tally(device) <= 4, `seed ${seed}: ${tally(device)} ${device}`);
      if (level === 2) for (const device of LEVEL_DEVICES[2]) assert.ok(tally(device) >= 2 && tally(device) <= 3, `seed ${seed}: ${tally(device)} ${device}`);
      if (level < 3) assert.equal(named.length, ROUND_LENGTH);
      if (level === 3) {
        for (const device of LEVEL_DEVICES[3]) assert.equal(tally(device), 1, `seed ${seed}: one ${device} to name`);
        const meaning = round.filter(q => q.mode === 'meaning');
        assert.deepEqual(meaning.map(q => q.item.device).sort(), ['hyperbole', 'idiom', 'idiom'], `seed ${seed}`);
        for (const q of meaning) {
          assert.deepEqual([...q.choices].sort(), [0, 1, 2], q.item.id);
          rightPlaces.add(q.choices.indexOf(0));
        }
      }
      assert.deepEqual(m.buildRound(level, seed), round, 'the same seed gives the same round');
    }
    assert.equal(seen.size, count(level), `level ${level}: every sentence turns up`);
    if (level === 3) assert.equal(rightPlaces.size, 3, 'the right meaning is not always in the same place');
  }
  assert.notDeepEqual(m.buildRound(1, 1).map(q => q.item.id), m.buildRound(1, 2).map(q => q.item.id));
  const orders = new Set(Array.from({ length: 50 }, (_, seed) => m.buildRound(2, seed + 1).map(q => q.item.device[0]).join('')));
  assert.ok(orders.size > 40, 'the kinds come in a different order each round');
});

test('the seeded random number generator is steady and spread out', () => {
  const a = m.seededRandom(42), b = m.seededRandom(42);
  assert.deepEqual(Array.from({ length: 5 }, a), Array.from({ length: 5 }, b));
  const many = Array.from({ length: 2000 }, m.seededRandom(7));
  assert.ok(many.every(v => v >= 0 && v < 1));
  const mean = many.reduce((sum, v) => sum + v, 0) / many.length;
  assert.ok(Math.abs(mean - 0.5) < 0.03, `mean ${mean}`);
});

test('checking answers in each mode', () => {
  for (const item of ITEMS) {
    const question = { item, mode: 'device', choices: LEVEL_DEVICES[item.level] };
    assert.deepEqual(question.choices.filter(choice => m.checkAnswer(question, choice)), [item.device], `${item.id}: exactly one choice is right`);
    assert.equal(m.choiceText(question, item.device), m.deviceById(item.device).name);
    if (!item.meanings) continue;
    const meaning = { item, mode: 'meaning', choices: [2, 0, 1] };
    assert.deepEqual(meaning.choices.map(choice => m.checkAnswer(meaning, choice)), [false, true, false], item.id);
    assert.deepEqual(meaning.choices.map(choice => m.choiceText(meaning, choice)), [item.meanings[2], item.meanings[0], item.meanings[1]]);
  }
  const lake = { item: m.itemById('a26'), mode: 'device', choices: LEVEL_DEVICES[1] };
  assert.equal(m.checkAnswer(lake, 'literal'), true);
  assert.equal(m.checkAnswer(lake, 'simile'), false);
  assert.equal(m.checkAnswer(lake, undefined), false);
  // A choice that is not on offer is never right.
  assert.equal(m.checkAnswer({ item: m.itemById('c01'), mode: 'device', choices: ['simile', 'metaphor'] }, 'idiom'), false);
  assert.equal(m.checkAnswer({ item: m.itemById('c01'), mode: 'meaning', choices: [1, 2] }, 0), false);
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

test('explanations name the signal', () => {
  assert.equal(m.explain(m.itemById('a01')), 'This is a simile. The word “like” compares the clouds to fluffy pillows.');
  assert.equal(m.explain(m.itemById('a02')), 'This is a simile. The words “as smooth as” compare the lake to glass.');
  assert.equal(m.explain(m.itemById('a12')), 'This is a metaphor. It calls the snow a white blanket, without using “like” or “as”.');
  assert.equal(m.explain(m.itemById('a23')), 'This is literal. Here “like” means “enjoy”. Nothing is being compared.');
  assert.equal(m.explain(m.itemById('b17')), 'This is personification. The moon cannot really smile. That is something a person does.');
  assert.equal(m.explain(m.itemById('b25')), 'This is hyperbole. “a hundred years” is far too much to be true. It is an exaggeration. It really means that the wait was very long.');
  assert.equal(m.explain(m.itemById('c16')), 'This is alliteration. 5 words close together begin with the same “s” sound.');
  assert.equal(m.explain(m.itemById('c22')), 'This is onomatopoeia. “Buzzed” is a sound word. Say it aloud and you can hear the noise it names.');
  assert.equal(revealHtml(m.itemById('a02')), 'The lake was <mark class="fl-mark">as smooth as</mark> glass.');
  assert.equal(revealHtml(m.itemById('a26')), 'The lake was calm this morning.');
});

test('the worksheet and its answer key are built from the bank', () => {
  const [remember, label, yourTurn, idioms] = activity.sections;
  assert.equal(label.type, 'figurative-language');
  const items = LABEL_IDS.map(m.itemById);
  assert.equal(new Set(LABEL_IDS).size, 10);
  assert.deepEqual(label.items.map(entry => entry.text), items.map(item => item.text));
  assert.deepEqual(label.items.map(entry => entry.answer), items.map(item => m.deviceById(item.device).name));
  label.items.forEach((entry, i) => {
    assert.equal(entry.key, items[i].why);
    assert.deepEqual(entry.pieces, m.pieces(items[i]));
  });
  // Two each of four kinds and one each of the sound devices, all named in the instructions.
  const tally = device => items.filter(item => item.device === device).length;
  assert.deepEqual(['simile', 'metaphor', 'personification', 'hyperbole', 'alliteration', 'onomatopoeia'].map(tally), [2, 2, 2, 2, 1, 1]);
  for (const item of items) assert.ok(label.intro.includes(m.deviceById(item.device).name.toLowerCase()), item.device);
  // The same kind never comes twice in a row.
  items.forEach((item, i) => assert.ok(i === 0 || item.device !== items[i - 1].device, item.id));
  for (const item of items) assert.ok(remember.lines.join(' ').includes(m.deviceById(item.device).about), item.device);
  // Part B: a literal sentence, with a simile and a metaphor about the same thing as model answers.
  const rewrite = Object.fromEntries(Object.entries(REWRITE_IDS).map(([device, id]) => [device, m.itemById(id)]));
  for (const [device, item] of Object.entries(rewrite)) {
    assert.equal(item.device, device);
    assert.match(item.text, /lake/);
  }
  assert.ok(yourTurn.items[0].q.includes(rewrite.literal.text));
  assert.ok(yourTurn.items[0].a.includes(rewrite.simile.text) && yourTurn.items[0].a.includes(rewrite.metaphor.text));
  // Part C: two idioms, the question quotes the phrase and the answer is the bank's meaning.
  assert.equal(idioms.items.length, 2);
  IDIOM_IDS.map(m.itemById).forEach((item, i) => {
    assert.equal(item.device, 'idiom');
    assert.ok(idioms.items[i].q.includes(item.text) && idioms.items[i].q.includes(`“${item.signal[0]}”`));
    assert.ok(idioms.items[i].a.startsWith(item.meanings[0]) && idioms.items[i].a.endsWith(item.why));
  });
  assert.equal(idioms.start, yourTurn.items.length + 1);
  assert.equal(idioms.intro, m.deviceById('idiom').about);
  assert.ok(activity.lesson.hook.includes(m.itemById('b25').text));
});
