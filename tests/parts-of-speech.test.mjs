import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/lib/parts-of-speech.mjs';
import { taggedHtml, highlightedHtml, tappableHtml, whyListHtml, chipHtml, paletteHtml } from '../src/lib/parts-of-speech-view.mjs';
import { activity, MARK_GROUPS, SORT_WORDS, SORT_TAGS, PATTERNS, sentenceWithPattern, markLine } from '../src/lib/activities/parts-of-speech.mjs';

const { SENTENCES, LEVELS, PARTS } = m;
const TAGS = PARTS.map(part => part.id);
const allWords = SENTENCES.flatMap(sentence => sentence.words.map(word => ({ ...word, sentence })));
const lower = word => word.text.toLowerCase();
const strip = html => html.replace(/<span class="visually-hidden">.*?<\/span>/g, '').replace(/<span class="pos-w-(tag|mark)"[^>]*>.*?<\/span>/g, '').replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/\s+([,.])/g, '$1');

// The closed word classes. A word tagged as one of these must be on its list, and a word on a list must be tagged that way.
const CLOSED = {
  article: ['a', 'an', 'the'],
  pronoun: ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'us', 'them'],
  conjunction: ['and', 'but', 'or', 'because', 'although', 'if', 'while', 'unless'],
  preposition: ['in', 'on', 'at', 'into', 'under', 'from', 'across', 'for', 'to', 'with', 'behind', 'through', 'during', 'beside', 'above', 'between', 'about'],
};
const PLAIN_ADVERBS = ['often', 'never', 'always', 'sometimes', 'usually', 'very'];
const HELPING = ['can', 'will'];
const LINKING = ['is', 'are', 'was', 'were'];

test('the bank: at least 20 sentences per level, each 5 to 10 words, in the right shape', () => {
  assert.equal(PARTS.length, 8);
  assert.deepEqual(LEVELS.map(level => level.id), [1, 2, 3]);
  for (const level of LEVELS) assert.ok(m.sentencesFor(level.id).length >= 20, `level ${level.id} has ${m.sentencesFor(level.id).length}`);
  for (const s of SENTENCES) {
    assert.match(s.id, /^[abc]\d\d$/, s.id);
    assert.equal(s.level, 'abc'.indexOf(s.id[0]) + 1, s.id);
    assert.ok(s.words.length >= 5 && s.words.length <= 10, `${s.id} has ${s.words.length} words`);
    assert.match(s.text, /^[A-Z][A-Za-z, ]+\.$/, `${s.id}: a plain sentence, with no digits, apostrophes or other marks`);
    assert.equal(s.text, s.words.map(word => word.text + word.after).join(' '));
    assert.equal(s.text.split(' ').length, s.words.length, s.id);
    assert.ok(s.words.slice(0, -1).every(word => word.after === '' || word.after === ','), s.id);
    s.words.forEach((word, i) => {
      assert.equal(word.index, i);
      assert.match(word.text, /^[A-Za-z]+$/, `${s.id}: ${word.text}`);
      // Only the first word, a name and "I" have a capital letter.
      if (/^[A-Z]/.test(word.text)) assert.ok(i === 0 || m.NAMES.includes(word.text) || word.text === 'I', `${s.id}: ${word.text}`);
    });
  }
  assert.equal(new Set(SENTENCES.map(s => s.id)).size, SENTENCES.length, 'ids are unique');
  assert.equal(new Set(SENTENCES.map(s => s.text.toLowerCase())).size, SENTENCES.length, 'sentences are unique');
  for (const s of SENTENCES) assert.equal(m.sentenceById(s.id), s);
});

test('every word has a tag from the set allowed at its level, and a one-line reason', () => {
  for (const level of LEVELS) {
    for (const tag of [...level.asks, ...level.allowed]) assert.ok(TAGS.includes(tag), tag);
    for (const tag of level.asks) assert.ok(level.allowed.includes(tag), `level ${level.id} can only ask about a tag it allows`);
    assert.equal(level.length % 1, 0);
  }
  assert.deepEqual(LEVELS[0].asks, ['noun', 'verb']);
  assert.deepEqual(LEVELS[1].asks, ['noun', 'verb', 'adjective', 'adverb', 'pronoun']);
  assert.deepEqual(LEVELS[2].asks, TAGS);
  for (const word of allWords) {
    const { sentence } = word;
    assert.ok(m.levelById(sentence.level).allowed.includes(word.tag), `${sentence.id}: “${word.text}” is tagged ${word.tag}`);
    assert.ok(word.why.length >= 10 && word.why.length <= 80, `${sentence.id}: “${word.text}” needs a short reason`);
    assert.match(word.why, /^[a-z]/, `${sentence.id}: the reason for “${word.text}” finishes the sentence “It …”`);
    assert.ok(!/\.$/.test(word.why), `${sentence.id}: no full stop at the end of a reason`);
    assert.ok(!/undefined/.test(word.why), `${sentence.id}: ${word.text}`);
    assert.match(m.explainWord(word), new RegExp(`^“${word.text}” is an? ${word.tag}\\. It `));
  }
});

