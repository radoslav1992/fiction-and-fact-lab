import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/lib/word-builder.mjs';
import { resultHtml, tilesHtml, middleOptionsHtml, cutterHtml, cutText, splitHtml, textHtml, partHtml } from '../src/lib/word-builder-view.mjs';
import { activity, BREAK_WORDS, BUILD_WORDS, MATCH_PREFIXES, MATCH_ORDER } from '../src/lib/activities/word-builder.mjs';

const { WORDS, PREFIXES, SUFFIXES, ROOTS, LEVELS, ROUND_LENGTH } = m;
const text = html => html.replace(/<span class="visually-hidden">.*?<\/span>/g, '').replace(/<[^>]+>/g, '');
const labels = word => word.parts.map(m.partLabel);

test('the word parts: the ones each level promises, each with one standard meaning', () => {
  const at = (list, level) => list.filter(part => part.level === level).map(part => part.label);
  assert.deepEqual(at(PREFIXES, 1), ['un-', 're-']);
  assert.deepEqual(at(SUFFIXES, 1), ['-ful', '-less', '-er', '-est', '-er', '-ing', '-ed', '-ly']);
  assert.deepEqual(at(PREFIXES, 2), ['dis-', 'mis-', 'pre-', 'non-', 'over-', 'under-']);
  assert.deepEqual(at(SUFFIXES, 2), ['-able', '-ness', '-ment', '-ion']);
  for (const id of ['port', 'spect', 'struct', 'graph', 'tele', 'bio', 'aud', 'rupt', 'scrib', 'dict', 'geo', 'micro', 'photo']) assert.ok(ROOTS.some(part => part.id === id), `the root ${id}`);
  const meaning = (list, id) => list.find(part => part.id === id).meaning;
  assert.equal(meaning(PREFIXES, 'un'), 'not, or the opposite of');
  assert.equal(meaning(PREFIXES, 're'), 'again, or back');
  assert.equal(meaning(PREFIXES, 'mis'), 'wrongly or badly');
  assert.equal(meaning(PREFIXES, 'pre'), 'before');
  assert.equal(meaning(SUFFIXES, 'ful'), 'full of');
  assert.equal(meaning(SUFFIXES, 'less'), 'without');
  assert.equal(meaning(SUFFIXES, 'able'), 'able to be');
  assert.deepEqual(Object.fromEntries(ROOTS.map(part => [part.id, part.meaning])), {
    port: 'carry', spect: 'look', struct: 'build', dict: 'say', rupt: 'break', scrib: 'write', aud: 'hear', graph: 'write or draw',
    tele: 'far', micro: 'small', photo: 'light', bio: 'life', geo: 'earth', auto: 'self', scope: 'look at', phone: 'sound', meter: 'measure',
  });
  for (const part of [...PREFIXES, ...SUFFIXES, ...ROOTS]) {
    assert.ok(part.meaning.length >= 3 && !part.meaning.endsWith('.'), part.label);
    assert.ok([1, 2, 3].includes(part.level), part.label);
    // Every part is used: affixes of levels 1 and 2 by at least five words, every other part by at least one.
    const used = WORDS.filter(word => word.parts.some(item => item.kind === part.kind && item.id === part.id)).length;
    assert.ok(used >= (part.kind !== 'root' && part.level < 3 ? 5 : 1), `${part.label} is used by ${used} words`);
    assert.equal(m.examplesOfPart(part, 3).length, Math.min(3, used));
  }
  for (const part of SUFFIXES) assert.match(part.makes, /^an? /, part.label);
  for (const part of ROOTS) {
    assert.ok(['Latin', 'Greek'].includes(part.origin), part.id);
    const used = WORDS.filter(word => word.parts.some(item => item.kind === 'root' && item.id === part.id)).length;
    assert.ok(used >= 2, `the root ${part.id} is in ${used} words`);
  }
  assert.equal(new Set(PREFIXES.map(part => part.id)).size, PREFIXES.length);
  assert.equal(new Set(SUFFIXES.map(part => part.id)).size, SUFFIXES.length);
  assert.equal(new Set(ROOTS.flatMap(part => part.forms)).size, ROOTS.flatMap(part => part.forms).length);
  assert.deepEqual(LEVELS.map(level => level.id), [1, 2, 3]);
});

