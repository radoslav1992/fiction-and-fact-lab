// The site's picture: a library card with three lines marked by highlighter pens. Teal marks a fact, pink marks
// an opinion and yellow marks a long word, the same colors the tools use. Shared by the home page and the
// Open Graph image (scripts/og-image.mjs). Text widths are fixed with textLength, so the highlights fit the
// words whichever font has loaded.
const CHECK = 'M-5 0l4 4 7-8';
const BUBBLE = 'M-7-6h14v9h-8l-4 4v-4h-2z';

const line = (y, width, text, fill, tag) => `
  <rect x="52" y="${y - 25}" width="${width + 16}" height="33" rx="5" fill="${fill.hl}"/>
  <text x="60" y="${y}" textLength="${width}" lengthAdjust="spacingAndGlyphs">${text}</text>
  <g transform="translate(${width + 92} ${y - 9})">
    <rect x="-14" y="-14" width="${tag.width}" height="28" rx="${tag.round}" fill="#fffdf6" stroke="${fill.ink}" stroke-width="2"/>
    <path d="${tag.icon}" fill="none" stroke="${fill.ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <text class="lc-tag" x="12" y="5" fill="${fill.ink}" textLength="${tag.width - 38}" lengthAdjust="spacingAndGlyphs">${tag.label}</text>
  </g>`;

export const LIBRARY_CARD_LABEL = 'A library card with three handwritten lines. A teal highlighter marks one line as a fact, a pink highlighter marks one as an opinion, and a yellow highlighter marks a long word.';

export function libraryCardSvg() {
  const rules = [150, 204, 258, 312].map(y => `<path d="M40 ${y}h440" stroke="#b9c3e6" stroke-width="1.5"/>`).join('');
  return `<svg class="library-card" viewBox="0 0 540 424" role="img" aria-label="${LIBRARY_CARD_LABEL}" xmlns="http://www.w3.org/2000/svg">
  <g transform="rotate(-2 270 200)">
    <rect x="22" y="26" width="476" height="340" rx="14" fill="#fffdf6" stroke="#d8cdb3" stroke-width="2"/>
    <circle cx="260" cy="48" r="7" fill="#f7f1e1" stroke="#d8cdb3" stroke-width="2"/>
    <text class="lc-head" x="40" y="84" textLength="250" lengthAdjust="spacingAndGlyphs">FICTION &amp; FACT LIBRARY</text>
    <text class="lc-small" x="480" y="84" text-anchor="end">Reader’s card</text>
    <path d="M22 98h476" stroke="#1d2158" stroke-width="3"/>
    ${rules}
    ${line(141, 250, 'Bees make honey.', { hl: '#bfeadf', ink: '#0a5a54' }, { label: 'FACT', width: 82, round: 6, icon: CHECK })}
    ${line(195, 222, 'Honey is yummy.', { hl: '#ffd4e3', ink: '#8a1b52' }, { label: 'OPINION', width: 116, round: 14, icon: BUBBLE })}
    <rect x="178" y="224" width="186" height="33" rx="5" fill="#ffe14f"/>
    <text x="60" y="249" textLength="112" lengthAdjust="spacingAndGlyphs">Bees are</text>
    <text x="186" y="249" textLength="170" lengthAdjust="spacingAndGlyphs">extraordinary</text>
    <text x="358" y="249">.</text>
    <text class="lc-small" x="60" y="300">3 sentences · 9 words</text>
    <g transform="rotate(-7 390 300)">
      <rect x="318" y="274" width="142" height="50" rx="8" fill="none" stroke="#2c3294" stroke-width="3"/>
      <text class="lc-stamp" x="389" y="308" text-anchor="middle" textLength="112" lengthAdjust="spacingAndGlyphs">CHECKED</text>
    </g>
  </g>
  <g transform="translate(-6 46) rotate(-14 420 345)">
    <rect x="352" y="330" width="150" height="30" rx="8" fill="#1d2158"/>
    <rect x="332" y="334" width="26" height="22" rx="3" fill="#2c3294"/>
    <path d="M332 336h-18l-10 9 10 9h18z" fill="#ffe14f" stroke="#1d2158" stroke-width="2" stroke-linejoin="round"/>
    <rect x="452" y="330" width="14" height="30" fill="#ffe14f"/>
  </g>
  <style>
    .library-card text { font-family: 'Literata', 'Literata Georgia', 'Literata Times', Georgia, serif; font-weight: 600; font-size: 25px; fill: #1d2158; }
    .library-card .lc-head { font-family: 'Atkinson Hyperlegible', 'Atkinson Fallback', Arial, sans-serif; font-weight: 700; font-size: 17px; }
    .library-card .lc-small { font-family: 'Atkinson Hyperlegible', 'Atkinson Fallback', Arial, sans-serif; font-weight: 400; font-size: 15px; fill: #4b4f7a; }
    .library-card .lc-tag { font-family: 'Atkinson Hyperlegible', 'Atkinson Fallback', Arial, sans-serif; font-weight: 700; font-size: 14px; }
    .library-card .lc-stamp { font-family: 'Atkinson Hyperlegible', 'Atkinson Fallback', Arial, sans-serif; font-weight: 700; font-size: 24px; fill: #2c3294; }
  </style>
</svg>`;
}