test('a word has the same tag everywhere in the bank, and none of the shifting words is used', () => {
  const tags = new Map();
  for (const word of allWords) {
    const seen = tags.get(lower(word));
    assert.ok(!seen || seen === word.tag, `“${lower(word)}” is tagged ${seen} and ${word.tag}`);
    tags.set(lower(word), word.tag);
    assert.ok(!m.AVOIDED.includes(lower(word)), `${word.sentence.id}: “${word.text}” is on the avoided list`);
  }
  // The examples of words with two jobs are not in the game at all, or only in one of their jobs.
  for (const item of m.SHIFTERS) {
    assert.ok(item.uses.length >= 2 && new Set(item.uses.map(([tag]) => tag)).size === item.uses.length, item.word);
    for (const [tag, text] of item.uses) {
      assert.ok(TAGS.includes(tag) && new RegExp(`\\b${item.word}\\b`, 'i').test(text), text);
      assert.ok(!SENTENCES.some(s => s.text === text), `“${text}” is an example for the page, not a game sentence`);
    }
    assert.ok(!tags.has(item.word), `“${item.word}” can be two parts of speech, so the bank leaves it out`);
  }
});

test('closed word classes: articles, pronouns, conjunctions and prepositions are exactly the words on their lists', () => {
  for (const word of allWords) {
    for (const [tag, list] of Object.entries(CLOSED)) {
      assert.equal(word.tag === tag, list.includes(lower(word)), `${word.sentence.id}: “${word.text}” tagged ${word.tag}`);
    }
  }
  for (const s of SENTENCES) {
    s.words.forEach((word, i) => {
      const next = s.words[i + 1];
      if (word.tag === 'article') {
        // An article is followed by its noun, with at most one adjective between them.
        const after = s.words.slice(i + 1, i + 3);
        assert.ok(after[0]?.tag === 'noun' || (after[0]?.tag === 'adjective' && after[1]?.tag === 'noun'), `${s.id}: “${word.text}”`);
        const noun = after.find(w => w.tag === 'noun');
        assert.equal(word.why, `goes with the noun “${noun.text}”`);
        if (lower(word) !== 'the') assert.equal(lower(word) === 'an', /^[aeiou]/i.test(next.text), `${s.id}: “${word.text} ${next.text}”`);
      }
      // A preposition is followed by a noun phrase or a pronoun, never by a verb (so "to" is never part of "to run").
      if (word.tag === 'preposition') assert.ok(['article', 'noun', 'pronoun', 'adjective'].includes(next?.tag), `${s.id}: “${word.text}” needs something to place`);
      // An adjective comes before its noun, or after a linking verb.
      if (word.tag === 'adjective') {
        const before = s.words.slice(0, i).reverse();
        const linked = before.find(w => w.tag === 'verb' || w.tag === 'noun');
        assert.ok(next?.tag === 'noun' || (linked && LINKING.includes(lower(linked))), `${s.id}: “${word.text}”`);
      }
      if (word.tag === 'adverb') assert.ok(/ly$/.test(word.text) || PLAIN_ADVERBS.includes(lower(word)), `${s.id}: “${word.text}”`);
      if (/ly$/.test(word.text)) assert.ok(word.tag === 'adverb' || word.text === 'friendly', `${s.id}: “${word.text}”`);
      // A helping verb is followed by its main verb, and "very" by the adjective it strengthens.
      if (HELPING.includes(lower(word))) assert.equal(next?.tag, 'verb', `${s.id}: “${word.text}”`);
      if (lower(word) === 'very') assert.equal(next?.tag, 'adjective', s.id);
      // No -ing word is used as a noun or an adjective: the only -ing verbs follow a helping "are".
      if (/ing$/.test(word.text) && (word.tag === 'verb' || word.tag === 'adjective')) assert.ok(word.tag === 'verb' && lower(s.words[i - 1]) === 'are', `${s.id}: “${word.text}”`);
    });
  }
  // The other words ending in -ing are a plain noun and a preposition, not verbs in disguise.
  assert.deepEqual([...new Set(allWords.filter(w => /ing$/.test(w.text)).map(w => `${lower(w)}:${w.tag}`))].sort(), ['during:preposition', 'morning:noun', 'singing:verb']);
  // No -ed word is used to describe a noun ("the broken cup"): apart from "bed" and "red", every one is a verb.
  assert.deepEqual([...new Set(allWords.filter(w => /ed$/.test(w.text) && w.tag !== 'verb').map(w => `${lower(w)}:${w.tag}`))].sort(), ['bed:noun', 'red:adjective']);
});