test('the list: at least 40 words per level, every word built correctly from its parts', () => {
  for (const level of LEVELS) assert.ok(m.wordsFor(level.id).length >= 40, `level ${level.id} has ${m.wordsFor(level.id).length}`);
  assert.equal(new Set(WORDS.map(word => word.word)).size, WORDS.length, 'no word is listed twice');
  for (const word of WORDS) {
    assert.match(word.word, /^[a-z]{4,14}$/, word.word);
    assert.equal(word.spelled, word.word, `${word.word}: its parts spell “${word.spelled}”`);
    assert.equal(m.spell(word.parts).word, word.word);
    assert.ok(word.parts.length >= 2 && word.parts.length <= 4, word.word);
    assert.ok(word.parts.every(part => part.kind && part.label && /^[a-z]+$/.test(part.text)), word.word);
    // The level of a word is the highest level of its parts: level 3 words have a root, level 2 words a level 2 affix.
    assert.equal(word.level, Math.max(...word.parts.map(part => part.level)), word.word);
    assert.ok(word.parts.some(part => part.kind !== 'base'), `${word.word} has a prefix, a suffix or a root`);
    assert.equal(word.level === 3, word.parts.some(part => part.kind === 'root'), `${word.word}: roots are level 3`);
    if (word.level < 3) assert.equal(word.parts.filter(part => part.kind === 'base').length, 1, `${word.word} has one base word`);
    // Prefixes come first and suffixes last.
    const kinds = word.parts.map(part => (part.kind === 'prefix' ? 'p' : part.kind === 'suffix' ? 's' : 'm')).join('');
    assert.match(kinds, /^p*m+s*$/, `${word.word}: ${kinds}`);
    assert.ok(word.definition.length >= 6 && word.definition.length <= 90, `${word.word}: ${word.definition}`);
    assert.ok(!/[.“”]$|undefined/.test(word.definition), `${word.word}: ${word.definition}`);
    assert.equal(m.wordByText(word.word), word);
    assert.equal(m.partsLine(word).split(' + ').length, word.parts.length);
    assert.ok(!/undefined|NaN/.test(m.explain(word)), word.word);
  }
  // Hand-written definitions are all different, so a meaning points at one word only.
  const plain = WORDS.filter(word => word.plain).map(word => word.definition);
  assert.equal(new Set(plain).size, plain.length);
  // Nothing is split where there is no real prefix.
  for (const fake of ['really', 'uncle', 'under', 'pretty', 'reach', 'missing', 'display', 'recent', 'unit']) assert.equal(m.wordByText(fake), undefined, fake);
  // A base word is always a whole word that the rest of the list spells the same way.
  const bases = new Set(WORDS.filter(word => word.level < 3).flatMap(word => word.parts.filter(part => part.kind === 'base').map(part => part.text)));
  assert.ok(bases.has('happy') && bases.has('hope') && bases.has('run') && !bases.has('happi') && !bases.has('hop ') && !bases.has('runn'));
});

test('definitions made from a suffix read correctly', () => {
  const definition = word => m.wordByText(word).definition;
  assert.equal(definition('taller'), 'more tall');
  assert.equal(definition('happiest'), 'most happy');
  assert.equal(definition('quickly'), 'in a quick way');
  assert.equal(definition('easily'), 'in an easy way');
  assert.equal(definition('unkindly'), 'in an unkind way');
  assert.equal(definition('carefully'), 'in a careful way');
  assert.equal(definition('happiness'), 'the state of being happy');
  assert.equal(definition('unhappiness'), 'the state of being unhappy');
  assert.equal(definition('hoping'), 'the action “hope”, happening now or going on');
  assert.equal(definition('unlocked'), 'the action “unlock”, in the past');
  for (const word of WORDS.filter(word => !word.plain)) assert.ok(['ing', 'ed', 'er', 'est', 'ly', 'ness'].includes(word.parts.at(-1).id), word.word);
});

