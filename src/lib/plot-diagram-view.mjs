// How the Plot Diagram Builder draws a diagram: the story mountain as an SVG string, with the text of each
// stage wrapped inside its box, plus a small mountain and a stacked list for narrow screens. Used by the
// pages on the server (the first screen, the example pages, the worksheet) and by the tool in the browser,
// so a diagram looks the same wherever it is drawn.
//
// SVG text does not wrap by itself, and the server has no font to measure with. So lines are broken here,
// using the measured width of every character of the site's fonts (below).
import { STAGES, EXTRAS } from './plot-diagram.mjs';

export const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* ------------------------------------------------------ measuring text */

// Advance widths in thousandths of an em for the characters from space (32) to ~ (126), measured in Chromium:
// Atkinson Hyperlegible regular, bold and italic, and Literata bold (the display font).
const WIDTHS = {
  regular: [280,281,301,655,594,927,705,160,300,300,433,602,205,368,205,377,648,402,549,574,614,583,598,510,615,598,205,205,553,602,553,520,780,626,619,656,673,567,548,710,690,414,510,627,539,820,689,727,601,753,618,596,558,690,589,840,623,595,607,315,377,315,552,396,268,526,566,500,564,539,311,560,546,278,254,490,239,841,546,552,566,576,340,471,324,536,441,654,461,429,460,319,233,319,555],
  bold: [320,283,410,783,619,977,702,222,366,366,434,618,243,374,243,442,652,448,586,605,626,612,632,543,625,561,243,243,573,618,573,614,754,690,639,673,686,580,544,719,679,458,560,659,537,842,700,764,626,781,654,619,617,663,656,883,699,687,621,333,442,333,589,430,314,553,596,520,596,566,367,597,572,315,259,567,314,886,572,573,596,601,372,534,379,570,526,723,533,518,516,370,234,370,533],
  italic: [280,284,334,634,610,1000,691,193,301,302,439,619,209,372,208,371,654,403,565,580,636,575,605,537,617,601,208,210,613,658,613,527,784,627,625,661,674,565,546,712,694,414,509,623,541,824,693,728,597,748,610,609,558,693,592,844,624,598,613,317,519,317,552,413,272,521,555,495,555,542,320,555,548,270,258,487,259,846,550,547,556,555,353,479,324,540,444,658,462,435,467,322,289,322,539],
  display: [213,361,432,633,605,849,837,254,395,395,466,582,315,361,324,403,632,437,567,580,613,542,596,536,591,591,324,315,582,582,582,560,914,721,689,691,790,615,593,755,840,417,584,788,619,974,750,772,650,773,742,597,700,749,719,1023,748,702,649,370,402,370,572,470,500,569,659,535,663,555,401,615,670,352,333,652,349,983,670,626,664,651,527,477,403,659,596,882,603,567,517,422,248,422,590],
};
// Curly quotes, dashes and the ellipsis (the widest of the four fonts, so a line never runs over).
const PUNCTUATION = { '’': 310, '‘': 315, '“': 525, '”': 525, '–': 510, '—': 1000, '…': 900 };
// A little room for the fallback fonts, whose letters are not exactly as wide.
const SAFETY = 1.04;

/** The width of a piece of text in SVG units, at a font size, in one of the fonts above. */
export function textWidth(text, size, font = 'regular') {
  const table = WIDTHS[font];
  let total = 0;
  for (const char of text) {
    const code = char.codePointAt(0);
    if (code >= 32 && code < 127) total += table[code - 32];
    else if (PUNCTUATION[char]) total += PUNCTUATION[char];
    else {
      // An accented letter is as wide as its plain letter; anything else is taken to be wide.
      const base = char.normalize('NFD').codePointAt(0);
      total += base >= 32 && base < 127 ? table[base - 32] : code > 0x2e7f ? 1050 : 700;
    }
  }
  return (total * size) / 1000;
}

/**
 * Text broken into lines no wider than maxWidth: [{ text, gap }]. A line break in the text starts a new
 * paragraph (gap is true on its first line). A word wider than the box is cut. With maxLines, extra lines are
 * dropped and the last one ends in "…".
 */