test('each level keeps to its rules, and every question it can ask has a target', () => {
  const count = (s, tag) => m.targets(s, tag).length;
  for (const s of m.sentencesFor(1)) {
    assert.equal(count(s, 'verb'), 1, `${s.id}: one action verb`);
    assert.ok(count(s, 'noun') >= 1, `${s.id}: at least one noun`);
    assert.ok(!s.words.some(word => [...LINKING, ...HELPING].includes(lower(word))), `${s.id}: no linking or helping verbs at level 1`);
  }
  for (const s of [...m.sentencesFor(2), ...m.sentencesFor(3)]) {
    assert.ok(count(s, 'verb') >= 1, `${s.id}: a verb`);
    assert.ok(count(s, 'noun') + count(s, 'pronoun') >= 1, `${s.id}: a noun or a pronoun`);
  }
  for (const s of m.sentencesFor(2)) assert.ok(LEVELS[1].asks.filter(tag => count(s, tag) > 0).length >= 3, `${s.id}: at least three of the five parts of speech`);
  // Level 2 has plenty of every part of speech it asks about, and level 3 of all eight.
  for (const level of [2, 3]) {
    for (const tag of m.levelById(level).asks) {
      const sentences = m.sentencesFor(level).filter(s => count(s, tag) > 0).length;
      assert.ok(sentences >= 8, `level ${level}: ${sentences} sentences with ${tag}`);
    }
  }
  // Nearly every level 3 sentence has a preposition or a conjunction in it.
  const withLinks = m.sentencesFor(3).filter(s => count(s, 'preposition') + count(s, 'conjunction') >= 1).length;
  assert.ok(withLinks >= m.sentencesFor(3).length - 2, `${withLinks} level 3 sentences have a preposition or a conjunction`);
  assert.deepEqual(m.targets(m.sentenceById('a01'), 'noun'), [2, 5]);
  assert.deepEqual(m.targets(m.sentenceById('a01'), 'pronoun'), []);
});

test('rounds: the right length, no repeats, a target in every question, the same for the same seed', () => {
  for (const level of LEVELS) {
    const seen = new Set(), asked = new Set();
    for (let seed = 1; seed <= 300; seed++) {
      const round = m.buildRound(level.id, seed);
      assert.equal(round.length, level.length);
      assert.ok(level.length >= 8 && level.length <= 10);
      assert.equal(new Set(round.map(q => q.sentence.id)).size, level.length, `level ${level.id} seed ${seed}: no repeats`);
      for (const q of round) {
        assert.equal(q.sentence.level, level.id);
        seen.add(q.sentence.id);
        if (q.mode === 'color') continue;
        asked.add(q.tag);
        assert.ok(level.asks.includes(q.tag));
        assert.ok(m.targets(q.sentence, q.tag).length >= 1, `level ${level.id} seed ${seed}: a question with nothing to find`);
        if (q.mode === 'name') assert.equal(q.sentence.words[q.index].tag, q.tag);
      }
      const modes = round.map(q => q.mode);
      if (level.id === 1) {
        assert.ok(modes.every(mode => mode === 'tap'));
        assert.equal(round.filter(q => q.tag === 'noun').length, 5);
        assert.equal(round.filter(q => q.tag === 'verb').length, 5);
      } else if (level.id === 2) {
        assert.equal(modes.filter(mode => mode === 'tap').length, 5);
        assert.equal(modes.filter(mode => mode === 'name').length, 5);
        const tags = new Set(round.map(q => q.tag));
        assert.ok(tags.size >= 4, `level 2 seed ${seed}: only ${[...tags]} asked`);
        for (const tag of tags) assert.ok(round.filter(q => q.tag === tag).length <= 4, `level 2 seed ${seed}: too many ${tag} questions`);
      } else {
        assert.ok(modes.every(mode => mode === 'color'));
      }
      assert.deepEqual(m.buildRound(level.id, seed), round, 'the same seed gives the same round');
    }
    assert.equal(seen.size, m.sentencesFor(level.id).length, `level ${level.id}: every sentence turns up`);
    if (level.id < 3) assert.deepEqual([...asked].sort(), [...level.asks].sort(), `level ${level.id}: every part of speech is asked about`);
  }
  assert.notDeepEqual(m.buildRound(1, 1).map(q => q.sentence.id), m.buildRound(1, 2).map(q => q.sentence.id));
  // Level 1 does not simply alternate nouns and verbs.
  const orders = new Set(Array.from({ length: 50 }, (_, seed) => m.buildRound(1, seed + 1).map(q => q.tag[0]).join('')));
  assert.ok(orders.size > 30);
});

