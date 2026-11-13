import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as r from '../src/lib/readability.mjs';
import { display, notices, markedHtml, fmt, FORMULAS, MARKED_WORD_LIMIT } from '../src/lib/readability-view.mjs';
import { SAMPLES, DEFAULT_SAMPLE, WORKSHEET_PASSAGE, WORKSHEET_REWRITE, sampleById } from '../src/lib/reading-samples.mjs';

const near = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-6, `${message}: ${actual} vs ${expected}`);
const sentences = text => r.splitSentences(text).map(s => s.text);
const words = text => r.tokenizeWords(text).map(w => w.text);

/* ------------------------------------------------------------ sentences */

test('sentences end at . ! ? followed by a space, in capitals or not', () => {
  assert.deepEqual(sentences('The cat sat. It purred! Did it sleep? Yes.'), ['The cat sat.', 'It purred!', 'Did it sleep?', 'Yes.']);
  assert.deepEqual(sentences('i like cats. my cat is big.'), ['i like cats.', 'my cat is big.'], 'students do not always type capitals');
  assert.deepEqual(sentences('No end mark here'), ['No end mark here']);
  assert.deepEqual(sentences('One. Two'), ['One.', 'Two']);
});

test('abbreviations and initials do not end a sentence', () => {
  assert.deepEqual(sentences('Mr. Lee moved to the U.S. in 2010. He likes it.'), ['Mr. Lee moved to the U.S. in 2010.', 'He likes it.']);
  assert.deepEqual(sentences('Dr. Kim and Mrs. Diaz met Prof. Stone on St. Mark’s Road.'), ['Dr. Kim and Mrs. Diaz met Prof. Stone on St. Mark’s Road.']);
  assert.deepEqual(sentences('J. K. Lee wrote it. I read it.'), ['J. K. Lee wrote it.', 'I read it.']);
  assert.deepEqual(sentences('Bring fruit, e.g. apples, pears, etc. and a knife.'), ['Bring fruit, e.g. apples, pears, etc. and a knife.']);
  assert.deepEqual(sentences('We left at 5 p.m. Then it rained.'), ['We left at 5 p.m.', 'Then it rained.'], 'a capital after p.m. starts a new sentence');
  assert.deepEqual(sentences('So do I. We left.'), ['So do I.', 'We left.'], '"I" is a word, not an initial');
  assert.deepEqual(sentences('She lives in the U.S.'), ['She lives in the U.S.']);
});

test('decimals, ellipses and quotes', () => {
  assert.deepEqual(sentences('Pi is about 3.14. It never ends.'), ['Pi is about 3.14.', 'It never ends.']);
  assert.deepEqual(sentences('It cost $4.50 at the shop.'), ['It cost $4.50 at the shop.']);
  assert.deepEqual(sentences('Wait... what was that? Nothing.'), ['Wait... what was that?', 'Nothing.']);
  assert.deepEqual(sentences('He waited… Then he left.'), ['He waited…', 'Then he left.']);
  assert.deepEqual(sentences('“Where are you going?” asked Tom. “Home,” said Ann.'), ['“Where are you going?” asked Tom.', '“Home,” said Ann.']);
  assert.deepEqual(sentences('She said, "Stop." Then she left.'), ['She said, "Stop."', 'Then she left.']);
  assert.deepEqual(sentences('Really?! Yes!!! (I think so.) Fine.'), ['Really?!', 'Yes!!!', '(I think so.)', 'Fine.']);
});

test('a blank line ends a sentence; a single line break does not', () => {
  assert.deepEqual(sentences('A Title\n\nThe first line\nruns on here.'), ['A Title', 'The first line\nruns on here.']);
  assert.deepEqual(sentences('  \n\n  '), []);
  assert.deepEqual(sentences('Hello. !!! ...'), ['Hello. !!! ...'], 'punctuation with no word joins the sentence before it');
});

test('sentence positions point back into the text', () => {
  const text = '  First one.  Second one!\n\nThird';
  for (const s of r.splitSentences(text)) assert.equal(text.slice(s.start, s.end), s.text);
});

