// The Reading Level Checker's classroom activity. Every number in the table and in the answers comes from
// analyze() in readability.mjs, and each `checks` entry pairs a printed number with the value the model gives
// (tests/activities.test.mjs). The student worksheet and the answer key are both rendered from this object.
import { analyze, gradeLabel, LONG_SENTENCE_WORDS, LONG_WORD_SYLLABLES } from '../readability.mjs';
import { fmt } from '../readability-view.mjs';
import { WORKSHEET_PASSAGE, WORKSHEET_REWRITE } from '../reading-samples.mjs';

// Common Core ELA writing standards referenced below, paraphrased.
export const standards = {
  'W.4.4': 'Produce clear and coherent writing in which the development and organization suit the task, purpose and audience (grade 4; the same standard continues in grades 5–8).',
  'W.4.5': 'With guidance and support from peers and adults, develop and strengthen writing as needed by planning, revising and editing (grade 4; continues in grades 5–8).',
};

export const before = analyze(WORKSHEET_PASSAGE.text);
export const after = analyze(WORKSHEET_REWRITE);

export const COLUMNS = ['Words', 'Sentences', 'Words per sentence', 'Syllables per word', 'Flesch Reading Ease', 'Reading level'];
const row = a => ({
  'Words': String(a.counts.words),
  'Sentences': String(a.counts.sentences),
  'Words per sentence': fmt(a.counts.wordsPerSentence),
  'Syllables per word': fmt(a.counts.syllablesPerWord, 2),
  'Flesch Reading Ease': fmt(a.scores.readingEase),
  'Reading level': gradeLabel(a.grade),
});

const longest = before.sentences.reduce((a, b) => (b.words > a.words ? b : a));
const longestStart = longest.text.split(' ').slice(0, 3).join(' ');
const longSentences = before.sentences.filter(s => s.long);
const gradeOf = a => Math.round(a.grade);
const gradesYounger = gradeOf(before) - gradeOf(after);

export const activity = {
  tool: 'reading-level',
  toolName: 'Reading Level Checker',
  title: 'Rewrite It for a Younger Reader',
  pageTitle: 'Reading Level Worksheet: Rewrite for a Younger Reader',
  pageDescription: 'Free printable reading level worksheet for grades 4–8: students check a passage, record the numbers, rewrite it for a younger reader and check it again.',
  grade: 'Grades 4–8',
  minutes: 20,
  standards: ['W.4.4', 'W.4.5'],
  goal: 'Measure how hard a passage is to read, then rewrite it so a younger reader can understand it without losing any facts.',
  steps: [
    `Open the Reading Level Checker and press the sample button “${WORKSHEET_PASSAGE.label}”. It is the passage printed below.`,
    'Record its numbers in the first row of the table.',
    'Tick both boxes under “Your text, marked”, then answer questions 1 and 2.',
    'Write your rewrite (question 3). Press “Clear the box”, type your rewrite in, and record its numbers in the second row.',
  ],
  lesson: {
    hook: '“Here are two paragraphs that say the same thing. Which would you give to a second grader? How did you decide?”',
    debrief: 'Which change moved the reading level most: shorter sentences or shorter words? Did your rewrite keep every fact?',
    tip: 'Pairs work well: one student types, the other checks that each fact from the passage is still there. The sample rewrite in the key is one answer, not the answer.',
  },
  sections: [
    { type: 'passage', heading: `The passage: ${WORKSHEET_PASSAGE.label}`, text: WORKSHEET_PASSAGE.text },
    {
      type: 'table',
      heading: 'Record the numbers',
      rowHeader: 'Text',
      columns: COLUMNS,
      keyNote: 'The first row is what the checker shows for the passage. The second row is for the sample rewrite in answer 3; students’ own numbers will differ.',
      rows: [{ label: 'The passage', values: row(before) }, { label: 'My rewrite', values: row(after) }],
    },
    {
      type: 'questions',
      heading: 'Questions',
      keyHeading: 'Answers',
      items: [
        {
          q: 'Which sentence in the passage is the longest? How many words does it have?',
          lines: 1,
          a: `The sentence that begins “${longestStart} …” has ${longest.words} words. The checker marks ${longSentences.length === 1 ? 'only this sentence' : `${longSentences.length} sentences`} as long (more than ${LONG_SENTENCE_WORDS} words).`,
          checks: [[String(longest.words), longest.words], [String(LONG_SENTENCE_WORDS), LONG_SENTENCE_WORDS]],
        },
        {
          q: `Find three long words (${LONG_WORD_SYLLABLES} or more syllables) in the passage. Next to each, write a shorter word or phrase that means nearly the same.`,
          lines: 2,
          a: `Possible answers: approaches → comes, disappears → fades, visible → easy to see, eventually → at last, produces → makes. The checker marks ${before.counts.longWords} long words in the passage. “Chlorophyll” is a science word worth keeping and explaining.`,
          checks: [[String(before.counts.longWords), before.counts.longWords]],
        },
        {
          q: 'Rewrite the passage for a younger reader. Keep every fact, but use shorter sentences and shorter words.',
          lines: 7,
          a: `Sample rewrite: “${WORKSHEET_REWRITE}” It has ${after.counts.words} words in ${after.counts.sentences} sentences and checks as ${gradeLabel(after.grade)}.`,
          checks: [[String(after.counts.words), after.counts.words], [String(after.counts.sentences), after.counts.sentences], [String(gradeOf(after)), after.grade]],
        },
        {
          q: 'Compare the two rows of your table. What happened to the words per sentence and to the reading level?',
          lines: 2,
          a: `In the sample rewrite, the words per sentence fell from ${fmt(before.counts.wordsPerSentence)} to ${fmt(after.counts.wordsPerSentence)} and the syllables per word from ${fmt(before.counts.syllablesPerWord, 2)} to ${fmt(after.counts.syllablesPerWord, 2)}, so the reading level dropped ${gradesYounger} grades, from ${gradeLabel(before.grade)} to ${gradeLabel(after.grade)}. Students should see both averages fall in their own table.`,
          checks: [
            [fmt(before.counts.wordsPerSentence), before.counts.wordsPerSentence], [fmt(after.counts.wordsPerSentence), after.counts.wordsPerSentence],
            [fmt(before.counts.syllablesPerWord, 2), before.counts.syllablesPerWord], [fmt(after.counts.syllablesPerWord, 2), after.counts.syllablesPerWord],
            [String(gradesYounger), gradesYounger], [String(gradeOf(before)), before.grade], [String(gradeOf(after)), after.grade],
          ],
        },
        {
          q: 'A classmate says, “My story checks as grade 3, so every third grader will understand it.” Is that right? Explain.',
          lines: 2,
          a: 'Not always. The formulas only count how long the sentences and words are. A text made of short words can still be about a hard idea, and a short word can be a rare one. The grade is a useful first check, not a promise.',
          checks: [],
        },
      ],
    },
  ],
};