test('checking answers in each mode', () => {
  const dog = m.sentenceById('a01'); // The brown dog chased a ball.
  const tap = { sentence: dog, mode: 'tap', tag: 'noun' };
  assert.deepEqual(m.checkAnswer(tap, [2, 5]), { right: true, marks: [null, null, 'hit', null, null, 'hit'] });
  assert.deepEqual(m.checkAnswer(tap, [5, 2]).right, true);
  assert.deepEqual(m.checkAnswer(tap, [2]), { right: false, marks: [null, null, 'hit', null, null, 'missed'] });
  assert.deepEqual(m.checkAnswer(tap, [2, 3, 5]), { right: false, marks: [null, null, 'hit', 'wrong', null, 'hit'] });
  assert.equal(m.checkAnswer(tap, []).right, false);
  assert.equal(m.checkAnswer(tap, undefined).right, false);
  assert.equal(m.answerLine(tap), 'The nouns are “dog” and “ball”.');
  assert.equal(m.answerLine({ ...tap, tag: 'verb' }), 'The only verb is “chased”.');

  const name = { sentence: dog, mode: 'name', tag: 'adjective', index: 1 };
  assert.deepEqual(m.checkAnswer(name, 'adjective'), { right: true, marks: [null, 'hit', null, null, null, null] });
  assert.deepEqual(m.checkAnswer(name, 'noun'), { right: false, marks: [null, 'wrong', null, null, null, null] });
  assert.equal(m.answerLine(name), '“brown” is an adjective. It describes the dog.');

  const color = { sentence: dog, mode: 'color' };
  const key = dog.words.map(word => word.tag);
  assert.deepEqual(key, ['article', 'adjective', 'noun', 'verb', 'article', 'noun']);
  assert.deepEqual(m.checkAnswer(color, key), { right: true, marks: Array(6).fill('hit') });
  assert.deepEqual(m.checkAnswer(color, ['article', 'noun', 'noun', 'verb', null, 'noun']), { right: false, marks: ['hit', 'wrong', 'hit', 'hit', 'wrong', 'hit'] });
  assert.equal(m.checkAnswer(color, undefined).right, false);

  // The right answer is right, and a changed answer is wrong, for every question of 40 rounds at each level.
  for (const level of [1, 2, 3]) {
    for (let seed = 1; seed <= 40; seed++) {
      for (const q of m.buildRound(level, seed)) {
        const right = q.mode === 'tap' ? m.targets(q.sentence, q.tag) : q.mode === 'name' ? q.tag : q.sentence.words.map(word => word.tag);
        assert.equal(m.checkAnswer(q, right).right, true);
        const wrong = q.mode === 'tap' ? q.sentence.words.map(w => w.index).filter(i => !right.includes(i)).slice(0, 1) : q.mode === 'name' ? (q.tag === 'noun' ? 'verb' : 'noun') : right.map(() => 'conjunction');
        assert.equal(m.checkAnswer(q, wrong).right, false);
      }
    }
  }
});

