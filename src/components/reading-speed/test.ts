// The Reading Speed Test in the browser: show a passage, time the reading, ask the questions and show the
// result. The rules are in reading-speed.mjs. Results stay on this device (local storage); nothing is sent.
import {
  LEVELS, MODES, HISTORY_SHOWN, passageById, passagesFor, levelById, modeById, paragraphs, wordCount, questionsFor, scoreAnswers,
  wordsPerMinute, createStopwatch, judgeTiming, formatTime, interpret, addResult, cleanHistory, compareWithEarlier, historyLine,
} from '../../lib/reading-speed.mjs';
import { track } from '../../lib/analytics';

interface Saved { at: number; passage: string; mode: string; wpm: number; correct: number; total: number; paused?: boolean }
const HISTORY_KEY = 'readingSpeedResults';
const root = document.querySelector<HTMLElement>('[data-speed]');

if (root) {
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const screens = [...root.querySelectorAll<HTMLElement>('[data-screen]')];
  const setup = $<HTMLFormElement>('[data-setup]'), quiz = $<HTMLFormElement>('[data-quiz]');
  const passageBox = $('[data-passage]'), passageTitle = $('[data-passage-title]'), passageBody = $('[data-passage-body]');
  const done = $<HTMLButtonElement>('[data-done]'), live = $('[data-live]');
  const watch = createStopwatch(() => performance.now());
  const svg = (body: string) => `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  const RIGHT = svg('<circle cx="10" cy="10" r="7.5"/><path d="M6.5 10.3l2.4 2.4 4.6-5"/>'), WRONG = svg('<circle cx="10" cy="10" r="7.5"/><path d="M7 7l6 6M13 7l-6 6"/>');
  const escapeHtml = (text: string) => text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

  let passage = passagesFor(1)[0], mode = 'silent';
  let reading = false, timing = { ms: 0, pauses: 0 }, wpm = 0;

  /* ---------------------------------------------------------- saved results */
  const readHistory = (): Saved[] => { try { return cleanHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')); } catch { return []; } };
  const writeHistory = (history: Saved[]) => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { /* private mode: the result is just not kept */ } };
  const day = (at: number) => (Number.isFinite(at) ? new Date(at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '');
  function showHistory() {
    const history = readHistory();
    $('[data-history]').hidden = history.length === 0;
    $('[data-history-list]').innerHTML = history.slice(0, HISTORY_SHOWN).map(result => `<li><span class="rs-history-day">${escapeHtml(day(result.at))}</span> ${escapeHtml(historyLine(result))}</li>`).join('');
    const read = new Set(history.map(result => result.passage));
    for (const mark of root!.querySelectorAll<HTMLElement>('[data-read-mark]')) mark.hidden = !read.has(mark.dataset.readMark!);
  }

  function show(name: string, focus?: HTMLElement) {
    for (const screen of screens) screen.hidden = screen.dataset.screen !== name;
    root!.dataset.showing = name;
    // No smooth scrolling here: nothing should be moving while someone is reading against the clock.
    root!.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
    focus?.focus({ preventScroll: true });
  }
  const announce = (text: string) => { live.textContent = ''; window.setTimeout(() => { live.textContent = text; }, 50); };
  const paragraphsHtml = () => paragraphs(passage).map(text => `<p>${escapeHtml(text)}</p>`).join('');
  const selectedLevel = () => Number(new FormData(setup).get('rs-level'));
  function showLevel(level: number) {
    for (const group of root!.querySelectorAll<HTMLElement>('[data-passages]')) group.toggleAttribute('data-active', Number(group.dataset.passages) === level);
  }

  /* ---------------------------------------------------------------- reading */
  function begin() {
    const info = modeById(mode)!;
    passageTitle.textContent = passage.title;
    // The passage goes into the page only now.
    passageBody.innerHTML = paragraphsHtml();
    $('[data-running]').textContent = mode === 'aloud' ? 'Timer running · read aloud' : 'Timer running · read silently';
    done.disabled = true;
    show('read', passageBox);
    track('reading_speed_start', { level: passage.level, mode, passage: passage.id });
    // Start the clock once the passage has been drawn, so drawing it is not counted as reading time.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (root!.dataset.showing !== 'read') return;
      watch.start();
      reading = true;
      done.disabled = false;
      if (document.hidden) watch.pause();
      announce(`The timer is running. ${info.id === 'aloud' ? 'Read the passage aloud' : 'Read the passage silently'}, then press Done reading.`);
    }));
  }
  function putAway() {
    reading = false;
    passageBody.replaceChildren();
  }
  // A hidden tab is not being read: the clock stops while the tab is hidden, and the result says so.
  document.addEventListener('visibilitychange', () => {
    if (!reading) return;
    if (document.hidden) watch.pause(); else watch.resume();
  });

  function finishReading() {
    if (!reading) return;
    timing = watch.stop();
    putAway();
    const words = wordCount(passage);
    const verdict = judgeTiming(words, timing.ms);
    if (!verdict.counts) {
      track('reading_speed_void', { level: passage.level, mode, reason: verdict.reason });
      $('[data-void-text]').textContent = verdict.message;
      show('void', $('[data-void-title]'));
      announce(`This result does not count. ${verdict.message}`);
      return;
    }
    wpm = wordsPerMinute(words, timing.ms);
    const detail = `${words} words in ${formatTime(timing.ms)}, ${modeById(mode)!.label}`;
    $('[data-wpm]').textContent = String(wpm);
    $('[data-speed-detail]').textContent = detail;
    const paused = $('[data-paused-note]');
    paused.hidden = timing.pauses === 0;
    paused.textContent = pausedText();
    $('[data-quiz-passage]').textContent = passage.title;
    $('[data-quiz-error]').textContent = '';
    $('[data-questions]').innerHTML = questionsFor(passage).map((question, i) => `<li><fieldset class="rs-question" data-question="${i}">
      <legend>${escapeHtml(question.q)}</legend>
      ${question.options.map((option, at) => `<label class="rs-option"><input type="radio" name="rs-q${i}" value="${at}" /><span>${escapeHtml(option)}</span></label>`).join('')}
    </fieldset></li>`).join('');
    show('quiz', $('[data-quiz-title]'));
    announce(`You read at ${wpm} words a minute: ${detail}. Now answer the questions.`);
  }
  const pausedText = () => (timing.pauses
    ? `The timer stopped ${timing.pauses === 1 ? 'once' : `${timing.pauses} times`} while this tab was hidden, so the time may be a little off.`
    : '');

  /* ---------------------------------------------------------------- results */
  function finishQuiz() {
    const groups = [...quiz.querySelectorAll<HTMLElement>('[data-question]')];
    const chosen = groups.map(group => group.querySelector<HTMLInputElement>('input:checked')?.value);
    const missing = chosen.findIndex(value => value === undefined);
    groups.forEach((group, i) => group.classList.toggle('is-waiting', chosen[i] === undefined));
    if (missing >= 0) {
      $('[data-quiz-error]').textContent = `Answer every question first. Question ${missing + 1} is still waiting.`;
      groups[missing].querySelector<HTMLInputElement>('input')!.focus();
      return;
    }
    const answers = chosen.map(Number);
    const score = scoreAnswers(passage, answers);
    const result: Saved = { at: Date.now(), passage: passage.id, mode, wpm, correct: score.correct, total: score.total };
    if (timing.pauses) result.paused = true;
    const earlier = readHistory();
    const meaning = interpret({ wpm, correct: score.correct, total: score.total, mode });
    const compare = compareWithEarlier(result, earlier);
    writeHistory(addResult(earlier, result));
    // The event says that a test was finished, not how it went: speeds and scores stay in this browser.
    track('reading_speed_complete', { level: passage.level, mode, passage: passage.id, paused: timing.pauses > 0 });

    $('[data-final-wpm]').textContent = String(wpm);
    $('[data-final-detail]').textContent = `${wordCount(passage)} words in ${formatTime(timing.ms)}, ${modeById(mode)!.label}`;
    $('[data-final-score]').textContent = `${score.correct} of ${score.total}`;
    $('[data-meaning-title]').textContent = meaning.title;
    $('[data-meaning-text]').textContent = meaning.text;
    const compareLine = $('[data-compare]');
    compareLine.hidden = !compare;
    compareLine.textContent = compare ? `${compare.text} Comparing with your own earlier results at the same level is the comparison that tells you something.` : '';
    const paused = $('[data-paused-result]');
    paused.hidden = timing.pauses === 0;
    paused.textContent = pausedText();
    $('[data-review]').innerHTML = questionsFor(passage).map((question, i) => {
      const right = score.right[i];
      return `<li class="${right ? 'is-right' : 'is-wrong'}"><p class="rs-review-q">${escapeHtml(question.q)}</p>
        <p class="rs-review-a">${right ? RIGHT : WRONG}<span>${right ? 'Right' : 'Not quite'}. You chose “${escapeHtml(question.options[answers[i]])}.”${right ? '' : ` The answer is “${escapeHtml(question.options[question.answer])}.”`}</span></p>
        <p class="rs-review-why">${escapeHtml(question.why)}</p></li>`;
    }).join('');
    $('[data-passage-again]').innerHTML = `<h4>${escapeHtml(passage.title)}</h4>${paragraphsHtml()}`;
    root!.querySelector<HTMLDetailsElement>('.rs-again')!.open = false;
    showHistory();
    show('results', $('[data-results-title]'));
    announce(`${wpm} words a minute, ${score.correct} of ${score.total} questions right. ${meaning.title} ${meaning.text}`);
  }

  function backToSetup(next = false) {
    $('[data-passage-again]').replaceChildren();
    $('[data-review]').replaceChildren();
    const level = passage.level;
    if (next) {
      // Offer the next passage of this level that has not been read yet, or simply the next one.
      const all = passagesFor(level), read = new Set(readHistory().map(result => result.passage));
      const at = all.indexOf(passage);
      const order = [...all.slice(at + 1), ...all.slice(0, at)];
      const pick = order.find(item => !read.has(item.id)) ?? order[0];
      const input = setup.querySelector<HTMLInputElement>(`input[name="rs-passage-${level}"][value="${pick.id}"]`);
      if (input) input.checked = true;
    }
    show('setup', setup.querySelector<HTMLInputElement>(`input[name="rs-passage-${level}"]:checked`) ?? undefined);
  }

  /* ----------------------------------------------------------------- events */
  setup.addEventListener('change', event => {
    if ((event.target as HTMLInputElement).name === 'rs-level') showLevel(selectedLevel());
  });
  setup.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(setup);
    const level = selectedLevel();
    passage = passageById(String(data.get(`rs-passage-${level}`))) ?? passagesFor(level)[0];
    mode = modeById(String(data.get('rs-mode')))?.id ?? 'silent';
    begin();
  });
  quiz.addEventListener('submit', event => { event.preventDefault(); finishQuiz(); });
  quiz.addEventListener('change', event => {
    (event.target as Element).closest('[data-question]')?.classList.remove('is-waiting');
    $('[data-quiz-error]').textContent = '';
  });
  root.addEventListener('click', event => {
    const target = event.target as Element;
    if (target.closest('[data-done]')) return finishReading();
    if (target.closest('[data-cancel]')) { watch.stop(); putAway(); return backToSetup(); }
    if (target.closest('[data-retry]')) return begin();
    if (target.closest('[data-another]')) return backToSetup(true);
    if (target.closest('[data-back]')) return backToSetup();
    if (target.closest('[data-clear-history]')) { writeHistory([]); showHistory(); announce('Your saved results were cleared.'); }
  });

  // A link can open the set-up with a level, a passage and a way of reading chosen: ?level=2&passage=water&mode=aloud
  const params = new URLSearchParams(location.search);
  const wanted = passageById(params.get('passage') ?? '');
  const level = wanted?.level ?? levelById(params.get('level') ?? '')?.id;
  const check = (name: string, value: string | number) => { const input = setup.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`); if (input) input.checked = true; };
  if (level && LEVELS.some(item => item.id === level)) check('rs-level', level);
  if (wanted) check(`rs-passage-${wanted.level}`, wanted.id);
  if (MODES.some(item => item.id === params.get('mode'))) check('rs-mode', params.get('mode')!);
  // The browser may have kept an earlier choice across a reload, so show the passages of the level that is checked.
  showLevel(selectedLevel());
  showHistory();
  root.dataset.showing = 'setup';
}
