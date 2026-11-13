// The Fiction or Nonfiction Game in the browser. Rounds come from buildRound() in fiction-or-nonfiction.mjs,
// so the same round number always gives the same ten questions. Scores stay on this device (local storage).
import { LEVELS, ROUND_LENGTH, buildRound, checkAnswer, scoreRound, resultMessage, explain, answerOf, answerName } from '../../lib/fiction-or-nonfiction.mjs';
import { ICON, escapeHtml, revealHtml } from '../../lib/fiction-or-nonfiction-view.mjs';
import { track } from '../../lib/analytics';

type Question = ReturnType<typeof buildRound>[number];
const BEST_KEY = 'fictionNonfictionBest';
const root = document.querySelector<HTMLElement>('[data-game]');

if (root) {
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const screens = [...root.querySelectorAll<HTMLElement>('[data-screen]')];
  const card = $('[data-card]'), prompt = $('[data-prompt]'), text = $('[data-text]');
  const sortButtons = $('[data-answers="sort"]'), picks = $('[data-answers="genre"]');
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

  const promptFor = ({ item, mode }: Question) => {
    const question = mode === 'sort' ? 'Fiction or nonfiction?' : 'Which genre is it?';
    return item.form === 'description' ? `A book is described. ${question}` : question;
  };
  // Short texts are set large; passages and poems are set as reading text.
  const textClass = (item: Question['item']) => `fn-text${item.text.length > 110 ? ' is-long' : ''}${item.text.includes('\n') ? ' is-poem' : ''}`;

  function ask() {
    const question = round[index];
    const { item, mode, choices } = question;
    answered = false;
    $('[data-number]').textContent = String(index + 1);
    prompt.textContent = promptFor(question);
    text.textContent = item.text;
    text.className = textClass(item);
    card.className = 'fn-card';
    feedback.hidden = true;
    sortButtons.hidden = mode !== 'sort';
    picks.hidden = mode === 'sort';
    for (const button of sortButtons.querySelectorAll('button')) { button.disabled = false; button.classList.remove('is-chosen', 'is-answer'); }
    if (mode === 'genre') {
      picks.innerHTML = choices.map((id, i) => `<button type="button" class="fn-pick" data-answer="${id}"><kbd aria-hidden="true">${i + 1}</kbd><span>${escapeHtml(answerName(id))}</span></button>`).join('');
    }
    dots.forEach((dot, i) => { dot.className = i < index ? (results[i] ? 'is-right' : 'is-wrong') : i === index ? 'is-current' : ''; });
    card.focus({ preventScroll: true });
  }

  function answer(value: string, button: HTMLElement | null) {
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

    // Show the answer on the text itself: the words that give it away.
    text.innerHTML = revealHtml(item);
    card.classList.add('is-revealed');
    for (const b of (mode === 'sort' ? sortButtons : picks).querySelectorAll<HTMLButtonElement>('button')) {
      b.disabled = true;
      b.classList.toggle('is-answer', b.dataset.answer === answerOf(item));
    }
    button?.classList.add('is-chosen');
    chosen.push(answerName(value));

    verdict.innerHTML = `${right ? ICON.right : ICON.wrong}<span>${right ? 'Correct!' : 'Not quite.'}</span>`;
    verdict.className = `fn-verdict ${right ? 'is-right' : 'is-wrong'}`;
    why.textContent = explain(item);
    next.textContent = index === ROUND_LENGTH - 1 ? 'See your results' : 'Next question';
    feedback.hidden = false;
    live.textContent = `${right ? 'Correct.' : 'Not quite.'} ${explain(item)}`;
    next.focus({ preventScroll: true });
    // Bring the explanation and the Next button into view on a small screen. The text stays on screen too
    // whenever the two fit together.
    const below = feedback.getBoundingClientRect().bottom + 12 - window.innerHeight;
    if (below > 0) window.scrollBy({ top: below });
  }

  function finish() {
    const score = scoreRound(results);
    const best = readBest();
    if (!(best[level] >= score.correct)) {
      best[level] = score.correct;
      try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch { /* private mode: the score is just not kept */ }
    }
    track('fiction_nonfiction_round_complete', { level, score: score.correct, streak: score.bestStreak });
    $('[data-final]').textContent = String(score.correct);
    $('[data-best-streak]').textContent = String(score.bestStreak);
    $('[data-message]').textContent = resultMessage(score);
    const missed = round.map((question, i) => ({ question, i })).filter(({ i }) => !results[i]);
    $('[data-missed]').innerHTML = missed.length
      ? `<h3>${missed.length === 1 ? 'The one you missed' : `The ${missed.length} you missed`}</h3><ol class="fn-missed">${missed.map(({ question, i }) => `<li><p class="${textClass(question.item)}">${revealHtml(question.item)}</p><p>You chose ${escapeHtml(chosen[i])}. ${escapeHtml(explain(question.item))}</p></li>`).join('')}</ol>`
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
    track('fiction_nonfiction_start', { level });
    show('play');
    ask();
    root!.scrollIntoView({ block: 'nearest' });
  }

  root.addEventListener('click', event => {
    const target = event.target as Element;
    const levelButton = target.closest<HTMLElement>('[data-level]');
    if (levelButton) return start(Number(levelButton.dataset.level));
    const choice = target.closest<HTMLElement>('[data-answer]');
    if (choice) return answer(choice.dataset.answer!, choice);
    if (target.closest('[data-next]')) { if (index === ROUND_LENGTH - 1) finish(); else { index++; ask(); } return; }
    if (target.closest('[data-again]')) return start(level);
    if (target.closest('[data-same]')) return start(level, seed);
    if (target.closest('[data-quit], [data-levels]')) { show('start'); root.querySelector<HTMLElement>(`[data-level="${level}"]`)?.focus(); }
  });

  // Keyboard: F and N answer a "fiction or nonfiction?" question, 1–6 choose a genre.
  document.addEventListener('keydown', event => {
    if (root.dataset.showing !== 'play' || answered || event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((event.target as Element).tagName)) return;
    const { mode, choices } = round[index];
    const key = event.key.toLowerCase();
    const value = mode === 'sort' ? ({ f: 'fiction', n: 'nonfiction' } as Record<string, string>)[key] : /^[1-9]$/.test(key) ? choices[Number(key) - 1] : undefined;
    if (!value) return;
    answer(value, (mode === 'sort' ? sortButtons : picks).querySelector<HTMLElement>(`[data-answer="${value}"]`));
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
