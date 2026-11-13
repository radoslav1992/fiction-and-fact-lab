// The Plot Diagram Builder's classroom activity. The events to place, their order, the stage of each one and
// every reason come from the story bank in plot-diagram.mjs, and the student worksheet and the answer key
// are both rendered from this object, so the key cannot drift from the worksheet (tests/plot-diagram.test.mjs).
import { STAGES, buildRound, climaxOf, eventsFor } from '../plot-diagram.mjs';

// Common Core ELA reading standards referenced below, paraphrased.
export const standards = {
  'RL.3.5': 'Refer to the parts of stories, dramas and poems, and describe how each part builds on earlier sections (grade 3).',
  'RL.5.5': 'Explain how chapters, scenes or stanzas fit together to give a story, drama or poem its overall structure (grade 5).',
  'RL.6.3': 'Describe how a story’s plot unfolds in a series of episodes, and how the characters respond or change as it moves toward a resolution (grade 6).',
};

// Part A uses one tale from the bank, with its cards in the order of this round of the practice mode.
export const WORKSHEET_TALE = 'tortoise-and-the-hare';
export const WORKSHEET_ROUND = 15;
const round = buildRound(WORKSHEET_TALE, WORKSHEET_ROUND);
const { tale, cards } = round;
const climax = climaxOf(tale);
const letterOf = card => 'ABCDEFGH'[cards.indexOf(card)];
const stageKey = STAGES.map(stage => `${stage.number} ${stage.name}`).join(' · ');
// The stages that hold two events, for the hint ("one stage has two events").
const doubles = STAGES.filter(stage => eventsFor(tale, stage.id).length === 2);
const COUNT = ['No stage has', 'One stage has', 'Two stages have', 'Three stages have'];
const falling = eventsFor(tale, 'falling')[0], resolution = eventsFor(tale, 'resolution')[0];

export const activity = {
  tool: 'plot-diagram',
  toolName: 'Plot Diagram Builder',
  title: 'Story Mountain Worksheet',
  pageTitle: 'Story Mountain Worksheet: Blank Plot Diagram to Print',
  pageDescription: 'Free printable plot diagram worksheet for grades 3–6: place the events of a fable on a story mountain, then fill in a blank mountain for your own story.',
  grade: 'Grades 3–6',
  minutes: 20,
  standards: ['RL.3.5', 'RL.5.5', 'RL.6.3'],
  goal: 'Name the five stages of a plot diagram, place the events of a story on them, and map a story you have read on a story mountain.',
  steps: [
    'Open the Plot Diagram Builder, choose “Sort the events” and sort one story. Read the reason under each card.',
    `Do Part A. The story is ${tale.title}.`,
    'Do Part B for a story your class has read, with one or two key events in each box. Then do Part C.',
  ],
  lesson: {
    hook: '“Think of a story everyone here knows. What is the most important moment in it, the one the whole story builds up to? How do you know it is that moment and not another?”',
    debrief: 'Which stage was hardest to fill in for your own story? Did you and your partner choose the same climax, and if not, which one decides the main problem?',
    tip: 'Sort one story together on the board first. Use the round link under the board to give everyone the same cards. For Part B, a story the whole class has read makes the diagrams easy to compare.',
  },
  sections: [
    {
      type: 'plot-diagram',
      task: 'events',
      heading: `Part A: Place the events of ${tale.title}`,
      intro: `Write the number of the stage where each event belongs: ${stageKey}. ${COUNT[doubles.length]} two events.`,
      tale,
      cards,
    },
    {
      type: 'plot-diagram',
      task: 'mountain',
      heading: 'Part B: Your story mountain',
      keyHeading: 'Part B: Your story mountain (answers vary)',
      tale,
      blank: { lines: 3, gap: 24, hill: 84 },
      lookFor: [
        'Each box holds an event, something that happens, and the events are in story order.',
        'The climax decides the main problem and comes near the end. The resolution shows how things are at the very end.',
      ],
      modelNote: `For comparison, the finished story mountain of ${tale.title}, from Part A:`,
    },
    {
      type: 'questions',
      heading: 'Part C: Think about it',
      items: [
        {
          q: `Which event of ${tale.title} is the climax? Write its letter and explain how you know.`,
          lines: 2,
          a: `Event ${letterOf(climax)}: “${climax.text}” ${climax.why} Before this moment we cannot tell how the story will end. After it, we can.`,
        },
        {
          q: 'What is the difference between falling action and resolution? Use a story from this page to explain.',
          lines: 2,
          a: `The falling action is what happens right after the climax, because of it. The resolution is the ending, when the problem is over. In ${tale.title}, event ${letterOf(falling)} is the falling action and event ${letterOf(resolution)} is the resolution.`,
        },
      ],
    },
  ],
};
