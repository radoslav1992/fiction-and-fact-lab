// How the Fiction or Nonfiction Game shows an item once its answer is known: as HTML strings, used by the
// page on the server (examples, the genre guide) and by the game in the browser.
// Fiction and nonfiction each have a color, an icon and a word, so nothing depends on color alone.
import { KIND_NAME, kindOf, pieces } from './fiction-or-nonfiction.mjs';

const svg = body => `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
export const ICON = {
  // A star for a story that was imagined; a magnifying glass for writing you can check.
  fiction: svg('<path d="M10 2.6l2.1 4.9 5.3.5-4 3.5 1.2 5.2-4.6-2.8-4.6 2.8 1.2-5.2-4-3.5 5.3-.5z"/>'),
  nonfiction: svg('<circle cx="8.6" cy="8.6" r="5.4"/><path d="M12.7 12.7l4.6 4.6"/>'),
  right: svg('<circle cx="10" cy="10" r="7.5"/><path d="M6.5 10.3l2.4 2.4 4.6-5"/>'),
  wrong: svg('<circle cx="10" cy="10" r="7.5"/><path d="M7 7l6 6M13 7l-6 6"/>'),
};

export const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** A small label: icon plus the word "Fiction" or "Nonfiction". */
export const tagHtml = kind => `<span class="fn-tag ${kind}">${ICON[kind]}${KIND_NAME[kind]}</span>`;

/** The item's text with its giveaway words marked, tinted for fiction or nonfiction (a poem is left plain). */
export function revealHtml(item) {
  const kind = kindOf(item);
  const html = pieces(item).map(piece => (piece.mark ? `<mark class="fn-mark">${escapeHtml(piece.text)}</mark>` : escapeHtml(piece.text))).join('');
  return `<span class="fn-seg ${kind}">${html}</span>`;
}
