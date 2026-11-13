// The Fiction or Nonfiction Game's classroom activity. Every item and answer comes from the bank in
// fiction-or-nonfiction.mjs, and the student worksheet and the answer key are both rendered from this
// object, so the key cannot drift from the worksheet (tests/fiction-or-nonfiction.test.mjs).
import { DEFINITIONS, CLUES, KIND_NAME, itemById, clueNames, explain } from '../fiction-or-nonfiction.mjs';

// Common Core ELA standards referenced below, paraphrased.
export const standards = {
  'RL.1.5': 'Explain major differences between books that tell stories and books that give information (grade 1; the skill is built on in later grades).',
  'RI.2.5': 'Know and use text features such as captions, bold print, subheadings, glossaries and indexes to find key facts or information in a text (grade 2).',
};

// Part A: five fiction and five nonfiction items from levels 1 and 2, short enough to fit on one page.
export const SORT_IDS = ['a14', 'a21', 'b31', 'b10', 'b04', 'b30', 'b13', 'a29', 'b35', 'b17'];
const sortItems = SORT_IDS.map(itemById);
// Part B: the two frog sentences, and the item in Part A that reads like a story but is nonfiction.
export const FROG_IDS = ['a16', 'a17'];
const [frogKing, tadpole] = FROG_IDS.map(itemById);
const trueStory = sortItems.find(item => item.tricky === 'true-story');
const trueStoryAt = sortItems.indexOf(trueStory) + 1;

const cluesOf = kind => Object.values(CLUES).filter(clue => clue.kind === kind).map(clue => clue.name).join(', ');
/** What the key prints for an item: the answer in a word, the clues by name (level 2) and the reason. */
const keyNote = item => explain(item).replace(`This is ${item.kind}.`, `${KIND_NAME[item.kind]}.`);

export const activity = {
  tool: 'fiction-or-nonfiction',
  toolName: 'Fiction or Nonfiction Game',
  title: 'Fiction or Nonfiction Worksheet',
  pageTitle: 'Fiction or Nonfiction Worksheet: Free Printable',
  pageDescription: 'Free printable fiction or nonfiction worksheet for grades 2–5: sort ten items, name the clue that gave each one away and write your own. With answer key.',
  grade: 'Grades 2–5',
  minutes: 15,
  standards: ['RL.1.5', 'RI.2.5'],
  goal: 'Tell fiction from nonfiction, name the clue that gives each one away, and write a sentence of each kind.',
  steps: [
    'Play one round of the Fiction or Nonfiction Game at your level. Read the explanation after each answer.',
    'Do Part A. For each item ask: did the author make it up, or is it about the real world? Then write the clue that gave it away. The lists of clues will help you.',
    'Do Part B. Then play another round and try to beat your score.',
  ],
  lesson: {
    hook: `Read out two sentences from the game: “${frogKing.text}” and “${tadpole.text}” Which one did someone make up? How can you tell?`,
    debrief: `Which items were hardest to sort? Item ${trueStoryAt} reads like a story. What makes it nonfiction?`,
    tip: 'Bring one fiction book and one nonfiction book from the class library and hunt for the clues in each: a table of contents, headings, a glossary and an index, or characters and dialogue. To compare scores fairly, share the round link from the results screen.',
  },
  sections: [
    { type: 'text', heading: 'Remember', lines: [`${DEFINITIONS.fiction} ${DEFINITIONS.nonfiction}`, `Clues for fiction: ${cluesOf('fiction')}.`, `Clues for nonfiction: ${cluesOf('nonfiction')}.`] },
    {
      type: 'fiction-or-nonfiction',
      heading: 'Part A: Fiction or nonfiction?',
      intro: 'Write F for fiction or N for nonfiction on the line before each item. Then write the clue that gave it away.',
      items: sortItems.map(item => ({ id: item.id, text: item.text, letter: KIND_NAME[item.kind][0], key: keyNote(item) })),
    },
    {
      type: 'questions',
      heading: 'Part B: Your turn',
      items: [
        {
          q: 'Write one sentence of fiction and one sentence of nonfiction about a frog.',
          lines: 2,
          a: `Answers vary. The fiction sentence should be made up, like this one from the game: “${frogKing.text}” The nonfiction sentence should give true information, like this one: “${tadpole.text}”`,
        },
        {
          q: `Item ${trueStoryAt} in Part A tells what happens in order, like a story, but it is nonfiction. How can you tell?`,
          lines: 2,
          a: `${trueStory.why} Clues: ${clueNames(trueStory)}.`,
        },
      ],
    },
  ],
};
