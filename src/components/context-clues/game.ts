// The Context Clues Game in the browser. Rounds come from buildRound() in context-clues.mjs, so the same
// round number always gives the same ten sentences. Scores stay on this device (local storage).
import { LEVELS, ROUND_LENGTH, CLUE_TYPES, buildRound, checkAnswer, scoreRound, resultMessage, explain, words, meaningSentence, clueNote, clueType } from '../../lib/context-clues.mjs';
import { ICON, escapeHtml, sentenceHtml, revealHtml, againHtml, typeTagHtml } from '../../lib/context-clues-view.mjs';
import { track } from '../../lib/analytics';

type Question = ReturnType<typeof buildRound>[number];
const BEST_KEY = 'contextCluesBest';
const root = document.querySelector<HTMLElement>('[data-cc-game]');

if (root) {
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const screens = [...root.querySelectorAll<HTMLElement>('[data-screen]')];
  const card = $('[data-card]'), prompt = $('[data-prompt]'), sentence = $('[data-sentence]');
  const options = $('[data-answers="options"]'), wordPicks = $('[data-answers="words"]');
  const feedback = $('[data-feedback]'), verdict = $('[data-verdict]'), next = $<HTMLButtonElement>('[data-next]');
  const live = $('[data-live]');
  const dots = [...root.querySelectorAll<HTMLElement>('[data-dots] li')];

  let level = 1, seed = 0, round: Question[] = [], index = 0;
  let results: boolean[] = [], chosen: string[] = [], answered = false;

  const readBest = (): Record<string, number> => { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') || {}; } catch { return {}; } };
  function showBest() {
    const best = readBest();
    for (const el of root!.querySelectorAll<HTMLElement>('[data-best]')) {
      const score = best[el.dataset.best!];
      el.textContent = Number.isInteger(score) ? `Your best: ${score} out of ${ROUND_LENGTH}` : '';
    }
  }
  function show(name: string) {
    for (const screen of screens) screen.hidden = screen.dataset.screen !== name;
    root!.dataset.showing = name;
  }

  const promptFor = (question: Question) => {
    const word = `“${question.item.word}”`;
    if (question.mode === 'meaning') return `What does ${word} mean in this sentence?`;
    if (question.mode === 'clue') return `Tap a word that is a clue to what ${word} means.`;
    return `What type of clue tells you what ${word} means?`;
  };
  const optionButton = (text: string, i: number) => `<button type="button" class="cc-option" data-pick="${i}"><kbd aria-hidden="true">${i + 1}</kbd><span>${escapeHtml(text)}</span></button>`;

  function ask() {
    const question = round[index];
    const { item, mode } = question;
    answered = false;
    $('[data-number]').textContent = String(index + 1);
    prompt.textContent = promptFor(question);
    sentence.innerHTML = sentenceHtml(item);
    card.className = 'cc-card';
    feedback.hidden = true;
    options.hidden = mode === 'clue';
    wordPicks.hidden = mode !== 'clue';
    if (mode === 'meaning') {
      options.className = 'cc-options';
      options.innerHTML = question.options.map(optionButton).join('');
    } else if (mode === 'type') {
      options.className = 'cc-options cc-types';
      options.innerHTML = CLUE_TYPES.map((type, i) => optionButton(type.name, i)).join('');
    } else {
      // Every word is a button except the word being asked about.
      wordPicks.innerHTML = words(item).map((word, i) => (word.target
        ? `<span class="cc-pick is-target">${escapeHtml(word.text)}</span>`
        : `<button type="button" class="cc-pick" data-pick="${i}">${escapeHtml(word.text)}</button>`)).join('');
    }
    dots.forEach((dot, i) => { dot.className = i < index ? (results[i] ? 'is-right' : 'is-wrong') : i === index ? 'is-current' : ''; });
    card.focus({ preventScroll: true });
    // If the last explanation was scrolled into view, come back up to the top of the game for the new sentence.
    const top = root!.getBoundingClientRect().top;
    if (top < 0) window.scrollBy({ top });
  }

  function answer(pick: number, button: HTMLElement | null) {
    if (answered) return;
    answered = true;
    const question = round[index];
    const { item, mode } = question;
    const value = mode === 'type' ? CLUE_TYPES[pick]?.id : pick;
    const right = checkAnswer(question, value);
    results.push(right);
    const score = scoreRound(results);
    let streak = 0;
    for (let i = results.length - 1; i >= 0 && results[i]; i--) streak++;
    $('[data-score]').textContent = String(score.correct);
    $('[data-streak]').textContent = String(streak);
    dots[index].className = right ? 'is-right' : 'is-wrong';

    // Show the answer on the sentence itself: the clue and the signal word.
    sentence.innerHTML = revealHtml(item);
    card.classList.add('is-revealed');
    for (const b of (mode === 'clue' ? wordPicks : options).querySelectorAll<HTMLButtonElement>('button')) {
      const i = Number(b.dataset.pick);
      b.disabled = true;
      b.classList.toggle('is-answer', checkAnswer(question, mode === 'type' ? CLUE_TYPES[i].id : i));
    }
    button?.classList.add('is-chosen');
    const label = (button?.querySelector('span') ?? button)?.textContent ?? '';
    chosen.push(mode === 'clue' ? `You tapped “${label}”.` : mode === 'type' ? `You chose ${label.toLowerCase()}.` : `You chose “${label}”.`);

    verdict.innerHTML = `${right ? ICON.right : ICON.wrong}<span>${right ? 'Correct!' : 'Not quite.'}</span>`;
    verdict.className = `cc-verdict ${right ? 'is-right' : 'is-wrong'}`;
    $('[data-meaning]').textContent = meaningSentence(item);
    $('[data-type-tag]').innerHTML = typeTagHtml(item.type);
    $('[data-note]').textContent = clueNote(item);
    $('[data-again]').innerHTML = againHtml(item);
    next.textContent = index === ROUND_LENGTH - 1 ? 'See your results' : 'Next sentence';
    feedback.hidden = false;
    live.textContent = `${right ? 'Correct.' : 'Not quite.'} ${explain(item)}`;
    next.focus({ preventScroll: true });
    // On a small screen, bring the whole explanation and the Next button into view, without pushing the
    // verdict off the top.
    const box = feedback.getBoundingClientRect();
    const below = box.bottom + 12 - window.innerHeight;
    if (below > 0) window.scrollBy({ top: Math.min(below, Math.max(0, box.top - 8)) });
  }

  function finish() {
    const score = scoreRound(results);
    const best = readBest();
    if (!(best[level] >= score.correct)) {
      best[level] = score.correct;
      try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch { /* private mode: the score is just not kept */ }
    }
    track('context_clues_round_complete', { level, score: score.correct, streak: score.bestStreak });
    $('[data-final]').textContent = String(score.correct);
    $('[data-best-streak]').textContent = String(score.bestStreak);
    $('[data-message]').textContent = resultMessage(score);
    const missed = round.map((question, i) => ({ question, i })).filter(({ i }) => !results[i]);
    $('[data-missed]').innerHTML = missed.length
      ? `<h3>${missed.length === 1 ? 'The one you missed' : `The ${missed.length} you missed`}</h3><ol class="cc-missed">${missed.map(({ question, i }) => {
        const { item } = question;
        return `<li><p class="cc-sentence">${revealHtml(item)}</p><p>${escapeHtml(chosen[i])} ${escapeHtml(meaningSentence(item))} Clue type: ${escapeHtml(clueType(item.type).name.toLowerCase())}. ${escapeHtml(clueNote(item))}</p></li>`;
      }).join('')}</ol>`
      : '';
    const link = `${location.origin}${location.pathname}?level=${level}&round=${seed}`;
    $('[data-round-number]').textContent = String(seed);
    const anchor = $<HTMLAnchorElement>('[data-round-link]');
    anchor.href = link;
    anchor.textContent = link;
    showBest();
    show('results');
    $('[data-results-title]').focus({ preventScroll: true });
    root!.scrollIntoView({ block: 'nearest' });
  }

  function start(newLevel: number, newSeed = Math.floor(Math.random() * 900000) + 100000) {
    level = newLevel;
    seed = newSeed;
    round = buildRound(level, seed);
    index = 0;
    results = [];
    chosen = [];
    const info = LEVELS.find(item => item.id === level)!;
    $('[data-level-name]').textContent = `${info.name} · ${info.grades}`;
    $('[data-score]').textContent = '0';
    $('[data-streak]').textContent = '0';
    // For teachers' links and for testing: which round is on screen.
    root!.dataset.gameLevel = String(level);
    root!.dataset.gameRound = String(seed);
    track('context_clues_start', { level });
    show('play');
    ask();
    root!.scrollIntoView({ block: 'nearest' });
  }

  root.addEventListener('click', event => {
    const target = event.target as Element;
    const levelButton = target.closest<HTMLElement>('[data-level]');
    if (levelButton) return start(Number(levelButton.dataset.level));
    const pick = target.closest<HTMLElement>('[data-pick]');
    if (pick) return answer(Number(pick.dataset.pick), pick);
    if (target.closest('[data-next]')) { if (index === ROUND_LENGTH - 1) finish(); else { index++; ask(); } return; }
    if (target.closest('[data-again-round]')) return start(level);
    if (target.closest('[data-same]')) return start(level, seed);
    if (target.closest('[data-quit], [data-levels]')) { show('start'); root.querySelector<HTMLElement>(`[data-level="${level}"]`)?.focus(); }
  });

  // Keyboard: 1–5 choose a meaning or a type of clue. Words are tapped, or reached with Tab.
  document.addEventListener('keydown', event => {
    if (root.dataset.showing !== 'play' || answered || event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((event.target as Element).tagName)) return;
    if (round[index].mode === 'clue' || !/^[1-9]$/.test(event.key)) return;
    const button = options.querySelector<HTMLElement>(`[data-pick="${Number(event.key) - 1}"]`);
    if (button) answer(Number(event.key) - 1, button);
  });

  showBest();
  show('start');
  // A link from a teacher can open one exact round: ?level=2&round=123456
  const params = new URLSearchParams(location.search);
  const wantedLevel = Number(params.get('level')), wantedRound = Number(params.get('round'));
  if (LEVELS.some(item => item.id === wantedLevel)) {
    if (Number.isInteger(wantedRound) && wantedRound > 0) start(wantedLevel, wantedRound);
    else start(wantedLevel);
  }
}
