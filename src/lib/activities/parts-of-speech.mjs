// The Parts of Speech Game's classroom activity. Every sentence, word and label comes from the bank in
// parts-of-speech.mjs, and the student worksheet and the answer key are both rendered from this object,
// so the key cannot drift from the worksheet (tests/parts-of-speech.test.mjs).
import { SENTENCES, partById, sentenceById, plainWord } from '../parts-of-speech.mjs';

// Common Core ELA language standards referenced below, paraphrased.
export const standards = {
  'L.3.1a': 'Explain what nouns, pronouns, verbs, adjectives and adverbs do in general, and what they do in particular sentences (grade 3).',
  'L.5.1a': 'Explain what conjunctions, prepositions and interjections do in general, and what they do in particular sentences (grade 5).',
};

// Part A: eight sentences from levels 1 and 2. In the first four the student marks nouns and verbs, in the
// last four adjectives and adverbs.
export const MARK_GROUPS = [
  { underline: 'noun', circle: 'verb', ids: ['a05', 'a13', 'b22', 'b30'] },
  { underline: 'adjective', circle: 'adverb', ids: ['b02', 'b04', 'b28', 'b25'] },
];
// Part B: twelve words from the bank, three for each column, in the order they are printed in the word box.
export const SORT_TAGS = ['noun', 'verb', 'adjective', 'adverb'];
export const SORT_WORDS = ['softly', 'library', 'gentle', 'carried', 'never', 'kitten', 'muddy', 'sings', 'rainbow', 'carefully', 'brave', 'climbed'];
// Part C: the student writes a sentence to each pattern. The key gives a sentence from the bank that fits.
export const PATTERNS = [
  ['article', 'adjective', 'noun', 'verb', 'adverb'],
  ['article', 'noun', 'verb', 'preposition', 'article', 'noun'],
];

const tagOf = text => SENTENCES.flatMap(sentence => sentence.words).find(word => plainWord(word) === text)?.tag;
/** The first sentence in the bank whose words have exactly these tags, in this order. */
export const sentenceWithPattern = pattern => SENTENCES.find(sentence => sentence.words.map(word => word.tag).join() === pattern.join());
const names = pattern => pattern.map(tag => partById(tag).name.toLowerCase()).join(' + ');
const list = words => (words.length < 3 ? words.join(' and ') : `${words.slice(0, -1).join(', ')} and ${words.at(-1)}`);

let number = 0;
const groups = MARK_GROUPS.map(group => {
  const under = partById(group.underline), ring = partById(group.circle);
  const out = {
    ...group,
    start: number + 1,
    intro: `Sentences ${number + 1} to ${number + group.ids.length}: underline every ${under.name.toLowerCase()} and circle every ${ring.name.toLowerCase()}.`,
    items: group.ids.map(sentenceById),
  };
  number += group.ids.length;
  return out;
});

const define = id => partById(id).definition;
const patternQuestion = (pattern, hint) => {
  const example = sentenceWithPattern(pattern);
  return {
    q: `Write a sentence with this pattern: ${names(pattern)}. ${hint}`,
    lines: 2,
    a: `Answers vary. A sentence from the game that fits the pattern is “${example.text}” Check each word of the student’s sentence against the pattern: ${example.words.map(word => `“${word.text}” is the ${partById(word.tag).name.toLowerCase()}`).join(', ')}.`,
  };
};

export const activity = {
  tool: 'parts-of-speech',
  toolName: 'Parts of Speech Game',
  title: 'Parts of Speech Worksheet',
  pageTitle: 'Parts of Speech Worksheet: Free Printable, Grades 3–6',
  pageDescription: 'Free printable parts of speech worksheet for grades 3–6: mark nouns, verbs, adjectives and adverbs in eight sentences, sort twelve words. With answer key.',
  grade: 'Grades 3–6',
  minutes: 20,
  standards: ['L.3.1a', 'L.5.1a'],
  goal: 'Find the nouns, verbs, adjectives and adverbs in a sentence, sort words by the job they do, and build sentences from a pattern of parts of speech.',
  steps: [
    'Play one round of the Parts of Speech Game at your level. Read the reason for each word after you check.',
    'Do Part A. Read each sentence all the way through before you mark it.',
    'Do Part B. Every word in the box goes in one column, and every column gets three words.',
    'Do Part C. Then play another round and try to beat your score.',
  ],
  lesson: {
    hook: '“The little kitten purred softly.” Which word tells us what the kitten did? Which word tells us how? Which word could we leave out and still have a sentence?',
    debrief: 'Which part of speech was hardest to find, and which test helped? Did anyone find a word that could go in two columns in a different sentence?',
    tip: 'Do the first sentence of Part A together on the board. To compare scores fairly, share the round link from the results screen so everyone gets the same sentences.',
  },
  sections: [
    { type: 'text', heading: 'Remember', lines: [`${define('noun')} ${define('verb')}`, `${define('adjective')} ${define('adverb')} ${define('preposition')}`] },
    { type: 'pos-mark', heading: 'Part A: Mark the sentences', groups },
    {
      type: 'pos-sort',
      heading: 'Part B: Sort the words',
      intro: 'Write each word from the box in the column for its part of speech.',
      keyNote: 'The words in a column can be in any order.',
      bank: SORT_WORDS,
      columns: SORT_TAGS.map(tag => ({ tag, name: partById(tag).name, words: SORT_WORDS.filter(word => tagOf(word) === tag) })),
    },
    {
      type: 'questions',
      heading: 'Part C: Build a sentence',
      items: [
        patternQuestion(PATTERNS[0], 'The articles are a, an and the.'),
        patternQuestion(PATTERNS[1], 'A preposition is a word such as in, on, under or at.'),
      ],
    },
  ],
};

/** What is marked in a Part A sentence, in words: “Nouns: Ben, ball and net. Verb: kicked.” */
export function markLine(group, sentence) {
  const part = tag => {
    const words = sentence.words.filter(word => word.tag === tag).map(word => word.text);
    const name = partById(tag);
    return `${words.length === 1 ? name.name : name.plural[0].toUpperCase() + name.plural.slice(1)}: ${list(words)}.`;
  };
  return `${part(group.underline)} ${part(group.circle)}`;
}