/* ---------------------------------------------------------------- words */

test('words: hyphens, apostrophes and numbers', () => {
  assert.deepEqual(words('A well-known ten-year-old doesn’t mind.'), ['A', 'well-known', 'ten-year-old', 'doesn’t', 'mind']);
  assert.deepEqual(words("It's the dogs' bowl, isn't it?"), ["It's", 'the', 'dogs', 'bowl', "isn't", 'it']);
  assert.deepEqual(words('In 2024 we paid 1,250 dollars, or 3.5 times more.'), ['In', '2024', 'we', 'paid', '1,250', 'dollars', 'or', '3.5', 'times', 'more']);
  assert.deepEqual(words('The U.S. team won 3–2 at 4:30 p.m.'), ['The', 'U.S.', 'team', 'won', '3', '2', 'at', '4', '30', 'p.m.']);
  assert.deepEqual(words('we can not dedicate—we can not consecrate'), ['we', 'can', 'not', 'dedicate', 'we', 'can', 'not', 'consecrate'], 'a dash separates words');
  assert.deepEqual(words('café naïve Zoë'), ['café', 'naïve', 'Zoë']);
  assert.deepEqual(words('... !!! — ?'), []);
  assert.equal(r.countLetters("don't"), 4);
  assert.equal(r.countLetters('well-known'), 9);
  assert.equal(r.countLetters('1,250'), 4);
});

/* ------------------------------------------------------------ syllables */

// Counts as given in standard dictionaries.
const SYLLABLES = {
  1: ['a', 'I', 'the', 'cat', 'make', 'time', 'love', 'there', 'where', 'house', 'horse', 'once', 'one', 'are', 'use', 'eye', 'eyes', 'you',
    'jumped', 'walked', 'played', 'called', 'smiled', 'changed', 'tried', 'watched', // -ed
    'makes', 'times', 'lives', 'miles', 'rules', 'shapes', 'clothes', 'goes', 'shoes', // -es
    'blue', 'fruit', 'juice', 'build', 'guide', 'school', 'through', 'thought', 'friend', 'earth', 'heard', // vowel pairs
    'they', 'key', 'type', 'style', 'rhyme', 'myth', // y
    'whole', 'smile', 'square', 'queen', 'tongue', 'league', 'bed', 'red', 'said'],
  2: ['table', 'little', 'apple', 'people', 'circle', 'purple', 'tables', 'bottles', 'handled', 'settled', // -le
    'wanted', 'needed', 'started', // -ed after t or d
    'buses', 'boxes', 'watches', 'wishes', 'faces', 'pages', 'houses', // -es after a hissing sound
    'water', 'mother', 'answer', 'about', 'because', 'between', 'country', 'mountain', 'island', 'ancient',
    'happy', 'funny', 'yellow', 'beyond', 'player', 'playing', 'royal', 'crayon', 'monkey', 'obey', 'any', // y
    'lovely', 'careful', 'useful', 'hopeless', 'movement', 'homework', 'something', 'sometimes', 'baseball', 'notebook', // silent e inside
    'going', 'being', 'seeing', 'flying', 'giant', 'lion', 'quiet', 'diet', 'science', 'poem', 'cruel', 'fluent', 'ruin', // vowel pairs said apart
    'ocean', 'equal', 'language', 'question', 'region', 'million', 'onion', 'senior', // vowel pairs said together
    "didn't", "couldn't", "isn't", "doesn't", 'maybe', 'create', 'orange', 'machine', 'measure', 'sentence', 'unique', 'argue', 'value',
    'prism', 'rhythm', 'business', 'evening', 'every', 'Wednesday', 'hundred', 'someone'],
  3: ['animal', 'another', 'important', 'example', 'together', 'remember', 'beautiful', 'elephant', 'dinosaur', 'butterfly', 'library',
    'family', 'different', 'favorite', 'syllable', 'syllables', 'triangle', 'bicycle',
    'piano', 'media', 'radio', 'video', 'idea', 'area', 'violin', 'period', 'curious', 'serious', 'various', 'obvious',
    'actual', 'usual', 'studying', 'happier', 'easier', 'happiest', 'opinion', 'delicious', 'tomorrow', 'yesterday', 'everyone',
    'excited', 'decided', 'created', 'recipe', 'museum', 'audience', 'completely', 'excitement', 'somebody', 'wonderful', 'adventure',
    'genuine', 'continue', 'computer', 'banana', 'energy', 'history', 'chlorophyll', 'honeycomb'],
  4: ['January', 'February', 'usually', 'experiment', 'temperature', 'caterpillar', 'biology', 'geography', 'geometry', 'material',
    'variety', 'society', 'experience', 'situation', 'education', 'information', 'community', 'ability', 'especially', 'everybody',
    'continuous', 'apostrophe', 'scientific', 'dictionary', 'dedicated', 'altogether'],
  5: ['photosynthesis', 'readability', 'vocabulary', 'university', 'opportunity', 'electricity', 'unfortunately', 'imagination', 'organization', 'imaginary'],
};

