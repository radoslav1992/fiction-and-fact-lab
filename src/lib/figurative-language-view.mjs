// How the Figurative Language Game shows a sentence once its answer is known: as HTML strings, used by the
// page on the server (the examples) and by the game in the browser.
import { pieces } from './figurative-language.mjs';

const svg = body => `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
export const ICON = {
  right: svg('<circle cx="10" cy="10" r="7.5"/><path d="M6.5 10.3l2.4 2.4 4.6-5"/>'),
  wrong: svg('<circle cx="10" cy="10" r="7.5"/><path d="M7 7l6 6M13 7l-6 6"/>'),
};

export const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** The sentence with its signal words marked. */
export function revealHtml(item) {
  return pieces(item).map(piece => (piece.mark ? `<mark class="fl-mark">${escapeHtml(piece.text)}</mark>` : escapeHtml(piece.text))).join('');
}