export function wrapText(text, maxWidth, size, font = 'regular', maxLines = Infinity) {
  const fits = piece => textWidth(piece, size, font) * SAFETY <= maxWidth;
  const lines = [];
  text.split('\n').forEach((paragraph, p) => {
    let line = '', first = true;
    const push = () => { lines.push({ text: line, gap: first && p > 0 }); first = false; line = ''; };
    for (const word of paragraph.split(' ').filter(Boolean)) {
      if (line && fits(`${line} ${word}`)) { line += ` ${word}`; continue; }
      if (line) push();
      let rest = Array.from(word);
      while (rest.length > 1 && !fits(rest.join(''))) {
        let take = rest.length - 1;
        while (take > 1 && !fits(rest.slice(0, take).join(''))) take--;
        line = rest.slice(0, take).join('');
        push();
        rest = rest.slice(take);
      }
      line = rest.join('');
    }
    if (line) push();
  });
  if (lines.length > maxLines) {
    lines.length = maxLines;
    let last = Array.from(lines[maxLines - 1].text);
    while (last.length > 1 && !fits(`${last.join('')}…`)) last.pop();
    lines[maxLines - 1].text = `${last.join('').replace(/[\s.,;:!?]+$/, '')}…`;
  }
  return lines;
}

/* -------------------------------------------------- the story mountain */

// The drawing is 880 units wide and as tall as its text needs. Rising action and falling action sit beside
// the slopes, the climax above the peak, and the beginning and the ending under the flat ground.
const W = 880, PAD = 14;
const SIDE = 240, TOP = 272, NOTES = 340;      // box widths: side boxes, the climax box, the story notes
const FOOT_L = 258, PEAK_X = 466, FOOT_R = 622; // where the mountain leaves the ground, peaks and lands
const BOX_PAD = 12, HEAD = 40, FONT = 15, LINE = 20, PARAGRAPH = 6;
const MARK = 13;                                // radius of the numbered markers on the line
const MAX_HILL = 430;
const TITLE_X = 448, TITLE_FONT = 19, TITLE_LINE = 24, TITLE_WIDTH = 210;

const n = value => Math.round(value * 10) / 10;
const textAt = (x, y, cls, text, anchor) => `<text x="${n(x)}" y="${n(y)}" class="${cls}"${anchor ? ` text-anchor="${anchor}"` : ''}>${escapeHtml(text)}</text>`;
const boxWidth = stage => (stage.id === 'climax' ? TOP : SIDE);

// What goes inside a stage's box, and how tall that makes it.
function stageBlock(stage, text, opts) {
  const inner = boxWidth(stage) - 2 * BOX_PAD;
  if (opts.blank) {
    // A worksheet: the question, then ruled lines to write on.
    const prompt = wrapText(stage.prompt, inner, 13, 'italic');
    const rules = opts.blank.lines ?? 3, ruleGap = opts.blank.gap ?? 27;
    return { prompt, rules, ruleGap, promptLine: 16, height: HEAD - 4 + prompt.length * 16 + rules * ruleGap + 9 };
  }
  if (text) {
    const lines = wrapText(text, inner, FONT, 'regular');
    const gaps = lines.filter(line => line.gap).length * PARAGRAPH;
    return { lines, height: HEAD + lines.length * LINE + gaps + 10 };
  }
  const prompt = opts.prompts ? wrapText(stage.prompt, inner, 14, 'italic') : [];
  return { prompt, promptLine: 19, height: HEAD + Math.max(3 * LINE, prompt.length * 19) + 10 };
}

/**
 * Where everything on the mountain goes for a diagram: { width, height, peak, base, boxes, markers, title, notes }.
 * opts.prompts shows each stage's question in an empty box; opts.blank ({ lines, gap }) draws a worksheet
 * with ruled lines and no text.
 */
