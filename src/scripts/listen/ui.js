/** Small DOM/rendering helpers shared across the Listen pages. */

import { formatTime } from './api.js';

/** Escape text for safe insertion into HTML. */
export function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** The player page for a book. The path and the `id` parameter are the same as on the old site. */
export const bookUrl = (id) => `/book/?id=${encodeURIComponent(id)}`;

const FALLBACK_COVER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
       <rect width="100%" height="100%" fill="#f1e9d3"/>
       <rect x="70" y="60" width="160" height="180" rx="10" fill="#fffdf6" stroke="#1d2158" stroke-width="8"/>
       <path d="M70 100h160" stroke="#1d2158" stroke-width="8"/>
       <rect x="96" y="124" width="92" height="26" rx="6" fill="#ffe14f"/>
       <path d="M100 137h100M100 172h76M100 204h90" stroke="#1d2158" stroke-width="9" stroke-linecap="round"/>
     </svg>`
  );

/** Build the markup for a single book card (anchor → book page). */
export function bookCardHTML(book) {
  const subtitle = book.runtime ? `· ${esc(book.runtime)}` : '';
  return `
    <a class="book-card" href="${bookUrl(book.id)}"
       aria-label="${esc(book.title)} by ${esc(book.author)}">
      <span class="book-card__frame">
        <img class="book-card__cover" loading="lazy" src="${esc(book.cover)}" width="180" height="180"
             alt="Cover of ${esc(book.title)}"
             onerror="this.onerror=null;this.src='${FALLBACK_COVER}'" />
      </span>
      <span class="book-card__body">
        <span class="book-card__title">${esc(book.title)}</span>
        <span class="book-card__author">${esc(book.author)}</span>
        <span class="book-card__meta">${book.year ? esc(book.year) : ''} ${subtitle}</span>
      </span>
    </a>`;
}

/** Render an array of books into a container element as a grid of cards. */
export function renderGrid(container, books) {
  if (!books.length) {
    container.innerHTML = `<p class="listen-empty">No books found on this shelf.</p>`;
    return;
  }
  container.innerHTML = books.map(bookCardHTML).join('');
}

/** A "Continue listening" card with a progress bar. */
export function progressCardHTML(p) {
  const pct =
    p.position && p.chapterCount
      ? Math.min(100, Math.round(((p.chapterIndex + 0.5) / p.chapterCount) * 100))
      : 0;
  return `
    <a class="book-card book-card--progress" href="${bookUrl(p.id)}"
       aria-label="Continue ${esc(p.title)}">
      <span class="book-card__frame">
        <img class="book-card__cover" loading="lazy" src="${esc(p.cover)}" width="180" height="180"
             alt="Cover of ${esc(p.title)}"
             onerror="this.onerror=null;this.src='${FALLBACK_COVER}'" />
        <span class="book-card__resume">Resume</span>
      </span>
      <span class="book-card__body">
        <span class="book-card__title">${esc(p.title)}</span>
        <span class="book-card__author">${esc(p.author)}</span>
        <span class="book-card__meta">Ch. ${(p.chapterIndex ?? 0) + 1}${
          p.chapterCount ? ' of ' + p.chapterCount : ''
        } · ${formatTime(p.position)}</span>
        <span class="book-progress"><span class="book-progress__bar" style="width:${pct}%"></span></span>
      </span>
    </a>`;
}

export { FALLBACK_COVER };
