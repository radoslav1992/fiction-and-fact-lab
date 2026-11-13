import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/lib/cause-and-effect.mjs';
import { revealHtml, chainHtml, pairsHtml, tagHtml } from '../src/lib/cause-and-effect-view.mjs';
import { activity, standards, MARK_IDS, MATCH_IDS, MATCH_ORDER, FINISH, CHAIN_ID } from '../src/lib/activities/cause-and-effect.mjs';

const { ITEMS, LEVELS, SIGNALS, MATCH_SETS, ROUND_LENGTH } = m;
const strip = html => html.replace(/<sup[^>]*>.*?<\/sup>/g, '').replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const wordCount = text => text.split(/\s+/).length;
const sentences = [...m.itemsFor(1), ...m.itemsFor(2)];
const paragraphs = m.itemsFor(3);
// Signal words that must not turn up in a paragraph that is listed as having none.
const ANY_SIGNAL = /(?<![\p{L}])(because|since|so|therefore|as a result|due to|led to|caused|thus|consequently)(?![\p{L}])/iu;

test('the bank: at least 90 items, 30 or more per level, in the right shape', () => {
  assert.ok(ITEMS.length >= 90, `${ITEMS.length} items`);
  assert.deepEqual(LEVELS.map(level => level.id), [1, 2, 3]);
  for (const level of LEVELS) assert.ok(m.itemsFor(level.id).length >= 30, `level ${level.id} has ${m.itemsFor(level.id).length}`);
  for (const s of ITEMS) {
    assert.match(s.id, /^[abc]\d\d$/, s.id);
    assert.equal(s.id[0], 'abc'[s.level - 1], `${s.id} is filed under its level`);
    assert.equal(s.kind === 'sentence', s.level < 3, s.id);
    assert.match(s.text, /^[A-Z].*[.]$/, s.id);
    assert.ok(!/\s{2}|\n|—/.test(s.text), `${s.id}: no double spaces, line breaks or em dashes`);
    assert.equal(m.itemById(s.id), s);
  }
  for (const s of m.itemsFor(1)) assert.ok(wordCount(s.text) <= 12, `${s.id} has ${wordCount(s.text)} words, too long for level 1`);
  for (const s of m.itemsFor(2)) assert.ok(wordCount(s.text) <= 17, `${s.id} has ${wordCount(s.text)} words, too long for level 2`);
  for (const s of paragraphs) assert.ok(wordCount(s.text) >= 25 && wordCount(s.text) <= 45, `${s.id} has ${wordCount(s.text)} words`);
  assert.equal(new Set(ITEMS.map(s => s.id)).size, ITEMS.length);
  assert.equal(new Set(ITEMS.map(s => s.text.toLowerCase())).size, ITEMS.length);
});