test('syllables: a list of known words, including the hard cases', () => {
  let total = 0;
  for (const [count, list] of Object.entries(SYLLABLES)) {
    for (const word of list) { total++; assert.equal(r.countSyllables(word), Number(count), word); }
  }
  assert.ok(total >= 60, `${total} words checked`);
});

test('syllables: hyphens, capitals, accents, numbers and other alphabets', () => {
  assert.equal(r.countSyllables('well-known'), 2);
  assert.equal(r.countSyllables('ten-year-old'), 3);
  assert.equal(r.countSyllables('battle-field'), 3);
  assert.equal(r.countSyllables('TABLE'), 2);
  assert.equal(r.countSyllables('café'), 2);
  assert.equal(r.countSyllables('TV'), 2, 'capitals with no vowel are spelled out');
  assert.equal(r.countSyllables('U.S.'), 2);
  assert.equal(r.countSyllables('Mr'), 2);
  // Numbers are counted the way they are read aloud.
  for (const [number, count] of [['7', 2], ['12', 1], ['21', 3], ['100', 3], ['365', 6], ['1,000', 3], ['1918', 4], ['1905', 4], ['2024', 6], ['3.14', 4], ['1,000,000', 3], ['0', 2], ['3rd', 1], ['20th', 2]]) {
    assert.equal(r.countSyllables(number), count, number);
  }
  assert.equal(r.countSyllables('日本語'), 1, 'no Latin letters: one syllable, never zero');
  assert.equal(r.countSyllables('x'), 1);
});

/* ------------------------------------------------------------- formulas */

test('each formula against a hand-calculated example', () => {
  // 100 words, 5 sentences, 150 syllables, 450 letters, 10 long words:
  // 20 words per sentence, 1.5 syllables per word, 4.5 letters per word, 10% long words.
  near(r.fleschReadingEase(100, 5, 150), 206.835 - 20.3 - 126.9, 'Flesch Reading Ease'); // 59.635
  near(r.fleschReadingEase(100, 5, 150), 59.635, 'Flesch Reading Ease');
  near(r.fleschKincaidGrade(100, 5, 150), 9.91, 'Flesch–Kincaid'); // 7.8 + 17.7 − 15.59
  near(r.gunningFog(100, 5, 10), 12, 'Gunning Fog'); // 0.4 × (20 + 10)
  near(r.smogGrade(10, 5), 1.043 * Math.sqrt(60) + 3.1291, 'SMOG'); // 10 long words × 30 ÷ 5 sentences = 60
  near(r.smogGrade(10, 5), 11.208143, 'SMOG');
  near(r.smogGrade(30, 30), 1.043 * Math.sqrt(30) + 3.1291, 'SMOG with exactly 30 sentences');
  near(r.colemanLiau(450, 100, 5), 9.18, 'Coleman–Liau'); // 0.0588 × 450 − 0.296 × 5 − 15.8
  near(r.automatedReadability(450, 100, 5), 9.765, 'ARI'); // 21.195 + 10 − 21.43
});