export function layoutDiagram(diagram, opts = {}) {
  const blocks = Object.fromEntries(STAGES.map(stage => [stage.id, stageBlock(stage, diagram.stages[stage.id], opts)]));

  // The title sits inside the mountain, so the mountain must be tall enough to hold it.
  const title = { lines: [], author: '', placeholder: '' };
  if (!opts.blank) {
    if (diagram.title) title.lines = wrapText(diagram.title, TITLE_WIDTH, TITLE_FONT, 'display', 3);
    else if (opts.prompts) title.placeholder = 'Story title';
    if (diagram.author) title.author = wrapText(`by ${diagram.author}`, TITLE_WIDTH, 13.5, 'regular', 1)[0].text;
  }
  const titleHeight = title.lines.length * TITLE_LINE + (title.author ? 20 : 0) + (title.placeholder ? 22 : 0);
  const titleWidth = Math.max(0, ...title.lines.map(line => textWidth(line.text, TITLE_FONT, 'display')), title.author ? textWidth(title.author, 13.5) : 0, title.placeholder ? 80 : 0);
  // How far up the mountain (0 at the ground, 1 at the peak) a line this wide still fits between the slopes.
  const room = Math.max(0.08, Math.min((TITLE_X - FOOT_L - titleWidth / 2 - 12) / (PEAK_X - FOOT_L), (FOOT_R - TITLE_X - titleWidth / 2 - 12) / (FOOT_R - PEAK_X)));
  const hill = Math.max(opts.blank ? opts.blank.hill ?? 120 : 190, titleHeight ? (titleHeight + 16) / room : 0);

  let peak = PAD + blocks.climax.height + MARK + 11;
  const base = Math.max(peak + hill, PAD + Math.max(blocks.rising.height, blocks.falling.height) + MARK + 19);
  if (base - peak > MAX_HILL) peak = base - MAX_HILL;
  const middle = (peak + base) / 2;
  const beside = block => Math.min(Math.max(middle - block.height / 2, PAD), base - MARK - 19 - block.height);
  const ground = base + MARK + 9;

  const boxes = {
    exposition: { x: PAD, y: ground },
    rising: { x: PAD, y: beside(blocks.rising) },
    climax: { x: PEAK_X - TOP / 2, y: peak - MARK - 11 - blocks.climax.height },
    falling: { x: W - PAD - SIDE, y: beside(blocks.falling) },
    resolution: { x: W - PAD - SIDE, y: ground },
  };
  for (const stage of STAGES) Object.assign(boxes[stage.id], { w: boxWidth(stage), h: blocks[stage.id].height, ...blocks[stage.id] });

  const markers = {
    exposition: { x: (PAD + FOOT_L) / 2, y: base },
    rising: { x: (FOOT_L + PEAK_X) / 2, y: middle },
    climax: { x: PEAK_X, y: peak },
    falling: { x: (PEAK_X + FOOT_R) / 2, y: middle },
    resolution: { x: (FOOT_R + W - PAD) / 2, y: base },
  };

  // Story notes (characters, setting, problem) go under the mountain, between the beginning and the ending.
  let notes = null;
  const rows = opts.blank ? [] : EXTRAS.filter(extra => diagram[extra.id]).map(extra => ({ name: extra.name, lines: wrapText(diagram[extra.id], NOTES - 2 * BOX_PAD, 14, 'regular') }));
  if (rows.length) notes = { x: (FOOT_L + FOOT_R) / 2 - NOTES / 2, y: ground, w: NOTES, h: 10 + rows.reduce((sum, row) => sum + 18 + row.lines.length * 19 + 6, 0) + 4, rows };

  const height = Math.max(boxes.exposition.y + boxes.exposition.h, boxes.resolution.y + boxes.resolution.h, notes ? notes.y + notes.h : 0) + PAD;
  return { width: W, height: Math.ceil(height), peak, base, boxes, markers, title, notes };
}

function boxSvg(stage, box, filled) {
  const { x, y, w, h } = box;
  const out = [`<g class="pd-stage${filled ? '' : ' is-empty'}" data-stage="${stage.id}">`];
  out.push(`<rect class="pd-box" x="${n(x)}" y="${n(y)}" width="${w}" height="${n(h)}" rx="5"/>`);
  out.push(`<path class="pd-bar" d="M${n(x + 5)},${n(y)}h${w - 10}a5,5 0 0 1 5,5h-${w}a5,5 0 0 1 5,-5z"/>`);
  out.push(`<circle class="pd-badge" cx="${n(x + BOX_PAD + 10)}" cy="${n(y + 23)}" r="10"/>`);
  out.push(textAt(x + BOX_PAD + 10, y + 27.6, 'pd-badge-n', stage.number, 'middle'));
  const nameX = x + BOX_PAD + 27;
  out.push(textAt(nameX, y + 28, 'pd-name', stage.name));
  if (stage.also) out.push(textAt(nameX + textWidth(stage.name, 15, 'bold') + 7, y + 28, 'pd-also', stage.also));
  let at = y + HEAD;
  if (box.lines) {
    for (const line of box.lines) {
      if (line.gap) at += PARAGRAPH;
      at += LINE;
      out.push(textAt(x + BOX_PAD, at - 5, 'pd-text', line.text));
    }
  } else {
    if (box.rules) at -= 4;
    for (const line of box.prompt) {
      at += box.promptLine;
      out.push(textAt(x + BOX_PAD, at - 5, box.rules ? 'pd-prompt pd-prompt-small' : 'pd-prompt', line.text));
    }
    for (let i = 0; i < (box.rules ?? 0); i++) {
      at += box.ruleGap;
      out.push(`<path class="pd-rule" d="M${n(x + BOX_PAD)},${n(at)}h${w - 2 * BOX_PAD}"/>`);
    }
  }
  out.push('</g>');
  return out.join('');
}