test('the three spelling rules', () => {
  const add = (stem, ending) => m.addSuffix(stem, ending);
  assert.deepEqual(add('hope', 'ing'), { text: 'hoping', rule: 'drop-e' });
  assert.deepEqual(add('nice', 'est'), { text: 'nicest', rule: 'drop-e' });
  assert.deepEqual(add('educate', 'ion'), { text: 'education', rule: 'drop-e' });
  assert.deepEqual(add('hope', 'ful'), { text: 'hopeful', rule: null });
  assert.deepEqual(add('agree', 'able'), { text: 'agreeable', rule: null });
  assert.deepEqual(add('run', 'er'), { text: 'runner', rule: 'double' });
  assert.deepEqual(add('big', 'est'), { text: 'biggest', rule: 'double' });
  assert.deepEqual(add('stop', 'ed'), { text: 'stopped', rule: 'double' });
  assert.deepEqual(add('fix', 'ed'), { text: 'fixed', rule: null });
  assert.deepEqual(add('play', 'ing'), { text: 'playing', rule: null });
  assert.deepEqual(add('read', 'er'), { text: 'reader', rule: null });
  assert.deepEqual(add('help', 'ing'), { text: 'helping', rule: null });
  assert.deepEqual(add('sad', 'ly'), { text: 'sadly', rule: null });
  assert.deepEqual(add('happy', 'ness'), { text: 'happiness', rule: 'y-to-i' });
  assert.deepEqual(add('carry', 'ed'), { text: 'carried', rule: 'y-to-i' });
  assert.deepEqual(add('carry', 'ing'), { text: 'carrying', rule: null });
  assert.deepEqual(add('play', 'ed'), { text: 'played', rule: null });
  assert.deepEqual(add('beauty', 'ful'), { text: 'beautiful', rule: 'y-to-i' });

  const changes = word => m.wordByText(word).changes;
  assert.deepEqual(changes('hoping'), [{ rule: 'drop-e', stem: 'hope', suffix: '-ing' }]);
  assert.deepEqual(changes('hopping'), [{ rule: 'double', stem: 'hop', suffix: '-ing' }]);
  assert.deepEqual(changes('unhappiness'), [{ rule: 'y-to-i', stem: 'happy', suffix: '-ness' }]);
  assert.deepEqual(changes('unbreakable'), []);
  assert.deepEqual(changes('misspell'), []);
  assert.equal(m.changeLine(changes('hoping')[0]), 'The e in “hope” is dropped before -ing.');
  assert.equal(m.changeLine(changes('runner')[0]), 'The last letter of “run” is doubled before -er.');
  assert.equal(m.changeLine(changes('happiness')[0]), 'The y in “happy” changes to i before -ness.');
  assert.deepEqual(m.RULES.map(rule => rule.id), ['drop-e', 'double', 'y-to-i']);
  for (const rule of m.RULES) {
    const examples = m.examplesOfRule(rule.id, 4);
    assert.equal(examples.length, 4, rule.id);
    assert.equal(new Set(examples.map(word => word.parts[0].text)).size, 4, 'four different base words');
    for (const word of examples) assert.deepEqual(word.changes.map(change => change.rule), [rule.id]);
    assert.equal(m.ruleById(rule.id), rule);
  }
  // Each "but" in the rules table is true of the rules as coded.
  assert.equal(add('carry', 'ing').text + add('play', 'ed').text + add('fix', 'ed').text + add('read', 'er').text + add('sad', 'ly').text + add('hope', 'ful').text, 'carryingplayedfixedreadersadlyhopeful');
  // Only suffixes change a spelling, and the root words of level 3 never do.
  for (const word of WORDS.filter(word => word.level === 3)) assert.deepEqual(word.changes, [], word.word);
  for (const word of WORDS.filter(word => word.changes.length === 0)) assert.equal(word.parts.map(part => part.text).join(''), word.word);
});

