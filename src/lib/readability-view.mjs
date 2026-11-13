// What the Reading Level Checker shows for an analysis, as plain strings and HTML. The page renders it on the
// server for the default sample, and the browser renders it again as the reader types, so both use this file.
import {
  LONG_SENTENCE_WORDS, LONG_WORD_SYLLABLES, MIN_WORDS, SMOG_SENTENCES, SILENT_WPM, ALOUD_WPM,
  gradeLabel, ageRange, easeLabel, readingSeconds, formatDuration,
} from './readability.mjs';

/** A number with a fixed number of decimals and a real minus sign. */
export const fmt = (value, decimals = 1) => value.toFixed(decimals).replace(/^-(?=.*[1-9])/, '−').replace(/^-/, '');
const plural = (n, word) => `${n.toLocaleString('en-US')} ${word}${n === 1 ? '' : 's'}`;

/** The six formulas in the order the breakdown table lists them. */
export const FORMULAS = [
  { key: 'fleschKincaid', name: 'Flesch–Kincaid Grade Level', result: 'US grade', formula: '0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59', uses: 'Sentence length and syllables per word' },
  { key: 'readingEase', name: 'Flesch Reading Ease', result: 'Score, higher is easier', formula: '206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words)', uses: 'Sentence length and syllables per word' },
  { key: 'gunningFog', name: 'Gunning Fog Index', result: 'US grade', formula: '0.4 × [(words ÷ sentences) + 100 × (long words ÷ words)]', uses: 'Sentence length and the share of long words' },
  { key: 'smog', name: 'SMOG Grade', result: 'US grade', formula: '1.043 × √(long words × 30 ÷ sentences) + 3.1291', uses: 'Long words per 30 sentences' },
  { key: 'colemanLiau', name: 'Coleman–Liau Index', result: 'US grade', formula: '0.0588 × (letters per 100 words) − 0.296 × (sentences per 100 words) − 15.8', uses: 'Letters per word and sentence length' },
  { key: 'ari', name: 'Automated Readability Index', result: 'US grade', formula: '4.71 × (letters ÷ words) + 0.5 × (words ÷ sentences) − 21.43', uses: 'Letters per word and sentence length' },
];

const BLANK = '–';

/** Every value the results panel shows, keyed by the name of its [data-out] element. */
export function display(analysis) {
  const { counts: c, scores } = analysis;
  if (analysis.empty) {
    const keys = ['grade', 'gradeNumber', 'ages', 'ease', 'easeLabel', 'words', 'sentences', 'wordsPerSentence', 'syllablesPerWord', 'longWordShare', 'readTime', 'aloudTime', ...FORMULAS.map(f => f.key)];
    return { ...Object.fromEntries(keys.map(key => [key, BLANK])), ages: 'Type or paste some text', easeLabel: '', easePosition: '0' };
  }
  return {
    grade: gradeLabel(analysis.grade),
    gradeNumber: fmt(analysis.grade),
    ages: ageRange(analysis.grade),
    ease: fmt(scores.readingEase),
    easeLabel: easeLabel(scores.readingEase),
    easePosition: String(Math.round(Math.min(100, Math.max(0, scores.readingEase)))),
    words: c.words.toLocaleString('en-US'),
    sentences: c.sentences.toLocaleString('en-US'),
    wordsPerSentence: fmt(c.wordsPerSentence),
    syllablesPerWord: fmt(c.syllablesPerWord, 2),
    longWordShare: `${fmt(c.longWordShare * 100)}%`,
    readTime: formatDuration(readingSeconds(c.words, SILENT_WPM)),
    aloudTime: formatDuration(readingSeconds(c.words, ALOUD_WPM)),
    ...Object.fromEntries(FORMULAS.map(f => [f.key, fmt(scores[f.key])])),
  };
}

/** Honest warnings that apply to this text. */
export function notices(analysis) {
  const { counts: c } = analysis;
  if (analysis.empty) return ['Type or paste some text to check its reading level.'];
  const list = [];
  if (!analysis.english) list.push('Most of this text is not written in the Latin alphabet. These formulas were made for English, so the numbers will not mean much here.');
  if (analysis.rough) list.push(`This text has ${plural(c.words, 'word')}. Results for fewer than about ${MIN_WORDS} words are rough: one long sentence or one long word can move the grade a lot.`);
  if (c.sentences < SMOG_SENTENCES) list.push(`SMOG was designed for samples of ${SMOG_SENTENCES} sentences or more. This text has ${plural(c.sentences, 'sentence')}, so its SMOG grade is an estimate.`);
  return list;
}

const escapeHtml = text => text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** At most this many words are shown back with marks; the numbers always use the whole text. */
export const MARKED_WORD_LIMIT = 3000;

/**
 * The text again, with long sentences wrapped in <mark class="rl-sentence"> (each followed by its word count)
 * and long words in <span class="rl-word">. CSS switches each kind of mark on and off.
 */
export function markedHtml(text, analysis) {
  const limit = analysis.words.length > MARKED_WORD_LIMIT ? analysis.words[MARKED_WORD_LIMIT].start : text.length;
  let html = '';
  let at = 0;
  let w = 0;
  const plain = to => { html += escapeHtml(text.slice(at, to)); at = to; };
  for (const sentence of analysis.sentences) {
    if (sentence.start >= limit) break;
    plain(sentence.start);
    if (sentence.long) html += '<mark class="rl-sentence">';
    while (w < analysis.words.length && analysis.words[w].start < sentence.end) {
      const word = analysis.words[w++];
      if (!word.long) continue;
      plain(word.start);
      html += `<span class="rl-word">${escapeHtml(word.text)}</span>`;
      at = word.end;
    }
    plain(sentence.end);
    if (sentence.long) html += `</mark><span class="rl-badge">${sentence.words} words</span>`;
  }
  plain(limit);
  return html.trimEnd();
}

export const MARK_LABELS = {
  sentences: `Long sentences (more than ${LONG_SENTENCE_WORDS} words)`,
  words: `Long words (${LONG_WORD_SYLLABLES} or more syllables)`,
};