test('every sentence splits cleanly into one cause, one effect and its signal', () => {
  for (const s of sentences) {
    for (const part of ['cause', 'effect']) {
      assert.equal(s.text.split(s[part]).length, 2, `${s.id}: the ${part} “${s[part]}” appears in the sentence exactly once`);
      assert.ok(wordCount(s[part]) >= 2, `${s.id}: the ${part} is more than one word`);
      assert.ok(!/^[\s,;.]|[\s,;.]$/.test(s[part]), `${s.id}: the ${part} has no loose punctuation`);
    }
    const [first, second] = m.parts(s);
    assert.ok(first.start + first.text.length <= second.start, `${s.id}: the cause and the effect do not overlap`);
    assert.deepEqual([first.kind, second.kind].sort(), ['cause', 'effect']);
    // Nothing is left over but the signal and punctuation.
    const pieces = m.pieces(s);
    assert.equal(pieces.map(piece => piece.text).join(''), s.text, s.id);
    const signal = m.signalById(s.signal);
    assert.ok(signal, `${s.id}: “${s.signal}” is a listed signal`);
    assert.deepEqual(pieces.filter(piece => piece.kind === 'signal').map(piece => piece.text.toLowerCase()), signal.words, `${s.id}: the signal is in the sentence, outside the cause and the effect`);
    assert.match(pieces.filter(piece => !piece.kind).map(piece => piece.text).join(''), /^[\s,.;]*$/, `${s.id}: only the signal and punctuation lie outside the cause and the effect`);
    assert.ok(s.text.endsWith(`${second.text}.`), `${s.id}: the sentence ends with its second part`);
    // The part that comes right after the signal is the one the signal table says.
    const ranges = m.signalRanges(s);
    const after = range => m.parts(s).find(part => part.start > range[1] - 1 && part.start - range[1] <= 2)?.kind;
    if (signal.follows === 'both') assert.deepEqual(ranges.map(after), ['cause', 'effect'], s.id);
    else assert.equal(after(ranges.at(-1)), signal.follows, `${s.id}: the ${signal.follows} follows “${signal.label}”`);
    assert.equal(strip(revealHtml(s)), s.text, s.id);
    assert.equal((revealHtml(s).match(/class="ce-seg cause"/g) ?? []).length, 1);
    assert.equal((revealHtml(s).match(/class="ce-seg effect"/g) ?? []).length, 1);
    assert.ok(m.words(s).some(word => word.signal) && m.words(s).some(word => !word.signal), s.id);
    assert.deepEqual(m.words(s).filter(word => word.signal).map(word => word.text.toLowerCase()), signal.words.join(' ').split(' '), s.id);
  }
  assert.equal(m.signalText(m.itemById('a01')), 'because');
  assert.equal(m.signalText(m.itemById('b05')), 'As a result');
  assert.equal(m.signalText(m.itemById('b10')), 'If … then');
});

test('level 1 uses “because” and “so”, in both orders; level 2 adds six more signals', () => {
  const one = m.itemsFor(1);
  assert.deepEqual([...new Set(one.map(s => s.signal))].sort(), ['because', 'so']);
  assert.equal(one.filter(s => s.signal === 'because').length, one.filter(s => s.signal === 'so').length);
  for (const s of one) {
    // Effect first with “because”, cause first with “so”.
    assert.equal(m.parts(s)[0].kind, s.signal === 'because' ? 'effect' : 'cause', s.id);
    assert.match(s.text, s.signal === 'because' ? /^[^,.;]+ because [^,.;]+\.$/ : /^[^,.;]+, so [^,.;]+\.$/, s.id);
  }
  const two = m.itemsFor(2);
  for (const id of ['since', 'as a result', 'therefore', 'due to', 'led to', 'if then']) assert.ok(two.filter(s => s.signal === id).length >= 4, `level 2 has at least four “${id}” sentences`);
  assert.ok(!two.some(s => s.signal === 'so'));
  // Both orders at level 2 as well.
  assert.ok(two.filter(s => m.parts(s)[0].kind === 'cause').length >= 10);
  assert.ok(two.filter(s => m.parts(s)[0].kind === 'effect').length >= 5);
  for (const signal of SIGNALS) {
    assert.equal(m.signalById(signal.id), signal);
    assert.equal(m.itemById(signal.example).signal, signal.id, `${signal.example} is an example of “${signal.label}”`);
    assert.ok(['cause', 'effect', 'both'].includes(signal.follows));
    assert.ok(signal.tip.includes(`“${signal.words[0]}”`), signal.id);
  }
});