/**
 * The whole diagram as an SVG string. `diagram` is { title, author, stages, characters, setting, problem }.
 * Options: prompts (show the question in an empty box), blank (a worksheet to write on), label (the
 * accessible name), className.
 */
export function diagramSvg(diagram, opts = {}) {
  const L = layoutDiagram(diagram, opts);
  const { peak, base, boxes, markers } = L;
  const filled = id => Boolean(diagram.stages[id]) && !opts.blank;
  const label = opts.label ?? (diagram.title ? `Story mountain for ${diagram.title}` : opts.blank ? 'A blank story mountain with five boxes to fill in' : 'Story mountain');
  const out = [`<svg class="pd-svg ${opts.className ?? 'pd-wide'}" viewBox="0 0 ${L.width} ${L.height}" role="img" aria-label="${escapeHtml(label)}">`];

  // The mountain: soft highlighter inside, an ink line along the top, and an arrow where the story ends.
  const end = W - PAD - 9;
  out.push(`<path class="pd-hill" d="M${FOOT_L},${n(base)}L${PEAK_X},${n(peak)}L${FOOT_R},${n(base)}z"/>`);
  out.push(`<path class="pd-ground" d="M${FOOT_L},${n(base)}H${FOOT_R}"/>`);
  out.push(`<path class="pd-line" d="M${PAD},${n(base)}H${FOOT_L}L${PEAK_X},${n(peak)}L${FOOT_R},${n(base)}H${end}"/>`);
  out.push(`<path class="pd-arrow" d="M${end - 4},${n(base - 9)}L${end + 9},${n(base)}L${end - 4},${n(base + 9)}z"/>`);

  // Dashed leaders tie the side boxes to their place on the slope.
  const leader = (box, marker, side) => {
    const y = Math.min(Math.max(marker.y, box.y + 14), box.y + box.h - 14);
    const from = side === 'left' ? box.x + box.w : box.x;
    return `<path class="pd-leader" d="M${n(from)},${n(y)}L${n(marker.x + (side === 'left' ? -MARK : MARK))},${n(marker.y)}"/>`;
  };
  out.push(leader(boxes.rising, markers.rising, 'left'), leader(boxes.falling, markers.falling, 'right'));
  out.push(`<path class="pd-leader" d="M${PEAK_X},${n(boxes.climax.y + boxes.climax.h)}V${n(peak - MARK)}"/>`);

  // The title, inside the mountain.
  const { title } = L;
  let at = base - 14 - (title.author ? 20 : 0) - (title.lines.length - 1) * TITLE_LINE;
  for (const line of title.lines) { out.push(textAt(TITLE_X, at, 'pd-title', line.text, 'middle')); at += TITLE_LINE; }
  if (title.author) out.push(textAt(TITLE_X, base - 16, 'pd-author', title.author, 'middle'));
  if (title.placeholder) out.push(textAt(TITLE_X, base - 18, 'pd-prompt', title.placeholder, 'middle'));

  for (const stage of STAGES) out.push(boxSvg(stage, boxes[stage.id], filled(stage.id) || Boolean(opts.blank)));
  for (const stage of STAGES) {
    const marker = markers[stage.id];
    out.push(`<g class="pd-marker${filled(stage.id) || opts.blank ? '' : ' is-empty'}"><circle cx="${n(marker.x)}" cy="${n(marker.y)}" r="${MARK}"/>${textAt(marker.x, marker.y + 5.2, 'pd-marker-n', stage.number, 'middle')}</g>`);
  }

  if (L.notes) {
    const { x, y, w, h, rows } = L.notes;
    out.push(`<g class="pd-notes"><rect class="pd-notes-box" x="${n(x)}" y="${n(y)}" width="${w}" height="${n(h)}" rx="5"/>`);
    let line = y + 10;
    for (const row of rows) {
      line += 18;
      out.push(textAt(x + BOX_PAD, line - 4, 'pd-notes-name', row.name));
      for (const piece of row.lines) { line += 19; out.push(textAt(x + BOX_PAD, line - 5, 'pd-notes-text', piece.text)); }
      line += 6;
    }
    out.push('</g>');
  }
  out.push('</svg>');
  return out.join('');
}

