// The Figurative Language Game's classroom activity. Every sentence and answer comes from the bank in
// figurative-language.mjs, and the student worksheet and the answer key are both rendered from this
// object, so the key cannot drift from the worksheet (tests/figurative-language.test.mjs).
import { itemById, deviceById, pieces } from '../figurative-language.mjs';

// Common Core ELA standards referenced below, paraphrased.
export const standards = {
  'L.4.5': 'Show understanding of figurative language: explain the meaning of simple similes and metaphors in context, and recognize and explain common idioms (grade 4).',
  'L.5.5': 'Show understanding of figurative language: interpret similes and metaphors in context, and recognize and explain common idioms (grade 5).',
  'L.6.5': 'Show understanding of figurative language: interpret figures of speech such as personification in context (grade 6).',
};

// Part A: ten sentences to label, two each of four kinds and one each of the two sound devices.
export const LABEL_IDS = ['b18', 'a08', 'b25', 'a12', 'c22', 'b21', 'b03', 'c16', 'b09', 'b27'];
const labelItems = LABEL_IDS.map(itemById);
const labelDevices = ['simile', 'metaphor', 'personification', 'hyperbole', 'alliteration', 'onomatopoeia'].map(deviceById);
// Part B: a literal sentence, with a simile and a metaphor about the same lake as model answers.
export const REWRITE_IDS = { literal: 'a26', simile: 'a02', metaphor: 'a21' };
const rewrite = Object.fromEntries(Object.entries(REWRITE_IDS).map(([device, id]) => [device, itemById(id)]));
// Part C: two idioms to explain.
export const IDIOM_IDS = ['c01', 'c07'];
const idiomItems = IDIOM_IDS.map(itemById);

export const activity = {
  tool: 'figurative-language',
  toolName: 'Figurative Language Game',
  title: 'Figurative Language Worksheet',
  pageTitle: 'Figurative Language Worksheet: Free Printable',
  pageDescription: 'Free printable figurative language worksheet for grades 4–6: label ten sentences, write a simile and a metaphor and explain two idioms. With answer key.',
  grade: 'Grades 4–6',
  minutes: 15,
  standards: ['L.4.5', 'L.5.5', 'L.6.5'],
  goal: 'Name six kinds of figurative language, turn a plain sentence into a simile and a metaphor, and explain what two idioms mean.',
  steps: [
    'Play one round of the Figurative Language Game at your level. Read the explanation after each answer.',
    'Do Part A. Look for the signal in each sentence: “like” or “as”, a thing that acts like a person, a huge exaggeration, a repeated sound or a sound word.',
    'Do Part B. Keep the lake in both of your sentences and change what you compare it to.',
    'Do Part C. Then play another round and try to beat your score.',
  ],
  lesson: {
    hook: `“${itemById('b25').text}” Did they really? What does the speaker want us to understand, and why not just say “a long time”?`,
    debrief: 'Which sentences in Part A were hardest to label, and which signal settled it? Read out some of the similes and metaphors from Part B.',
    tip: 'Level 1 makes a good warm-up for the whole class: its literal sentences show that “like” and “as” do not always make a simile. To compare scores fairly, share the round link from the results screen.',
  },
  sections: [
    { type: 'text', heading: 'Remember', lines: [0, 2, 4].map(i => labelDevices.slice(i, i + 2).map(device => device.about).join(' ')) },
    {
      type: 'figurative-language',
      heading: 'Part A: Name the figurative language',
      intro: `Write the kind of figurative language on the line under each sentence. Choose from: ${labelDevices.map(device => device.name.toLowerCase()).join(', ')}.`,
      items: labelItems.map(item => ({ id: item.id, text: item.text, pieces: pieces(item), answer: deviceById(item.device).name, key: item.why })),
    },
    {
      type: 'questions',
      heading: 'Part B: Your turn',
      items: [
        {
          q: `This sentence is literal: “${rewrite.literal.text}” Rewrite it as a simile. Then rewrite it as a metaphor.`,
          lines: 2,
          a: `Answers vary. A simile compares the lake to something else with “like” or “as”: “${rewrite.simile.text}” A metaphor says the lake is something else: “${rewrite.metaphor.text}”`,
        },
      ],
    },
    {
      type: 'questions',
      heading: 'Part C: Idioms',
      intro: deviceById('idiom').about,
      start: 2,
      items: idiomItems.map(item => ({
        q: `“${item.text}” What does “${item.signal[0]}” mean in this sentence?`,
        lines: 1,
        a: `${item.meanings[0]} ${item.why}`,
      })),
    },
  ],
};