test('level 2 comes in eight matching sets of four, with nothing shared inside a set', () => {
  assert.equal(MATCH_SETS.length, 8);
  assert.deepEqual(MATCH_SETS.flat(), m.itemsFor(2));
  for (const set of MATCH_SETS) {
    assert.equal(set.length, 4);
    assert.equal(new Set(set.map(s => s.set)).size, 1);
    // No two causes or effects in a set are about the same thing: they share no word of four letters or more
    // apart from a few very common ones.
    const common = new Set(['with', 'from', 'that', 'were', 'they', 'there', 'your', 'could', 'only', 'into', 'over', 'went', 'left', 'paint', 'water']);
    const key = text => new Set(text.toLowerCase().match(/[a-z]{4,}/g)?.filter(word => !common.has(word)) ?? []);
    for (const a of set) for (const b of set) {
      if (a === b) continue;
      const shared = [...key(a.cause)].filter(word => key(b.effect).has(word) || key(b.cause).has(word));
      assert.deepEqual(shared, [], `${a.id} and ${b.id} share “${shared}”, so their parts could be mixed up`);
    }
  }
});

test('every paragraph: three linked events, something that only came afterwards, and wrong options', () => {
  assert.ok(m.itemsFor(3, 'chain').length >= 15 && m.itemsFor(3, 'fork').length >= 10);
  for (const s of paragraphs) {
    assert.ok(['chain', 'fork'].includes(s.kind), s.id);
    assert.equal(s.events.length, 3, s.id);
    assert.ok(s.decoys.length >= (s.kind === 'fork' ? 2 : 1), `${s.id}: enough wrong options`);
    const statements = [...s.events, s.after, ...s.decoys];
    assert.equal(new Set(statements).size, statements.length, `${s.id}: every option is different`);
    for (const statement of statements) assert.match(statement, /^[A-Z][^.!?]{8,70}\.$/, `${s.id}: “${statement}” is one short sentence`);
    assert.match(s.askCause, /^What caused .+\?$/, s.id);
    if (s.kind === 'chain') assert.match(s.askEffect, /^What was the effect of .+\?$/, s.id);
    assert.match(s.root, /^[a-zA-Z’ -]{6,40}$/, `${s.id}: root`);
    // The paragraph is three or four sentences, and the last one is the event that only came afterwards:
    // it shares a word with `after` and carries no signal word.
    const lines = s.text.split(/(?<=\.) /);
    assert.ok(lines.length >= 3 && lines.length <= 4, `${s.id}: ${lines.length} sentences`);
    const last = lines.at(-1).toLowerCase();
    const afterWords = s.after.toLowerCase().match(/[a-z’]{4,}/g);
    assert.ok(afterWords.filter(word => last.includes(word)).length >= 2, `${s.id}: “${s.after}” is what the last sentence says`);
    assert.ok(!ANY_SIGNAL.test(lines.at(-1)), `${s.id}: no signal word in the last sentence`);
    // What the paragraph does not say is really not in it.
    for (const decoy of s.decoys) assert.ok(!s.text.includes(decoy.replace(/\.$/, '')), `${s.id}: “${decoy}” is in the paragraph`);
    // The listed signal words are in the text, and a paragraph listed with none has none.
    for (const signal of s.signals) assert.ok(new RegExp(`(?<![\\p{L}])${signal}(?![\\p{L}])`, 'u').test(s.text), `${s.id}: “${signal}” is in the paragraph`);
    assert.equal(ANY_SIGNAL.test(s.text), s.signals.length > 0, `${s.id}: its list of signal words matches the text`);
    assert.ok(chainHtml(s).includes(`is-${s.kind}`) && statements.slice(0, 4).every(statement => strip(chainHtml(s)).includes(statement)), s.id);
  }
  // Some paragraphs have no signal word at all, of both kinds.
  for (const kind of ['chain', 'fork']) {
    assert.ok(m.itemsFor(3, kind).filter(s => s.signals.length === 0).length >= 5, `${kind}s with no signal word`);
    assert.ok(m.itemsFor(3, kind).filter(s => s.signals.length > 0).length >= 5, `${kind}s with a signal word`);
  }
});

