// The Fables Read-Along classroom activity. The fable, the words, the questions and every answer come from
// the bank in fables.mjs, and the student worksheet and the answer key are both rendered from this object,
// so the key cannot drift from the worksheet (tests/fables.test.mjs).
import { FABLES, QUIZ_LENGTH_WORD, STORY_QUESTIONS, fableBySlug, storyText, answerLetters } from '../fables.mjs';
import { site } from '../site.mjs';

// Common Core ELA standards referenced below, paraphrased.
export const standards = {
  'RL.2.2': 'Retell stories, including fables and folktales, and find their central message, lesson or moral (grade 2).',
  'RL.3.2': 'Retell stories, including fables; find the central message, lesson or moral and explain how key details show it (grade 3).',
  'W.3.3': 'Write narratives about real or imagined events, in a clear order and with descriptive details (grade 3).',
};

/** The fable printed on the worksheet. */
export const WORKSHEET_FABLE = 'lion-and-mouse';
const fable = fableBySlug(WORKSHEET_FABLE);
const storyQuestions = fable.questions.filter(question => question.kind === 'story');
const moralQuestion = fable.questions.find(question => question.kind === 'moral');
const host = new URL(site.url).hostname;
// A question that asks "why" needs a longer answer than one that asks what happened: it gets two lines on
// the worksheet, and the key adds the bank's explanation to the answer.
const asksWhy = question => /^Why/.test(question.q);

export const activity = {
  tool: 'fables',
  toolName: 'Fables Read-Along',
  fable: WORKSHEET_FABLE,
  title: `${fable.title} Worksheet`,
  pageTitle: `Fable Worksheet: ${fable.title}, Free Printable`,
  pageDescription: `Free printable fable worksheet for grades 2–5: read ${fable.title}, answer four questions, put the moral in your own words and write a new ending.`,
  grade: 'Grades 2–5',
  minutes: 20,
  standards: ['RL.2.2', 'RL.3.2', 'W.3.3'],
  goal: 'Read a fable closely, answer questions about it, say its moral in your own words and write a new ending.',
  steps: [
    `Listen to ${fable.title} in the Fables Read-Along and follow the highlighted sentence, or read it below.`,
    'Read the fable again by yourself. Use “Words to know” for any word that is new to you.',
    'Do Part A, then Part B. Look back at the fable to check each answer.',
  ],
  lesson: {
    hook: '“Could a mouse ever help a lion? How?” Take two or three ideas, then say: let us find out what this mouse did.',
    debrief: 'Which sentence in the fable shows the moral most clearly? Who wrote a modern version, and who are its characters?',
    tip: 'Play the fable on the board once before students read alone. Every fable page also has a Print button that makes a one-page sheet with five multiple-choice questions; the answer key lists the right letters for all ten.',
  },
  sections: [
    { type: 'passage', heading: `Read: ${fable.title}`, text: storyText(fable) },
    { type: 'text', heading: 'Words to know', lines: [fable.vocabulary.map(item => `${item.word}: ${item.meaning}`).join(' · ')] },
    {
      type: 'questions',
      heading: 'Part A: About the story',
      keyHeading: 'Part A: About the story (answers)',
      items: storyQuestions.map(question => ({ q: question.q, lines: asksWhy(question) ? 2 : 1, a: asksWhy(question) ? `${question.right} ${question.why}` : question.right })),
    },
    {
      type: 'questions',
      heading: 'Part B: The moral, and your turn',
      keyHeading: 'Part B: The moral, and your turn (answers)',
      start: STORY_QUESTIONS + 1,
      items: [
        {
          q: 'What is the moral of this fable? Write it in your own words.',
          lines: 2,
          a: `The fable ends with its moral: “${fable.moral}” In other words: ${moralQuestion.right} Accept any answer that carries the same idea.`,
        },
        {
          q: 'Write a new ending for the fable, or a modern version of it, in three sentences.',
          lines: 4,
          a: 'Answers vary. Look for three complete sentences that fit together. A new ending should follow from the fable so far. A modern version has new characters and a new place, and it teaches the same moral.',
        },
      ],
    },
    {
      type: 'fables-letters',
      heading: 'Finished early?',
      keyHeading: 'Answers for the printed fable pages',
      lines: [`Read another fable at ${host}/tools/fables/ and answer its ${QUIZ_LENGTH_WORD} questions.`],
      keyNote: `The Print button on each fable page makes a one-page sheet with ${QUIZ_LENGTH_WORD} multiple-choice questions. The right answers, in order:`,
      items: FABLES.map(item => ({ title: item.title, letters: answerLetters(item) })),
    },
  ],
};