test('analyze counts a small text the way a person would', () => {
  const a = r.analyze('The cat sat on the mat. It was happy.');
  assert.equal(a.counts.words, 9);
  assert.equal(a.counts.sentences, 2);
  assert.equal(a.counts.syllables, 10);
  assert.equal(a.counts.letters, 27);
  assert.equal(a.counts.longWords, 0);
  near(a.counts.wordsPerSentence, 4.5, 'words per sentence');
  near(a.scores.fleschKincaid, 0.39 * 4.5 + 11.8 * (10 / 9) - 15.59, 'Flesch–Kincaid');
  near(a.scores.readingEase, 206.835 - 1.015 * 4.5 - 84.6 * (10 / 9), 'Reading Ease');
  near(a.scores.ari, 4.71 * 3 + 0.5 * 4.5 - 21.43, 'ARI');
  near(a.scores.colemanLiau, 0.0588 * 300 - 0.296 * (200 / 9) - 15.8, 'Coleman–Liau');
  near(a.scores.gunningFog, 1.8, 'Fog');
  near(a.scores.smog, 3.1291, 'SMOG with no long words');
  assert.equal(a.rough, true);
});

test('the consensus grade is the median of the five grade formulas', () => {
  assert.equal(r.consensusGrade({ fleschKincaid: 4, gunningFog: 9, smog: 6, colemanLiau: 5, ari: 30, readingEase: 99 }), 6);
  assert.equal(r.consensusGrade({ fleschKincaid: -2, gunningFog: 1, smog: 3.1, colemanLiau: 0, ari: -5 }), 0);
  for (const sample of SAMPLES) {
    const a = r.analyze(sample.text);
    const grades = r.GRADE_FORMULAS.map(key => a.scores[key]);
    assert.equal(grades.filter(g => g <= a.grade).length >= 3 && grades.filter(g => g >= a.grade).length >= 3, true, sample.id);
  }
  assert.deepEqual(FORMULAS.map(f => f.key).filter(key => key !== 'readingEase').sort(), [...r.GRADE_FORMULAS].sort());
});

test('grade labels, ages, Reading Ease labels and times', () => {
  assert.equal(r.gradeLabel(-3), 'Below grade 1');
  assert.equal(r.gradeLabel(0.4), 'Below grade 1');
  assert.equal(r.gradeLabel(0.5), 'Grade 1');
  assert.equal(r.gradeLabel(5.6), 'Grade 6');
  assert.equal(r.gradeLabel(12.4), 'Grade 12');
  assert.equal(r.gradeLabel(12.5), 'College');
  assert.equal(r.gradeLabel(16.6), 'College graduate');
  assert.equal(r.ageRange(0), 'ages 6 and under');
  assert.equal(r.ageRange(1), 'ages 6–7');
  assert.equal(r.ageRange(5.6), 'ages 11–12');
  assert.equal(r.ageRange(12), 'ages 17–18');
  assert.equal(r.ageRange(14), 'ages 18 and up');
  assert.deepEqual([120, 90, 89.9, 80, 70, 60, 50, 30, 29.9, -15].map(r.easeLabel), ['Very easy', 'Very easy', 'Easy', 'Easy', 'Fairly easy', 'Standard', 'Fairly difficult', 'Difficult', 'Very difficult', 'Very difficult']);
  assert.equal(r.readingSeconds(200, r.SILENT_WPM), 60);
  assert.equal(r.readingSeconds(130, r.ALOUD_WPM), 60);
  assert.deepEqual([0, 3, 37.8, 56, 58, 60, 100, 150, 3600].map(r.formatDuration), ['0 seconds', '5 seconds', '40 seconds', '60 seconds', '1 minute', '1 minute', '2 minutes', '3 minutes', '60 minutes']);
});

/* ----------------------------------------------------------- edge cases */

