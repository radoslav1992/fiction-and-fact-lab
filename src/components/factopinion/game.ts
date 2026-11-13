// The Fact or Opinion Game in the browser. Rounds come from buildRound() in fact-opinion.mjs, so the same
// round number always gives the same ten statements. Scores stay on this device (local storage).
import { LEVELS, ROUND_LENGTH, buildRound, checkAnswer, scoreRound, resultMessage, explain, parts, words } from '../../lib/fact-opinion.mjs';
import { ICON, KIND_NAME, escapeHtml, revealHtml } from '../../lib/fact-opinion-view.mjs';
import { track } from '../../lib/analytics';

type Question = ReturnType<typeof buildRound>[number];
const BEST_KEY = 'factOpinionBest';
const root = document.querySelector<HTMLElement>('[data-game]');

if (root) {
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const screens = [...root.querySelectorAll<HTMLElement>('[data-screen]')];
  const card = $('[data-card]'), prompt = $('[data-prompt]'), statement = $('[data-statement]');
  const sortButtons = $('[data-answers="sort"]'), picks = $('[data-answers="pick"]');
  const feedback = $('[data-feedback]'), verdict = $('[data-verdict]'), why = $('[data-why]'), next = $<HTMLButtonElement>('[data-next]');
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

  const PROMPTS = { sort: 'Fact or opinion?', part: 'One part of this sentence is an opinion. Tap that part.', clue: 'Tap a clue word that tells you part of this sentence is an opinion.' };

  function ask() {
    const { item, mode } = round[index];
    answered = false;
    $('[data-number]').textContent = String(index + 1);
    prompt.textContent = PROMPTS[mode];
    statement.textContent = item.text;
    card.className = 'fo-card';
    feedback.hidden = true;
    sortButtons.hidden = mode !== 'sort';
    picks.hidden = mode === 'sort';
    for (const button of sortButtons.querySelectorAll('button')) { button.disabled = false; button.classList.remove('is-chosen', 'is-answer'); }
    if (mode === 'part') {
      picks.className = 'fo-picks fo-parts';
      picks.innerHTML = parts(item).map((part, i) => `<button type="button" class="fo-pick" data-pick="${i}"><kbd aria-hidden="true">${i + 1}</kbd><span>${escapeHtml(part.text.replace(/^[\s,]+|[\s,.]+$/g, ''))}</span></button>`).join('');
    } else if (mode === 'clue') {
      picks.className = 'fo-picks fo-words';
      picks.innerHTML = words(item).map((word, i) => `<button type="button" class="fo-pick" data-pick="${i}">${escapeHtml(word.text)}</button>`).join('');
    }
    dots.forEach((dot, i) => { dot.className = i < index ? (results[i] ? 'is-right' : 'is-wrong') : i === index ? 'is-current' : ''; });
    card.focus({ preventScroll: true });
  }

  function answer(value: string | number, button: HTMLElement | null) {
    if (answered) return;
    answered = true;
    const question = round[index];
    const { item, mode } = question;
    const right = checkAnswer(question, value);
    results.push(right);
    const score = scoreRound(results);
    let streak = 0;
    for (let i = results.length - 1; i >= 0 && results[i]; i--) streak++;
    $('[data-score]').textContent = String(score.correct);
    $('[data-streak]').textContent = String(streak);
    dots[index].className = right ? 'is-right' : 'is-wrong';

    // Show the answer on the statement itself: clue words, and the fact and opinion parts.
    statement.innerHTML = revealHtml(item);
    card.classList.add('is-revealed');
    const buttons = [...(mode === 'sort' ? sortButtons : picks).querySelectorAll<HTMLButtonElement>('button')];
    buttons.forEach((b, i) => {
      b.disabled = true;
      const correct = mode === 'sort' ? b.dataset.answer === item.kind : checkAnswer(question, i);
      b.classList.toggle('is-answer', correct);
    });
    button?.classList.add('is-chosen');
    chosen.push(mode === 'sort' ? KIND_NAME[value as 'fact' | 'opinion'] : `“${(button?.querySelector('span') ?? button)?.textContent ?? ''}”`);

    verdict.innerHTML = `${right ? ICON.right : ICON.wrong}<span>${right ? 'Correct!' : 'Not quite.'}</span>`;
    verdict.className = `fo-verdict ${right ? 'is-right' : 'is-wrong'}`;
    why.textContent = explain(item);
    next.textContent = index === ROUND_LENGTH - 1 ? 'See your results' : 'Next statement';
    feedback.hidden = false;
    live.textContent = `${right ? 'Correct.' : 'Not quite.'} ${explain(item)}`;
    next.focus({ preventScroll: true });
    // Bring the explanation into view on a small screen, keeping the statement on screen if it fits.
    const below = feedback.getBoundingClientRect().bottom + 12 - window.innerHeight;
    if (below > 0) window.scrollBy({ top: Math.min(below, Math.max(0, card.getBoundingClientRect().top - 8)) || below });
  }

  function finish() {
    const score = scoreRound(results);
    const best = readBest();
    if (!(best[level] >= score.correct)) {
      best[level] = score.correct;
      try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch { /* private mode: the score is just not kept */ }
    }
    track('fact_opinion_round_complete', { level, score: score.correct, streak: score.bestStreak });
    $('[data-final]').textContent = String(score.correct);
    $('[data-best-streak]').textContent = String(score.bestStreak);
    $('[data-message]').textContent = resultMessage(score);
    const missed = round.map((question, i) => ({ question, i })).filter(({ i }) => !results[i]);
    $('[data-missed]').innerHTML = missed.length
      ? `<h3>${missed.length === 1 ? 'The one you missed' : `The ${missed.length} you missed`}</h3><ol class="fo-missed">${missed.map(({ question, i }) => `<li><p class="fo-statement">${revealHtml(question.item)}</p><p>You chose ${escapeHtml(chosen[i])}. ${escapeHtml(explain(question.item))}</p></li>`).join('')}</ol>`
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
    track('fact_opinion_start', { level });
    show('play');
    ask();
    root!.scrollIntoView({ block: 'nearest' });
  }

  root.addEventListener('click', event => {
    const target = event.target as Element;
    const levelButton = target.closest<HTMLElement>('[data-level]');
    if (levelButton) return start(Number(levelButton.dataset.level));
    const sort = target.closest<HTMLElement>('[data-answer]');
    if (sort) return answer(sort.dataset.answer!, sort);
    const pick = target.closest<HTMLElement>('[data-pick]');
    if (pick) return answer(Number(pick.dataset.pick), pick);
    if (target.closest('[data-next]')) { if (index === ROUND_LENGTH - 1) finish(); else { index++; ask(); } return; }
    if (target.closest('[data-again]')) return start(level);
    if (target.closest('[data-same]')) return start(level, seed);
    if (target.closest('[data-quit], [data-levels]')) { show('start'); root.querySelector<HTMLElement>(`[data-level="${level}"]`)?.focus(); }
  });

  // Keyboard: F and O answer a "fact or opinion?" question, 1–3 choose a part of a mixed sentence.
  document.addEventListener('keydown', event => {
    if (root.dataset.showing !== 'play' || answered || event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((event.target as Element).tagName)) return;
    const { mode } = round[index];
    const key = event.key.toLowerCase();
    if (mode === 'sort' && (key === 'f' || key === 'o')) {
      const kind = key === 'f' ? 'fact' : 'opinion';
      answer(kind, sortButtons.querySelector<HTMLElement>(`[data-answer="${kind}"]`));
    } else if (mode === 'part' && /^[1-9]$/.test(key)) {
      const button = picks.querySelector<HTMLElement>(`[data-pick="${Number(key) - 1}"]`);
      if (button) answer(Number(key) - 1, button);
    }
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
