// The Context Clues Game's classroom activity. Every sentence, meaning and clue type comes from the bank in
// context-clues.mjs, and the student worksheet and the answer key are both rendered from this object, so
// the key cannot drift from the worksheet (tests/context-clues.test.mjs).
import { DEFINITION, CLUE_TYPES, itemById, meaningSentence } from '../context-clues.mjs';

// Common Core ELA standards referenced below, paraphrased.
export const standards = {
  'L.4.4a': 'Use context, such as definitions, examples or restatements in the text, as a clue to the meaning of a word or phrase (grade 4; similar standards in grades 2, 3 and 5).',
  'L.6.4a': 'Use context, such as the overall meaning of a sentence or paragraph, as a clue to the meaning of a word or phrase (grades 6–8).',
};

// Part A: eight sentences, two for each of four clue types and one inference. Part B asks for the clue type
// of the last four. Part C: two words to write a sentence for.
export const MEANING_IDS = ['a05', 'a25', 'b20', 'b26', 'b03', 'c08', 'c15', 'c34'];
export const TYPES_FROM = 5;
export const WRITE_IDS = ['a01', 'b10'];
const meaningItems = MEANING_IDS.map(itemById);
const typeItems = meaningItems.slice(TYPES_FROM - 1);
const typeNames = CLUE_TYPES.map(type => type.name.toLowerCase().replace(' or contrast', ''));

const writeQuestion = item => ({
  q: `Write your own sentence with the word “${item.word}” in it. Put a clue in the sentence, so that a reader who does not know the word can work it out.`,
  lines: 2,
  a: `Answers vary. ${meaningSentence(item)} The sentence must hold a clue to that meaning: a definition, a synonym, an antonym or examples. One from the game: “${item.text}”`,
});

export const activity = {
  tool: 'context-clues',
  toolName: 'Context Clues Game',
  title: 'Context Clues Worksheet',
  pageTitle: 'Context Clues Worksheet: Free Printable, Grades 3–6',
  pageDescription: 'Free printable context clues worksheet for grades 3–6: find the clue in eight sentences, write each meaning and name the type of clue. With answer key.',
  grade: 'Grades 3–6',
  minutes: 20,
  standards: ['L.4.4a', 'L.6.4a'],
  goal: 'Work out what an unknown word means from the words around it, and name the type of clue the sentence gives.',
  steps: [
    'Play one round of the Context Clues Game at your level. Read the clue note after each answer.',
    'Do Part A. Read the whole sentence before you decide.',
    'Do Part B and Part C.',
    'Check two of your meanings in a dictionary. Then play another round and try to beat your score.',
  ],
  lesson: {
    hook: '“The glorp was so heavy that it took four of us to lift it onto the truck.” Glorp is not a real word. What can you tell about a glorp anyway, and which words told you?',
    debrief: 'Which type of clue was easiest to spot, and which was hardest? When would you still want a dictionary?',
    tip: 'Do the first sentence of Part A together and think aloud: read on, find the clue, try your meaning in place of the word. To compare scores fairly, share the round link from the results screen.',
  },
  sections: [
    { type: 'text', heading: 'Remember', lines: [`${DEFINITION} Types of clue: ${typeNames.join(', ')}.`] },
    {
      type: 'context-clues',
      part: 'meanings',
      heading: 'Part A: What does the word mean?',
      intro: 'Read each sentence. Underline the words that are the clue. Then write what the word in bold means.',
      keyNote: 'The clue is underlined, with a dotted line under any signal word. Accept any meaning close to the one given.',
      items: meaningItems,
    },
    {
      type: 'context-clues',
      part: 'types',
      heading: 'Part B: Name the type of clue',
      intro: `Look again at sentences ${TYPES_FROM} to ${MEANING_IDS.length}. Which type of clue did each one give you?`,
      start: TYPES_FROM,
      items: typeItems,
    },
    { type: 'questions', heading: 'Part C: Your turn', items: WRITE_IDS.map(itemById).map(writeQuestion) },
  ],
};
