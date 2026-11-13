// The Cause and Effect Game in the browser. Rounds come from buildRound() in cause-and-effect.mjs, so the
// same round number always gives the same ten questions. Scores stay on this device (local storage).
import { LEVELS, ROUND_LENGTH, buildRound, checkAnswer, scoreRound, resultMessage, explain, answerLine, whyNot, parts, words, sentenceCase } from '../../lib/cause-and-effect.mjs';
import { ICON, escapeHtml, revealHtml, chainHtml, pairsHtml } from '../../lib/cause-and-effect-view.mjs';
import { track } from '../../lib/analytics';

// A question, loosely typed: sentences have `item`, the matching question has `items` and `order`, and the
// paragraph questions of level 3 also have `prompt`, `options` and `answer`.
interface Item { id: string; text: string; cause: string; effect: string }
interface Question { mode: string; item: Item; items: Item[]; order: number[]; prompt: string; options: string[]; answer: string }
const BEST_KEY = 'causeEffectBest';
const root = document.querySelector<HTMLElement>('[data-ce-game]');

if (root) {
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const screens = [...root.querySelectorAll<HTMLElement>('[data-screen]')];
  const card = $('[data-card]'), prompt = $('[data-prompt]'), statement = $('[data-statement]');
  const picks = $('[data-answers]');
  const feedback = $('[data-feedback]'), verdict = $('[data-verdict]'), why = $('[data-why]'), diagram = $('[data-diagram]'), next = $<HTMLButtonElement>('[data-next]');
  const live = $('[data-live]');
  const dots = [...root.querySelectorAll<HTMLElement>('[data-dots] li')];

  let level = 1, seed = 0, round: Question[] = [], index = 0;
  let results: boolean[] = [], chosen: string[] = [], answered = false;
  // The matching question: which cause is selected, and the slot matched to each cause so far.
  let selected = 0, matched: (number | undefined)[] = [];

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

  const PROMPTS: Record<string, string> = {
    cause: 'Tap the cause: the part that tells why it happened.',
    effect: 'Tap the effect: the part that tells what happened.',
    signal: 'Tap the signal word or words that join the cause to the effect.',
    match: 'Match each cause to its effect. Choose a cause, then tap the effect it leads to.',
  };
  const clean = (text: string) => text.replace(/^[\s,]+|[\s,.]+$/g, '');
  const numbered = (text: string, i: number, attribute: string) => `<button type="button" class="ce-pick" ${attribute}="${i}"><kbd aria-hidden="true">${i + 1}</kbd><span>${escapeHtml(text)}</span></button>`;

  /** The matching board: causes on one side, effects (in a mixed order) on the other. */
  function drawMatch(question: Question) {
    const { items, order } = question;
    picks.className = 'ce-picks ce-match';
    picks.innerHTML = `
      <div class="ce-match-col" role="group" aria-label="Causes"><p class="ce-match-head">Causes</p>${items.map((item, i) => `<button type="button" class="ce-pick ce-match-cause" data-cause="${i}" aria-pressed="false"><span>${escapeHtml(sentenceCase(item.cause))}</span><b class="ce-match-badge" aria-hidden="true"></b></button>`).join('')}</div>
      <div class="ce-match-col" role="group" aria-label="Effects"><p class="ce-match-head">Effects</p>${order.map((itemIndex, slot) => `<button type="button" class="ce-pick ce-match-effect" data-slot="${slot}"><span>${escapeHtml(sentenceCase(items[itemIndex].effect))}</span><b class="ce-match-badge" aria-hidden="true"></b></button>`).join('')}</div>`;
    matched = items.map(() => undefined);
    select(0);
  }
  function select(cause: number) {
    selected = cause;
    for (const button of picks.querySelectorAll<HTMLElement>('[data-cause]')) button.setAttribute('aria-pressed', String(Number(button.dataset.cause) === cause));
  }
  function pair(cause: number, slot: number) {
    matched[cause] = slot;
    const number = String(matched.filter(value => value !== undefined).length);
    for (const button of [picks.querySelector<HTMLButtonElement>(`[data-cause="${cause}"]`)!, picks.querySelector<HTMLButtonElement>(`[data-slot="${slot}"]`)!]) {
      button.disabled = true;
      button.classList.add('is-matched');
      button.setAttribute('aria-pressed', 'false');
      button.querySelector('.ce-match-badge')!.textContent = number;
    }
  }
  /** One tap on an effect in the matching question. A wrong pair ends the question; the last pair is made for you. */
  function tapEffect(slot: number) {
    const { items, order } = round[index];
    if (order[slot] !== selected) {
      chosen.push(`“${sentenceCase(items[selected].cause)}” with “${items[order[slot]].effect}”`);
      picks.querySelector(`[data-cause="${selected}"]`)?.classList.add('is-chosen');
      picks.querySelector(`[data-slot="${slot}"]`)?.classList.add('is-chosen');
      return complete(false);
    }
    pair(selected, slot);
    const left = items.map((_, i) => i).filter(i => matched[i] === undefined);
    if (left.length === 1) pair(left[0], order.indexOf(left[0]));
    if (left.length <= 1) { chosen.push(''); return complete(true); }
    select(left[0]);
    live.textContent = `That is a pair: ${items[order[slot]].cause}, and ${items[order[slot]].effect}. ${left.length} causes left.`;
    picks.querySelector<HTMLElement>('[data-slot]:not(:disabled)')?.focus({ preventScroll: true });
  }

  function ask() {
    const question = round[index];
    const { mode } = question;
    answered = false;
    $('[data-number]').textContent = String(index + 1);
    card.className = 'ce-card';
    feedback.hidden = true;
    picks.hidden = false;
    statement.hidden = mode === 'match';
    statement.classList.toggle('is-paragraph', level === 3);
    prompt.classList.toggle('is-question', level === 3);
    // A paragraph is read first and its question comes after it; a sentence has its instruction above it.
    if (level === 3) card.append(statement, prompt); else card.append(prompt, statement);
    if (mode === 'match') {
      prompt.textContent = PROMPTS.match;
      drawMatch(question);
    } else {
      const { item } = question;
      statement.textContent = item.text;
      if (mode === 'cause' || mode === 'effect') {
        prompt.textContent = PROMPTS[mode];
        picks.className = 'ce-picks ce-parts';
        picks.innerHTML = parts(item).map((part, i) => numbered(clean(part.text), i, 'data-pick')).join('');
      } else if (mode === 'signal') {
        prompt.textContent = PROMPTS.signal;
        picks.className = 'ce-picks ce-words';
        picks.innerHTML = words(item).map((word, i) => `<button type="button" class="ce-pick" data-pick="${i}">${escapeHtml(word.text)}</button>`).join('');
      } else {
        prompt.textContent = question.prompt;
        picks.className = 'ce-picks ce-options';
        picks.innerHTML = question.options.map((option, i) => numbered(option, i, 'data-pick')).join('');
      }
    }
    dots.forEach((dot, i) => { dot.className = i < index ? (results[i] ? 'is-right' : 'is-wrong') : i === index ? 'is-current' : ''; });
    card.focus({ preventScroll: true });
    // If the last explanation was scrolled into view, come back up to the top of the game for the new question.
    const top = root!.getBoundingClientRect().top;
    if (top < 0) window.scrollBy({ top });
  }

  /** One tap on a part, a word or an option. */
  function answer(pick: number, button: HTMLElement | null) {
    if (answered) return;
    const question = round[index];
    if (question.mode === 'match') return;
    button?.classList.add('is-chosen');
    chosen.push(`“${(button?.querySelector('span') ?? button)?.textContent ?? ''}”`);
    for (const b of picks.querySelectorAll<HTMLButtonElement>('button')) b.classList.toggle('is-answer', checkAnswer(question, Number(b.dataset.pick)));
    const wrongReason = level === 3 ? whyNot(question, question.options[pick]) : '';
    complete(checkAnswer(question, pick), wrongReason);
  }

  /** Mark the question, show the answer and the explanation. */
  function complete(right: boolean, wrongReason = '') {
    if (answered) return;
    answered = true;
    const question = round[index];
    results.push(right);
    const score = scoreRound(results);
    let streak = 0;
    for (let i = results.length - 1; i >= 0 && results[i]; i--) streak++;
    $('[data-score]').textContent = String(score.correct);
    $('[data-streak]').textContent = String(streak);
    dots[index].className = right ? 'is-right' : 'is-wrong';
    for (const b of picks.querySelectorAll<HTMLButtonElement>('button')) b.disabled = true;
    card.classList.add('is-revealed');

    let text = explain(question);
    if (question.mode === 'match') {
      diagram.innerHTML = pairsHtml(question.items);
      text = right ? 'Every cause is joined to its own effect.' : 'That pair does not match. Here is each cause with its own effect.';
    } else if (level === 3) {
      diagram.innerHTML = chainHtml(question.item);
      text = `${wrongReason} ${answerLine(question)}`.trim();
    } else {
      // Show the answer on the sentence itself: the cause, the effect and the signal word.
      statement.innerHTML = revealHtml(question.item);
      diagram.innerHTML = '';
    }
    verdict.innerHTML = `${right ? ICON.right : ICON.wrong}<span>${right ? 'Correct!' : 'Not quite.'}</span>`;
    verdict.className = `ce-verdict ${right ? 'is-right' : 'is-wrong'}`;
    why.textContent = text;
    next.textContent = index === ROUND_LENGTH - 1 ? 'See your results' : 'Next question';
    feedback.hidden = false;
    live.textContent = `${right ? 'Correct.' : 'Not quite.'} ${level === 3 ? `${text} ` : ''}${explain(question)}`;
    next.focus({ preventScroll: true });
    // On a small screen, bring the whole explanation and the Next button into view, without pushing the
    // verdict off the top.
    const box = feedback.getBoundingClientRect();
    const below = box.bottom + 12 - window.innerHeight;
    if (below > 0) window.scrollBy({ top: Math.min(below, Math.max(0, box.top - 8)) });
  }

  function missedHtml(question: Question, picked: string) {
    if (question.mode === 'match') return `<li><p>Match each cause to its effect. You paired ${escapeHtml(picked)}.</p>${pairsHtml(question.items)}</li>`;
    if (level === 3) return `<li><p>${escapeHtml(question.item.text)}</p><p><strong>${escapeHtml(question.prompt)}</strong> You chose ${escapeHtml(picked)}. ${escapeHtml(answerLine(question))}</p>${chainHtml(question.item)}</li>`;
    return `<li><p class="ce-statement">${revealHtml(question.item)}</p><p>You tapped ${escapeHtml(picked)}. ${escapeHtml(explain(question))}</p></li>`;
  }

  function finish() {
    const score = scoreRound(results);
    const best = readBest();
    if (!(best[level] >= score.correct)) {
      best[level] = score.correct;
      try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch { /* private mode: the score is just not kept */ }
    }
    track('cause_effect_round_complete', { level, score: score.correct, streak: score.bestStreak });
    $('[data-final]').textContent = String(score.correct);
    $('[data-best-streak]').textContent = String(score.bestStreak);
    $('[data-message]').textContent = resultMessage(score);
    const missed = round.map((question, i) => ({ question, i })).filter(({ i }) => !results[i]);
    $('[data-missed]').innerHTML = missed.length
      ? `<h3>${missed.length === 1 ? 'The one you missed' : `The ${missed.length} you missed`}</h3><ol class="ce-missed">${missed.map(({ question, i }) => missedHtml(question, chosen[i])).join('')}</ol>`
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
    round = buildRound(level, seed) as unknown as Question[];
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
    track('cause_effect_start', { level });
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
    const cause = target.closest<HTMLButtonElement>('[data-cause]');
    if (cause && !answered && !cause.disabled) return select(Number(cause.dataset.cause));
    const slot = target.closest<HTMLButtonElement>('[data-slot]');
    if (slot && !answered && !slot.disabled) return tapEffect(Number(slot.dataset.slot));
    if (target.closest('[data-next]')) { if (index === ROUND_LENGTH - 1) finish(); else { index++; ask(); } return; }
    if (target.closest('[data-again]')) return start(level);
    if (target.closest('[data-same]')) return start(level, seed);
    if (target.closest('[data-quit], [data-levels]')) { show('start'); root.querySelector<HTMLElement>(`[data-level="${level}"]`)?.focus(); }
  });

  // Keyboard: 1 and 2 choose a part of the sentence, 1–4 choose an option. Words and the matching board are
  // reached with Tab.
  document.addEventListener('keydown', event => {
    if (root.dataset.showing !== 'play' || answered || event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((event.target as Element).tagName)) return;
    const { mode } = round[index];
    if (mode === 'signal' || mode === 'match' || !/^[1-9]$/.test(event.key)) return;
    const button = picks.querySelector<HTMLElement>(`[data-pick="${Number(event.key) - 1}"]`);
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
