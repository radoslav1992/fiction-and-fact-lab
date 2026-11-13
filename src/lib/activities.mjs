// Classroom activities: one printable student worksheet per tool, plus a teacher answer key.
// Each activity lives in ./activities/<tool>.mjs and is built from that tool's model, so a printed
// number or answer cannot drift from what the tool shows (tests/activities.test.mjs).
import { activity as readingLevel, standards as readingStandards } from './activities/reading-level.mjs';
import { activity as factOrOpinion, standards as factStandards } from './activities/fact-or-opinion.mjs';
import { activity as fictionOrNonfiction, standards as fictionStandards } from './activities/fiction-or-nonfiction.mjs';

// Common Core ELA standards referenced by the activities, paraphrased.
export const standards = { ...readingStandards, ...factStandards, ...fictionStandards };

export const activities = [readingLevel, factOrOpinion, fictionOrNonfiction];