test('explanations name the parts, their meanings and any spelling change', () => {
  assert.equal(m.explain(m.wordByText('unhappy')), 'un- + happy = unhappy. “un-” means “not, or the opposite of”. Unhappy: not happy.');
  assert.equal(m.explain(m.wordByText('runner')), 'run + -er = runner. “-er” means “a person or thing that does”. The last letter of “run” is doubled before -er. Runner: a person who runs.');
  assert.equal(m.explain(m.wordByText('taller')), 'tall + -er = taller. “-er” means “more”. Taller: more tall.');
  assert.equal(m.explain(m.wordByText('transport')), 'trans- + port = transport. “trans-” means “across”. The root “port” means “carry”. Transport: to carry people or things from one place to another.');
  assert.equal(m.partsLine(m.wordByText('description')), 'de- + script + -ion');
  assert.equal(m.partsLine(m.wordByText('autobiography')), 'auto + bio + graph + -y');
  assert.deepEqual(m.wordByText('geometry').parts.map(part => part.id), ['geo', 'meter', 'y']);
});

test('build mode: every word with one part before and one part after its middle can be made, and nothing else', () => {
  for (const level of LEVELS) {
    const middles = m.middlesFor(level.id);
    assert.ok(middles.length >= 20, `level ${level.id} offers ${middles.length} middles`);
    assert.deepEqual(middles.map(item => item.text), middles.map(item => item.text).sort());
    for (const middle of middles) {
      assert.equal(middle.kind, level.id === 3 ? 'root' : 'base', middle.text);
      const family = m.familyOf(level.id, middle.text);
      assert.equal(middle.count, family.length);
      assert.ok(family.length >= 1, middle.text);
      const tiles = m.tilesFor(level.id, middle.text);
      for (const side of ['before', 'after']) {
        const shown = tiles[side].map(tile => tile.label);
        assert.equal(new Set(shown).size, shown.length, `${middle.text}: a tile twice`);
        assert.ok(shown.length <= 8 || level.id === 3, `${middle.text}: ${shown.length} tiles ${side}`);
        assert.ok(!shown.includes(middle.text));
      }
      const made = new Set();
      for (const before of [null, ...tiles.before.map(tile => tile.label)]) {
        for (const after of [null, ...tiles.after.map(tile => tile.label)]) {
          const word = m.lookup(level.id, before, middle.text, after);
          if (!before && !after) { assert.equal(word, null, `${middle.text} alone is not a built word`); continue; }
          if (!word) continue;
          assert.deepEqual(labels(word), [before, middle.text, after].filter(Boolean), word.word);
          made.add(word.word);
        }
      }
      assert.deepEqual([...made].sort(), family.map(word => word.word).sort(), `${middle.text}: every word of the family can be built with the tiles shown`);
    }
    // Levels 1 and 2 show tiles that do not fit as well, so some choices are "not a word we know".
    if (level.id < 3) assert.ok(middles.every(middle => m.tilesFor(level.id, middle.text).after.length >= 7), `level ${level.id}`);
  }
  assert.equal(m.lookup(1, 'un-', 'happy', null).word, 'unhappy');
  assert.equal(m.lookup(1, 'un-', 'happy', '-ly').word, 'unhappily');
  assert.equal(m.lookup(1, 're-', 'happy', null), null);
  assert.equal(m.lookup(1, null, 'happy', '-ful'), null);
  assert.equal(m.lookup(1, null, 'happy', '-ness'), null, 'level 1 does not know level 2 words');
  assert.equal(m.lookup(2, null, 'happy', '-ness').word, 'happiness');
  assert.equal(m.lookup(1, null, 'play', '-er').word, 'player');
  assert.equal(m.lookup(1, null, 'tall', '-er').word, 'taller');
  assert.equal(m.lookup(3, 'tele', 'scope', null).word, 'telescope');
  assert.equal(m.lookup(3, null, 'tele', 'scope').word, 'telescope');
  assert.equal(m.lookup(3, 'bio', 'graph', '-y').word, 'biography');
  assert.equal(m.lookup(3, 'de-', 'script', '-ion').word, 'description');
  // The one tile spelled -er carries both of its meanings.
  assert.equal(m.tilesFor(1, 'happy').after.find(tile => tile.label === '-er').meaning, 'more; or a person or thing that does');
  // At level 3 nothing is offered where nothing ever fits.
  assert.deepEqual(m.tilesFor(3, 'tele').before, []);
  assert.deepEqual(m.tilesFor(3, 'phone').after, []);
  // Most of the list can be built; the rest (two prefixes or two suffixes) is met in challenge mode.
  for (const level of LEVELS) {
    const buildable = m.buildableFor(level.id);
    assert.deepEqual(buildable, m.wordsFor(level.id).filter(word => m.middlesFor(level.id).some(middle => m.familyOf(level.id, middle.text).includes(word))));
    assert.ok(buildable.length >= 40 && buildable.length >= m.wordsFor(level.id).length * 0.85, `level ${level.id}: ${buildable.length} of ${m.wordsFor(level.id).length} words can be built`);
    for (const word of m.wordsFor(level.id).filter(word => !buildable.includes(word))) assert.ok(word.parts.length >= 3, `${word.word} cannot be built`);
  }
});