test('the tally, the part of speech to practice, the score and the message', () => {
  const round = m.buildRound(2, 7);
  const perfect = round.map(q => m.checkAnswer(q, q.mode === 'tap' ? m.targets(q.sentence, q.tag) : q.tag));
  const counts = m.tally(round, perfect);
  assert.equal(Object.values(counts).reduce((sum, row) => sum + row.total, 0), 10);
  assert.ok(Object.values(counts).every(row => row.right === row.total));
  assert.equal(m.practiceNext(counts), null);
  // Miss the first question: its part of speech is the one to practice.
  const one = [...perfect];
  one[0] = m.checkAnswer(round[0], round[0].mode === 'tap' ? [] : 'article');
  assert.equal(m.practiceNext(m.tally(round, one)), round[0].tag);
  // At level 3 every word counts for the part of speech it is.
  const hard = m.buildRound(3, 7);
  const words = hard.flatMap(q => q.sentence.words);
  const checks = hard.map(q => m.checkAnswer(q, q.sentence.words.map(word => (word.tag === 'adverb' ? 'adjective' : word.tag))));
  const byWord = m.tally(hard, checks);
  assert.equal(Object.values(byWord).reduce((sum, row) => sum + row.total, 0), words.length);
  for (const tag of TAGS) assert.equal(byWord[tag]?.total ?? 0, words.filter(word => word.tag === tag).length, tag);
  assert.equal(byWord.adverb.right, 0);
  assert.equal(m.practiceNext(byWord), 'adverb');
  assert.equal(m.practiceNext({ noun: { right: 1, total: 2 }, verb: { right: 2, total: 4 }, adverb: { right: 3, total: 3 } }), 'verb', 'on a tie, the one with more misses');
  assert.equal(m.practiceNext({}), null);

  assert.deepEqual(m.scoreRound([]), { correct: 0, total: 0, perfect: false });
  assert.deepEqual(m.scoreRound([true, false, true]), { correct: 2, total: 3, perfect: false });
  assert.deepEqual(m.scoreRound(Array(8).fill(true)), { correct: 8, total: 8, perfect: true });
  const messages = [10, 8, 5, 4].map(correct => m.resultMessage({ correct, total: 10 }));
  assert.equal(new Set(messages).size, 4);
  assert.match(messages[0], /perfect/i);
});

test('the seeded random number generator is steady and spread out', () => {
  const a = m.seededRandom(42), b = m.seededRandom(42);
  assert.deepEqual(Array.from({ length: 5 }, a), Array.from({ length: 5 }, b));
  const many = Array.from({ length: 2000 }, m.seededRandom(7));
  assert.ok(many.every(v => v >= 0 && v < 1));
  assert.ok(Math.abs(many.reduce((sum, v) => sum + v, 0) / many.length - 0.5) < 0.03);
});

test('what the page and the game show comes from the bank', () => {
  for (const part of PARTS) {
    assert.ok(part.definition.length > 30 && part.test.length > 20 && part.plural && part.short, part.id);
    const examples = m.examplesOf(part.id, 5);
    assert.equal(examples.length, part.id === 'article' ? 2 : 5, part.id);
    for (const example of examples) assert.ok(example.sentence.words.some(word => m.plainWord(word) === example.word && word.tag === part.id), `${example.word} is ${part.id}`);
    assert.equal(chipHtml(part.id), `<span class="pos-chip pos-${part.id}">${part.name}</span>`);
  }
  assert.equal(m.plainWord({ text: 'The' }), 'the');
  assert.equal(m.plainWord({ text: 'Maya' }), 'Maya');
  assert.equal(m.plainWord({ text: 'I' }), 'I');
  assert.ok(m.CONVENTIONS.length >= 5 && m.CONVENTIONS.every(line => line.endsWith('.')));
  for (const s of SENTENCES) {
    assert.equal(strip(taggedHtml(s)), s.text, s.id);
    assert.equal(strip(tappableHtml(s)), s.text, s.id);
    assert.equal(strip(highlightedHtml(s, 0)), s.text, s.id);
    assert.equal((tappableHtml(s).match(/<button /g) ?? []).length, s.words.length);
    assert.equal((whyListHtml({ sentence: s, mode: 'color' }).match(/<li/g) ?? []).length, s.words.length, `${s.id}: a reason for every word`);
  }
  const dog = m.sentenceById('a01');
  const question = { sentence: dog, mode: 'tap', tag: 'noun' };
  const check = m.checkAnswer(question, [2, 3]);
  const html = taggedHtml(dog, check.marks);
  assert.equal((html.match(/is-hit/g) ?? []).length, 1);
  assert.equal((html.match(/is-wrong/g) ?? []).length, 1);
  assert.equal((html.match(/is-missed/g) ?? []).length, 1);
  assert.match(whyListHtml(question, check), /You missed this noun\./);
  assert.match(whyListHtml(question, check), /You tapped it, but it is not a noun\./);
  assert.equal((whyListHtml(question, check, null, true).match(/<li/g) ?? []).length, 2, 'only the words that went wrong');
  assert.match(whyListHtml({ sentence: dog, mode: 'name', tag: 'adjective', index: 1 }, m.checkAnswer({ sentence: dog, mode: 'name', tag: 'adjective', index: 1 }, 'adverb'), 'adverb'), /You chose adverb\./);
  assert.equal((paletteHtml(LEVELS[2].asks, 'data-paint').match(/<button /g) ?? []).length, 8);
  assert.equal((paletteHtml(LEVELS[1].asks, 'data-choice').match(/data-choice=/g) ?? []).length, 5);
});

