// How the Context Clues Game shows a sentence: as HTML strings, used by the page on the server (examples,
// worked examples) and by the game in the browser.
// The target word is bold on a yellow marker stroke, the clue has a solid underline and the signal word a
// dotted one, so nothing depends on color alone.
import { pieces, clueType, findPhrase } from './context-clues.mjs';

const svg = body => `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
export const ICON = {
  right: svg('<circle cx="10" cy="10" r="7.5"/><path d="M6.5 10.3l2.4 2.4 4.6-5"/>'),
  wrong: svg('<circle cx="10" cy="10" r="7.5"/><path d="M7 7l6 6M13 7l-6 6"/>'),
};

export const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const TAGS = { word: ['<strong class="cc-word">', '</strong>'], clue: ['<mark class="cc-clue">', '</mark>'], signal: ['<mark class="cc-signal">', '</mark>'] };
const render = list => list.map(piece => (piece.kind ? `${TAGS[piece.kind][0]}${escapeHtml(piece.text)}${TAGS[piece.kind][1]}` : escapeHtml(piece.text))).join('');

/** The sentence as it is asked: only the target word is marked. */
export const sentenceHtml = item => render(pieces(item, false));
/** The sentence with its answer showing: the target word, the clue and the signal word are marked. */
export const revealHtml = item => render(pieces(item, true));

/** The extra sentence, with the target word marked. */
export function againHtml(item) {
  const at = findPhrase(item.again, item.word);
  if (!at) return escapeHtml(item.again);
  return `${escapeHtml(item.again.slice(0, at[0]))}<strong class="cc-word">${escapeHtml(item.again.slice(at[0], at[1]))}</strong>${escapeHtml(item.again.slice(at[1]))}`;
}

/** A small label with the name of a clue type. */
export const typeTagHtml = type => `<span class="cc-type">${escapeHtml(clueType(type).name)}</span>`;
