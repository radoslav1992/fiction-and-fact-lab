// The Reading Level Checker's model: pure functions, shared by the page (server and browser), the worksheet,
// the answer key and the tests.
//
// Text is split into sentences and words, syllables are estimated word by word, and six published
// readability formulas are worked out from those counts with their standard constants.
// Everything here is a simplification of real reading, and the page says so:
//   - Syllables are counted by spelling rules (plus a short list of exceptions), not looked up in a dictionary.
//   - A sentence ends at . ! or ? followed by a space, or at a blank line. Titles such as "Mr." and initials
//     such as "U.S." do not end a sentence.
//   - A hyphenated word is one word. A number written in digits is one word, its syllables are counted the
//     way it is read aloud, and it never counts as a long word.
//   - The formulas were made for English. Other alphabets are counted but flagged (`english: false`).

/** A sentence with more words than this is marked as long. */
export const LONG_SENTENCE_WORDS = 20;
/** A word with at least this many syllables is a long word (the "complex" or "polysyllable" word of Fog and SMOG). */
export const LONG_WORD_SYLLABLES = 3;
/** Assumed speeds for the time estimates, in words per minute. */
export const SILENT_WPM = 200;
export const ALOUD_WPM = 130;
/** Below this many words the results are rough, and the page says so. */
export const MIN_WORDS = 100;
/** SMOG was designed for samples of this many sentences. */
export const SMOG_SENTENCES = 30;

/* ------------------------------------------------------------------ words */