test('the worksheet and its answer key are built from the bank', () => {
  const [remember, mark, sort, write] = activity.sections;
  assert.deepEqual(activity.sections.map(section => section.type), ['text', 'pos-mark', 'pos-sort', 'questions']);
  for (const id of ['noun', 'verb', 'adjective', 'adverb', 'preposition']) assert.ok(remember.lines.join(' ').includes(m.partById(id).definition), id);

  // Part A: eight different sentences, each with something to underline and something to circle.
  assert.equal(mark.groups.length, 2);
  const ids = MARK_GROUPS.flatMap(group => group.ids);
  assert.equal(ids.length, 8);
  assert.equal(new Set(ids).size, 8);
  mark.groups.forEach((group, g) => {
    assert.deepEqual(group.items, MARK_GROUPS[g].ids.map(m.sentenceById));
    assert.equal(group.start, g * 4 + 1);
    assert.ok(group.intro.startsWith(`Sentences ${g * 4 + 1} to ${g * 4 + 4}: underline every ${group.underline} and circle every ${group.circle}.`));
    for (const sentence of group.items) {
      assert.ok(sentence.level <= 2, 'levels 1 and 2 only');
      assert.ok(m.targets(sentence, group.underline).length >= 1, `${sentence.id}: something to underline`);
      assert.ok(m.targets(sentence, group.circle).length >= 1, `${sentence.id}: something to circle`);
    }
  });
  assert.equal(markLine(mark.groups[0], m.sentenceById('a05')), 'Nouns: Ben, ball and net. Verb: kicked.');
  assert.equal(markLine(mark.groups[0], m.sentenceById('b22')), 'Nouns: parrot and words. Verbs: can and learn.');
  assert.equal(markLine(mark.groups[1], m.sentenceById('b04')), 'Adjective: hot. Adverb: very.');

  // Part B: twelve words from the bank, three for each column, each with one tag only.
  assert.equal(SORT_WORDS.length, 12);
  assert.equal(new Set(SORT_WORDS).size, 12);
  assert.deepEqual(sort.bank, SORT_WORDS);
  assert.deepEqual(sort.columns.map(column => column.tag), SORT_TAGS);
  for (const column of sort.columns) {
    assert.equal(column.words.length, 3, column.name);
    for (const text of column.words) {
      const found = allWords.filter(word => m.plainWord(word) === text);
      assert.ok(found.length >= 1, `“${text}” is in the bank`);
      assert.ok(found.every(word => word.tag === column.tag), `“${text}” is always ${column.tag}`);
    }
  }
  assert.deepEqual(sort.columns.flatMap(column => column.words).sort(), [...SORT_WORDS].sort());
  // The word box does not give the answer away by listing the words column by column.
  assert.notDeepEqual(SORT_WORDS, sort.columns.flatMap(column => column.words));

  // Part C: each pattern is met by a sentence in the bank, and the key quotes it.
  assert.equal(write.items.length, PATTERNS.length);
  PATTERNS.forEach((pattern, i) => {
    const example = sentenceWithPattern(pattern);
    assert.deepEqual(example.words.map(word => word.tag), pattern);
    assert.ok(write.items[i].q.includes(pattern.join(' + ')));
    assert.ok(write.items[i].a.includes(`“${example.text}”`));
    for (const word of example.words) assert.ok(write.items[i].a.includes(`“${word.text}” is the ${word.tag}`));
  });
  assert.equal(sentenceWithPattern(PATTERNS[0]).text, 'The little kitten purred softly.');
});