test('challenge rounds: ten questions about ten words, one right answer each, the same for the same seed', () => {
  const family = label => [...PREFIXES, ...SUFFIXES, ...ROOTS].filter(part => part.label === label || part.forms?.includes(label)).map(part => part.family).filter(Boolean);
  for (const level of [1, 2, 3]) {
    const seen = { part: new Set(), break: new Set(), meaning: new Set() };
    for (let seed = 1; seed <= 300; seed++) {
      const round = m.buildRound(level, seed);
      assert.equal(round.length, ROUND_LENGTH);
      assert.deepEqual(round.map(q => q.kind).sort(), ['break', 'break', 'break', 'meaning', 'meaning', 'meaning', 'part', 'part', 'part', 'part']);
      assert.equal(new Set(round.map(q => q.word.word)).size, ROUND_LENGTH, `level ${level} seed ${seed}: a word twice`);
      for (const q of round) {
        const { word } = q;
        assert.equal(word.level, level);
        assert.ok(m.QUESTION_KINDS[q.kind](word), `${word.word} suits a “${q.kind}” question`);
        seen[q.kind].add(word.word);
        assert.ok(q.prompt.includes(q.kind === 'part' ? word.definition : word.word), q.prompt);
        if (q.kind === 'break') {
          assert.deepEqual(q.answer, m.cuts(word));
          assert.equal(q.answer.length, word.parts.length - 1);
          // Cutting the word at those places gives its parts.
          const pieces = [0, ...q.answer].map((start, i) => word.word.slice(start, q.answer[i] ?? word.word.length));
          assert.deepEqual(pieces, word.parts.map(part => part.text), word.word);
          assert.equal(m.checkAnswer(q, q.answer), true);
          assert.equal(m.checkAnswer(q, [...q.answer].reverse()), true);
          assert.equal(m.checkAnswer(q, q.answer.map(place => place + 1)), false);
          assert.equal(m.checkAnswer(q, []), false);
          continue;
        }
        assert.equal(q.options.length, 4, `${word.word}: ${q.options}`);
        assert.equal(new Set(q.options).size, 4, `${word.word}: ${q.options}`);
        assert.equal(q.options.filter(option => option === q.answer).length, 1);
        assert.ok(q.part.kind !== 'base' && word.parts.includes(q.part));
        for (const option of q.options) assert.equal(m.checkAnswer(q, option), option === q.answer);
        if (q.kind === 'meaning') {
          assert.equal(q.answer, q.part.meaning);
          assert.ok(q.prompt.includes(`“${m.partLabel(q.part)}”`));
        } else {
          assert.equal(q.answer, m.partLabel(q.part));
          assert.equal(q.shown.replace('___', q.answer), labels(word).join(' + '));
          assert.equal(word.parts.length, 2);
          assert.ok(word.plain, `${word.word}: the meaning in the question is hand-written`);
          // No other choice has a meaning close to the right one, and none makes a listed word with the same meaning.
          const own = family(q.answer);
          for (const option of q.options.filter(option => option !== q.answer)) {
            assert.ok(!family(option).some(name => own.includes(name)), `${word.word}: ${option} is too close to ${q.answer}`);
            const rival = WORDS.find(other => labels(other).join(' + ') === q.shown.replace('___', option));
            assert.ok(!rival || rival.definition !== word.definition, `${word.word}: ${rival?.word} means the same`);
          }
        }
      }
      assert.deepEqual(m.buildRound(level, seed), round, 'the same seed gives the same round');
    }
    for (let seed = 301; seed <= 3000; seed++) for (const q of m.buildRound(level, seed)) seen[q.kind].add(q.word.word);
    for (const [kind, fits] of Object.entries(m.QUESTION_KINDS)) {
      const pool = m.wordsFor(level).filter(fits);
      assert.ok(pool.length >= 15, `level ${level}: ${pool.length} words for “${kind}” questions`);
      assert.equal(seen[kind].size, pool.length, `level ${level}: every word that suits “${kind}” turns up`);
    }
  }
  assert.notDeepEqual(m.buildRound(1, 1).map(q => q.word.word), m.buildRound(1, 2).map(q => q.word.word));
  assert.deepEqual(m.cuts(m.wordByText('unbreakable')), [2, 7]);
  assert.deepEqual(m.cuts(m.wordByText('autobiography')), [4, 7, 12]);
});