test('paragraph questions: one right answer and three wrong ones, built from the events', () => {
  for (const s of paragraphs) {
    const [first, second, third] = s.events;
    const caused = m.paragraphQuestion(s, 'what-caused'), effect = m.paragraphQuestion(s, 'what-effect'), after = m.paragraphQuestion(s, 'after');
    assert.equal(caused.prompt, s.askCause);
    assert.equal(caused.answer, first);
    assert.ok(!caused.wrong.includes(second), `${s.id}: the event asked about is not an option`);
    assert.equal(effect.answer, third);
    assert.equal(after.answer, s.after);
    assert.equal(after.prompt, `Which of these happened afterwards, but was not caused by ${s.root}?`);
    assert.deepEqual(after.wrong.slice(0, 2), [second, third], 'the real effects are the tempting wrong answers');
    if (s.kind === 'chain') {
      assert.equal(effect.prompt, s.askEffect);
      assert.ok(effect.wrong.includes(first), 'the cause is offered as a wrong “effect”');
    } else {
      assert.equal(effect.prompt, `What was one effect of ${s.root}?`);
      // The other effect is not offered, so there is only one right answer.
      assert.ok(!effect.wrong.includes(second) && !effect.wrong.includes(first), s.id);
    }
    for (const question of [caused, effect, after]) {
      assert.equal(question.wrong.length, 3, s.id);
      assert.equal(new Set([question.answer, ...question.wrong]).size, 4, s.id);
      assert.ok(question.wrong.every(Boolean), s.id);
      assert.ok(question.wrong.includes(s.decoys[0]), s.id);
      for (const mode of ['what-caused', 'what-effect', 'after']) {
        const q = { item: s, mode, ...m.paragraphQuestion(s, mode) };
        assert.equal(m.whyNot(q, q.answer), '');
        for (const option of q.wrong) assert.ok(m.whyNot(q, option).length > 20, `${s.id}: a reason for “${option}”`);
      }
    }
  }
  const freezer = m.itemById('c02');
  const q = mode => ({ item: freezer, mode, ...m.paragraphQuestion(freezer, mode) });
  assert.equal(m.whyNot(q('what-caused'), freezer.events[2]), 'That came later in the chain. It is an effect, not the cause.');
  assert.equal(m.whyNot(q('what-effect'), freezer.events[0]), 'That is the cause, not the effect.');
  assert.equal(m.whyNot(q('after'), freezer.events[1]), 'That happened because of the open freezer door, so it is an effect.');
  assert.equal(m.whyNot(q('what-caused'), freezer.after), 'That only happened afterwards. Nothing in the paragraph links it to the other events.');
  assert.equal(m.whyNot(q('what-caused'), freezer.decoys[0]), 'The paragraph does not say that.');
  assert.equal(m.whyNot({ item: m.itemById('c22'), mode: 'what-caused', answer: 'x' }, m.itemById('c22').events[2]), 'That is another effect of the same cause.');
  assert.equal(m.answerLine(q('what-caused')), 'The cause: Nora forgot to close the freezer door.');
  assert.equal(m.answerLine(q('what-effect')), 'The effect: A sticky puddle spread across the freezer shelf.');
  assert.match(m.answerLine(q('after')), /^Only this just came later: Nora rode her bike to school\. Coming after something is not the same as being caused by it\.$/);
});

test('nothing in the bank breaks the content rules', () => {
  // No history, health claims or social topics, and nothing frightening.
  const banned = /\b(war|king|queen|president|vote|law|god|church|sick|ill|cold and flu|caught a cold|fever|medicine|vaccine|germs?|diet|healthy|unhealthy|vitamins?|sugar|tired|sleepy|headache|stomach|injur\w+|hurt|blood|died\b(?! out)|kill\w*|poor|rich|money|crime|police)\b/i;
  for (const s of ITEMS) {
    const texts = s.kind === 'sentence' ? [s.text] : [s.text, ...s.events, s.after, ...s.decoys];
    for (const text of texts) {
      const hit = text.match(banned);
      // Plants may die of frost; nothing else does.
      assert.ok(!hit || (hit[0] === 'died' && /tomato plants/.test(text)), `${s.id}: “${hit?.[0]}” in: ${text}`);
    }
  }
});

