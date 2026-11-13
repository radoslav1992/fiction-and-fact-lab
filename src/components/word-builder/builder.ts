// The Word Builder in the browser: build mode (tiles around a base word) and challenge mode (seeded rounds of
// ten). Every word, meaning and spelling comes from word-builder.mjs. Scores and the list of words a student
// has built stay on this device (local storage).
import { LEVELS, ROUND_LENGTH, levelById, buildableFor, middlesFor, tilesFor, lookup, familyOf, buildRound, checkAnswer, scoreRound, resultMessage, explain } from '../../lib/word-builder.mjs';
import { ICON, escapeHtml, textHtml, tilesHtml, middleOptionsHtml, resultHtml, cutterHtml, splitHtml, cutText } from '../../lib/word-builder-view.mjs';
import { track } from '../../lib/analytics';

type Question = ReturnType<typeof buildRound>[number];
const BEST_KEY = 'wordBuilderBest', FOUND_KEY = 'wordBuilderFound';
const root = document.querySelector<HTMLElement>('[data-word-builder]');

if (root) {
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const panels = [...root.querySelectorAll<HTMLElement>('[data-panel]')];
  const screens = [...root.querySelectorAll<HTMLElement>('[data-screen]')];
  const middleSelect = $<HTMLSelectElement>('[data-middle]');
  const beforeTiles = $('[data-tiles="before"]'), afterTiles = $('[data-tiles="after"]'), result = $('[data-result]');
  const card = $('[data-card]'), prompt = $('[data-prompt]'), shown = $('[data-shown]'), cutter = $('[data-cutter]'), hint = $('[data-hint]');
  const optionBox = $('[data-options]'), checkRow = $('[data-check-row]'), checkButton = $<HTMLButtonElement>('[data-check]');
  const feedback = $('[data-feedback]'), verdict = $('[data-verdict]'), next = $<HTMLButtonElement>('[data-next]'), live = $('[data-live]');
  const dots = [...root.querySelectorAll<HTMLElement>('[data-dots] li')];

  let level = 1, mode = 'build';
  let before: string | null = 'un-', middle = 'happy', after: string | null = null;
  let seed = 0, round: Question[] = [], index = 0, results: boolean[] = [], chosen: string[] = [], answered = false;
  let places: number[] = [];
  const tracked = new Set<number>();
  // The word on screen when the page loads was not built by the student, so it does not count as found.
  let touched = false;

  const read = <T,>(key: string, empty: T): T => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? empty; } catch { return empty; } };
  const write = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: it is just not kept */ } };
  let found = new Set<string>(read<string[]>(FOUND_KEY, []));

  /* ------------------------------------------------------------- build */
  function showFound() {
    const family = familyOf(level, middle);
    const here = family.filter(word => found.has(word.word));
    const total = buildableFor(level).filter(word => found.has(word.word)).length;
    $('[data-found-line]').innerHTML = `Built on “${escapeHtml(middle)}”: <b>${here.length} of ${family.length}</b>${here.length ? ` (${here.map(word => escapeHtml(word.word)).join(', ')})` : ''}. At this level you have built <b>${total} of ${buildableFor(level).length}</b> words.`;
  }

  function drawResult() {
    result.innerHTML = resultHtml(level, before, middle, after);
    const word = lookup(level, before, middle, after);
    if (touched && word && (before || after) && !found.has(word.word)) {
      found.add(word.word);
      write(FOUND_KEY, [...found]);
      if (!tracked.has(level)) { tracked.add(level); track('word_builder_build', { level }); }
    }
    showFound();
  }

  function drawBoard() {
    const tiles = tilesFor(level, middle);
    if (!tiles.before.some(tile => tile.label === before)) before = null;
    if (!tiles.after.some(tile => tile.label === after)) after = null;
    beforeTiles.innerHTML = tilesHtml(tiles.before, 'before', before);
    afterTiles.innerHTML = tilesHtml(tiles.after, 'after', after);
    drawResult();
  }

  function setLevel(newLevel: number, keepMiddle = false) {
    level = newLevel;
    for (const button of root!.querySelectorAll<HTMLElement>('[data-level]')) button.setAttribute('aria-pressed', String(Number(button.dataset.level) === level));
    const info = levelById(level);
    $('[data-level-about]').innerHTML = `${escapeHtml(info.about)} <span class="wb-count">${buildableFor(level).length} words to build.</span>`;
    $('[data-middle-label]').textContent = level === 3 ? 'Root' : 'Base word';
    const middles = middlesFor(level);
    if (!keepMiddle || !middles.some(item => item.text === middle)) { middle = level === 1 ? 'happy' : level === 2 ? 'agree' : 'port'; before = null; after = null; }
    middleSelect.innerHTML = middleOptionsHtml(level, middle);
    drawBoard();
    root!.dataset.currentLevel = String(level);
    showBest();
    if (mode === 'challenge') showScreen('start');
  }

  function setMode(newMode: string) {
    mode = newMode;
    for (const button of root!.querySelectorAll<HTMLElement>('.wb-mode')) button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
    for (const panel of panels) panel.hidden = panel.dataset.panel !== mode;
    root!.dataset.currentMode = mode;
    if (mode === 'challenge') showScreen('start');
  }

  /* --------------------------------------------------------- challenge */
  const readBest = () => read<Record<string, number>>(BEST_KEY, {});
  function showBest() {
    const score = readBest()[level];
    $('[data-best]').textContent = Number.isInteger(score) ? `Your best at ${levelById(level).name}: ${score} out of ${ROUND_LENGTH}` : '';
  }
  function showScreen(name: string) {
    for (const screen of screens) screen.hidden = screen.dataset.screen !== name;
    root!.dataset.showing = name;
  }

  function updateCuts() {
    const question = round[index];
    const needed = question.word.parts.length - 1;
    for (const gap of cutter.querySelectorAll<HTMLElement>('[data-gap]')) gap.setAttribute('aria-pressed', String(places.includes(Number(gap.dataset.gap))));
    checkButton.disabled = places.length !== needed;
    hint.textContent = places.length === needed ? 'Ready. Press Check.' : `Tap between two letters to cut the word there. Cuts made: ${places.length} of ${needed}.`;
  }

  function ask() {
    const question = round[index];
    answered = false;
    places = [];
    $('[data-number]').textContent = String(index + 1);
    prompt.textContent = question.prompt;
    card.className = 'wb-card';
    feedback.hidden = true;
    const breaking = question.kind === 'break';
    shown.hidden = question.kind !== 'part';
    shown.textContent = question.shown ?? '';
    cutter.hidden = !breaking;
    hint.hidden = !breaking;
    checkRow.hidden = !breaking;
    optionBox.hidden = breaking;
    if (breaking) {
      optionBox.innerHTML = '';
      cutter.innerHTML = cutterHtml(question.word.word);
      updateCuts();
    } else {
      cutter.innerHTML = '';
      optionBox.innerHTML = question.options.map((option: string, i: number) => `<button type="button" class="wb-option" data-option="${i}"><kbd aria-hidden="true">${i + 1}</kbd><span>${escapeHtml(option)}</span></button>`).join('');
    }
    dots.forEach((dot, i) => { dot.className = i < index ? (results[i] ? 'is-right' : 'is-wrong') : i === index ? 'is-current' : ''; });
    card.focus({ preventScroll: true });
  }

  function answer(value: string | number[], button: HTMLElement | null = null) {
    if (answered) return;
    answered = true;
    const question = round[index];
    const right = checkAnswer(question, value);
    results.push(right);
    chosen.push(Array.isArray(value) ? cutText(question.word.word, value) : value);
    $('[data-score]').textContent = String(scoreRound(results).correct);
    dots[index].className = right ? 'is-right' : 'is-wrong';
    card.classList.add('is-revealed');
    for (const b of optionBox.querySelectorAll<HTMLButtonElement>('button')) {
      b.disabled = true;
      b.classList.toggle('is-answer', question.options?.[Number(b.dataset.option)] === question.answer);
    }
    button?.classList.add('is-chosen');
    for (const gap of cutter.querySelectorAll<HTMLButtonElement>('button')) {
      gap.disabled = true;
      gap.classList.toggle('is-answer', question.kind === 'break' && question.answer.includes(Number(gap.dataset.gap)));
    }
    checkRow.hidden = true;
    hint.hidden = true;
    verdict.innerHTML = `${right ? ICON.right : ICON.wrong}<span>${right ? 'Correct!' : 'Not quite.'}</span>`;
    verdict.className = `wb-verdict ${right ? 'is-right' : 'is-wrong'}`;
    $('[data-split]').innerHTML = splitHtml(question.word);
    $('[data-why]').innerHTML = textHtml(explain(question.word));
    next.textContent = index === ROUND_LENGTH - 1 ? 'See your results' : 'Next question';
    feedback.hidden = false;
    live.textContent = `${right ? 'Correct.' : 'Not quite.'} ${explain(question.word)}`;
    next.focus({ preventScroll: true });
    const below = feedback.getBoundingClientRect().bottom + 12 - window.innerHeight;
    if (below > 0) window.scrollBy({ top: Math.min(below, Math.max(0, card.getBoundingClientRect().top - 8)) || below });
  }

  function finish() {
    const score = scoreRound(results);
    const best = readBest();
    if (!(best[level] >= score.correct)) { best[level] = score.correct; write(BEST_KEY, best); }
    track('word_builder_round_complete', { level, score: score.correct });
    $('[data-final]').textContent = String(score.correct);
    $('[data-message]').textContent = resultMessage(score);
    const missed = round.map((question, i) => ({ question, i })).filter(({ i }) => !results[i]);
    $('[data-missed]').innerHTML = missed.length
      ? `<h3>${missed.length === 1 ? 'The one you missed' : `The ${missed.length} you missed`}</h3><ol class="wb-missed">${missed.map(({ question, i }) => `<li><p><strong>${escapeHtml(question.prompt)}</strong></p><p class="wb-line">${splitHtml(question.word)}</p><p>You answered “${textHtml(chosen[i])}”. ${textHtml(explain(question.word))}</p></li>`).join('')}</ol>`
      : '';
    const link = `${location.origin}${location.pathname}?mode=challenge&level=${level}&round=${seed}`;
    $('[data-round-number]').textContent = String(seed);
    const anchor = $<HTMLAnchorElement>('[data-round-link]');
    anchor.href = link;
    anchor.textContent = link;
    showBest();
    showScreen('results');
    $('[data-results-title]').focus({ preventScroll: true });
    root!.scrollIntoView({ block: 'nearest' });
  }

  function start(newSeed = Math.floor(Math.random() * 900000) + 100000) {
    seed = newSeed;
    round = buildRound(level, seed);
    index = 0;
    results = [];
    chosen = [];
    const info = levelById(level);
    $('[data-level-name]').textContent = `${info.name} · ${info.grades}`;
    $('[data-score]').textContent = '0';
    // For teachers' links and for testing: which round is on screen.
    root!.dataset.gameRound = String(seed);
    track('word_builder_start', { level });
    showScreen('play');
    ask();
    root!.scrollIntoView({ block: 'nearest' });
  }

  /* ------------------------------------------------------------ events */
  root.addEventListener('click', event => {
    const target = event.target as Element;
    const levelButton = target.closest<HTMLElement>('[data-level]');
    if (levelButton) return setLevel(Number(levelButton.dataset.level));
    const modeButton = target.closest<HTMLElement>('[data-mode]');
    if (modeButton) { setMode(modeButton.dataset.mode!); if (modeButton.closest('[data-screen]')) root.querySelector<HTMLElement>('.wb-mode[data-mode="build"]')?.focus(); return; }
    const tile = target.closest<HTMLElement>('[data-tile]');
    if (tile) {
      touched = true;
      const label = tile.dataset.tile!;
      if (tile.dataset.side === 'before') before = before === label ? null : label; else after = after === label ? null : label;
      for (const other of tile.parentElement!.querySelectorAll<HTMLElement>('[data-tile]')) other.setAttribute('aria-pressed', String(other.dataset.tile === (tile.dataset.side === 'before' ? before : after)));
      return drawResult();
    }
    if (target.closest('[data-another]')) {
      touched = true;
      const middles = middlesFor(level);
      middle = middles[(middles.findIndex(item => item.text === middle) + 1) % middles.length].text;
      middleSelect.value = middle;
      before = null;
      after = null;
      return drawBoard();
    }
    if (target.closest('[data-start], [data-again]')) return start();
    if (target.closest('[data-same]')) return start(seed);
    if (target.closest('[data-quit]')) { showScreen('start'); return $('[data-start]').focus(); }
    const option = target.closest<HTMLElement>('[data-option]');
    if (option) return answer(round[index].options[Number(option.dataset.option)], option);
    const gap = target.closest<HTMLElement>('[data-gap]');
    if (gap && !answered) {
      const place = Number(gap.dataset.gap);
      places = places.includes(place) ? places.filter(p => p !== place) : [...places, place];
      return updateCuts();
    }
    if (target.closest('[data-clear]')) { places = []; return updateCuts(); }
    if (target.closest('[data-check]')) return answer([...places].sort((a, b) => a - b));
    if (target.closest('[data-next]')) { if (index === ROUND_LENGTH - 1) finish(); else { index++; ask(); } }
  });

  middleSelect.addEventListener('change', () => {
    touched = true;
    middle = middleSelect.value;
    before = null;
    after = null;
    drawBoard();
  });

  // Keyboard: 1 to 4 choose an answer in a challenge question.
  document.addEventListener('keydown', event => {
    if (mode !== 'challenge' || root.dataset.showing !== 'play' || answered || event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((event.target as Element).tagName) || !/^[1-4]$/.test(event.key)) return;
    const button = optionBox.hidden ? null : optionBox.querySelector<HTMLElement>(`[data-option="${Number(event.key) - 1}"]`);
    if (button) answer(round[index].options[Number(button.dataset.option)], button);
  });

  // A link can open a level, and a teacher's link can open one exact round: ?mode=challenge&level=2&round=123456
  const params = new URLSearchParams(location.search);
  const wantedLevel = Number(params.get('level')), wantedRound = Number(params.get('round'));
  setLevel(LEVELS.some(item => item.id === wantedLevel) ? wantedLevel : 1, true);
  if (params.get('mode') === 'challenge') {
    setMode('challenge');
    if (Number.isInteger(wantedRound) && wantedRound > 0) start(wantedRound);
  } else {
    setMode('build');
  }
}