test('scoring and the seeded random number generator', () => {
  assert.deepEqual(m.scoreRound([]), { correct: 0, total: 0, perfect: false });
  assert.deepEqual(m.scoreRound([true, false, true]), { correct: 2, total: 3, perfect: false });
  assert.deepEqual(m.scoreRound(Array(10).fill(true)), { correct: 10, total: 10, perfect: true });
  const messages = [10, 8, 5, 4].map(correct => m.resultMessage({ correct, total: 10 }));
  assert.equal(new Set(messages).size, 4);
  assert.match(messages[0], /perfect/i);
  const a = m.seededRandom(42), b = m.seededRandom(42);
  assert.deepEqual(Array.from({ length: 5 }, a), Array.from({ length: 5 }, b));
  const many = Array.from({ length: 2000 }, m.seededRandom(7));
  assert.ok(many.every(v => v >= 0 && v < 1));
  assert.ok(Math.abs(many.reduce((sum, v) => sum + v, 0) / many.length - 0.5) < 0.03);
});

test('what the board shows: the word and its parts, or a kind “not a word we know”', () => {
  const found = resultHtml(2, 'un-', 'happy', '-ness');
  assert.match(found, /data-found="unhappiness"/);
  assert.ok(text(found).includes('unhappiness'));
  assert.ok(text(found).includes('It means: the state of being unhappy.'));
  assert.ok(text(found).includes('Spelling change: The y in “happy” changes to i before -ness.'));
  assert.ok(text(found).includes('is a prefix. It means “not, or the opposite of”.'));
  assert.ok(text(found).includes('is the base word.'));
  assert.ok(text(found).includes('is a suffix. It means “the state of being”.'));
  const miss = resultHtml(1, null, 'happy', '-ful');
  assert.ok(text(miss).includes('Not a word we know'));
  assert.ok(!/not (a real|an English) word|is not English/i.test(text(miss)), 'it never claims the word is not English');
  assert.ok(text(miss).includes('Our list is short'));
  assert.ok(!/happyful|happiful/.test(miss), 'it does not print a made-up spelling');
  assert.ok(text(miss).includes('is a suffix. It means “full of”.'));
  const waiting = resultHtml(1, null, 'happy', null);
  assert.ok(text(waiting).includes('“happy” is the base word.'));
  assert.ok(text(waiting).includes('Our list has 5 words built on it.'));
  assert.ok(text(resultHtml(3, null, 'port', null)).includes('“port” is a root from Latin. It means “carry”.'));
  assert.ok(text(resultHtml(3, 'trans-', 'port', null)).includes('is a root. It means “carry”.'));
  for (const level of [1, 2, 3]) {
    for (const middle of m.middlesFor(level)) {
      const tiles = m.tilesFor(level, middle.text);
      const html = resultHtml(level, tiles.before[0]?.label ?? null, middle.text, tiles.after[0]?.label ?? null);
      assert.ok(!/undefined|NaN/.test(html), `${level} ${middle.text}`);
    }
    assert.equal((middleOptionsHtml(level, m.middlesFor(level)[0].text).match(/<option /g) ?? []).length, m.middlesFor(level).length);
  }
  const tiles = m.tilesFor(1, 'happy');
  assert.equal((tilesHtml(tiles.after, 'after', '-ly').match(/aria-pressed="true"/g) ?? []).length, 1);
  assert.match(tilesHtml([], 'before'), /Nothing goes in front/);
  assert.equal((cutterHtml('unhappy').match(/data-gap=/g) ?? []).length, 6);
  assert.match(cutterHtml('unhappy'), /aria-label="Cut between n and h"/);
  assert.equal(cutText('unbreakable', [2, 7]), 'un|break|able');
  assert.equal(text(splitHtml(m.wordByText('unbreakable'))), 'un-+break+-able');
  assert.equal(partHtml('un-', 'prefix'), '<span class="wb-part is-prefix">un-</span>');
  assert.equal(textHtml('before -ness and “-er”'), 'before <span class="nowrap">-ness</span> and “<span class="nowrap">-er</span>”');
});

