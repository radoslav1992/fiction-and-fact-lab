// The Fact or Opinion Game's classroom activity. Every statement and answer comes from the bank in
// fact-opinion.mjs, and the student worksheet and the answer key are both rendered from this object,
// so the key cannot drift from the worksheet (tests/fact-opinion.test.mjs).
import { DEFINITIONS, statementById } from '../fact-opinion.mjs';

// Common Core ELA standards referenced below, paraphrased.
export const standards = {
  'RH.6-8.8': 'Distinguish among fact, opinion and reasoned judgment in a text (grades 6–8).',
  'W.4.1': 'Write opinion pieces on topics or texts, supporting a point of view with reasons and information (grade 4; similar standards in grades 3 and 5).',
};

// Part A: five facts and five opinions from levels 1 and 2. Part B: four mixed sentences from level 3.
export const SORT_IDS = ['a03', 'a19', 'a26', 'a14', 'b08', 'b18', 'b15', 'b26', 'b33', 'b07'];
export const MIXED_IDS = ['c05', 'c10', 'c13', 'c23'];
const sortItems = SORT_IDS.map(statementById);
const mixedItems = MIXED_IDS.map(statementById);
// The statement in Part A that has a number in it but is still an opinion.
const numbered = statementById('b18');
const numberedAt = SORT_IDS.indexOf(numbered.id) + 1;

export const activity = {
  tool: 'fact-or-opinion',
  toolName: 'Fact or Opinion Game',
  title: 'Fact or Opinion Worksheet',
  pageTitle: 'Fact or Opinion Worksheet: Free Printable, Grades 3–6',
  pageDescription: 'Free printable fact or opinion worksheet for grades 3–6: sort ten statements, find the opinion inside four sentences and write your own. With answer key.',
  grade: 'Grades 3–6',
  minutes: 15,
  standards: ['RH.6-8.8', 'W.4.1'],
  goal: 'Tell facts from opinions, spot the clue words that signal an opinion, and find an opinion inside a sentence that also states a fact.',
  steps: [
    'Play one round of the Fact or Opinion Game at your level. Read the explanation after each answer.',
    'Do Part A. For each statement ask: can I check it? Could someone disagree?',
    'Do Part B. Each sentence mixes a fact with an opinion.',
    'Do Part C. Then play another round and try to beat your score.',
  ],
  lesson: {
    hook: '“Chocolate is made from cocoa beans. Chocolate is the best food in the world.” Which of these could we check, and how would we check it?',
    debrief: 'Which statements were hardest to sort, and what made them hard? Which clue words did you find?',
    tip: 'Play a few Level 1 statements together on the board first. To compare scores fairly, share the round link from the results screen so everyone gets the same ten statements.',
  },
  sections: [
    { type: 'text', heading: 'Remember', lines: [`${DEFINITIONS.fact} ${DEFINITIONS.opinion}`, 'Clue words for opinions: best, worst, better, should, too, beautiful, boring, I think.'] },
    { type: 'sort', heading: 'Part A: Fact or opinion?', intro: 'Write F for fact or O for opinion on the line before each statement.', items: sortItems },
    { type: 'mixed', heading: 'Part B: Find the opinion inside', intro: 'Each sentence has a fact and an opinion in it. Underline the part that is an opinion and circle the clue word.', items: mixedItems },
    {
      type: 'questions',
      heading: 'Part C: Your turn',
      items: [
        {
          q: 'Write one fact and one opinion about your school.',
          lines: 2,
          a: 'Answers vary. The fact must be something that can be checked, such as the number of students in the class. The opinion should be something people could disagree about, and will often use a clue word such as best, should or too.',
        },
        {
          q: `A classmate says, “If a sentence has a number in it, it must be a fact.” Use statement ${numberedAt} in Part A to show why that is wrong.`,
          lines: 2,
          a: `“${numbered.text.replace(/\.$/, "")}” has a number in it, but it is an opinion. ${numbered.why}`,
        },
      ],
    },
  ],
};
