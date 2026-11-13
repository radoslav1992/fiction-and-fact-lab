// The Main Idea and Details Game's classroom activity. Every paragraph, sentence and answer comes from the
// bank in main-idea.mjs, and the student worksheet and the answer key are both rendered from this object,
// so the key cannot drift from the worksheet (tests/main-idea.test.mjs).
import { DEFINITIONS, paragraphById, withIntruder, supportingSentences, whyNot } from '../main-idea.mjs';

// Common Core ELA standards referenced below, paraphrased.
export const standards = {
  'RI.3.2': 'Work out the main idea of a text, retell its key details and explain how they support the main idea (grade 3).',
  'RI.4.2': 'Work out the main idea of a text, explain how key details support it, and summarize the text (grade 4; grade 5 asks for two or more main ideas).',
};

// Part A: the main idea is the first sentence. Part B: it is the last sentence. Each has one sentence that
// does not belong, placed after `after` of the paragraph's own sentences. Part C: a paragraph whose main
// idea is implied, given as a list of details.
export const PARTS = [
  { id: 'a04', extra: 0, after: 3 },
  { id: 'b01', extra: 0, after: 2 },
];
export const DETAILS_ID = 'c11';

const ordinal = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];
const quote = text => `“${text}”`;

function part(spec, number, start) {
  const item = paragraphById(spec.id);
  const sentences = withIntruder(item, spec.extra, spec.after);
  const mainAt = sentences.findIndex(sentence => sentence.role === 'main');
  const extraAt = sentences.findIndex(sentence => sentence.role === 'extra');
  const position = mainAt === 0 ? 'first' : mainAt === sentences.length - 1 ? 'last' : ordinal[mainAt];
  return {
    type: 'main-idea',
    heading: `Part ${'AB'[number - 1]}: Paragraph ${number}`,
    item,
    sentences,
    start,
    items: [
      { q: 'What is the topic of the paragraph? Write it in a word or a short phrase.', lines: 1, a: `The topic is ${item.topic}.` },
      { q: 'Underline the sentence that states the main idea. Then write three details that support it.', lines: 3, a: `The main idea is the ${position} sentence: ${quote(sentences[mainAt].text)} Any three of the other ${supportingSentences(item).length} sentences that are not crossed out are details, such as ${quote(supportingSentences(item)[0])}` },
      { q: 'One sentence does not belong in the paragraph. Cross it out.', lines: 0, a: `Cross out the ${ordinal[extraAt]} sentence: ${quote(sentences[extraAt].text)} It is true, but it does not help to show that ${item.options.main[0].toLowerCase()}${item.options.main.slice(1)}` },
    ],
  };
}

const parts = PARTS.map((spec, i) => part(spec, i + 1, 1 + i * 3));
const details = paragraphById(DETAILS_ID);
const trap = parts[1].item;

export const activity = {
  tool: 'main-idea',
  toolName: 'Main Idea and Details Game',
  title: 'Main Idea and Details Worksheet',
  pageTitle: 'Main Idea Worksheet: Free Printable, Grades 3–6',
  pageDescription: 'Free printable main idea worksheet for grades 3–6: find the topic, the main idea and three details in two paragraphs, then write a main idea sentence.',
  grade: 'Grades 3–6',
  minutes: 20,
  standards: ['RI.3.2', 'RI.4.2'],
  goal: 'Find the topic, the main idea and the supporting details of a paragraph, and spot a sentence that does not belong.',
  steps: [
    'Play one round of the Main Idea and Details Game at your level. Read the explanation after each answer.',
    'Do Parts A and B. Read each paragraph twice before you write.',
    'Do Part C. Then play another round and try to beat your score.',
  ],
  lesson: {
    hook: '“If you had to tell a friend what this paragraph says in one sentence, what would you say? What did you leave out, and why?”',
    debrief: 'Which wrong answer tempted you most: the detail, the one that was too broad or the one that was off topic? How did you rule it out?',
    tip: 'Do one Level 1 paragraph together on the board first, and name each wrong option as it is revealed. To compare scores fairly, share the round link from the results screen so everyone gets the same five paragraphs.',
  },
  sections: [
    { type: 'text', heading: 'Remember', lines: [`${DEFINITIONS.topic} ${DEFINITIONS.mainIdea} ${DEFINITIONS.detail}`] },
    ...parts,
    {
      type: 'questions',
      heading: 'Part C: Your turn',
      start: 1 + parts.length * 3,
      items: [
        {
          q: `These details come from one paragraph: ${details.sentences.map((sentence, i) => `(${i + 1}) ${sentence}`).join(' ')} Write one sentence that states the main idea.`,
          lines: 2,
          a: `Sample answer: ${quote(details.options.main)} Accept any sentence that covers all ${details.sentences.length} details. The topic is ${details.topic}.`,
        },
        {
          q: `Why is ${quote(trap.options.detail)} not the main idea of paragraph 2?`,
          lines: 2,
          a: `${whyNot(trap, 'detail')} The main idea has to cover every sentence: ${quote(trap.options.main)}`,
        },
      ],
    },
  ],
};