/* ----------------------------------------------- small screens, icons */

// The small mountain shown above the stacked list on a narrow screen: the line, five numbers and their names.
const MINI = { exposition: [48, 112], rising: [128, 71], climax: [169, 30], falling: [201, 71], resolution: [277, 112] };
const MINI_LABEL = { exposition: [48, 139, 'middle'], rising: [111, 62, 'end'], climax: [169, 13, 'middle'], falling: [218, 62, 'start'], resolution: [277, 139, 'middle'] };

/** A small mountain with the five numbered stages. `filled` says which stage ids have text (all, if left out). */
export function miniMountainSvg(filled) {
  const out = ['<svg class="pd-svg pd-mini" viewBox="0 0 328 148" aria-hidden="true">'];
  out.push('<path class="pd-hill" d="M87,112L169,30L233,112z"/><path class="pd-line" d="M8,112H87L169,30L233,112H312"/><path class="pd-arrow" d="M309,105L320,112L309,119z"/>');
  for (const stage of STAGES) {
    const [x, y] = MINI[stage.id], [lx, ly, anchor] = MINI_LABEL[stage.id];
    const empty = filled && !filled.includes(stage.id);
    out.push(`<g class="pd-marker${empty ? ' is-empty' : ''}"><circle cx="${x}" cy="${y}" r="11"/>${textAt(x, y + 4.6, 'pd-marker-n', stage.number, 'middle')}</g>`);
    out.push(textAt(lx, ly, 'pd-mini-name', stage.name, anchor));
  }
  out.push('</svg>');
  return out.join('');
}

const ICON_PARTS = {
  exposition: 'M3,25H17',
  rising: 'M17,25L29,8',
  climax: 'M26,12L31,5L36,12',
  falling: 'M33,8L45,25',
  resolution: 'M45,25H59',
};
/** A tiny mountain with one stage drawn in ink, to show where that stage is. */
export const stageIconSvg = stageId =>
  `<svg class="pd-icon" viewBox="0 0 62 30" width="62" height="30" aria-hidden="true"><path class="pd-icon-line" d="M3,25H17L31,5L45,25H59"/><path class="pd-icon-part" d="${ICON_PARTS[stageId]}"/></svg>`;

const mark = body => `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
export const ICON = {
  right: mark('<circle cx="10" cy="10" r="7.5"/><path d="M6.5 10.3l2.4 2.4 4.6-5"/>'),
  wrong: mark('<circle cx="10" cy="10" r="7.5"/><path d="M7 7l6 6M13 7l-6 6"/>'),
};

const withBreaks = text => escapeHtml(text).replace(/\n/g, '<br>');

/** The diagram as a stacked list: shown under the small mountain on a narrow screen, and read by screen readers. */
export function stackHtml(diagram, opts = {}) {
  const head = diagram.title ? `<p class="pd-stack-title"><strong>${escapeHtml(diagram.title)}</strong>${diagram.author ? ` by ${escapeHtml(diagram.author)}` : ''}</p>` : '';
  const items = STAGES.map(stage => {
    const text = diagram.stages[stage.id];
    const body = text ? withBreaks(text) : opts.prompts ? `<em>${escapeHtml(stage.prompt)}</em>` : '';
    return `<li class="pd-stack-item${text ? '' : ' is-empty'}" data-stage="${stage.id}"><span class="pd-num" aria-hidden="true">${stage.number}</span><div><p class="pd-stack-name"><strong>${stage.name}</strong>${stage.also ? ` <span>(${stage.also})</span>` : ''}</p><p class="pd-stack-text">${body}</p></div></li>`;
  }).join('');
  const notes = EXTRAS.filter(extra => diagram[extra.id]).map(extra => `<div><dt>${extra.name}</dt><dd>${withBreaks(diagram[extra.id])}</dd></div>`).join('');
  return `<div class="pd-stack">${head}<ol class="pd-stack-list">${items}</ol>${notes ? `<dl class="pd-stack-notes">${notes}</dl>` : ''}</div>`;
}

/** Everything inside a diagram's <figure>: the wide mountain, and the small mountain with the stacked list. */
export function diagramHtml(diagram, opts = {}) {
  const filled = STAGES.filter(stage => diagram.stages[stage.id]).map(stage => stage.id);
  return diagramSvg(diagram, opts) + miniMountainSvg(opts.prompts ? filled : undefined) + stackHtml(diagram, opts);
}
