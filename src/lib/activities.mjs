// Classroom activities: one printable student worksheet per tool, plus a teacher answer key.
// Each activity lives in ./activities/<tool>.mjs and is built from that tool's model, so a printed
// number or answer cannot drift from what the tool shows (tests/activities.test.mjs).
// To add one: import its module here and add it to MODULES. The order shown is the order of the tools in labs.mjs.
import { tools } from './labs.mjs';
import * as readingLevel from './activities/reading-level.mjs';
import * as factOrOpinion from './activities/fact-or-opinion.mjs';
import * as contextClues from './activities/context-clues.mjs';
import * as causeAndEffect from './activities/cause-and-effect.mjs';
import * as plotDiagram from './activities/plot-diagram.mjs';
import * as partsOfSpeech from './activities/parts-of-speech.mjs';
import * as wordBuilder from './activities/word-builder.mjs';
import * as readingSpeed from './activities/reading-speed.mjs';
import * as mainIdea from './activities/main-idea.mjs';

const MODULES = [
  readingLevel,
  factOrOpinion,
  contextClues,
  causeAndEffect,
  plotDiagram,
  partsOfSpeech,
  wordBuilder,
  readingSpeed,
  mainIdea,
];

// Common Core ELA standards referenced by the activities, paraphrased.
export const standards = Object.assign({}, ...MODULES.map(module => module.standards));

const order = slug => { const at = tools.findIndex(tool => tool.slug === slug); return at < 0 ? tools.length : at; };
export const activities = MODULES.map(module => module.activity).sort((a, b) => order(a.tool) - order(b.tool));
