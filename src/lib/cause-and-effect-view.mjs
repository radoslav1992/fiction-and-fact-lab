// How the Cause and Effect Game shows an answer: as HTML strings, used by the page on the server (examples,
// worked examples) and by the game in the browser.
// A cause is underlined and an effect has a ring around it, the same marks the worksheet asks for, and each
// carries its word, so nothing depends on color.
import { pieces, sentenceCase } from './cause-and-effect.mjs';

const svg = body => `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
export const ICON = {
  right: svg('<circle cx="10" cy="10" r="7.5"/><path d="M6.5 10.3l2.4 2.4 4.6-5"/>'),
  wrong: svg('<circle cx="10" cy="10" r="7.5"/><path d="M7 7l6 6M13 7l-6 6"/>'),
};
export const KIND_NAME = { cause: 'Cause', effect: 'Effect' };

export const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** A small label: the word "Cause" or "Effect" in that part's style. */
export const tagHtml = kind => `<span class="ce-tag ${kind}">${KIND_NAME[kind]}</span>`;

/** A sentence with its answer showing: the cause underlined, the effect ringed, the signal word in bold. */
export function revealHtml(item) {
  return pieces(item).map(piece => {
    const text = escapeHtml(piece.text);
    if (piece.kind === 'signal') return `<strong class="ce-signal">${text}</strong>`;
    if (piece.kind) return `<span class="ce-seg ${piece.kind}">${text}</span><sup class="ce-seg-label">${KIND_NAME[piece.kind]}</sup>`;
    return text;
  }).join('');
}

/** A paragraph's events as a diagram: a chain of three links, or one cause with two effects, then what only came afterwards. */
export function chainHtml(item) {
  const labels = item.kind === 'chain' ? ['Cause', 'Its effect, and the next cause', 'Final effect'] : ['Cause', 'One effect', 'Another effect'];
  const links = item.events.map((event, i) => `<li><span class="ce-chain-label">${labels[i]}</span>${escapeHtml(event)}</li>`).join('');
  return `<ol class="ce-chain is-${item.kind}">${links}</ol><p class="ce-after"><span class="ce-chain-label">Only afterwards, not an effect</span>${escapeHtml(item.after)}</p>`;
}

/** The four pairs of a matching question, each cause with its effect. */
export function pairsHtml(items) {
  return `<ul class="ce-pairs">${items.map(item => `<li><span class="ce-seg cause">${escapeHtml(sentenceCase(item.cause))}</span> <span class="ce-arrow" aria-hidden="true">→</span><span class="visually-hidden"> caused </span> <span class="ce-seg effect">${escapeHtml(item.effect)}</span></li>`).join('')}</ul>`;
}