test('rounds: ten questions, no repeats, the right mix for each level, the same for the same seed', () => {
  for (const level of [1, 2, 3]) {
    const seen = new Set(), asked = new Set();
    for (let seed = 1; seed <= 300; seed++) {
      const round = m.buildRound(level, seed);
      assert.equal(round.length, ROUND_LENGTH);
      assert.deepEqual(m.buildRound(level, seed), round, 'the same seed gives the same round');
      const used = round.flatMap(q => (q.mode === 'match' ? q.items : [q.item]));
      assert.equal(new Set(used.map(s => s.id)).size, used.length, `level ${level} seed ${seed}: no sentence is used twice`);
      for (const s of used) { assert.equal(s.level, level); seen.add(s.id); }
      for (const q of round) if (q.mode !== 'match') asked.add(`${q.item.id}:${q.mode}`);
      const modes = {};
      for (const q of round) modes[q.mode] = (modes[q.mode] ?? 0) + 1;
      if (level === 1) {
        assert.deepEqual(modes, { cause: 5, effect: 5 });
        const because = round.filter(q => q.item.signal === 'because').length;
        assert.ok(because >= 4 && because <= 6, `level 1 seed ${seed}: ${because} “because” sentences`);
      } else if (level === 2) {
        assert.deepEqual(modes, { cause: 3, effect: 3, signal: 3, match: 1 });
        const match = round.find(q => q.mode === 'match');
        assert.ok(MATCH_SETS.includes(match.items));
        assert.deepEqual([...match.order].sort(), [0, 1, 2, 3]);
        assert.ok(match.order.some((value, i) => value !== i), 'the effects are never in the same order as their causes');
        assert.notEqual(round[0], match, 'a round does not open with the matching question');
      } else {
        assert.deepEqual(modes, { 'what-caused': 4, 'what-effect': 3, after: 3 });
        for (const q of round) {
          const expected = m.paragraphQuestion(q.item, q.mode);
          assert.equal(q.prompt, expected.prompt);
          assert.equal(q.answer, expected.answer);
          assert.deepEqual([...q.options].sort(), [expected.answer, ...expected.wrong].sort());
          assert.equal(q.options.filter(option => option === q.answer).length, 1);
        }
      }
    }
    assert.equal(seen.size, m.itemsFor(level).length, `level ${level}: every item turns up`);
    const kinds = level === 1 ? ['cause', 'effect'] : level === 2 ? ['cause', 'effect', 'signal'] : ['what-caused', 'what-effect', 'after'];
    for (const s of m.itemsFor(level)) for (const mode of kinds) assert.ok(asked.has(`${s.id}:${mode}`), `${s.id} is never asked as “${mode}”`);
  }
  assert.notDeepEqual(m.buildRound(1, 1).map(q => q.item.id), m.buildRound(1, 2).map(q => q.item.id));
  // The matching question moves about, every set is used, and the right option is in every position.
  const places = new Set(), sets = new Set(), positions = new Set();
  for (let seed = 1; seed <= 300; seed++) {
    const round = m.buildRound(2, seed);
    places.add(round.findIndex(q => q.mode === 'match'));
    sets.add(round.find(q => q.mode === 'match').items[0].set);
    for (const q of m.buildRound(3, seed)) positions.add(q.options.indexOf(q.answer));
  }
  assert.equal(places.size, 9);
  assert.equal(sets.size, 8);
  assert.equal(positions.size, 4);
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
  // "The ice cube melted because the room was warm." The effect is the first part.
  const ice = m.itemById('a01');
  assert.deepEqual(m.parts(ice).map(part => [part.kind, part.text]), [['effect', 'The ice cube melted'], ['cause', 'the room was warm']]);
  assert.deepEqual([0, 1, 2, -1, undefined].map(i => m.checkAnswer({ item: ice, mode: 'cause' }, i)), [false, true, false, false, false]);
  assert.deepEqual([0, 1, 2].map(i => m.checkAnswer({ item: ice, mode: 'effect' }, i)), [true, false, false]);
  // "It started to rain, so we opened our umbrellas." The cause is the first part.
  const rain = m.itemById('a17');
  assert.equal(m.checkAnswer({ item: rain, mode: 'cause' }, 0), true);
  assert.equal(m.checkAnswer({ item: rain, mode: 'effect' }, 0), false);
  // Tap the signal: any word of "As a result" is right, and "If" and "then" are both right.
  const stream = m.itemById('b05'), freezer = m.itemById('b10');
  const tapped = s => m.words(s).filter((_, i) => m.checkAnswer({ item: s, mode: 'signal' }, i)).map(word => word.text);
  assert.deepEqual(tapped(stream), ['As', 'a', 'result']);
  assert.deepEqual(tapped(freezer), ['If', 'then']);
  assert.deepEqual(tapped(ice), ['because']);
  assert.equal(m.checkAnswer({ item: ice, mode: 'signal' }, 99), false);
  for (const s of sentences) for (const mode of ['cause', 'effect']) assert.equal(m.parts(s).filter((_, i) => m.checkAnswer({ item: s, mode }, i)).length, 1, s.id);
  // Matching: slot k holds the effect of items[order[k]], and the answer lists the slot chosen for each cause.
  const match = { mode: 'match', items: MATCH_SETS[0], order: [2, 0, 3, 1] };
  assert.equal(m.checkAnswer(match, [1, 3, 0, 2]), true);
  assert.equal(m.checkAnswer(match, [0, 1, 2, 3]), false);
  assert.equal(m.checkAnswer(match, [1, 3, 2, 0]), false);
  assert.equal(m.checkAnswer(match, [1, 3, 0]), false);
  assert.equal(m.checkAnswer(match, undefined), false);
  // Paragraph questions: the index of the option.
  const q = { item: m.itemById('c02'), mode: 'what-caused', options: ['a', 'b', 'c', 'd'], answer: 'c' };
  assert.deepEqual([0, 1, 2, 3, 4].map(i => m.checkAnswer(q, i)), [false, false, true, false, false]);
});