const finite = a => [...Object.values(a.counts), ...Object.values(a.scores), a.grade].every(Number.isFinite);

test('edge cases: empty text, one word, no sentence end, other alphabets', () => {
  for (const text of ['', '   \n\n ', '?!...', null, undefined]) {
    const a = r.analyze(text);
    assert.equal(a.empty, true);
    assert.equal(a.counts.words, 0);
    assert.equal(a.counts.sentences, 0);
    assert.ok(finite(a), 'no NaN or Infinity for empty text');
    assert.equal(display(a).grade, '–');
    assert.deepEqual(notices(a), ['Type or paste some text to check its reading level.']);
    assert.equal(markedHtml(String(text ?? ''), a), String(text ?? '').trimEnd());
  }
  const one = r.analyze('Hello');
  assert.deepEqual([one.counts.words, one.counts.sentences, one.counts.syllables], [1, 1, 2]);
  assert.ok(finite(one) && one.rough);
  const noEnd = r.analyze('the cat sat on the mat');
  assert.deepEqual([noEnd.counts.words, noEnd.counts.sentences], [6, 1]);
  for (const text of ['吾輩は猫である。名前はまだ無い。', 'Это короткий текст. Он написан по-русски.', 'مرحبا بالعالم']) {
    const a = r.analyze(text);
    assert.equal(a.english, false, text);
    assert.ok(a.counts.words > 0 && finite(a), text);
    assert.match(notices(a)[0], /not written in the Latin alphabet/);
  }
  assert.equal(r.analyze('Une élève très curieuse a posé une question.').english, true, 'accented Latin letters are Latin');
  assert.equal(r.analyze('12 34 56').english, true, 'digits alone raise no alphabet notice');
});

test('a very long text is analyzed quickly and the marked text is capped', () => {
  const long = Array.from({ length: 500 }, () => sampleById('seasons').text).join('\n\n');
  const started = performance.now();
  const a = r.analyze(long);
  const html = markedHtml(long, a);
  const elapsed = performance.now() - started;
  assert.equal(a.counts.words, 500 * r.analyze(sampleById('seasons').text).counts.words);
  assert.equal(a.counts.sentences, 500 * 7);
  near(a.grade, r.analyze(sampleById('seasons').text).grade, 'repeating a text does not change its grade');
  assert.ok(elapsed < 3000, `took ${Math.round(elapsed)} ms`);
  assert.ok(html.length < long.length / 5, 'only the first part is shown back');
  assert.ok(a.words.length > MARKED_WORD_LIMIT);
});

/* -------------------------------------------------------- view and samples */

test('marked text: long sentences and long words are wrapped, everything else is escaped', () => {
  const text = 'Short one. ' + 'This sentence keeps going and going with far too many little words in it until the reader forgets where it began. <b>Bold</b> & "extraordinary".';
  const a = r.analyze(text);
  const html = markedHtml(text, a);
  assert.equal(a.counts.longSentences, 1);
  assert.match(html, /^Short one\. <mark class="rl-sentence">This sentence .* began\.<\/mark><span class="rl-badge">21 words<\/span> &lt;b&gt;Bold&lt;\/b&gt; &amp; &quot;<span class="rl-word">extraordinary<\/span>&quot;\.$/);
  // Taking the tags out gives the text back, apart from the word-count badges.
  const plain = html.replace(/<span class="rl-badge">\d+ words<\/span>/g, '').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  assert.equal(plain, text);
  assert.equal(r.LONG_SENTENCE_WORDS, 20);
  assert.equal(r.LONG_WORD_SYLLABLES, 3);
});

test('numbers are never marked as long words', () => {
  const a = r.analyze('In 1,234,567 seconds the extraordinary machine stopped.');
  assert.deepEqual(a.words.filter(w => w.long).map(w => w.text), ['extraordinary']);
  assert.equal(a.words[1].syllables > 3, true);
});

