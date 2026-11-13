// How the Main Idea and Details Game shows a paragraph and its answers: HTML strings, used by the page on the
// server (the worked examples) and by the game in the browser.
// Right and wrong always carry an icon and a word, so nothing depends on color alone.
import { OPTION_KINDS } from './main-idea.mjs';

const svg = body => `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
export const ICON = {
  right: svg('<circle cx="10" cy="10" r="7.5"/><path d="M6.5 10.3l2.4 2.4 4.6-5"/>'),
  wrong: svg('<circle cx="10" cy="10" r="7.5"/><path d="M7 7l6 6M13 7l-6 6"/>'),
};

export const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** The paragraph as HTML. With `reveal`, the sentence that states the main idea is marked. */
export function paragraphHtml(item, reveal = false) {
  return item.sentences.map((sentence, i) => (reveal && i === item.stated
    ? `<mark class="mi-stated">${escapeHtml(sentence)}</mark>`
    : escapeHtml(sentence))).join(' ');
}

/** The small label an option gets once the question is answered: "Main idea", "Too broad" and so on. */
export const kindTagHtml = kind => `<span class="mi-tag ${kind === 'main' ? 'is-main' : 'is-not'}">${kind === 'main' ? ICON.right : ICON.wrong}${escapeHtml(OPTION_KINDS[kind].label)}</span>`;