// An initialism (U.S., e.g., a.m.), a number with separators (1,000 or 3.14), or a run of letters and digits
// that may be joined by apostrophes and hyphens (don't, well-known, 10-year-old).
const WORD = /(?<![\p{L}\p{M}\p{N}])(?:\p{L}\.){2,}|\p{N}+(?:[.,]\p{N}+)+|[\p{L}\p{M}\p{N}]+(?:['’\-‑][\p{L}\p{M}\p{N}]+)*/gu;

/** Every word in the text with its position: [{ text, start, end }]. */
export function tokenizeWords(text) {
  return [...String(text).matchAll(WORD)].map(m => ({ text: m[0], start: m.index, end: m.index + m[0].length }));
}

/** Letters and digits in a word: the "characters" of Coleman–Liau and the Automated Readability Index. */
export function countLetters(word) {
  return (word.match(/[\p{L}\p{N}]/gu) ?? []).length;
}

/* -------------------------------------------------------------- sentences */

// Abbreviations that never end a sentence, and ones that end it only when a capital letter follows.
const NEVER_END = new Set(['mr', 'mrs', 'ms', 'dr', 'prof', 'st', 'mt', 'gen', 'capt', 'sen', 'rep', 'rev', 'gov', 'lt', 'sgt', 'col', 'vs', 'fig', 'e.g', 'i.e']);
const SOFT_END = new Set(['etc', 'a.m', 'p.m', 'inc', 'ltd', 'jr', 'sr', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec']);
const BOUNDARY = /([.!?…]+)(["'”’)\]]*)(\s+|$)|\n[ \t]*\n\s*/g;

function endsSentence(text, match) {
  const [, marks, closers] = match;
  const after = text[match.index + match[0].length];
  if (after === undefined) return true;
  const lower = /\p{Ll}/u.test(after);
  const upper = /\p{Lu}/u.test(after);
  if (marks === '.') {
    // The word just before the period. Looking back a fixed distance keeps long texts fast.
    const before = text.slice(Math.max(0, match.index - 24), match.index).match(/[\p{L}\p{N}.]+$/u)?.[0] ?? '';
    const word = before.toLowerCase();
    if (NEVER_END.has(word)) return false;
    if (SOFT_END.has(word) && !upper) return false;
    // Initials and initialisms: "J. K. Rowling", "the U.S. Army". "I" is a word, not an initial.
    if (/^(?:\p{L}\.)*\p{Lu}$/u.test(before) && before !== 'I') return false;
  }
  // "Wait... what?" and "Stop!" she said: the sentence carries on in lower case.
  if (lower && (/^(?:\.{2,}|…+)$/.test(marks) || closers)) return false;
  return true;
}

/** The text's sentences with their positions: [{ text, start, end }]. Pieces without a word are left out. */
export function splitSentences(text) {
  text = String(text);
  const sentences = [];
  let start = 0;
  const push = end => {
    const raw = text.slice(start, end);
    const piece = raw.trim();
    if (!piece) return;
    const from = start + raw.length - raw.trimStart().length;
    if (tokenizeWords(piece).length) sentences.push({ text: piece, start: from, end: from + piece.length });
    else if (sentences.length) {
      // Stray punctuation with no word in it ("!!!") stays with the sentence before it.
      const last = sentences.at(-1);
      last.end = from + piece.length;
      last.text = text.slice(last.start, last.end);
    }
  };
  for (const match of text.matchAll(BOUNDARY)) {
    if (match[1] === undefined) { push(match.index); start = match.index + match[0].length; continue; }
    if (!endsSentence(text, match)) continue;
    push(match.index + match[1].length + match[2].length);
    start = match.index + match[0].length;
  }
  push(text.length);
  return sentences;
}

/* -------------------------------------------------------------- syllables */

// Words the spelling rules below get wrong. Checked before the rules.
const EXCEPTIONS = {
  // silent letters and dropped vowels
  business: 2, businesses: 3, wednesday: 2, evening: 2, evenings: 2, every: 2, everything: 3, everybody: 4, everywhere: 3,
  people: 2, peoples: 2, leopard: 2, leopards: 2, george: 1, georgia: 2, soldier: 2, soldiers: 2, cashier: 2, priest: 1, priests: 1,
  hundred: 2, hundreds: 2, sacred: 2, hatred: 2, kindred: 2, naked: 2, wicked: 2, crooked: 2, rugged: 2, ragged: 2, jagged: 2,
  someone: 2, anyone: 3, persuade: 2, persuaded: 3, lion: 2, lions: 2, liar: 2, liars: 2,
  // a final e that is spoken
  recipe: 3, recipes: 3, maybe: 2, cafe: 2, apostrophe: 4, apostrophes: 4, catastrophe: 4, simile: 3, similes: 3, hyperbole: 4, karate: 3,
  // two vowels side by side that are two syllables
  idea: 3, ideas: 3, area: 3, areas: 3, create: 2, creates: 2, created: 3, creating: 3, creation: 3, creative: 3, creator: 3,
  react: 2, reacts: 2, reaction: 3, reactions: 3, reality: 4, realize: 3, realized: 3, theater: 3, theatre: 3, nuclear: 3, cereal: 3,
  poem: 2, poems: 2, poet: 2, poets: 2, poetry: 3, science: 2, sciences: 3, scientist: 3, scientists: 3, scientific: 4, society: 4,
  cooperate: 4, cooperation: 5, hawaii: 3, chaos: 2, oasis: 3,
  // suffixes that look like a silent e but are not
  element: 3, elements: 3, implement: 3, supplement: 3, complement: 3,
  // abbreviations read as words
  mr: 2, mrs: 2, ms: 1, dr: 2, st: 1, mt: 1, jr: 2, sr: 2, vs: 2, etc: 4,
};

// A silent e before one of these endings: love-ly, care-ful, some-thing, home-work, space-ship.
const AFTER_SILENT_E = 'ly|ful|fully|less|lessly|ness|ment|thing|time|where|what|how|body|work|ball|book|land|side|place|man|men|day|room|made|like|ship|hood|board|boat|fly|flies|fighter|light|way|town|yard|walk|house|life|line|stone|mate|back|fore';
const SILENT_E_INSIDE = new RegExp(`[aeiouy]([^aeiouy]{1,2})e(?=(?:${AFTER_SILENT_E})s?$)`, 'g');

// Vowel pairs that are usually two syllables. Each match adds one.
const SPLIT_VOWELS = [
  /(?<![cstl])ia/g,                                   // gi-ant, pi-ano, me-di-a (not special, Asia, brilliant)
  /(?<![cstgxh])io(?![nr]$)|(?<![cstgxhlnv])io(?=[nr]$)/g, // ra-di-o, vi-olin, cu-ri-ous (not nation, million, senior)
  /iu/g,                                              // sta-di-um, ra-di-us
  /(?<![qg])ua/g,                                     // ac-tu-al, Jan-u-ary (not equal, language)
  /(?<!q)uo/g,                                        // du-o, con-tin-u-ous
  /(?<![qg])ue(?=[lnt])/g,                            // cru-el, flu-ent, du-et
  /(?<![qgb])ui(?=n|d|t[iy])/g,                       // ru-in, flu-id, in-tu-i-tion (not fruit, build)
  /(?<![ct]|fr)ie(?=[nt])/g,                          // qui-et, cli-ent, va-ri-e-ty (not patient, friend)
  /(?<!g)eo|geo(?![nu])/g,                            // vid-e-o, ge-og-ra-phy (not pigeon, gorgeous)
  /eum$/g,                                            // mu-se-um
  /oic$/g,                                            // he-ro-ic
  /[aeiouy]ing$/g,                                    // go-ing, be-ing, fly-ing, stud-y-ing
  /[aeiouy]sm$|thm$/g,                                // pris-m, rhyth-m
];

function wordSyllables(raw) {
  const lower = raw.toLowerCase().normalize('NFD');
  const word = lower.replace(/[^a-z]/g, '');
  if (!word) return 1; // no Latin letters: counted as one syllable
  if (Object.hasOwn(EXCEPTIONS, word)) return EXCEPTIONS[word];
  // TV, DVD: capitals with no vowel are said letter by letter.
  if (/^[A-Z]{2,5}$/.test(raw) && !/[aeiouy]/.test(word)) return [...word].reduce((sum, c) => sum + (c === 'w' ? 3 : 1), 0);
  // y is a consonant at the start of a word and between vowels (yellow, player); otherwise a vowel (happy, type).
  const v = word.replace(/^y/, 'j').replace(/([aeiou])y(?=[aeiou])/g, '$1j');
  let n = (v.match(/[aeiouy]+/g) ?? []).length;
  // Silent endings: make, makes, jumped. Not ta-ble, bus-es, want-ed, han-dled.
  if (/[^aeiouy]e$/.test(v)) { if (!/[^aeiouy]le$/.test(v) && !/[^r]gue$/.test(v)) n--; }
  else if (/[^aeiouy]es$/.test(v)) { if (!/(?:[sxzcg]|ch|sh)es$/.test(v) && !/[^aeiouylr]les$/.test(v)) n--; }
  else if (/[^aeiouytd]ed$/.test(v)) { if (!/[^aeiouylr]led$/.test(v)) n--; }
  // tongue, league, unique: the ending "gue" or "que" is not a syllable of its own.
  if (/(?:[^r]gue|que)s?$/.test(v)) n--;
  // A silent e inside a word: love-ly, some-times. Not no-ble-man.
  n -= [...v.matchAll(SILENT_E_INSIDE)].filter(m => !/^[^lr]l$/.test(m[1])).length;
  for (const pattern of SPLIT_VOWELS) n += (v.match(pattern) ?? []).length;
  // happ-i-er, eas-i-est
  if (word.length >= 5 && /[^aeiou]ier$/.test(v)) n++;
  if (word.length >= 7 && /iest$/.test(v)) n++;
  // did-n't, could-n't, is-n't
  if (/[^aeiouy]n['’]t$/.test(lower)) n++;
  return Math.max(1, n);
}

// Syllables in the English names of numbers.
const ONES = [2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 3, 1, 2, 2, 2, 2, 3, 2, 2]; // zero … nineteen
const TENS = { 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 3, 8: 2, 9: 2 }; // twenty … ninety
const below100 = n => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ONES[n % 10] : 0));
const below1000 = n => (n >= 100 ? ONES[Math.floor(n / 100)] + 2 + (n % 100 ? below100(n % 100) : 0) : below100(n));
const digitByDigit = digits => [...digits].reduce((sum, d) => sum + ONES[Number(d)], 0);

function integerSyllables(digits, grouped) {
  if (digits.length > 12 || (digits.length > 1 && digits[0] === '0')) return digitByDigit(digits);
  const n = Number(digits);
  if (n === 0) return ONES[0];
  // 1100–1999 without a comma is read in pairs, like a year: nineteen eighteen, nineteen oh five, nineteen hundred.
  if (!grouped && n >= 1100 && n <= 1999) {
    const tail = n % 100;
    return below100(Math.floor(n / 100)) + (tail === 0 ? 2 : tail < 10 ? 1 + ONES[tail] : below100(tail));
  }
  let total = 0;
  for (let rest = n, group = 0; rest > 0; rest = Math.floor(rest / 1000), group++) {
    const part = rest % 1000;
    if (part) total += below1000(part) + (group ? 2 : 0); // thousand, million and billion have two syllables each
  }
  return total;
}

function numberSyllables(token) {
  // "3.14" is three point one four; "1,000" is one thousand.
  const [whole, fraction] = /^\d+\.\d+$/.test(token) ? token.split('.') : [token.replace(/[.,]/g, '')];
  return integerSyllables(whole, token.includes(',')) + (fraction ? 1 + digitByDigit(fraction) : 0);
}

const isNumeral = token => /^\d[\d.,]*$/.test(token);

/** Estimated syllables in one word (a heuristic: see the notes at the top of this file). */
export function countSyllables(token) {
  token = String(token);
  if (isNumeral(token)) return numberSyllables(token);
  // U.S., e.g., a.m.: each letter is said by name (w has three syllables).
  if (/^(?:\p{L}\.){2,}$/u.test(token)) return [...token.replace(/\./g, '')].reduce((sum, c) => sum + (c.toLowerCase() === 'w' ? 3 : 1), 0);
  let total = 0;
  for (const part of token.split(/[-‑]/)) {
    const pieces = part.match(/\d+|[^\d]+/g) ?? [];
    pieces.forEach((piece, i) => {
      if (/^\d/.test(piece)) total += integerSyllables(piece, false);
      else if (i > 0 && /^(?:st|nd|rd|th|s)$/i.test(piece)) total += 0; // 3rd, 20th, 1990s: already counted
      else total += wordSyllables(piece);
    });
  }
  return Math.max(1, total);
}

/* --------------------------------------------------------------- formulas */

const ratio = (a, b) => (b > 0 ? a / b : 0);

/** Flesch Reading Ease (Rudolf Flesch, 1948). Higher is easier; plain English is about 60–70. */
export const fleschReadingEase = (words, sentences, syllables) => 206.835 - 1.015 * ratio(words, sentences) - 84.6 * ratio(syllables, words);
/** Flesch–Kincaid Grade Level (Kincaid and others, 1975). */
export const fleschKincaidGrade = (words, sentences, syllables) => 0.39 * ratio(words, sentences) + 11.8 * ratio(syllables, words) - 15.59;
/** Gunning Fog Index (Robert Gunning, 1952). complexWords: words of three or more syllables. */
export const gunningFog = (words, sentences, complexWords) => 0.4 * (ratio(words, sentences) + 100 * ratio(complexWords, words));
/** SMOG grade (G. Harry McLaughlin, 1969). polysyllables: words of three or more syllables. */
export const smogGrade = (polysyllables, sentences) => 1.043 * Math.sqrt(polysyllables * ratio(30, sentences)) + 3.1291;
/** Coleman–Liau Index (Coleman and Liau, 1975): letters and sentences per 100 words. */
export const colemanLiau = (letters, words, sentences) => 0.0588 * (100 * ratio(letters, words)) - 0.296 * (100 * ratio(sentences, words)) - 15.8;
/** Automated Readability Index (Senter and Smith, 1967): characters per word and words per sentence. */
export const automatedReadability = (characters, words, sentences) => 4.71 * ratio(characters, words) + 0.5 * ratio(words, sentences) - 21.43;

/** The five grade-level formulas, in the order the page lists them. */
export const GRADE_FORMULAS = ['fleschKincaid', 'gunningFog', 'smog', 'colemanLiau', 'ari'];

/** One grade from five formulas: the middle value (the median), so a single odd result cannot drag it away. */
export function consensusGrade(scores) {
  const sorted = GRADE_FORMULAS.map(key => scores[key]).sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/* ---------------------------------------------------------------- reading */

/** US grade as words: "Below grade 1", "Grade 6", "College", "College graduate". */
export function gradeLabel(grade) {
  const g = Math.round(grade);
  if (g < 1) return 'Below grade 1';
  if (g <= 12) return `Grade ${g}`;
  return g <= 16 ? 'College' : 'College graduate';
}

/** Typical ages for a US grade: Grade 1 is ages 6–7 … Grade 12 is ages 17–18, then adults. */
export function ageRange(grade) {
  const g = Math.round(grade);
  if (g < 1) return 'ages 6 and under';
  return g <= 12 ? `ages ${g + 5}–${g + 6}` : 'ages 18 and up';
}

/** Flesch's own labels for his Reading Ease score. */
export function easeLabel(score) {
  if (score >= 90) return 'Very easy';
  if (score >= 80) return 'Easy';
  if (score >= 70) return 'Fairly easy';
  if (score >= 60) return 'Standard';
  if (score >= 50) return 'Fairly difficult';
  if (score >= 30) return 'Difficult';
  return 'Very difficult';
}

/** Seconds needed to read `words` words at `wpm` words per minute. */
export const readingSeconds = (words, wpm) => (words / wpm) * 60;

/** "45 seconds", "1 minute", "3 minutes": rounded up to the next 5 seconds below a minute, then to the nearest minute. */
export function formatDuration(seconds) {
  if (seconds <= 0) return '0 seconds';
  if (seconds < 57.5) return `${Math.max(5, Math.ceil(seconds / 5) * 5)} seconds`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

/* ---------------------------------------------------------------- analyze */

/**
 * Everything the checker shows for a text.
 * words: [{ text, start, end, syllables, letters, long }]
 * sentences: [{ text, start, end, words, long }]
 * counts: totals and averages; scores: the six formulas; grade: the consensus grade.
 */
export function analyze(text) {
  text = String(text ?? '');
  const words = tokenizeWords(text).map(word => {
    const syllables = countSyllables(word.text);
    return { ...word, syllables, letters: countLetters(word.text), long: syllables >= LONG_WORD_SYLLABLES && !isNumeral(word.text) };
  });
  let index = 0;
  const sentences = splitSentences(text).map(sentence => {
    let count = 0;
    while (index < words.length && words[index].start < sentence.end) { count++; index++; }
    return { ...sentence, words: count, long: count > LONG_SENTENCE_WORDS };
  });
  const total = (key) => words.reduce((sum, word) => sum + word[key], 0);
  const w = words.length, s = sentences.length, syllables = total('syllables'), letters = total('letters');
  const longWords = words.filter(word => word.long).length;
  const scores = {
    readingEase: fleschReadingEase(w, s, syllables),
    fleschKincaid: fleschKincaidGrade(w, s, syllables),
    gunningFog: gunningFog(w, s, longWords),
    smog: smogGrade(longWords, s),
    colemanLiau: colemanLiau(letters, w, s),
    ari: automatedReadability(letters, w, s),
  };
  const allLetters = text.match(/\p{L}/gu) ?? [];
  const latin = allLetters.filter(c => /[a-z]/i.test(c.normalize('NFD')[0])).length;
  return {
    words,
    sentences,
    counts: {
      words: w,
      sentences: s,
      syllables,
      letters,
      longWords,
      longSentences: sentences.filter(sentence => sentence.long).length,
      wordsPerSentence: ratio(w, s),
      syllablesPerWord: ratio(syllables, w),
      lettersPerWord: ratio(letters, w),
      longWordShare: ratio(longWords, w),
    },
    scores,
    grade: consensusGrade(scores),
    empty: w === 0,
    // The formulas were made for English: flag text that is mostly in another alphabet.
    english: allLetters.length === 0 || latin / allLetters.length >= 0.6,
    rough: w > 0 && w < MIN_WORDS,
  };
}