test('display: formatted values, with a real minus sign and no "-0.0"', () => {
  assert.equal(fmt(-0.6), '−0.6');
  assert.equal(fmt(-0.04), '0.0');
  assert.equal(fmt(5.649), '5.6');
  assert.equal(fmt(1.2649, 2), '1.26');
  const d = display(r.analyze(sampleById(DEFAULT_SAMPLE).text));
  for (const key of ['grade', 'gradeNumber', 'ages', 'ease', 'easeLabel', 'words', 'sentences', 'wordsPerSentence', 'syllablesPerWord', 'longWordShare', 'readTime', 'aloudTime', ...FORMULAS.map(f => f.key)]) {
    assert.ok(d[key] && d[key] !== '–' && !/NaN|undefined/.test(d[key]), key);
  }
  assert.match(d.grade, /^Grade \d+$/);
  assert.match(d.longWordShare, /^\d+\.\d%$/);
});

test('samples: written at clearly different levels, each long enough for a steady result', () => {
  const grades = SAMPLES.map(sample => r.analyze(sample.text));
  for (const [i, a] of grades.entries()) {
    assert.equal(a.rough, false, `${SAMPLES[i].id} has at least ${r.MIN_WORDS} words`);
    assert.equal(a.english, true);
  }
  const [kite, honey, seasons, formulas, gettysburg] = grades.map(a => a.grade);
  assert.ok(kite < 3.5 && honey > kite + 2 && seasons > honey + 2 && formulas > seasons + 5, `${[kite, honey, seasons, formulas].map(g => g.toFixed(1))}`);
  assert.ok(gettysburg > 9 && gettysburg < 13);
  assert.equal(new Set(grades.map(a => r.gradeLabel(a.grade))).size, SAMPLES.length, 'every sample shows a different level');
  // The default sample shows both kinds of mark, and no "short text" notice.
  const start = r.analyze(sampleById(DEFAULT_SAMPLE).text);
  assert.ok(start.counts.longSentences >= 1 && start.counts.longWords >= 1);
  assert.equal(sampleById('leaves'), WORKSHEET_PASSAGE);
  assert.equal(sampleById('nothing'), undefined);
});

test('the Gettysburg Address has the 272 words of the Bliss copy', () => {
  const text = sampleById('gettysburg').text;
  // The usual count treats "battle-field" as two words.
  assert.equal(text.split(/[\s—-]+/).filter(Boolean).length, 272);
  assert.equal(r.analyze(text).counts.words, 271, 'the checker counts a hyphenated word once');
  assert.equal(r.analyze(text).counts.sentences, 10);
  assert.ok(text.startsWith('Four score and seven years ago our fathers brought forth on this continent, a new nation,'));
  assert.ok(text.endsWith('shall not perish from the earth.'));
  assert.equal((text.match(/\n\n/g) ?? []).length, 2, 'three paragraphs');
});

test('the worksheet rewrite is easier than the passage and keeps its length', () => {
  const before = r.analyze(WORKSHEET_PASSAGE.text), after = r.analyze(WORKSHEET_REWRITE);
  assert.ok(before.counts.words >= r.MIN_WORDS && after.counts.words >= r.MIN_WORDS);
  assert.ok(after.grade <= before.grade - 3);
  assert.ok(after.counts.wordsPerSentence < before.counts.wordsPerSentence && after.counts.syllablesPerWord < before.counts.syllablesPerWord);
  assert.equal(after.counts.longSentences, 0);
});

test('one proprietary reading measure is never named in the source', () => {
  const banned = new RegExp(['lex', 'ile'].join(''), 'i');
  const root = new URL('..', import.meta.url);
  const files = ['README.md', ...['src', 'public', 'scripts', 'tests'].flatMap(dir => fs.readdirSync(new URL(dir, root), { recursive: true }).map(file => `${dir}/${file}`))];
  for (const file of files.filter(name => /\.(astro|mjs|ts|js|css|txt|md|svg|json)$/.test(name))) {
    assert.ok(!banned.test(fs.readFileSync(new URL(file, root), 'utf8')), file);
  }
});
