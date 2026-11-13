// The Figurative Language Game in the browser. Rounds come from buildRound() in figurative-language.mjs,
// so the same round number always gives the same ten questions. Scores stay on this device (local storage).
import { LEVELS, ROUND_LENGTH, buildRound, checkAnswer, scoreRound, resultMessage, explain, choiceText } from '../../lib/figurative-language.mjs';
import { ICON, escapeHtml, revealHtml } from '../../lib/figurative-language-view.mjs';
import { track } from '../../lib/analytics';

type Question = ReturnType<typeof buildRound>[number];
const BEST_KEY = 'figurativeLanguageBest';
const root = document.querySelector<HTMLElement>('[data-game]');

if (root) {
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const screens = [...root.querySelectorAll<HTMLElement>('[data-screen]')];
  const card = $('[data-card]'), prompt = $('[data-prompt]'), sentence = $('[data-sentence]');
  const picks = $('[data-answers]');
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
    if (mode === 'device') return level === 1 ? 'Simile, metaphor or literal?' : 'Which kind of figurative language is it?';
    return item.device === 'idiom' ? `What does “${item.signal[0]}” mean here?` : 'What does the speaker really mean?';
  };

  function ask() {
    const question = round[index];
    const { item, mode, choices } = question;
    answered = false;
    $('[data-number]').textContent = String(index + 1);
    prompt.textContent = promptFor(question);
    sentence.textContent = item.text;
    card.className = 'fl-card';
    feedback.hidden = true;
    picks.className = `fl-picks is-${mode}`;
    picks.innerHTML = choices.map((choice, i) => `<button type="button" class="fl-pick" data-pick="${i}"><kbd aria-hidden="true">${i + 1}</kbd><span>${escapeHtml(choiceText(question, choice))}</span></button>`).join('');
    dots.forEach((dot, i) => { dot.className = i < index ? (results[i] ? 'is-right' : 'is-wrong') : i === index ? 'is-current' : ''; });
    card.focus({ preventScroll: true });
  }

  /** `position` is the place of the choice on screen: 0 for the first button. */
  function answer(position: number) {
    const question = round[index];
    if (answered || !(position in question.choices)) return;
    answered = true;
    const { item, choices } = question;
    const right = checkAnswer(question, choices[position]);
    results.push(right);
    const score = scoreRound(results);
    let streak = 0;
    for (let i = results.length - 1; i >= 0 && results[i]; i--) streak++;
    $('[data-score]').textContent = String(score.correct);
    $('[data-streak]').textContent = String(streak);
    dots[index].className = right ? 'is-right' : 'is-wrong';

    // Show the answer on the sentence itself: the signal words.
    sentence.innerHTML = revealHtml(item);
    card.classList.add('is-revealed');
    [...picks.querySelectorAll<HTMLButtonElement>('button')].forEach((b, i) => {
      b.disabled = true;
      b.classList.toggle('is-answer', checkAnswer(question, choices[i]));
      b.classList.toggle('is-chosen', i === position);
    });
    chosen.push(choiceText(question, choices[position]));

    verdict.innerHTML = `${right ? ICON.right : ICON.wrong}<span>${right ? 'Correct!' : 'Not quite.'}</span>`;
    verdict.className = `fl-verdict ${right ? 'is-right' : 'is-wrong'}`;
    why.textContent = explain(item);
    next.textContent = index === ROUND_LENGTH - 1 ? 'See your results' : 'Next question';
    feedback.hidden = false;
    live.textContent = `${right ? 'Correct.' : 'Not quite.'} ${explain(item)}`;
    next.focus({ preventScroll: true });
    // Bring the explanation and the Next button into view on a small screen. The sentence stays on screen
    // too whenever the two fit together.
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
    track('figurative_language_round_complete', { level, score: score.correct, streak: score.bestStreak });
    $('[data-final]').textContent = String(score.correct);
    $('[data-best-streak]').textContent = String(score.bestStreak);
    $('[data-message]').textContent = resultMessage(score);
    const missed = round.map((question, i) => ({ question, i })).filter(({ i }) => !results[i]);
    $('[data-missed]').innerHTML = missed.length
      ? `<h3>${missed.length === 1 ? 'The one you missed' : `The ${missed.length} you missed`}</h3><ol class="fl-missed">${missed.map(({ question, i }) => `<li><p class="fl-sentence">${revealHtml(question.item)}</p><p>You chose “${escapeHtml(chosen[i])}”. ${escapeHtml(explain(question.item))}</p></li>`).join('')}</ol>`
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
    track('figurative_language_start', { level });
    show('play');
    ask();
    root!.scrollIntoView({ block: 'nearest' });
  }

  root.addEventListener('click', event => {
    const target = event.target as Element;
    const levelButton = target.closest<HTMLElement>('[data-level]');
    if (levelButton) return start(Number(levelButton.dataset.level));
    const pick = target.closest<HTMLElement>('[data-pick]');
    if (pick) return answer(Number(pick.dataset.pick));
    if (target.closest('[data-next]')) { if (index === ROUND_LENGTH - 1) finish(); else { index++; ask(); } return; }
    if (target.closest('[data-again]')) return start(level);
    if (target.closest('[data-same]')) return start(level, seed);
    if (target.closest('[data-quit], [data-levels]')) { show('start'); root.querySelector<HTMLElement>(`[data-level="${level}"]`)?.focus(); }
  });

  // Keyboard: the number keys choose an answer.
  document.addEventListener('keydown', event => {
    if (root.dataset.showing !== 'play' || answered || event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((event.target as Element).tagName)) return;
    if (/^[1-9]$/.test(event.key)) answer(Number(event.key) - 1);
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
