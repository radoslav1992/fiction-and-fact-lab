// The Reading Speed Test's classroom activity: a fluency record sheet for three timed readings of one
// passage. The passage, the word counts in its margin and every number in the key come from
// reading-speed.mjs, and the student sheet and the answer key are both rendered from this object
// (tests/reading-speed.test.mjs).
import { RECORD_PASSAGE, countedLines, wordCount, wordsPerMinute } from '../reading-speed.mjs';

// Common Core ELA standard referenced below, paraphrased.
export const standards = {
  'RF.4.4': 'Read with enough accuracy and fluency to support comprehension, including reading grade-level text aloud with accuracy, a suitable rate and expression on repeated readings (grade 4; grades 3 and 5 have the same standard).',
};

export const lines = countedLines(RECORD_PASSAGE);
export const words = wordCount(RECORD_PASSAGE);
/** The key's example: a reader who reads the whole passage three times, a little quicker each time. */
export const EXAMPLE_SECONDS = [93, 78, 66];
export const COLUMNS = ['Words read', 'Seconds', 'Words per minute'];
const example = EXAMPLE_SECONDS.map(seconds => ({ seconds, wpm: wordsPerMinute(words, seconds * 1000) }));
const row = ({ seconds, wpm }) => ({ 'Words read': String(words), 'Seconds': String(seconds), 'Words per minute': String(wpm) });
// A reader who stops partway: the margin gives the words read.
const stopLine = lines[5];
const [first, , third] = example;

export const activity = {
  tool: 'reading-speed',
  toolName: 'Reading Speed Test',
  title: 'Fluency Record Sheet',
  pageTitle: 'Fluency Record Sheet: Free Printable for Timed Reading',
  pageDescription: 'Free printable fluency record sheet for grades 3–6: a passage with word counts in the margin, a table for three timed readings and reflection questions.',
  grade: 'Grades 3–6',
  minutes: 20,
  standards: ['RF.4.4'],
  goal: 'Read the same passage aloud three times, work out your words per minute each time, and notice how your reading changes.',
  steps: [
    'Take the Reading Speed Test once at your level, to see how a timed reading works.',
    'Work with a partner. Read the passage below aloud while your partner times you with a clock or a stopwatch.',
    `Write down the words you read and the seconds you took. The whole passage is ${words} words. If you stop early, use the numbers in the margin.`,
    'Work out your words per minute. Do it twice more, then answer the questions.',
  ],
  lesson: {
    hook: '“Listen to this sentence read one word at a time, in a flat voice. Now listen to it read the way you would say it to a friend. Which was easier to understand, and why?”',
    debrief: 'What changed between your first reading and your third? Was your fastest reading also the one that sounded best?',
    tip: 'Pair students who read at a similar level, and have the partner follow the text with a finger while timing. Say clearly that the aim is smooth, accurate reading that sounds like talking, not a race. Each student compares only with their own earlier readings.',
  },
  sections: [
    {
      type: 'reading-speed',
      heading: `The passage: ${RECORD_PASSAGE.title}`,
      intro: 'The number at the end of each line is how many words you have read when you reach the end of that line.',
      lines,
    },
    {
      type: 'table',
      heading: 'Record three timed readings',
      intro: 'Words per minute = words read ÷ seconds × 60',
      rowHeader: 'Reading',
      columns: COLUMNS,
      keyNote: `An example, for a reader who reads all ${words} words each time. Students’ own numbers will differ. First reading: ${words} ÷ ${first.seconds} × 60 = ${first.wpm} words per minute, to the nearest whole number. A reader who stops after 60 seconds at the end of line ${lines.indexOf(stopLine) + 1} has read ${stopLine.count} words, which is ${wordsPerMinute(stopLine.count, 60000)} words per minute.`,
      rows: example.map((reading, i) => ({ label: `Reading ${i + 1}`, values: row(reading) })),
    },
    {
      type: 'questions',
      heading: 'Think about it',
      keyHeading: 'Answers',
      items: [
        {
          q: 'Compare your first reading with your third. What changed: your speed, how smooth it sounded, or both? Why?',
          lines: 2,
          a: `Answers vary. Most readers are faster and smoother on the third reading, because they know the words by then and can read them in groups. In the example the speed goes from ${first.wpm} to ${third.wpm} words per minute.`,
          checks: [[String(first.wpm), first.wpm], [String(third.wpm), third.wpm]],
        },
        {
          q: 'Was your fastest reading also your best reading? What makes a reading good to listen to?',
          lines: 2,
          a: 'Answers vary. A good reading is accurate and smooth, and it sounds like talking, with a pause at each comma and period. The fastest reading is not always the best: a reader who rushes may skip words or lose the meaning.',
          checks: [],
        },
      ],
    },
  ],
};
