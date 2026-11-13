// How the Fact or Opinion Game shows a statement once its answer is known: as HTML strings, used by the page
// on the server (examples, worked examples) and by the game in the browser.
// Fact and opinion each have a color, an icon and a word, so nothing depends on color alone.
import { parts, withClues } from './fact-opinion.mjs';

const svg = body => `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
export const ICON = {
  fact: svg('<rect x="2.5" y="2.5" width="15" height="15" rx="3"/><path d="M6 10.5l3 3 5-6.5"/>'),
  opinion: svg('<path d="M3 4h14v9H9l-4 3.5V13H3z"/>'),
  right: svg('<circle cx="10" cy="10" r="7.5"/><path d="M6.5 10.3l2.4 2.4 4.6-5"/>'),
  wrong: svg('<circle cx="10" cy="10" r="7.5"/><path d="M7 7l6 6M13 7l-6 6"/>'),
};
export const KIND_NAME = { fact: 'Fact', opinion: 'Opinion', mixed: 'Fact and opinion' };

export const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** A small label: icon plus the word "Fact" or "Opinion". */
export const tagHtml = kind => `<span class="tag ${kind}">${ICON[kind]}${KIND_NAME[kind]}</span>`;

const cluesHtml = (item, from, to) => withClues(item, from, to).map(piece => (piece.clue ? `<mark class="fo-clue">${escapeHtml(piece.text)}</mark>` : escapeHtml(piece.text))).join('');

/** The statement with its answer showing: clue words marked, and a mixed sentence split into labelled parts. */
export function revealHtml(item) {
  if (item.kind !== 'mixed') return `<span class="fo-seg ${item.kind}">${cluesHtml(item, 0, item.text.length)}</span>`;
  return parts(item).map(part => {
    // Keep commas and spaces outside the highlighted part.
    const lead = part.text.match(/^[\s,]*/)[0].length, tail = part.text.match(/[\s,.]*$/)[0].length;
    const start = part.start + lead, end = part.start + part.text.length - tail;
    return `${escapeHtml(part.text.slice(0, lead))}<span class="fo-seg ${part.kind}">${cluesHtml(item, start, end)}</span><sup class="fo-seg-label ${part.kind}">${KIND_NAME[part.kind]}</sup>${escapeHtml(part.text.slice(part.text.length - tail))}`;
  }).join('');
}
