// How the Parts of Speech Game shows a sentence once its answers are known: as HTML strings, used by the page
// on the server (the examples) and by the game in the browser.
// Each part of speech has a color and a written label, so nothing depends on color alone.
import { PARTS, partById } from './parts-of-speech.mjs';

const svg = body => `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
export const ICON = {
  right: svg('<circle cx="10" cy="10" r="7.5"/><path d="M6.5 10.3l2.4 2.4 4.6-5"/>'),
  wrong: svg('<circle cx="10" cy="10" r="7.5"/><path d="M7 7l6 6M13 7l-6 6"/>'),
};

export const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** A label for a part of speech: its color and its name. */
export const chipHtml = id => `<span class="pos-chip pos-${id}">${partById(id).name}</span>`;

const MARKS = {
  hit: ['✓', 'right'],
  missed: ['!', 'missed'],
  wrong: ['✗', 'wrong'],
};

/**
 * A sentence with every word colored and labelled with its part of speech.
 * `marks` (from checkAnswer) adds a tick, a cross or a "missed" sign to the words the question was about.
 */
export function taggedHtml(sentence, marks = null) {
  return sentence.words.map(word => {
    const part = partById(word.tag);
    const mark = marks?.[word.index];
    const sign = mark ? `<span class="pos-w-mark" aria-hidden="true">${MARKS[mark][0]}</span><span class="visually-hidden"> (${MARKS[mark][1]})</span>` : '';
    return `<span class="pos-slot"><span class="pos-w pos-${word.tag}${mark ? ` is-${mark}` : ''}"><span class="pos-w-text">${escapeHtml(word.text)}</span><span class="pos-w-tag" title="${part.name}">${part.short}</span>${sign}</span>${word.after ? `<span class="pos-punct">${word.after}</span>` : ''}</span>`;
  }).join(' ');
}

/** A sentence as plain words, with one word highlighted (the "name the highlighted word" question). */
export function highlightedHtml(sentence, index) {
  return sentence.words.map(word => `<span class="pos-slot"><span class="pos-w${word.index === index ? ' is-target' : ' is-plain'}"><span class="pos-w-text">${escapeHtml(word.text)}</span><span class="pos-w-tag"></span></span>${word.after ? `<span class="pos-punct">${word.after}</span>` : ''}</span>`).join(' ');
}

/** A sentence as buttons, one per word, for tapping. */
export function tappableHtml(sentence) {
  return sentence.words.map(word => `<span class="pos-slot"><button type="button" class="pos-w pos-pick" data-word="${word.index}" aria-pressed="false"><span class="pos-w-text">${escapeHtml(word.text)}</span><span class="pos-w-tag"></span></button>${word.after ? `<span class="pos-punct">${word.after}</span>` : ''}</span>`).join(' ');
}

/**
 * The reason for every word, as list items. A word the student got wrong says what went wrong.
 * `given` is what the student chose: a tag for "name", a list of tags for "color".
 * With `onlyMissed`, only the words the student got wrong are listed.
 */
export function whyListHtml(question, check = null, given = null, onlyMissed = false) {
  const { sentence, mode } = question;
  const article = id => (/^[aeiou]/.test(id) ? 'an' : 'a');
  return sentence.words.map(word => {
    const mark = check?.marks[word.index];
    let note = '';
    if (mark === 'missed') note = `You missed this ${partById(word.tag).name.toLowerCase()}.`;
    else if (mark === 'wrong' && mode === 'tap') note = `You tapped it, but it is not ${article(question.tag)} ${partById(question.tag).name.toLowerCase()}.`;
    else if (mark === 'wrong') {
      const chosen = mode === 'name' ? given : given?.[word.index];
      note = chosen ? `You chose ${partById(chosen).name.toLowerCase()}.` : 'You left it blank.';
    }
    const off = mark === 'missed' || mark === 'wrong';
    if (onlyMissed && !off) return '';
    return `<li${off ? ' class="is-off"' : ''}>${chipHtml(word.tag)} <span>“${escapeHtml(word.text)}” ${escapeHtml(word.why).replace(/(\s)(-[a-z]+)/g, '$1<span class="nowrap">$2</span>')}.${note ? ` <strong class="pos-note">${escapeHtml(note)}</strong>` : ''}</span></li>`;
  }).join('');
}

/** The palette: one button per part of speech, numbered for the keyboard. */
export function paletteHtml(ids, attribute) {
  return ids.map((id, i) => `<button type="button" class="pos-paint pos-${id}" ${attribute}="${id}"${attribute === 'data-paint' ? ' aria-pressed="false"' : ''}><kbd aria-hidden="true">${i + 1}</kbd>${partById(id).name}</button>`).join('');
}

export { PARTS };
