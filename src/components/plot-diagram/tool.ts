// The Plot Diagram Builder in the browser.
// Build your own: what is typed is drawn on the story mountain at once (diagramHtml, the same code the server
// uses), kept in local storage so a reload does not lose it, and can travel in a link after "#".
// Sort the events: rounds come from buildRound() in plot-diagram.mjs, so a round number always gives the same
// cards in the same order. Nothing typed is ever sent anywhere: analytics events carry settings and scores only.
import {
  STAGES, EXTRAS, TALES, emptyDiagram, cleanDiagram, isEmptyDiagram, filledStages, encodeDiagram, decodeDiagram,
  taleBySlug, stageById, buildRound, scoreRound, feedback, resultMessage, examplePath, practicePath,
} from '../../lib/plot-diagram.mjs';
import { diagramHtml, escapeHtml, stageIconSvg, ICON } from '../../lib/plot-diagram-view.mjs';
import { track } from '../../lib/analytics';

type Diagram = ReturnType<typeof emptyDiagram>;
type Round = NonNullable<ReturnType<typeof buildRound>>;
const DRAFT_KEY = 'plotDiagramDraft';
const BEST_KEY = 'plotDiagramBest';
const root = document.querySelector<HTMLElement>('[data-plot]');

if (root) {
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const panels = [...root.querySelectorAll<HTMLElement>('[data-panel]')];
  const modeButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-mode]')];

  function showMode(mode: string) {
    for (const panel of panels) panel.hidden = panel.dataset.panel !== mode;
    for (const button of modeButtons) button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
    root!.dataset.showing = mode;
  }

  /* ------------------------------------------------------ build your own */

  const fields = [...root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-field]')];
  const figure = $('[data-figure]');
  const status = $('[data-build-status]');
  const linkBox = $('[data-link-box]'), linkField = $<HTMLInputElement>('[data-link-field]');
  const sharedNote = $('[data-shared]'), restore = $<HTMLButtonElement>('[data-restore]');
  const isStage = (key: string) => STAGES.some(stage => stage.id === key);

  let diagram: Diagram = emptyDiagram();
  // The student's own diagram, set aside while a diagram from a link is on screen.
  let backup: Diagram | null = null;
  let undo: Diagram | null = null;
  let saveTimer = 0;

  function readFields(): Diagram {
    const raw = emptyDiagram() as Record<string, any>;
    for (const field of fields) {
      const key = field.dataset.field!;
      if (isStage(key)) raw.stages[key] = field.value; else raw[key] = field.value;
    }
    return cleanDiagram(raw);
  }
  function writeFields(next: Diagram) {
    const from = next as Record<string, any>;
    for (const field of fields) {
      const key = field.dataset.field!;
      field.value = isStage(key) ? from.stages[key] : from[key];
    }
    // Open the optional boxes if any of them has text.
    if (EXTRAS.some(extra => from[extra.id])) root!.querySelector<HTMLDetailsElement>('.pd-more')!.open = true;
  }
  const draw = () => { figure.innerHTML = diagramHtml(diagram, { prompts: true }); };
  function save() {
    try {
      if (isEmptyDiagram(diagram) && !backup) localStorage.removeItem(DRAFT_KEY);
      else localStorage.setItem(DRAFT_KEY, JSON.stringify({ diagram, backup }));
    } catch { /* private mode: the work is just not kept */ }
  }
  function load(): { diagram: Diagram; backup: Diagram | null } {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (saved && typeof saved === 'object') return { diagram: cleanDiagram(saved.diagram), backup: saved.backup ? cleanDiagram(saved.backup) : null };
    } catch { /* nothing saved, or not readable */ }
    return { diagram: emptyDiagram(), backup: null };
  }
  function setDiagram(next: Diagram) {
    diagram = cleanDiagram(next);
    writeFields(diagram);
    draw();
    save();
  }
  function say(text: string, undoable = false) {
    status.textContent = text;
    if (undoable) status.insertAdjacentHTML('beforeend', ' <button type="button" class="btn small" data-undo>Undo</button>');
  }
  function showShared() {
    sharedNote.hidden = false;
    restore.hidden = !backup;
    $('[data-shared-text]').textContent = backup
      ? 'You opened a diagram from a link. Your own diagram is kept safe.'
      : 'You opened a diagram from a link. You can change it here. Your changes stay in this browser.';
  }

  // A diagram that arrived in a link. The page's first script has already moved it out of the address.
  function takeShared() {
    const store = window as unknown as { plotDiagramShared?: string };
    const shared = store.plotDiagramShared ? decodeDiagram(store.plotDiagramShared) : null;
    const arrived = Boolean(store.plotDiagramShared);
    store.plotDiagramShared = undefined;
    if (!arrived) return;
    showMode('build');
    if (!shared) { say('That link does not hold a diagram. Ask for the link again.'); return; }
    const same = JSON.stringify(shared) === JSON.stringify(diagram);
    if (!same && !isEmptyDiagram(diagram) && !backup) backup = diagram;
    setDiagram(shared);
    linkBox.hidden = true;
    showShared();
    track('plot_diagram_open_link', { stages: filledStages(diagram) });
  }

  root.querySelector<HTMLFormElement>('[data-form]')!.addEventListener('submit', event => event.preventDefault());
  root.addEventListener('input', event => {
    if (!(event.target as Element).matches('[data-field]')) return;
    diagram = readFields();
    undo = null;
    if (status.querySelector('[data-undo]')) status.textContent = '';
    linkBox.hidden = true;
    draw();
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(save, 250);
  });
  window.addEventListener('pagehide', save);

  // Show which box of the mountain belongs to the field being typed in; a click on a box goes to its field.
  root.addEventListener('focusin', event => {
    const key = (event.target as HTMLElement).dataset?.field;
    if (key && isStage(key)) figure.dataset.active = key; else delete figure.dataset.active;
  });
  figure.addEventListener('click', event => {
    const stage = (event.target as Element).closest<HTMLElement>('[data-stage]')?.dataset.stage;
    if (!stage || root.classList.contains('is-big')) return;
    const field = fields.find(item => item.dataset.field === stage);
    field?.focus();
    field?.scrollIntoView({ block: 'nearest' });
  });

  async function copyLink() {
    if (isEmptyDiagram(diagram)) { say('Write something on your diagram first. Then you can copy a link to it.'); return; }
    const link = `${location.origin}${location.pathname}#d=${encodeDiagram(diagram)}`;
    linkField.value = link;
    linkBox.hidden = false;
    try {
      await navigator.clipboard.writeText(link);
      say('Link copied. Anyone who opens it sees this diagram.');
    } catch {
      linkField.focus();
      linkField.select();
      say('Press Ctrl+C (or ⌘C) to copy the link.');
    }
    track('plot_diagram_link', { stages: filledStages(diagram) });
  }
  linkField.addEventListener('focus', () => linkField.select());

  /* ----------------------------------------------------- sort the events */

  const screens = [...root.querySelectorAll<HTMLElement>('[data-sort-screen]')];
  const trayCards = $('[data-tray-cards]'), trayNote = $('[data-tray-note]'), tray = $('[data-tray]');
  const zones = $('[data-zones]');
  const hand = $('[data-hand]'), check = $<HTMLButtonElement>('[data-check]'), progress = $('[data-progress]');
  const result = $('[data-result]'), live = $('[data-live]');
  const backToTray = $<HTMLButtonElement>('[data-place="tray"]');

  let round: Round | null = null;
  let placed: Record<number, string> = {};
  let selected: number | null = null;
  let checked = false;          // the cards on the mountain are showing their answers
  let locked = new Set<number>(); // cards already checked and right
  let attempt = 0;

  const readBest = (): Record<string, number> => { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') || {}; } catch { return {}; } };
  function showBest() {
    const best = readBest();
    for (const el of root!.querySelectorAll<HTMLElement>('[data-best]')) {
      const tale = taleBySlug(el.dataset.best!)!;
      const score = best[tale.slug];
      el.textContent = Number.isInteger(score) ? `Your best: ${score} of ${tale.events.length}` : '';
    }
  }
  function showScreen(name: string) {
    for (const screen of screens) screen.hidden = screen.dataset.sortScreen !== name;
    root!.dataset.sorting = name;
  }
  const card = (id: number) => round!.cards.find(item => item.id === id)!;

  function cardHtml(item: Round['cards'][number]) {
    const place = placed[item.id];
    const shown = (checked && place) || locked.has(item.id);
    const right = shown && item.stage === place;
    const state = shown ? (right ? ' class="is-right"' : ' class="is-wrong"') : '';
    const why = shown ? `<p class="pd-why">${right ? ICON.right : ICON.wrong}<span>${escapeHtml(feedback(item, place))}</span></p>` : '';
    return `<li${state}><button type="button" class="pd-card" data-card="${item.id}" aria-pressed="${selected === item.id}" draggable="${!shown}"${shown ? ' disabled' : ''}>${escapeHtml(item.text)}</button>${why}</li>`;
  }

  function drawBoard() {
    if (!round) return;
    const waiting = round.cards.filter(item => !placed[item.id]);
    trayCards.innerHTML = waiting.map(cardHtml).join('');
    trayNote.hidden = waiting.length > 0;
    zones.innerHTML = STAGES.map(stage => {
      const here = round!.cards.filter(item => placed[item.id] === stage.id);
      return `<div class="pd-zone" data-zone="${stage.id}"><button type="button" class="pd-place" data-place="${stage.id}"><span class="pd-num" aria-hidden="true">${stage.number}</span><span class="pd-place-name">${stage.name}${stage.also ? `<small>${stage.also}</small>` : ''}</span>${stageIconSvg(stage.id)}<span class="visually-hidden">: ${here.length === 1 ? '1 card' : `${here.length} cards`} here. Put the chosen card here.</span></button><ul class="pd-cards" aria-label="Cards on ${stage.name}">${here.map(cardHtml).join('')}</ul></div>`;
    }).join('');
    const done = round.cards.length - waiting.length;
    progress.textContent = checked ? '' : `${done} of ${round.cards.length} cards placed`;
    check.disabled = waiting.length > 0 || checked;
    check.hidden = checked;
    drawHand();
  }

  function drawHand() {
    const item = selected === null ? null : card(selected);
    hand.hidden = !item;
    root!.classList.toggle('has-card', Boolean(item));
    backToTray.hidden = !(item && placed[item.id]);
    if (item) $('[data-hand-text]').textContent = item.text;
    for (const button of root!.querySelectorAll<HTMLElement>('[data-card]')) button.setAttribute('aria-pressed', String(Number(button.dataset.card) === selected));
  }

  function select(id: number | null) {
    selected = id;
    drawHand();
    if (id !== null) live.textContent = 'Card chosen. Now choose a stage, or press a number from 1 to 5.';
  }

  function place(id: number, where: string) {
    if (checked || locked.has(id)) return;
    if (where === 'tray') delete placed[id]; else placed[id] = where;
    selected = null;
    drawBoard();
    const left = round!.cards.filter(item => !placed[item.id]).length;
    live.textContent = where === 'tray' ? 'Card put back.' : `Card put on ${stageById(where)!.name}. ${left ? `${left} to go.` : 'All the cards are placed. Check your mountain.'}`;
    // Move on to the next card, or to the Check button when every card is placed.
    (trayCards.querySelector<HTMLElement>('[data-card]') ?? check).focus({ preventScroll: true });
  }

  function startRound(slug: string, seed = Math.floor(Math.random() * 900000) + 100000) {
    const next = buildRound(slug, seed);
    if (!next) return;
    round = next;
    placed = {};
    selected = null;
    checked = false;
    locked = new Set();
    attempt = 0;
    result.hidden = true;
    $('[data-sort-title]').textContent = `Sort the events: ${round.tale.title}`;
    $('[data-sort-summary]').textContent = round.tale.summary;
    root!.querySelector<HTMLDetailsElement>('.pd-remind')!.open = false;
    const link = `${location.origin}${practicePath(round.tale, seed)}`;
    $('[data-round-number]').textContent = String(seed);
    const anchor = $<HTMLAnchorElement>('[data-round-link]');
    anchor.href = link;
    anchor.textContent = link;
    // For teachers' links and for testing: which round is on screen.
    root!.dataset.sortStory = slug;
    root!.dataset.sortRound = String(seed);
    track('plot_sort_start', { story: slug });
    showMode('sort');
    showScreen('play');
    drawBoard();
  }

  function checkBoard() {
    if (!round || round.cards.some(item => !placed[item.id])) return;
    attempt++;
    checked = true;
    const score = scoreRound(round.tale, placed);
    for (const item of score.results) if (item.right) locked.add(item.event.id);
    if (attempt === 1) {
      const best = readBest();
      if (!(best[round.tale.slug] >= score.correct)) {
        best[round.tale.slug] = score.correct;
        try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch { /* private mode: the score is just not kept */ }
      }
      showBest();
    }
    track('plot_sort_check', { story: round.tale.slug, score: score.correct, total: score.total, attempt });
    drawBoard();
    const summary = `${score.correct} of ${score.total} in the right place`;
    $('[data-score]').textContent = summary;
    $('[data-message]').textContent = resultMessage(score);
    const tricky = $('[data-tricky]');
    tricky.hidden = score.perfect;
    tricky.textContent = `A tip for this story: ${round.tale.tricky}`;
    $('[data-fix]').hidden = score.perfect;
    const example = $<HTMLAnchorElement>('[data-example-link]');
    example.href = examplePath(round.tale);
    example.hidden = !score.perfect;
    result.hidden = false;
    live.textContent = `${summary}. ${resultMessage(score)} The reason is shown under each card.`;
    $('[data-result-title]').focus({ preventScroll: true });
    result.scrollIntoView({ block: 'nearest' });
  }

  // Take the cards that were wrong back off the mountain, and leave the right ones where they are.
  function fixMissed() {
    if (!round) return;
    for (const item of round.cards) if (!locked.has(item.id)) delete placed[item.id];
    checked = false;
    result.hidden = true;
    drawBoard();
    live.textContent = 'The cards you missed are back with the event cards. Try them again.';
    (trayCards.querySelector<HTMLElement>('[data-card]') ?? check).focus({ preventScroll: true });
  }

  function chooseStory() {
    round = null;
    selected = null;
    root!.classList.remove('has-card');
    showScreen('pick');
    $('#pd-choose').focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------- events */

  root.addEventListener('click', event => {
    const target = event.target as Element;
    const mode = target.closest<HTMLElement>('[data-mode]');
    if (mode) { showMode(mode.dataset.mode!); track('plot_diagram_mode', { mode: mode.dataset.mode! }); return; }

    // Build your own
    if (target.closest('[data-print-diagram]')) { track('plot_diagram_print', { stages: filledStages(diagram) }); window.print(); return; }
    if (target.closest('[data-copy-link]')) { copyLink(); return; }
    if (target.closest('[data-clear]')) {
      if (isEmptyDiagram(diagram)) { say('The diagram is already empty.'); return; }
      const before = diagram;
      setDiagram(emptyDiagram());
      undo = before;
      linkBox.hidden = true;
      say('Diagram cleared.', true);
      track('plot_diagram_clear');
      return;
    }
    if (target.closest('[data-undo]')) {
      if (undo) setDiagram(undo);
      undo = null;
      say('Your diagram is back.');
      $('[data-clear]').focus();
      return;
    }
    const big = target.closest<HTMLElement>('[data-big]');
    if (big) {
      const on = root.classList.toggle('is-big');
      big.setAttribute('aria-pressed', String(on));
      big.textContent = on ? 'Show the boxes to type in' : 'Bigger diagram';
      return;
    }
    if (target.closest('[data-restore]')) {
      if (backup) { const mine = backup; backup = null; setDiagram(mine); }
      sharedNote.hidden = true;
      say('This is your own diagram again.');
      return;
    }

    // Sort the events
    const story = target.closest<HTMLElement>('[data-story]');
    if (story) { startRound(story.dataset.story!); $('[data-sort-title]').focus({ preventScroll: true }); return; }
    const chosen = target.closest<HTMLButtonElement>('[data-card]');
    if (chosen) { if (!chosen.disabled) select(selected === Number(chosen.dataset.card) ? null : Number(chosen.dataset.card)); return; }
    const spot = target.closest<HTMLElement>('[data-place]') ?? target.closest<HTMLElement>('[data-zone]');
    if (spot) {
      if (selected === null) { live.textContent = 'Choose a card first.'; return; }
      place(selected, spot.dataset.place ?? spot.dataset.zone!);
      return;
    }
    if (target.closest('[data-drop]')) { select(null); return; }
    if (target.closest('[data-check]')) { checkBoard(); return; }
    if (target.closest('[data-fix]')) { fixMissed(); return; }
    if (target.closest('[data-restart]')) { if (round) { startRound(round.tale.slug, round.seed); $('[data-sort-title]').focus({ preventScroll: true }); } return; }
    if (target.closest('[data-change], [data-next-story]')) chooseStory();
  });

  // Keyboard: with a card chosen, 1 to 5 put it on a stage and Escape puts it down.
  document.addEventListener('keydown', event => {
    if (root.dataset.showing !== 'sort' || root.dataset.sorting !== 'play' || selected === null || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Escape') { const id = selected; select(null); root.querySelector<HTMLElement>(`[data-card="${id}"]`)?.focus(); return; }
    const stage = STAGES.find(item => String(item.number) === event.key);
    if (stage) { event.preventDefault(); place(selected, stage.id); }
  });

  // Dragging a card onto a stage does the same as choosing the card and then the stage.
  root.addEventListener('dragstart', event => {
    const dragged = (event.target as Element).closest?.<HTMLButtonElement>('[data-card]');
    if (!dragged || dragged.disabled) return;
    event.dataTransfer?.setData('text/plain', dragged.dataset.card!);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
    selected = Number(dragged.dataset.card);
    root.classList.add('has-card');
  });
  const dropTarget = (event: Event) => (event.target as Element).closest?.<HTMLElement>('[data-zone], [data-tray]') ?? null;
  root.addEventListener('dragover', event => {
    const over = dropTarget(event);
    if (!over || selected === null) return;
    event.preventDefault();
    for (const el of root.querySelectorAll('.is-over')) if (el !== over) el.classList.remove('is-over');
    over.classList.add('is-over');
  });
  root.addEventListener('dragend', () => { for (const el of root.querySelectorAll('.is-over')) el.classList.remove('is-over'); drawHand(); });
  root.addEventListener('drop', event => {
    const over = dropTarget(event);
    if (!over || selected === null) return;
    event.preventDefault();
    tray.classList.remove('is-over');
    place(selected, over.dataset.zone ?? 'tray');
  });

  /* -------------------------------------------------------------- start */

  const saved = load();
  backup = saved.backup;
  if (!isEmptyDiagram(saved.diagram)) { diagram = saved.diagram; writeFields(diagram); draw(); }
  else if (fields.some(field => field.value)) { diagram = readFields(); draw(); } // the browser kept the fields over a reload
  if (backup) showShared();
  showBest();
  showMode('build');
  showScreen('pick');
  takeShared();
  window.addEventListener('plotdiagramshared', takeShared);

  // A link can open the practice mode on one story, and on one exact round: ?story=cinderella&round=123456
  const params = new URLSearchParams(location.search);
  const wantedStory = params.get('story'), wantedRound = Number(params.get('round'));
  if (wantedStory && TALES.some(tale => tale.slug === wantedStory)) {
    if (Number.isInteger(wantedRound) && wantedRound > 0) startRound(wantedStory, wantedRound);
    else startRound(wantedStory);
  } else if (params.get('mode') === 'sort' || wantedStory) showMode('sort');
}