test('the worksheet and its answer key are built from the word list', () => {
  const [, breakUp, build, match, turn] = activity.sections;
  assert.deepEqual(activity.sections.map(section => section.type), ['text', 'wb-break', 'wb-build', 'wb-match', 'questions']);
  // Part A: eight different words, some with a spelling change, with two and three parts.
  assert.equal(BREAK_WORDS.length, 8);
  assert.equal(new Set(BREAK_WORDS).size, 8);
  assert.deepEqual(breakUp.items, BREAK_WORDS.map(m.wordByText));
  assert.ok(breakUp.items.every(Boolean));
  assert.ok(breakUp.items.every(word => word.level <= 2));
  assert.ok(breakUp.items.filter(word => word.changes.length).length >= 2);
  assert.ok(breakUp.items.some(word => word.parts.length === 2) && breakUp.items.some(word => word.parts.length === 3));
  assert.ok(breakUp.intro.includes('playful = play + -ful'));
  // Part B: six words, and a part bank that holds exactly their parts.
  assert.equal(BUILD_WORDS.length, 6);
  assert.deepEqual(build.items, BUILD_WORDS.map(m.wordByText));
  assert.ok(build.items.every(word => word && word.plain && word.parts.length === 2 && word.changes.length === 0));
  assert.equal(new Set([...BREAK_WORDS, ...BUILD_WORDS]).size, 14, 'no word is on the worksheet twice');
  const bank = build.bank.flatMap(([, parts]) => parts);
  assert.deepEqual(build.bank.map(([name]) => name), ['Prefixes', 'Base words', 'Suffixes']);
  assert.deepEqual([...bank].sort(), [...new Set(build.items.flatMap(labels))].sort());
  assert.ok(build.bank[0][1].every(label => label.endsWith('-')) && build.bank[2][1].every(label => label.startsWith('-')));
  // Each meaning is met by one word only among everything the bank could build.
  for (const word of build.items) {
    const same = WORDS.filter(other => other.definition === word.definition && labels(other).every(label => bank.includes(label)));
    assert.deepEqual(same, [word]);
  }
  // Part C: six prefixes, six different meanings, each letter used once.
  assert.equal(match.items.length, 6);
  assert.deepEqual(match.items.map(item => item.part.id), MATCH_PREFIXES);
  assert.deepEqual([...MATCH_ORDER].sort(), [...MATCH_PREFIXES].sort());
  assert.notDeepEqual(MATCH_ORDER, MATCH_PREFIXES, 'the meanings are not printed in the order of the prefixes');
  assert.deepEqual(match.meanings.map(item => item.letter), ['A', 'B', 'C', 'D', 'E', 'F']);
  assert.equal(new Set(match.meanings.map(item => item.meaning)).size, 6);
  for (const item of match.items) {
    assert.equal(match.meanings.find(meaning => meaning.letter === item.letter).meaning, item.part.meaning);
    assert.equal(item.examples.length, 2);
    for (const example of item.examples) assert.ok(example.startsWith(item.part.id), example);
  }
  // Part D: the rule in the key is the rule the tool applies.
  const happiness = m.wordByText('happiness');
  assert.ok(turn.items[0].q.startsWith('happy + -ness is spelled happiness.'));
  assert.ok(turn.items[0].a.includes(m.changeLine(happiness.changes[0])) && turn.items[0].a.includes(m.ruleById('y-to-i').rule));
  for (const [, word] of turn.items[1].a.matchAll(/\b((?:un|re|mis|pre)[a-z]+)\b/g)) assert.ok(m.wordByText(word), `${word} is in the list`);
});
