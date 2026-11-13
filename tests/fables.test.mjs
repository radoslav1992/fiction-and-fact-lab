import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/lib/fables.mjs';
import { RATES, DEFAULT_RATE, TIMING, rateById, englishVoices, chooseVoice, voiceKey, voiceLabel, createPlayer } from '../src/lib/fables-player.mjs';
import { activity, standards, WORKSHEET_FABLE } from '../src/lib/activities/fables.mjs';
import { analyze } from '../src/lib/readability.mjs';

const { FABLES, LETTERS, QUIZ_LENGTH, STORY_QUESTIONS } = m;
const words = text => m.wordRanges(text).length;
const plain = text => text.toLowerCase().replace(/[“”‘’'",.!?:;]/g, '').replace(/\s+/g, ' ').trim();
const everyString = fable => [
  fable.title, fable.theme, fable.summary, fable.moral, fable.discussion, ...fable.characters, ...fable.story.flat(),
  ...fable.vocabulary.flatMap(item => [item.word, item.meaning]),
  ...fable.questions.flatMap(item => [item.q, item.right, ...item.wrong, item.why]),
];

/* ------------------------------------------------------------------ the bank */

test('the bank: ten fables, each complete, with its own slug and title', () => {
  assert.equal(FABLES.length, 10);
  assert.equal(new Set(FABLES.map(fable => fable.slug)).size, 10);
  assert.equal(new Set(FABLES.map(fable => fable.title)).size, 10);
  assert.equal(new Set(FABLES.map(fable => fable.moral)).size, 10);
  assert.equal(new Set(FABLES.map(fable => fable.summary)).size, 10);
  FABLES.forEach((fable, i) => {
    assert.equal(fable.number, i + 1);
    assert.match(fable.slug, /^[a-z]+(-[a-z]+)+$/, fable.slug);
    assert.notEqual(fable.slug, 'activity', 'a fable page must not take the worksheet address');
    assert.equal(m.fableBySlug(fable.slug), fable);
    assert.match(fable.title, /^The [A-Z]/, fable.slug);
    assert.match(fable.summary, /^[A-Z].{50,130}\.$/, `${fable.slug}: a one-sentence summary`);
    assert.ok(fable.theme.length >= 5 && fable.theme.length <= 20, `${fable.slug}: theme`);
    assert.ok(fable.characters.length >= 1 && fable.characters.every(name => /^the /.test(name)), `${fable.slug}: characters`);
    assert.match(fable.discussion, /^[A-Z].{40,160}[.?]$/, `${fable.slug}: discussion prompt`);
    assert.ok(fable.discussion.includes('?'), `${fable.slug}: the prompt asks something`);
  });
  assert.equal(m.nextFable(FABLES[0]), FABLES[1]);
  assert.equal(m.nextFable(FABLES[9]), FABLES[0], 'after the last fable comes the first');
});

test('every fable: 120 to 220 words, short plain sentences, and the moral as the last sentence', () => {
  for (const fable of FABLES) {
    const count = m.wordCount(fable);
    assert.ok(count >= 120 && count <= 220, `${fable.slug} has ${count} words`);
    assert.ok(fable.story.length >= 4 && fable.story.length <= 6, `${fable.slug}: paragraphs`);
    const list = m.sentences(fable);
    assert.equal(list.length, fable.story.flat().length + 1);
    assert.deepEqual(list.map(sentence => sentence.index), list.map((_, i) => i));
    assert.equal(list.at(-1).text, fable.moral, `${fable.slug} ends with its moral`);
    assert.deepEqual(list.filter(sentence => sentence.moral).map(sentence => sentence.text), [fable.moral]);
    assert.equal(fable.paragraphs.at(-1).length, 1);
    assert.equal(m.storyText(fable).split('\n\n').length, fable.story.length + 1);
    assert.match(fable.moral, /^[A-Z][^.!?]{20,90}\.$/, `${fable.slug}: the moral is one sentence`);
    for (const { text } of list) {
      assert.match(text, /^[“A-Z]/, `${fable.slug}: “${text}” starts like a sentence`);
      assert.match(text, /[.!?]”?$/, `${fable.slug}: “${text}” ends like a sentence`);
      assert.ok(words(text) <= 22, `${fable.slug}: “${text}” is too long to read in one breath`);
      // Each entry is one sentence: outside quotation marks, nothing ends before the end.
      assert.ok(!/[.!?]\s+\S/.test(text.replace(/“[^”]*”/g, '')), `${fable.slug}: “${text}” holds more than one sentence`);
      assert.ok(!/\s{2}|\n|^\s|\s$/.test(text), `${fable.slug}: stray spaces in “${text}”`);
    }
    // Speech is curly-quoted and closed inside its own paragraph.
    for (const paragraph of fable.paragraphs) {
      const joined = paragraph.join(' ');
      assert.equal((joined.match(/“/g) ?? []).length, (joined.match(/”/g) ?? []).length, `${fable.slug}: quotation marks in “${joined.slice(0, 40)}…”`);
    }
  }
});

test('every fable reads at an elementary level by the site’s own checker', () => {
  for (const fable of FABLES) {
    const analysis = analyze(m.storyText(fable));
    assert.equal(analysis.counts.words, m.wordCount(fable), `${fable.slug}: both word counts agree`);
    assert.ok(analysis.grade < 6, `${fable.slug} checks as grade ${analysis.grade.toFixed(1)}`);
    assert.ok(analysis.scores.readingEase >= 85, `${fable.slug}: reading ease ${analysis.scores.readingEase.toFixed(0)}`);
  }
});

test('house style: US spelling, curly quotes, no em dashes, no stray spaces', () => {
  const british = /\b(colour|favourite|grey|travell|neighbour|centre|metre|realise|organise|towards|afterwards|whilst|learnt|honour|practise)/i;
  for (const fable of FABLES) {
    for (const text of everyString(fable)) {
      assert.ok(!/["']/.test(text), `${fable.slug}: straight quote in “${text}”`);
      assert.ok(!/—|--/.test(text), `${fable.slug}: dash in “${text}”`);
      assert.ok(!british.test(text), `${fable.slug}: British spelling in “${text}”`);
      assert.ok(!/\s{2}|^\s|\s$/.test(text), `${fable.slug}: stray spaces in “${text}”`);
    }
  }
  for (const item of m.SAYINGS) {
    assert.ok(m.fableBySlug(item.fable), item.fable);
    assert.ok(item.saying.length > 5 && /\.$/.test(item.meaning), item.saying);
  }
  assert.ok(plain(m.storyText(m.fableBySlug('tortoise-and-hare'))).includes(m.SAYINGS[0].saying), 'the first saying is in its fable');
});

test('vocabulary: three or four words per fable, each one used in the fable', () => {
  for (const fable of FABLES) {
    assert.ok(fable.vocabulary.length >= 3 && fable.vocabulary.length <= 4, fable.slug);
    assert.equal(new Set(fable.vocabulary.map(item => item.word)).size, fable.vocabulary.length);
    const text = m.storyText(fable);
    for (const { word, meaning } of fable.vocabulary) {
      assert.match(text, new RegExp(`(^|[^\\p{L}])${word}([^\\p{L}]|$)`, 'u'), `${fable.slug}: “${word}” is in the fable in this form`);
      assert.ok(meaning.length >= 6 && meaning.length <= 70, `${fable.slug}: ${word}`);
      assert.ok(!/[.!?]$/.test(meaning) && /^[a-z]/.test(meaning), `${fable.slug}: “${meaning}” is a plain phrase`);
      assert.ok(!new RegExp(`\\b${word}\\b`, 'i').test(meaning), `${fable.slug}: “${word}” is not explained with itself`);
    }
  }
});

test('questions: four about the story and one about the moral, each with one right answer and two wrong ones', () => {
  assert.equal(QUIZ_LENGTH, 5);
  assert.deepEqual([m.STORY_QUESTIONS_WORD, m.QUIZ_LENGTH_WORD], [['four'][STORY_QUESTIONS - 4], ['five'][QUIZ_LENGTH - 5]], 'the numbers written as words match the numbers');
  for (const fable of FABLES) {
    assert.deepEqual(fable.questions.map(item => item.kind), [...Array(STORY_QUESTIONS).fill('story'), 'moral'], fable.slug);
    assert.equal(new Set(fable.questions.map(item => item.q)).size, QUIZ_LENGTH, `${fable.slug}: no question twice`);
    for (const item of fable.questions) {
      assert.match(item.q, /^[A-Z].{12,100}\?$/, `${fable.slug}: ${item.q}`);
      assert.equal(item.wrong.length, 2, `${fable.slug}: ${item.q}`);
      const choices = [item.right, ...item.wrong];
      assert.equal(new Set(choices.map(plain)).size, 3, `${fable.slug}: three different choices for ${item.q}`);
      for (const choice of choices) assert.match(choice, /^[A-Z].{5,100}\.$/, `${fable.slug}: choice “${choice}”`);
      assert.match(item.why, /^[A-Z“].{25,170}[.”]$/, `${fable.slug}: explanation “${item.why}”`);
      // Words quoted in an explanation are really in the fable.
      const story = plain(m.storyText(fable));
      for (const [, quoted] of item.why.matchAll(/“([^”]+)”/g)) {
        for (const piece of quoted.split(/[.!?]\s*/).filter(Boolean)) assert.ok(story.includes(plain(piece)), `${fable.slug}: “${piece}” is quoted but not in the fable`);
      }
    }
    const moral = fable.questions.at(-1);
    assert.equal(moral.q, m.MORAL_QUESTION);
    assert.notEqual(plain(moral.right), plain(fable.moral), `${fable.slug}: the right choice says the moral in other words`);
    for (const wrong of moral.wrong) assert.ok(!FABLES.some(other => plain(other.moral) === plain(wrong)), `${fable.slug}: a wrong moral is not another fable’s moral`);
  }
  // No right answer is used for two questions anywhere.
  const rights = FABLES.flatMap(fable => fable.questions.map(item => plain(item.right)));
  assert.equal(new Set(rights).size, rights.length);
});

test('questions as shown: the right answer is where the model says, and A, B and C all get used', () => {
  const tally = { A: 0, B: 0, C: 0 };
  for (const fable of FABLES) {
    const shown = m.questions(fable);
    assert.equal(shown.length, QUIZ_LENGTH);
    shown.forEach((question, i) => {
      const item = fable.questions[i];
      assert.equal(question.number, i + 1);
      assert.equal(question.choices.length, LETTERS.length);
      assert.equal(question.choices[question.answer], item.right, `${fable.slug} q${i + 1}`);
      assert.deepEqual(question.choices.filter((_, c) => c !== question.answer), item.wrong, `${fable.slug} q${i + 1}: wrong answers keep their order`);
      assert.equal(question.answer, m.rightPosition(fable, i));
      for (let c = 0; c < 3; c++) assert.equal(m.checkAnswer(fable, i, c), c === question.answer);
      assert.equal(m.feedback(question, question.answer), `Correct! ${item.why}`);
      const miss = (question.answer + 1) % 3;
      assert.equal(m.feedback(question, miss), `Not quite. The answer is ${LETTERS[question.answer]}. ${item.why}`);
    });
    const letters = m.answerLetters(fable);
    assert.deepEqual(letters, shown.map(question => LETTERS[question.answer]));
    assert.equal(new Set(letters).size, 3, `${fable.slug}: ${letters.join('')} uses A, B and C`);
    assert.ok(!/(.)\1\1/.test(letters.join('')), `${fable.slug}: never the same letter three times running`);
    for (const letter of letters) tally[letter]++;
    assert.equal(m.checkAnswer(fable, 9, 0), false);
  }
  for (const letter of LETTERS) assert.ok(tally[letter] >= 14 && tally[letter] <= 20, `${letter} is right ${tally[letter]} times out of 50`);
  assert.ok(new Set(FABLES.map(fable => m.answerLetters(fable).join(''))).size >= 5, 'the fables do not all share one answer pattern');
});

test('scoring: counts right answers and finds a message for every score', () => {
  assert.deepEqual(m.scoreQuiz([]), { correct: 0, answered: 0, total: 5, done: false });
  assert.deepEqual(m.scoreQuiz([true, false, true]), { correct: 2, answered: 3, total: 5, done: false });
  assert.deepEqual(m.scoreQuiz([true, true, true, true, true]), { correct: 5, answered: 5, total: 5, done: true });
  const messages = [0, 1, 2, 3, 4, 5].map(correct => m.quizMessage({ correct, total: 5 }));
  for (const message of messages) assert.match(message, /^[A-Z].{20,120}\.$/);
  assert.match(messages[5], /Every answer right/);
  assert.notEqual(messages[5], messages[4]);
  assert.notEqual(messages[4], messages[3]);
  assert.equal(messages[3], messages[2]);
  assert.notEqual(messages[2], messages[1]);
});

test('words in a sentence: positions for the word highlight', () => {
  const text = '“You are so slow,” said the hare.';
  const ranges = m.wordRanges(text);
  assert.deepEqual(ranges.map(range => range.text), ['You', 'are', 'so', 'slow', 'said', 'the', 'hare']);
  for (const range of ranges) assert.equal(text.slice(range.start, range.end), range.text);
  assert.deepEqual(m.wordRanges('the hunter’s net, step-by-step').map(range => range.text), ['the', 'hunter’s', 'net', 'step-by-step']);
  assert.equal(m.wordIndexAt(ranges, 0), 0, 'the opening quotation mark belongs to the first word');
  assert.equal(m.wordIndexAt(ranges, 1), 0);
  assert.equal(m.wordIndexAt(ranges, 5), 1);
  assert.equal(m.wordIndexAt(ranges, 7), 1, 'the space after a word still belongs to it');
  assert.equal(m.wordIndexAt(ranges, text.indexOf('hare')), 6);
  assert.equal(m.wordIndexAt(ranges, text.length - 1), -1, 'the final full stop is not a word');
  assert.equal(m.wordIndexAt(ranges, -1), -1);
  assert.equal(m.wordIndexAt(ranges, undefined), -1);
  assert.equal(m.wordIndexAt([], 0), -1);
  // Every sentence in the bank can be split into words that sit where they say they do.
  for (const fable of FABLES) for (const { text: sentence } of m.sentences(fable)) {
    const list = m.wordRanges(sentence);
    assert.ok(list.length >= 1, sentence);
    list.forEach((range, i) => assert.equal(m.wordIndexAt(list, range.start), i, `${sentence}: ${range.text}`));
  }
});

test('pages: a unique title and description for every fable, and a reading time', () => {
  const titles = FABLES.map(m.pageTitle), descriptions = FABLES.map(m.pageDescription);
  assert.equal(new Set(titles).size, 10);
  assert.equal(new Set(descriptions).size, 10);
  FABLES.forEach((fable, i) => {
    assert.ok(titles[i].startsWith(`${fable.title}: Read-Along Fable`), titles[i]);
    assert.ok(titles[i].length >= 30 && titles[i].length <= 60, `${titles[i]} is ${titles[i].length} characters`);
    assert.ok(descriptions[i].length >= 120 && descriptions[i].length <= 155, `${fable.slug}: description is ${descriptions[i].length} characters`);
    assert.ok(descriptions[i].includes(fable.title));
    assert.equal(m.fablePath(fable), `/tools/fables/${fable.slug}/`);
    assert.match(m.minutesLabel(fable), /^about (1|1½|2) minutes?$/);
    assert.match(m.minutesIso(fable), /^PT[12]M(30S)?$/);
    assert.ok(Math.abs(m.readAloudSeconds(fable) - (m.wordCount(fable) / 130) * 60) < 1e-9, 'the time uses the site’s read-aloud speed');
  });
  assert.equal(m.pageTitle(FABLES[0]), 'The Tortoise and the Hare: Read-Along Fable with Questions');
  // The heading's two lines: the whole title, in two parts of about the same length, short enough for a phone.
  for (const fable of FABLES) {
    const lines = m.titleLines(fable.title);
    assert.equal(lines.join(' '), fable.title);
    assert.ok(lines.every(line => line.length >= 6 && line.length <= 19), `${fable.slug}: ${lines.join(' / ')}`);
  }
  assert.deepEqual(m.titleLines('The Goose That Laid the Golden Eggs'), ['The Goose That Laid', 'the Golden Eggs']);
  assert.ok(/^A fable is /.test(m.DEFINITIONS.fable) && /^A moral is /.test(m.DEFINITIONS.moral));
});

/* ------------------------------------------------------------- the worksheet */

test('worksheet: the fable, its words and its questions come from the bank, with every answer', () => {
  const fable = m.fableBySlug(WORKSHEET_FABLE);
  assert.ok(fable, 'the worksheet fable exists');
  assert.equal(activity.fable, WORKSHEET_FABLE);
  assert.ok(activity.title.includes(fable.title) && activity.pageTitle.includes(fable.title) && activity.pageDescription.includes(fable.title));
  assert.notEqual(activity.title, fable.title, 'the worksheet and the fable page have different headings');
  assert.deepEqual(activity.sections.map(section => section.type), ['passage', 'text', 'questions', 'questions', 'fables-letters']);
  const [passage, wordsToKnow, partA, partB, letters] = activity.sections;
  assert.equal(passage.text, m.storyText(fable), 'the fable is printed in full');
  assert.ok(passage.text.endsWith(fable.moral));
  for (const item of fable.vocabulary) assert.ok(wordsToKnow.lines.join(' ').includes(`${item.word}: ${item.meaning}`), item.word);

  const story = fable.questions.filter(item => item.kind === 'story');
  assert.equal(partA.items.length, 4);
  partA.items.forEach((item, i) => {
    assert.equal(item.q, story[i].q);
    // A “why” question gets two lines and its explanation; the others get the answer alone.
    const why = /^Why/.test(story[i].q);
    assert.equal(item.a, why ? `${story[i].right} ${story[i].why}` : story[i].right);
    assert.equal(item.lines, why ? 2 : 1);
  });
  assert.ok(partA.items.some(item => item.lines === 2) && partA.items.some(item => item.lines === 1));
  assert.equal(partB.start, 5);
  assert.equal(partB.items.length, 2);
  assert.match(partB.items[0].q, /moral.*in your own words/);
  assert.ok(partB.items[0].a.includes(`“${fable.moral}”`) && partB.items[0].a.includes(fable.questions.at(-1).right));
  assert.match(partB.items[1].q, /new ending.*modern version.*three sentences/);
  assert.match(partB.items[1].a, /^Answers vary\./);

  assert.deepEqual(letters.items, FABLES.map(item => ({ title: item.title, letters: m.answerLetters(item) })), 'the key lists the right letters for every fable page');
  assert.ok(letters.lines.length === 1 && letters.keyNote.length > 40);
  assert.deepEqual(activity.standards, Object.keys(standards));
  assert.ok(activity.steps[0].includes(fable.title));
});

/* -------------------------------------------------------------- the player */

// A stand-in for window.speechSynthesis. The test fires the events a browser would fire.
class FakeSynth {
  constructor({ pauseWorks = true, pauseEnds = false, eventsOnCancel = false } = {}) {
    Object.assign(this, { pauseWorks, pauseEnds, eventsOnCancel, queue: [], speaking: false, pending: false, paused: false, log: [] });
  }
  speak(utterance) { this.log.push(`speak:${utterance.text}`); this.queue.push(utterance); this.speaking = true; }
  cancel() {
    this.log.push('cancel');
    const dropped = this.queue;
    this.queue = [];
    this.speaking = false;
    // Some browsers report a cancelled utterance as an error and then as ended.
    if (this.eventsOnCancel) for (const utterance of dropped) { utterance.onerror?.({ error: 'interrupted' }); utterance.onend?.({}); }
  }
  pause() {
    this.log.push('pause');
    if (this.pauseEnds) this.end();
    else if (this.pauseWorks) this.paused = true;
  }
  resume() { this.log.push('resume'); this.paused = false; }
  get current() { return this.queue[0]; }
  start() { this.current.onstart?.({}); }
  boundary(charIndex, name = 'word') { this.current.onboundary?.({ name, charIndex }); }
  end() { const utterance = this.queue.shift(); this.speaking = this.queue.length > 0; utterance.onend?.({}); }
  fail(error) { const utterance = this.queue.shift(); this.speaking = false; utterance.onerror?.({ error }); }
  spoken() { return this.log.filter(entry => entry.startsWith('speak:')).map(entry => entry.slice(6)); }
}
class FakeUtterance { constructor(text) { this.text = text; } }

const SENTENCES = ['A hare was proud.', '“You are slow,” said the hare.', 'The tortoise did not stop.', 'Slow and steady wins the race.'];
function setup(options = {}, playerOptions = {}) {
  const synth = new FakeSynth(options);
  const changes = [];
  let clock = 0, nextId = 0;
  const timers = new Map();
  const player = createPlayer({
    synth, Utterance: FakeUtterance, sentences: SENTENCES,
    onChange: (state, reason) => changes.push({ ...state, reason }),
    setTimer: (fn, ms) => { timers.set(++nextId, { at: clock + ms, fn }); return nextId; },
    clearTimer: id => timers.delete(id),
    now: () => clock,
    ...playerOptions,
  });
  // Move the clock on, running each timer when its time comes.
  const wait = ms => {
    const until = clock + ms;
    for (;;) {
      const due = [...timers].filter(([, timer]) => timer.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      timers.delete(due[0]);
      clock = due[1].at;
      due[1].fn();
    }
    clock = until;
  };
  return { synth, player, changes, wait, last: () => changes.at(-1) };
}

test('player: one sentence per utterance, and the highlight follows start and end', () => {
  const { synth, player, changes, last } = setup();
  assert.deepEqual(player.state, { status: 'idle', index: -1, speaking: false, word: null, finished: false, error: null });
  player.play();
  assert.deepEqual(synth.spoken(), [SENTENCES[0]], 'only the first sentence is handed to the browser');
  assert.ok(!synth.log.includes('cancel'), 'the first Play speaks at once, inside the tap, with nothing to cancel');
  assert.equal(synth.current.lang, 'en-US');
  assert.equal(synth.current.rate, 1);
  assert.deepEqual(last(), { status: 'playing', index: 0, speaking: false, word: null, finished: false, error: null, reason: 'sentence' });
  synth.start();
  assert.deepEqual(last(), { status: 'playing', index: 0, speaking: true, word: null, finished: false, error: null, reason: 'start' });
  synth.end();
  assert.deepEqual(synth.spoken(), SENTENCES.slice(0, 2), 'the next sentence is spoken when the first has ended');
  assert.equal(last().index, 1);
  assert.equal(last().speaking, false);
  synth.start(); synth.end();
  synth.start(); synth.end();
  synth.start();
  assert.equal(last().index, 3);
  synth.end();
  assert.deepEqual(last(), { status: 'idle', index: -1, speaking: false, word: null, finished: true, error: null, reason: 'end' });
  assert.deepEqual(synth.spoken(), SENTENCES, 'every sentence was spoken once, in order');
  assert.ok(!synth.log.includes('cancel'), 'reading straight through never cancels');
  assert.ok(changes.every(change => change.index < SENTENCES.length));
  // Play after the end starts again from the top.
  player.toggle();
  assert.equal(last().index, 0);
  assert.equal(last().finished, false);
});

test('player: word boundaries mark the word, and are never needed', () => {
  const { synth, player, last } = setup();
  player.play(1);
  synth.start();
  synth.boundary(0);
  assert.deepEqual(last().word, { index: 0, start: 1, end: 4 });
  assert.equal(SENTENCES[1].slice(1, 4), 'You');
  const before = last();
  synth.boundary(2);
  assert.equal(last(), before, 'the same word again changes nothing');
  synth.boundary(SENTENCES[1].indexOf('slow'));
  assert.equal(last().word.index, 2);
  assert.equal(last().reason, 'word');
  synth.boundary(5, 'sentence');
  assert.equal(last().word.index, 2, 'sentence boundaries are ignored');
  synth.boundary(SENTENCES[1].length - 1);
  assert.equal(last().word, null, 'after the last word nothing is marked');
  synth.end();
  assert.equal(last().word, null);
  assert.equal(last().index, 2);
  // A browser that fires a boundary but no start event still counts as speaking.
  synth.boundary(4);
  assert.equal(last().speaking, true);
  assert.equal(last().word.index, 1);
});

test('player: events from a cancelled utterance are ignored, and the new sentence waits a moment', () => {
  for (const eventsOnCancel of [false, true]) {
    const { synth, player, wait, last } = setup({ eventsOnCancel });
    player.play();
    synth.start();
    const old = synth.current;
    player.play(2);
    assert.ok(synth.log.includes('cancel'));
    assert.deepEqual(last(), { status: 'playing', index: 2, speaking: false, word: null, finished: false, error: null, reason: 'sentence' });
    assert.deepEqual(synth.spoken(), [SENTENCES[0]], 'nothing is spoken straight after a cancel');
    old.onend?.({});
    old.onboundary?.({ name: 'word', charIndex: 3 });
    old.onerror?.({ error: 'interrupted' });
    assert.equal(last().index, 2, 'the old utterance cannot move the highlight');
    assert.equal(last().error, null);
    wait(TIMING.afterCancel);
    assert.deepEqual(synth.spoken(), [SENTENCES[0], SENTENCES[2]]);
    synth.start();
    assert.equal(last().speaking, true);
    synth.end();
    assert.equal(last().index, 3);
  }
});

test('player: pause and resume where the browser supports them', () => {
  const { synth, player, wait, last } = setup();
  player.play();
  synth.start();
  player.pause();
  assert.equal(last().status, 'paused');
  assert.equal(last().index, 0);
  assert.ok(synth.paused);
  wait(TIMING.pauseCheck + 50);
  assert.ok(!synth.log.includes('cancel'), 'a pause that worked is left alone');
  player.resume();
  assert.equal(last().status, 'playing');
  assert.equal(last().reason, 'resume');
  assert.deepEqual(synth.spoken(), [SENTENCES[0]], 'the sentence carries on; it is not spoken again');
  wait(TIMING.resumeCheck + 50);
  assert.deepEqual(synth.spoken(), [SENTENCES[0]]);
  synth.end();
  assert.equal(last().index, 1);
});

test('player: where pause() does nothing, speech is stopped and the sentence is read again on resume', () => {
  const { synth, player, wait, last } = setup({ pauseWorks: false });
  player.play(1);
  synth.start();
  player.pause();
  assert.equal(last().status, 'paused');
  assert.ok(!synth.log.includes('cancel'));
  wait(TIMING.pauseCheck);
  assert.ok(synth.log.includes('cancel'), 'the voice is silenced once it is clear that pause() did nothing');
  assert.deepEqual({ status: last().status, index: last().index, speaking: last().speaking }, { status: 'paused', index: 1, speaking: false });
  player.resume();
  wait(TIMING.afterCancel);
  assert.deepEqual(synth.spoken(), [SENTENCES[1], SENTENCES[1]], 'the same sentence, from its start');
  assert.equal(last().status, 'playing');
  synth.start(); synth.end();
  assert.equal(last().index, 2);
});

test('player: where pause() ends the sentence, the place is kept', () => {
  const { synth, player, wait, last } = setup({ pauseEnds: true });
  player.play(1);
  synth.start();
  player.pause();
  assert.deepEqual({ status: last().status, index: last().index }, { status: 'paused', index: 1 });
  assert.deepEqual(synth.spoken(), [SENTENCES[1]], 'the end of a paused sentence does not start the next one');
  wait(1000);
  player.toggle();
  assert.deepEqual(synth.spoken(), [SENTENCES[1], SENTENCES[1]]);
});

test('player: on browsers known for it (nativePause off), pause stops at once', () => {
  const { synth, player, wait, last } = setup({}, { nativePause: false });
  player.play(2);
  synth.start();
  player.pause();
  assert.ok(synth.log.includes('cancel') && !synth.log.includes('pause'));
  assert.equal(last().status, 'paused');
  player.resume();
  wait(TIMING.afterCancel);
  assert.deepEqual(synth.spoken(), [SENTENCES[2], SENTENCES[2]]);
});

test('player: a resume that does not bring the voice back reads the sentence again', () => {
  const { synth, player, wait } = setup();
  player.play();
  synth.start();
  player.pause();
  synth.resume = () => { synth.log.push('resume'); };   // stays paused
  player.resume();
  wait(TIMING.resumeCheck);
  synth.resume = () => { synth.log.push('resume'); synth.paused = false; };
  wait(TIMING.afterCancel);
  assert.deepEqual(synth.spoken(), [SENTENCES[0], SENTENCES[0]]);
});

test('player: back, next and tapping a sentence', () => {
  const { synth, player, wait, last } = setup();
  player.next();
  assert.equal(player.state.status, 'idle', 'back and next do nothing while stopped');
  player.play(1);
  synth.start();
  player.next();
  assert.equal(last().index, 2);
  wait(TIMING.afterCancel);
  player.next(); player.next(); player.next();
  assert.equal(last().index, 3, 'next stops at the last sentence');
  wait(TIMING.afterCancel);
  assert.equal(synth.spoken().at(-1), SENTENCES[3], 'only the sentence finally chosen is spoken');
  assert.equal(synth.spoken().length, 3);
  player.previous();
  assert.equal(last().index, 2);
  wait(TIMING.afterCancel);
  synth.start();
  // While paused, the place moves but nothing is spoken until Play.
  player.pause();
  player.previous();
  player.previous();
  player.previous();
  assert.deepEqual({ status: last().status, index: last().index }, { status: 'paused', index: 0 });
  const count = synth.spoken().length;
  wait(2000);
  assert.equal(synth.spoken().length, count);
  player.resume();
  wait(TIMING.afterCancel);
  assert.equal(synth.spoken().at(-1), SENTENCES[0]);
  player.play(99);
  assert.equal(last().index, 3, 'a sentence number out of range is brought into range');
});

test('player: speed and voice are used for each utterance and apply at once', () => {
  const { synth, player, wait, last } = setup();
  const voice = { name: 'Test', lang: 'en-GB', voiceURI: 'test' };
  player.setRate(0.75);
  player.setVoice(voice);
  assert.equal(player.state.status, 'idle');
  player.play();
  assert.equal(synth.current.rate, 0.75);
  assert.equal(synth.current.voice, voice);
  assert.equal(synth.current.lang, 'en-GB');
  synth.start();
  player.setRate(1.25);
  wait(TIMING.afterCancel);
  assert.deepEqual(synth.spoken(), [SENTENCES[0], SENTENCES[0]], 'the sentence is read again at the new speed');
  assert.equal(synth.current.rate, 1.25);
  synth.start();
  // The browser hands out a new object for the same voice when its list changes: that must not restart anything.
  player.setVoice({ ...voice });
  player.setRate(1.25);
  wait(TIMING.afterCancel);
  assert.equal(synth.spoken().length, 2);
  assert.equal(last().speaking, true);
  player.setVoice({ name: 'Other', lang: 'en-US', voiceURI: 'other' });
  wait(TIMING.afterCancel);
  assert.equal(synth.spoken().length, 3);
  assert.equal(synth.current.voice.name, 'Other');
});

test('player: stop, and stopping when the page is hidden', () => {
  const { synth, player, wait, last } = setup();
  player.play(1);
  synth.start();
  player.suspend();
  assert.ok(synth.log.includes('cancel'), 'speech stops when the page is hidden');
  assert.deepEqual({ status: last().status, index: last().index, speaking: last().speaking }, { status: 'paused', index: 1, speaking: false });
  player.resume();
  wait(TIMING.afterCancel);
  assert.deepEqual(synth.spoken(), [SENTENCES[1], SENTENCES[1]]);
  synth.start();
  player.stop();
  assert.deepEqual(last(), { status: 'idle', index: -1, speaking: false, word: null, finished: false, error: null, reason: 'stop' });
  assert.equal(synth.queue.length, 0);
  const count = synth.spoken().length;
  wait(60000);
  assert.equal(synth.spoken().length, count, 'nothing is spoken after Stop, however long we wait');
  player.suspend();
  assert.equal(player.state.status, 'idle', 'hiding a stopped page changes nothing');
});

test('player: speech that never starts, or fails, is reported instead of waited for', () => {
  const quiet = setup();
  quiet.player.play();
  quiet.wait(TIMING.startTimeout - 1);
  assert.equal(quiet.last().status, 'playing');
  quiet.wait(1);
  assert.deepEqual(quiet.last(), { status: 'idle', index: -1, speaking: false, word: null, finished: false, error: 'unavailable', reason: 'error' });
  // A second try that works clears the error.
  quiet.player.play();
  quiet.wait(TIMING.afterCancel);
  quiet.synth.start();
  assert.equal(quiet.last().error, null);

  // With no voices listed, the wait is shorter.
  const none = setup();
  none.player.setVoice(null, false);
  none.player.play();
  none.wait(TIMING.startTimeoutNoVoices);
  assert.equal(none.last().error, 'unavailable');

  const broken = setup();
  broken.player.play();
  broken.synth.fail('synthesis-failed');
  assert.equal(broken.last().error, 'unavailable');
  assert.equal(broken.last().status, 'idle');

  const interrupted = setup();
  interrupted.player.play();
  interrupted.synth.start();
  interrupted.synth.current.onerror({ error: 'interrupted' });
  assert.equal(interrupted.last().status, 'playing', 'an interruption is not a failure');

  const throwing = setup();
  throwing.synth.speak = () => { throw new Error('no speech'); };
  throwing.player.play();
  assert.equal(throwing.last().error, 'unavailable');
});

test('player: a sentence whose end never arrives does not hold up the story', () => {
  const { synth, player, wait, last } = setup();
  player.play();
  synth.start();
  const limit = SENTENCES[0].length * TIMING.stallPerChar + TIMING.stallExtra;
  wait(limit - 1);
  assert.equal(last().index, 0);
  wait(1 + TIMING.afterCancel);
  assert.equal(last().index, 1);
  assert.deepEqual(synth.spoken(), SENTENCES.slice(0, 2));
});

test('voices: English only, device voices first, novelty voices left out, the saved one remembered', () => {
  const voice = (name, lang, extra = {}) => ({ name, lang, voiceURI: name, localService: true, default: false, ...extra });
  const all = [
    voice('Amelie', 'fr-CA'), voice('Google UK English Female', 'en-GB', { localService: false }), voice('Daniel', 'en-GB'),
    voice('Bells', 'en-US'), voice('Samantha', 'en-US', { default: true }), voice('Alex', 'en-US'), voice('Karen', 'en_AU'), voice('Samantha', 'en-US'),
  ];
  const list = englishVoices(all);
  assert.deepEqual(list.map(item => item.name), ['Samantha', 'Alex', 'Daniel', 'Karen', 'Google UK English Female']);
  assert.equal(chooseVoice(all, '').name, 'Samantha');
  assert.equal(chooseVoice(all, 'Daniel').name, 'Daniel');
  assert.equal(chooseVoice(all, 'Gone').name, 'Samantha', 'a saved voice that is no longer there falls back to the best one');
  assert.equal(chooseVoice([voice('Amelie', 'fr-CA')], ''), null);
  assert.equal(chooseVoice([], 'x'), null);
  assert.deepEqual(englishVoices(undefined), []);
  assert.deepEqual(englishVoices([voice('Bells', 'en-US')]).map(item => item.name), ['Bells'], 'a novelty voice is better than none');
  assert.equal(voiceLabel(list[0]), 'Samantha');
  assert.equal(voiceLabel(list[2]), 'Daniel (en-GB)');
  assert.equal(voiceLabel(list[3]), 'Karen (en-AU)');
  assert.equal(voiceLabel(list[4]), 'Google UK English Female (en-GB), online');
  assert.equal(voiceKey(list[0]), 'Samantha');
  assert.equal(voiceKey(null), '');
});

test('speeds: slow, normal and fast, with normal as the default', () => {
  assert.deepEqual(RATES.map(rate => rate.id), ['slow', 'normal', 'fast']);
  assert.ok(RATES[0].rate < 1 && RATES[2].rate > 1);
  assert.equal(rateById(DEFAULT_RATE).rate, 1);
  assert.equal(rateById('nonsense').id, DEFAULT_RATE);
  assert.equal(rateById('slow').rate, RATES[0].rate);
});
