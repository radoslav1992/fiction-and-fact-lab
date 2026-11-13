// The Cause and Effect Game's classroom activity. Every sentence, cause, effect and chain comes from the
// bank in cause-and-effect.mjs, and the student worksheet and the answer key are both rendered from this
// object, so the key cannot drift from the worksheet (tests/cause-and-effect.test.mjs).
import { DEFINITIONS, SIGNALS, itemById, stem } from '../cause-and-effect.mjs';

// Common Core ELA standards referenced below, paraphrased.
export const standards = {
  'RI.3.3': 'Describe how a series of events, ideas or steps in a text are related, using language about time, sequence and cause and effect (grade 3).',
  'RI.4.5': 'Describe the overall structure of a text or part of a text, such as chronology, comparison, cause and effect, or problem and solution (grade 4).',
};

// Part A: eight sentences to mark, four from level 1 and four from level 2.
export const MARK_IDS = ['a04', 'a19', 'a11', 'a26', 'b11', 'b09', 'b22', 'b18'];
// Part B: five causes to match. Each cause fits only its own effect. MATCH_ORDER is the order the effects
// are printed in: the effect lettered k belongs to MATCH_IDS[MATCH_ORDER[k]].
export const MATCH_IDS = ['b05', 'b06', 'b13', 'b24', 'b27'];
export const MATCH_ORDER = [2, 4, 0, 1, 3];
// Part C: four sentences with the cause or the effect left out.
export const FINISH = [['a02', 'cause'], ['a17', 'effect'], ['a16', 'cause'], ['b10', 'effect']];
// Part D: the chain shown in the answer key.
export const CHAIN_ID = 'c02';

const signalsThatLeadTo = part => SIGNALS.filter(signal => signal.follows === part && signal.id !== 'led to').map(signal => signal.label).join(', ');
const finishQuestion = ([id, missing]) => {
  const item = itemById(id);
  return {
    q: `Finish the sentence with ${missing === 'cause' ? 'a cause' : 'an effect'} that makes sense: “${stem(item, missing)}”`,
    lines: 1,
    a: `Answers vary. Any ${missing} that makes sense is right. In the game the sentence ends: “${item[missing]}”.`,
  };
};

export const activity = {
  tool: 'cause-and-effect',
  toolName: 'Cause and Effect Game',
  title: 'Cause and Effect Worksheet',
  pageTitle: 'Cause and Effect Worksheet: Free Printable, Grades 3–6',
  pageDescription: 'Free printable cause and effect worksheet for grades 3–6: mark the cause and effect in eight sentences, match five pairs and draw a chain. With answer key.',
  grade: 'Grades 3–6',
  minutes: 20,
  standards: ['RI.3.3', 'RI.4.5'],
  goal: 'Find the cause and the effect in a sentence, use signal words to tell them apart, and link three events in a chain.',
  steps: [
    'Play one round of the Cause and Effect Game at your level. Read the explanation after each answer.',
    'Do Part A. For each sentence ask: what happened? Why did it happen?',
    'Do Part B and Part C.',
    'Do Part D. Then play another round and try to beat your score.',
  ],
  lesson: {
    hook: 'Drop a pencil on the floor. What happened? Why did it happen? Which of those two answers is the cause, and which is the effect?',
    debrief: 'Which signal words come just before a cause, and which come just before an effect? Can something happen after another thing without being caused by it?',
    tip: 'Do the first sentence of Part A together, then say it the other way around with “so” in place of “because”. To compare scores fairly, share the round link from the results screen.',
  },
  sections: [
    { type: 'text', heading: 'Remember', lines: [`${DEFINITIONS.cause} ${DEFINITIONS.effect} The cause comes right after: ${signalsThatLeadTo('cause')}. The effect comes right after: ${signalsThatLeadTo('effect')}.`] },
    {
      type: 'cause-and-effect',
      part: 'mark',
      heading: 'Part A: Find the cause and the effect',
      intro: 'In each sentence, underline the cause and draw a ring around the effect.',
      keyNote: 'The cause is underlined, the effect is in a ring and the signal word is in bold.',
      items: MARK_IDS.map(itemById),
    },
    {
      type: 'cause-and-effect',
      part: 'match',
      heading: 'Part B: Match each cause to its effect',
      intro: 'Write the letter of the effect on the line beside its cause.',
      items: MATCH_IDS.map(itemById),
      order: MATCH_ORDER,
    },
    { type: 'questions', heading: 'Part C: Finish the sentence', items: FINISH.map(finishQuestion) },
    {
      type: 'cause-and-effect',
      part: 'chain',
      heading: 'Part D: Draw a chain',
      intro: 'Think of three events. The first causes the second, and the second causes the third. Write one in each box.',
      keyNote: 'Answers vary. Each event must be the cause of the next one. An example from the game:',
      item: itemById(CHAIN_ID),
    },
  ],
};
