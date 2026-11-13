// What the Word Builder shows, as HTML strings: used by the component on the server (the first screen) and
// by builder.ts in the browser, so both draw the board and the result the same way.
// Prefixes, base words, roots and suffixes each have a color, and each is always named in words as well.
import { KIND_NAME, lookup, tilesFor, middlesFor, familyOf, partLabel, changeLine, partsLine } from './word-builder.mjs';

const svg = body => `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
export const ICON = {
  right: svg('<circle cx="10" cy="10" r="7.5"/><path d="M6.5 10.3l2.4 2.4 4.6-5"/>'),
  wrong: svg('<circle cx="10" cy="10" r="7.5"/><path d="M7 7l6 6M13 7l-6 6"/>'),
};

export const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Escaped text in which a suffix such as -ment never breaks across two lines after its hyphen. */
export const textHtml = text => escapeHtml(text).replace(/(^|[\s“])(-[a-z]+)/g, '$1<span class="nowrap">$2</span>');

/** A word part as a small label: “un-”, colored by its kind. */
export const partHtml = (label, kind) => `<span class="wb-part is-${kind}">${escapeHtml(label)}</span>`;

/** A word shown as its parts: un- + break + -able. */
export const splitHtml = word => word.parts.map(part => partHtml(partLabel(part), part.kind)).join('<span class="wb-plus" aria-hidden="true">+</span><span class="visually-hidden"> plus </span>');

/** The tiles on one side of the board, as toggle buttons. */
export function tilesHtml(tiles, side, chosen = null) {
  if (!tiles.length) return `<p class="wb-none">${side === 'before' ? 'Nothing goes in front of this root in our list.' : 'Nothing goes after this root in our list.'}</p>`;
  return tiles.map(tile => `<button type="button" class="wb-tile is-${tile.kind}" data-tile="${escapeHtml(tile.label)}" data-side="${side}" aria-pressed="${tile.label === chosen}">${escapeHtml(tile.label)}</button>`).join('');
}

/** The choices for the middle of the board. */
export function middleOptionsHtml(level, chosen) {
  return middlesFor(level).map(middle => `<option value="${escapeHtml(middle.text)}"${middle.text === chosen ? ' selected' : ''}>${escapeHtml(middle.text)}${middle.meaning ? ` (${escapeHtml(middle.meaning)})` : ''}</option>`).join('');
}

/** What the board has made: the word and what its parts mean, or a kind "not in our list". */
export function resultHtml(level, before, middle, after) {
  const tiles = tilesFor(level, middle);
  const info = middlesFor(level).find(item => item.text === middle);
  const middleKind = info?.kind ?? 'base';
  const picked = [tiles.before.find(tile => tile.label === before), { label: middle, kind: middleKind, meaning: info?.meaning ?? null }, tiles.after.find(tile => tile.label === after)].filter(Boolean);
  const line = picked.map(part => partHtml(part.label, part.kind)).join('<span class="wb-plus" aria-hidden="true">+</span><span class="visually-hidden"> plus </span>');
  const meaning = part => (part.kind === 'base'
    ? `<li>${partHtml(part.label, part.kind)} <span>is the base word.</span></li>`
    : `<li>${partHtml(part.label, part.kind)} <span>is a ${KIND_NAME[part.kind]}. It means “${escapeHtml(part.meaning)}”.</span></li>`);
  const family = familyOf(level, middle).length;

  if (!before && !after) {
    const about = middleKind === 'root'
      ? `“${escapeHtml(middle)}” is a root from ${info.origin}. It means “${escapeHtml(info.meaning)}”. Add another part to build a word.`
      : `“${escapeHtml(middle)}” is the base word. Add a part to the front, to the end, or both.`;
    return `<p class="wb-line">${line}</p><p class="wb-word is-waiting">${escapeHtml(middle)}</p><p class="wb-def">${about} Our list has ${family} ${family === 1 ? 'word' : 'words'} built on it.</p>`;
  }
  const word = lookup(level, before, middle, after);
  if (!word) {
    return `<p class="wb-line">${line}</p><p class="wb-word is-miss">Not a word we know</p>`
      + `<p class="wb-def">These parts do not make a word in our list. Our list is short, so it does not hold every English word. Try another part.</p>`
      + `<ul class="wb-meanings">${picked.map(meaning).join('')}</ul>`;
  }
  const parts = word.parts.map(part => ({ label: partLabel(part), kind: part.kind, meaning: part.meaning }));
  return `<p class="wb-line">${line}</p><p class="wb-word is-found" data-found="${escapeHtml(word.word)}">${escapeHtml(word.word)}</p>`
    + `<p class="wb-def"><strong>It means:</strong> ${escapeHtml(word.definition)}.</p>`
    + (word.changes.length ? `<p class="wb-spelling"><strong>Spelling change:</strong> ${word.changes.map(change => textHtml(changeLine(change))).join(' ')}</p>` : '')
    + `<ul class="wb-meanings">${parts.map(meaning).join('')}</ul>`;
}

/** A word laid out letter by letter, with a button in every gap, for the "break it into parts" question. */
export function cutterHtml(word) {
  const letters = [...word];
  return letters.map((letter, i) => `<span class="wb-cut"><span class="wb-letter">${escapeHtml(letter)}</span>${i < letters.length - 1 ? `<button type="button" class="wb-gap" data-gap="${i + 1}" aria-pressed="false" aria-label="Cut between ${escapeHtml(letter)} and ${escapeHtml(letters[i + 1])}"></button>` : ''}</span>`).join('');
}

/** A word with a mark at each place it was cut: “un|break|able”. */
export const cutText = (word, places) => [...word].map((letter, i) => (places.includes(i) ? `|${letter}` : letter)).join('');

export { partsLine };
