// The Word Builder's classroom activity. Every word, part, meaning and spelling note comes from the list in
// word-builder.mjs, and the student worksheet and the answer key are both rendered from this object, so the
// key cannot drift from the worksheet (tests/word-builder.test.mjs).
import { PREFIXES, wordByText, partsLine, partLabel, changeLine, ruleById, examplesOfPart } from '../word-builder.mjs';

// Common Core ELA language standards referenced below, paraphrased.
export const standards = {
  'L.3.4b': 'Work out the meaning of the new word formed when a known affix is added to a known word, such as heat and preheat or care and careless (grade 3).',
  'L.3.2e': 'Use conventional spelling when adding suffixes to base words, as in sitting, smiled and happiness (grade 3).',
};

// Part A: eight words to break into parts. Two of them change their spelling.
export const BREAK_WORDS = ['rewrite', 'careless', 'unhelpful', 'hoping', 'misspell', 'happiness', 'disagreement', 'unbreakable'];
// Part B: six words to build from the part bank. The bank is made of exactly their parts.
export const BUILD_WORDS = ['unkind', 'reread', 'preheat', 'fearless', 'misuse', 'readable'];
// Part C: six prefixes to match to their meanings, and the order the meanings are printed in.
export const MATCH_PREFIXES = ['un', 're', 'mis', 'pre', 'over', 'under'];
export const MATCH_ORDER = ['pre', 'under', 'un', 'mis', 're', 'over'];

const breakItems = BREAK_WORDS.map(wordByText);
const buildItems = BUILD_WORDS.map(wordByText);
const prefixById = id => PREFIXES.find(part => part.id === id);
const letterOf = id => 'ABCDEF'[MATCH_ORDER.indexOf(id)];
const unique = list => [...new Set(list)];
const bankOf = kinds => unique(buildItems.flatMap(word => word.parts).filter(part => kinds.includes(part.kind)).map(partLabel));
const happiness = wordByText('happiness');
// The worked example printed above Part A.
const example = wordByText('playful');
const rule = ruleById(happiness.changes[0].rule);
const sampleWords = MATCH_PREFIXES.slice(0, 4).map(id => `${prefixById(id).label} ${examplesOfPart(prefixById(id), 3).map(word => word.word).join(', ')}`);

export const activity = {
  tool: 'word-builder',
  toolName: 'Prefix and Suffix Word Builder',
  title: 'Prefix and Suffix Worksheet',
  pageTitle: 'Prefix and Suffix Worksheet: Free Printable, Grades 3–5',
  pageDescription: 'Free printable prefix and suffix worksheet for grades 3–5: break eight words into parts, build six words from a part bank and match prefixes. With key.',
  grade: 'Grades 3–5',
  minutes: 20,
  standards: ['L.3.4b', 'L.3.2e'],
  goal: 'Break a word into its prefix, base word and suffix, build new words from parts, and use the parts to work out what a word means.',
  steps: [
    'Open the Word Builder. In Build mode, make five words at Level 1 or Level 2 and read what each part means.',
    'Do Part A. Write the base word the way it is spelled on its own.',
    'Do Parts B and C. You can check a word by building it in the Word Builder.',
    'Do Part D. Then play a Challenge round.',
  ],
  lesson: {
    hook: '“If happy means glad, what does unhappy mean? What about unkind and unsafe? What do you think the two letters u and n are doing?”',
    debrief: 'Which word in Part A was hardest to break up, and why? What happens to the spelling of hope when you add -ing, and of happy when you add -ness?',
    tip: 'Build the first word of Part A together on the board in Build mode. For Challenge mode, share the round link from the results screen so everyone gets the same ten questions.',
  },
  sections: [
    { type: 'text', heading: 'Remember', lines: ['A prefix is a word part added to the front of a base word. A suffix is a word part added to the end. Each part has a meaning, so the parts tell you what the whole word means.'] },
    { type: 'wb-break', heading: 'Part A: Break the word into its parts', intro: `Write each word as its parts, with a plus sign between them, like this: ${example.word} = ${partsLine(example)}.`, items: breakItems },
    {
      type: 'wb-build',
      heading: 'Part B: Build the word',
      intro: 'Use parts from the box to build a word for each meaning. A part can be used more than once.',
      bank: [['Prefixes', bankOf(['prefix'])], ['Base words', bankOf(['base'])], ['Suffixes', bankOf(['suffix'])]],
      items: buildItems,
    },
    {
      type: 'wb-match',
      heading: 'Part C: Match each prefix to its meaning',
      intro: 'Write the letter of the meaning on the line before each prefix.',
      items: MATCH_PREFIXES.map(id => ({ part: prefixById(id), letter: letterOf(id), examples: examplesOfPart(prefixById(id), 2).map(word => word.word) })),
      meanings: MATCH_ORDER.map(id => ({ letter: letterOf(id), meaning: prefixById(id).meaning })),
    },
    {
      type: 'questions',
      heading: 'Part D: Your turn',
      items: [
        {
          q: `${partsLine(happiness)} is spelled ${happiness.word}. What happened to the y? Write the rule in your own words.`,
          lines: 1,
          a: `${changeLine(happiness.changes[0])} The rule: ${rule.rule} ${rule.keeps}`,
        },
        {
          q: 'Choose one prefix from Part C. Write two words that begin with it, and use one of them in a sentence.',
          lines: 2,
          a: `Answers vary. Words from the Word Builder’s list: ${sampleWords.join('; ')}. The sentence should use the word with the meaning the prefix gives it.`,
        },
      ],
    },
  ],
};