test('explanations name the cause, the effect and the signal', () => {
  assert.match(m.DEFINITIONS.cause, /why something happens/);
  assert.match(m.DEFINITIONS.effect, /what happens because of the cause/);
  assert.equal(m.explain({ item: m.itemById('a01'), mode: 'cause' }), 'The cause is “the room was warm”: it tells why. The effect is “The ice cube melted”: it tells what happened. The signal is “because”. The cause comes right after “because”.');
  assert.equal(m.explain({ item: m.itemById('a17'), mode: 'effect' }), 'The cause is “It started to rain”: it tells why. The effect is “we opened our umbrellas”: it tells what happened. The signal is “so”. The effect comes right after “so”.');
  assert.match(m.explain({ item: m.itemById('b03'), mode: 'signal' }), /The signal is “led to”\. The cause comes before “led to” and the effect after it\.$/);
  assert.match(m.explain({ item: m.itemById('b10'), mode: 'cause' }), /The signal is “If … then”\. The cause comes after “if” and the effect after “then”\.$/);
  assert.equal(m.explain({ item: m.itemById('c02'), mode: 'after' }), 'This is a chain. Cause: Nora forgot to close the freezer door. Its effect: The ice cream melted. That effect was the cause of the next one: A sticky puddle spread across the freezer shelf. Only afterwards: Nora rode her bike to school. It came later, but the open freezer door did not cause it.');
  assert.match(m.explain({ item: m.itemById('c22'), mode: 'after' }), /^This is one cause with two effects\. Cause: A heavy snowstorm hit the town\. One effect: .+ Another effect: .+ Only afterwards: The town choir gave its concert\. It came later, but the snowstorm did not cause it\.$/);
  assert.match(m.explain({ mode: 'match', items: MATCH_SETS[0], order: [1, 2, 3, 0] }), /^The pairs are: “The Moon blocked the Sun” caused “the sky went dark for a few minutes”; /);
  for (const s of ITEMS) assert.ok(!/undefined|NaN/.test(m.explain({ item: s, mode: s.level === 3 ? 'after' : 'cause' })), s.id);
  assert.equal(m.sentenceCase('the storm'), 'The storm');
  assert.equal(m.stem(m.itemById('a02'), 'cause'), 'The grass is wet because ______.');
  assert.equal(m.stem(m.itemById('a17'), 'effect'), 'It started to rain, so ______.');
  assert.match(tagHtml('cause'), /class="ce-tag cause">Cause</);
  assert.match(tagHtml('effect'), /class="ce-tag effect">Effect</);
  assert.equal((pairsHtml(MATCH_SETS[0]).match(/<li>/g) ?? []).length, 4);
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
  const [remember, mark, match, finish, chain] = activity.sections;
  assert.ok(remember.lines[0].includes(m.DEFINITIONS.cause) && remember.lines[0].includes(m.DEFINITIONS.effect));
  assert.ok(remember.lines[0].includes('The cause comes right after: because, since, due to.'));
  assert.ok(remember.lines[0].includes('The effect comes right after: so, as a result, therefore.'));
  // Part A: eight sentences, half from each of levels 1 and 2, in both orders.
  assert.deepEqual(mark.items, MARK_IDS.map(m.itemById));
  assert.equal(mark.items.length, 8);
  assert.equal(mark.items.filter(s => s.level === 1).length, 4);
  assert.equal(mark.items.filter(s => s.level === 2).length, 4);
  assert.ok(mark.items.filter(s => m.parts(s)[0].kind === 'cause').length >= 3 && mark.items.filter(s => m.parts(s)[0].kind === 'effect').length >= 3);
  assert.ok(new Set(mark.items.map(s => s.signal)).size >= 5, 'a spread of signal words');
  // Part B: five pairs, the effects in a mixed order with no effect on the same line as its cause.
  assert.deepEqual(match.items, MATCH_IDS.map(m.itemById));
  assert.equal(match.items.length, 5);
  assert.deepEqual([...MATCH_ORDER].sort(), [0, 1, 2, 3, 4]);
  assert.ok(MATCH_ORDER.every((value, i) => value !== i));
  assert.equal(match.order, MATCH_ORDER);
  // Part C: the sentence with one part left out, and the bank's own ending in the key.
  assert.equal(finish.items.length, 4);
  FINISH.forEach(([id, missing], i) => {
    const s = m.itemById(id);
    assert.ok(finish.items[i].q.includes(`“${m.stem(s, missing)}”`) && finish.items[i].q.includes('______'));
    assert.ok(!finish.items[i].q.includes(s[missing]), 'the missing part is not printed on the worksheet');
    assert.ok(finish.items[i].a.includes(`“${s[missing]}”`));
    assert.ok(m.stem(s, missing).endsWith('______.'), 'the gap is at the end of the sentence');
  });
  assert.deepEqual(FINISH.map(([, missing]) => missing).sort(), ['cause', 'cause', 'effect', 'effect']);
  // Part D: the key shows a chain from the bank.
  assert.equal(chain.item, m.itemById(CHAIN_ID));
  assert.equal(chain.item.kind, 'chain');
  // No sentence is used twice on the sheet.
  const ids = [...MARK_IDS, ...MATCH_IDS, ...FINISH.map(([id]) => id), CHAIN_ID];
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(activity.standards, Object.keys(standards));
  assert.equal(activity.tool, 'cause-and-effect');
});
