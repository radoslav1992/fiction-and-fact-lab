// The Main Idea and Details Game in the browser. Rounds come from buildRound() in main-idea.mjs, so the same
// round number always gives the same five paragraphs. Scores stay on this device (local storage).
import {
  LEVELS, ROUND_LENGTH, ROUND_POINTS, OPTION_KINDS, buildRound, checkMain, checkSort, scoreRound, resultMessage,
  explainMain, whyNot, explainSentence,
} from '../../lib/main-idea.mjs';
import { ICON, escapeHtml, paragraphHtml, kindTagHtml } from '../../lib/main-idea-view.mjs';
import { track } from '../../lib/analytics';

type Question = ReturnType<typeof buildRound>[number];
type Kind = keyof typeof OPTION_KINDS;
interface Result { main: boolean; sort: boolean; chosen: Kind; sortRight: boolean[] }
const BEST_KEY = 'mainIdeaBest';
const root = document.querySelector<HTMLElement>('[data-main-idea]');

if (root) {
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const screens = [...root.querySelectorAll<HTMLElement>('[data-screen]')];
  const steps = [...root.querySelectorAll<HTMLElement>('[data-step]')];
  const card = $('[data-card]'), paragraph = $('[data-paragraph]'), options = $('[data-options]');
  const sortCard = $('[data-sort-card]'), mainIdea = $('[data-main]'), sortList = $('[data-sort]'), check = $<HTMLButtonElement>('[data-check]');
  const feedback = $('[data-feedback]'), verdict = $('[data-verdict]'), why = $('[data-why]'), next = $<HTMLButtonElement>('[data-next]');
  const live = $('[data-live]');
  const dots = [...root.querySelectorAll<HTMLElement>('[data-dots] li')];

  let level = 1, seed = 0, round: Question[] = [], index = 0;
  let step: 'main' | 'sort' = 'main', answered = false;
  let results: Result[] = [];

  const readBest = (): Record<string, number> => { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') || {}; } catch { return {}; } };
  function showBest() {
    const best = readBest();
    for (const el of root!.querySelectorAll<HTMLElement>('[data-best]')) {
      const score = best[el.dataset.best!];
      el.textContent = Number.isInteger(score) ? `Your best: ${score} out of ${ROUND_POINTS}` : '';
    }
  }
  function show(name: string) {
    for (const screen of screens) screen.hidden = screen.dataset.screen !== name;
    root!.dataset.showing = name;
  }
  function showStep(name: 'main' | 'sort') {
    step = name;
    for (const el of steps) el.hidden = el.dataset.step !== name;
    root!.dataset.step = name;
  }
  const points = () => scoreRound(results).points;
  function drawDots() {
    dots.forEach((dot, i) => {
      const [a, b] = [...dot.children] as HTMLElement[];
      const result = results[i];
      dot.className = i === index ? 'is-current' : '';
      a.className = result ? (result.main ? 'is-right' : 'is-wrong') : '';
      b.className = result && (i < index || (step === 'sort' && answered)) ? (result.sort ? 'is-right' : 'is-wrong') : '';
    });
  }
  // A new step starts at the top of the game, so the paragraph or the main idea is what the player sees first.
  function toTop() {
    const { top } = root!.getBoundingClientRect();
    if (top < 0 || top > window.innerHeight / 2) root!.scrollIntoView({ block: 'start' });
  }
  // Bring the explanation into view on a small screen.
  function reveal(el: HTMLElement) {
    const below = el.getBoundingClientRect().bottom + 12 - window.innerHeight;
    if (below > 0) window.scrollBy({ top: below });
  }

  function askMain() {
    const { item, options: choices } = round[index];
    answered = false;
    showStep('main');
    $('[data-number]').textContent = String(index + 1);
    paragraph.innerHTML = paragraphHtml(item);
    options.innerHTML = choices.map((option, i) => `<button type="button" class="mi-option" data-option="${i}"><kbd aria-hidden="true">${i + 1}</kbd><span class="mi-option-text">${escapeHtml(option.text)}</span></button>`).join('');
    feedback.hidden = true;
    drawDots();
    card.focus({ preventScroll: true });
    toTop();
  }

  function answerMain(i: number) {
    if (answered || step !== 'main') return;
    answered = true;
    const question = round[index];
    const { item } = question;
    const right = checkMain(question, i);
    const chosen = question.options[i].kind as Kind;
    results[index] = { main: right, sort: false, chosen, sortRight: [] };
    $('[data-score]').textContent = String(points());
    // Show which option is which, and mark the main idea in the paragraph if a sentence states it.
    paragraph.innerHTML = paragraphHtml(item, true);
    [...options.querySelectorAll<HTMLButtonElement>('button')].forEach((button, at) => {
      const kind = question.options[at].kind as Kind;
      button.disabled = true;
      button.classList.toggle('is-answer', kind === 'main');
      button.classList.toggle('is-chosen', at === i);
      button.insertAdjacentHTML('beforeend', kindTagHtml(kind));
    });
    const explanation = right ? explainMain(item) : `${whyNot(item, chosen)} The main idea is: “${item.options.main}” ${explainMain(item)}`;
    verdict.innerHTML = `${right ? ICON.right : ICON.wrong}<span>${right ? 'Correct!' : 'Not quite.'}</span>`;
    verdict.className = `mi-verdict ${right ? 'is-right' : 'is-wrong'}`;
    why.textContent = explanation;
    next.textContent = 'Next: sort the sentences';
    feedback.hidden = false;
    live.textContent = `${right ? 'Correct.' : 'Not quite.'} ${explanation}`;
    drawDots();
    next.focus({ preventScroll: true });
    reveal(feedback);
  }

  function askSort() {
    const { item, sort } = round[index];
    answered = false;
    showStep('sort');
    mainIdea.textContent = item.options.main;
    sortList.innerHTML = sort.map((sentence, i) => `<li class="mi-sentence" data-sentence="${i}">
      <p class="mi-sentence-text" id="mi-s${i}">${escapeHtml(sentence.text)}</p>
      <div class="mi-choice" role="radiogroup" aria-labelledby="mi-s${i}">
        <label><input type="radio" name="mi-sort-${i}" value="yes" /><span>Supports</span></label>
        <label><input type="radio" name="mi-sort-${i}" value="no" /><span>Does not belong</span></label>
      </div>
      <p class="mi-sentence-why" data-sentence-why hidden></p>
    </li>`).join('');
    check.hidden = false;
    feedback.hidden = true;
    drawDots();
    sortCard.focus({ preventScroll: true });
    toTop();
  }

  function checkSorting() {
    if (answered || step !== 'sort') return;
    const question = round[index];
    const rows = [...sortList.querySelectorAll<HTMLElement>('[data-sentence]')];
    const answers = rows.map(row => row.querySelector<HTMLInputElement>('input:checked')?.value);
    const missing = answers.findIndex(value => value === undefined);
    if (missing >= 0) {
      live.textContent = '';
      window.setTimeout(() => { live.textContent = 'Sort every sentence first. One is still waiting.'; }, 50);
      rows.forEach((row, i) => row.classList.toggle('is-waiting', answers[i] === undefined));
      rows[missing].querySelector<HTMLInputElement>('input')!.focus();
      return;
    }
    answered = true;
    const marked = checkSort(question, answers.map(value => value === 'yes'));
    results[index].sort = marked.all;
    results[index].sortRight = marked.right;
    $('[data-score]').textContent = String(points());
    rows.forEach((row, i) => {
      const { belongs } = question.sort[i];
      row.classList.remove('is-waiting');
      row.classList.add(marked.right[i] ? 'is-right' : 'is-wrong');
      for (const input of row.querySelectorAll<HTMLInputElement>('input')) {
        input.disabled = true;
        input.closest('label')!.classList.toggle('is-answer', (input.value === 'yes') === belongs);
      }
      const note = row.querySelector<HTMLElement>('[data-sentence-why]')!;
      note.innerHTML = `${marked.right[i] ? ICON.right : ICON.wrong}<span>${marked.right[i] ? 'Right.' : 'Not quite.'} ${escapeHtml(explainSentence(question.item, belongs))}</span>`;
      note.hidden = false;
    });
    check.hidden = true;
    const summary = marked.all
      ? `You sorted all ${marked.total} sentences correctly.`
      : `You sorted ${marked.correct} of ${marked.total} sentences correctly. The point is for getting them all.`;
    verdict.innerHTML = `${marked.all ? ICON.right : ICON.wrong}<span>${marked.all ? 'Correct!' : 'Not quite.'}</span>`;
    verdict.className = `mi-verdict ${marked.all ? 'is-right' : 'is-wrong'}`;
    why.textContent = `${summary} A sentence supports the main idea when it gives a fact or an example that helps to show it.`;
    next.textContent = index === ROUND_LENGTH - 1 ? 'See your results' : 'Next paragraph';
    feedback.hidden = false;
    live.textContent = `${marked.all ? 'Correct.' : 'Not quite.'} ${summary}`;
    drawDots();
    next.focus({ preventScroll: true });
    reveal(feedback);
  }

  function finish() {
    const score = scoreRound(results);
    const best = readBest();
    if (!(best[level] >= score.points)) {
      best[level] = score.points;
      try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch { /* private mode: the score is just not kept */ }
    }
    track('main_idea_round_complete', { level, score: score.points, main: score.main, sort: score.sort });
    $('[data-final]').textContent = String(score.points);
    $('[data-final-main]').textContent = String(score.main);
    $('[data-final-sort]').textContent = String(score.sort);
    $('[data-message]').textContent = resultMessage(score);
    const missed = round.map((question, i) => ({ question, result: results[i] })).filter(({ result }) => !result.main || !result.sort);
    $('[data-missed]').innerHTML = missed.length
      ? `<h3>${missed.length === 1 ? 'The paragraph to look at again' : `The ${missed.length} paragraphs to look at again`}</h3><ol class="mi-missed">${missed.map(({ question, result }) => {
        const { item } = question;
        const lines = [`<p class="mi-paragraph">${paragraphHtml(item, true)}</p>`, `<p><strong>Main idea:</strong> ${escapeHtml(item.options.main)}</p>`];
        if (!result.main) lines.push(`<p>You chose “${escapeHtml(item.options[result.chosen])}” ${escapeHtml(whyNot(item, result.chosen))}</p>`);
        const wrong = question.sort.filter((_, i) => !result.sortRight[i]);
        if (wrong.length) lines.push(`<p>Sorting to check:</p><ul>${wrong.map(sentence => `<li>“${escapeHtml(sentence.text)}” ${escapeHtml(explainSentence(item, sentence.belongs))}</li>`).join('')}</ul>`);
        return `<li>${lines.join('')}</li>`;
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
    toTop();
  }

  function start(newLevel: number, newSeed = Math.floor(Math.random() * 900000) + 100000) {
    level = newLevel;
    seed = newSeed;
    round = buildRound(level, seed);
    index = 0;
    results = [];
    const info = LEVELS.find(item => item.id === level)!;
    $('[data-level-name]').textContent = `${info.name} · ${info.grades}`;
    $('[data-score]').textContent = '0';
    // For teachers' links and for testing: which round is on screen.
    root!.dataset.gameLevel = String(level);
    root!.dataset.gameRound = String(seed);
    track('main_idea_start', { level });
    show('play');
    askMain();
  }

  root.addEventListener('click', event => {
    const target = event.target as Element;
    const levelButton = target.closest<HTMLElement>('[data-level]');
    if (levelButton) return start(Number(levelButton.dataset.level));
    const option = target.closest<HTMLElement>('[data-option]');
    if (option) return answerMain(Number(option.dataset.option));
    if (target.closest('[data-check]')) return checkSorting();
    if (target.closest('[data-next]')) {
      if (step === 'main') askSort();
      else if (index === ROUND_LENGTH - 1) finish();
      else { index++; askMain(); }
      return;
    }
    if (target.closest('[data-again]')) return start(level);
    if (target.closest('[data-same]')) return start(level, seed);
    if (target.closest('[data-quit], [data-levels]')) { show('start'); root.querySelector<HTMLElement>(`[data-level="${level}"]`)?.focus(); }
  });
  sortList.addEventListener('change', event => (event.target as Element).closest('[data-sentence]')?.classList.remove('is-waiting'));

  // Keyboard: 1 to 4 choose a main idea.
  document.addEventListener('keydown', event => {
    if (root.dataset.showing !== 'play' || step !== 'main' || answered || event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((event.target as Element).tagName)) return;
    if (/^[1-4]$/.test(event.key)) answerMain(Number(event.key) - 1);
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
