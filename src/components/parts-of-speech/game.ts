// The Parts of Speech Game in the browser. Rounds come from buildRound() in parts-of-speech.mjs, so the same
// round number always gives the same sentences. Scores stay on this device (local storage).
import { LEVELS, PARTS, partById, levelById, buildRound, checkAnswer, answerLine, tally, practiceNext, scoreRound, resultMessage } from '../../lib/parts-of-speech.mjs';
import { ICON, escapeHtml, taggedHtml, highlightedHtml, tappableHtml, whyListHtml, chipHtml } from '../../lib/parts-of-speech-view.mjs';
import { track } from '../../lib/analytics';

type Question = ReturnType<typeof buildRound>[number];
type Check = ReturnType<typeof checkAnswer>;
const BEST_KEY = 'partsOfSpeechBest';
const root = document.querySelector<HTMLElement>('[data-pos-game]');

if (root) {
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const screens = [...root.querySelectorAll<HTMLElement>('[data-screen]')];
  const card = $('[data-card]'), prompt = $('[data-prompt]'), hint = $('[data-hint]'), sentenceBox = $('[data-sentence]');
  const palette = $('[data-palette]'), choices = $('[data-choices]'), checkRow = $('[data-check-row]');
  const checkButton = $<HTMLButtonElement>('[data-check]'), left = $('[data-left]');
  const feedback = $('[data-feedback]'), verdict = $('[data-verdict]'), answerText = $('[data-answer]'), why = $('[data-why]'), next = $<HTMLButtonElement>('[data-next]');
  const live = $('[data-live]'), dotList = $('[data-dots]');

  let level = 1, seed = 0, round: Question[] = [], index = 0;
  let checks: Check[] = [], given: unknown[] = [], answered = false;
  let tapped = new Set<number>(), painted: (string | null)[] = [], paint = PARTS[0].id;

  const readBest = (): Record<string, number> => { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') || {}; } catch { return {}; } };
  function showBest() {
    const best = readBest();
    for (const el of root!.querySelectorAll<HTMLElement>('[data-best]')) {
      const score = best[el.dataset.best!];
      el.textContent = Number.isInteger(score) ? `Your best: ${score} out of ${levelById(Number(el.dataset.best)).length}` : '';
    }
  }
  function show(name: string) {
    for (const screen of screens) screen.hidden = screen.dataset.screen !== name;
    root!.dataset.showing = name;
  }

  const HINTS: Record<string, string> = {
    noun: 'There may be more than one. Tap each one, then press Check.',
    verb: 'Tap each one, then press Check.',
    adjective: 'Tap each one, then press Check. In this game, a, an and the are articles, not adjectives.',
    adverb: 'Tap each one, then press Check.',
    pronoun: 'Tap each one, then press Check.',
  };

  function setPaint(id: string) {
    paint = id;
    for (const button of palette.querySelectorAll<HTMLElement>('[data-paint]')) button.setAttribute('aria-pressed', String(button.dataset.paint === id));
  }

  function updateCheck() {
    const { sentence, mode } = round[index];
    if (mode === 'tap') {
      checkButton.disabled = tapped.size === 0;
      left.textContent = tapped.size === 0 ? 'Tap at least one word.' : `${tapped.size} tapped.`;
    } else if (mode === 'color') {
      const todo = painted.filter(tag => !tag).length;
      checkButton.disabled = todo > 0;
      left.textContent = todo === 0 ? 'Every word has a color.' : `${todo} of ${sentence.words.length} words still to color.`;
    }
  }

  function ask() {
    const question = round[index];
    const { sentence, mode } = question;
    answered = false;
    tapped = new Set();
    painted = sentence.words.map(() => null);
    $('[data-number]').textContent = String(index + 1);
    if (mode === 'tap') {
      prompt.textContent = `Tap all the ${partById(question.tag).plural}.`;
      hint.textContent = level === 2 && question.tag === 'verb' ? 'Tap each one, then press Check. A helping verb is a verb too.' : HINTS[question.tag];
      sentenceBox.innerHTML = tappableHtml(sentence);
    } else if (mode === 'name') {
      prompt.textContent = 'What part of speech is the highlighted word?';
      hint.textContent = 'Read the whole sentence first. What job is the word doing?';
      sentenceBox.innerHTML = highlightedHtml(sentence, question.index);
    } else {
      prompt.textContent = 'Color the whole sentence.';
      hint.textContent = 'Pick a part of speech, then tap every word that belongs to it. Tap a word again to clear it.';
      sentenceBox.innerHTML = tappableHtml(sentence);
      setPaint(PARTS[0].id);
    }
    card.className = 'pos-card';
    sentenceBox.dataset.mode = mode;
    palette.hidden = mode !== 'color';
    choices.hidden = mode !== 'name';
    checkRow.hidden = mode === 'name';
    feedback.hidden = true;
    for (const button of [...palette.querySelectorAll('button'), ...choices.querySelectorAll('button')]) { button.disabled = false; button.classList.remove('is-chosen', 'is-answer'); }
    updateCheck();
    [...dotList.children].forEach((dot, i) => { dot.className = i < index ? (checks[i].right ? 'is-right' : 'is-wrong') : i === index ? 'is-current' : ''; });
    card.focus({ preventScroll: true });
  }

  function tapWord(button: HTMLElement) {
    if (answered) return;
    const { mode } = round[index];
    const i = Number(button.dataset.word);
    if (mode === 'tap') {
      if (tapped.has(i)) tapped.delete(i); else tapped.add(i);
      button.setAttribute('aria-pressed', String(tapped.has(i)));
    } else if (mode === 'color') {
      const before = painted[i];
      painted[i] = before === paint ? null : paint;
      if (before) button.classList.remove(`pos-${before}`);
      if (painted[i]) button.classList.add(`pos-${painted[i]}`);
      button.setAttribute('aria-pressed', String(Boolean(painted[i])));
      const tag = button.querySelector<HTMLElement>('.pos-w-tag')!;
      tag.textContent = painted[i] ? partById(painted[i]).short : '';
      tag.title = painted[i] ? partById(painted[i]).name : '';
    }
    updateCheck();
  }

  function answer(value: unknown, button: HTMLElement | null = null) {
    if (answered) return;
    answered = true;
    const question = round[index];
    const { sentence, mode } = question;
    const check = checkAnswer(question, value);
    checks.push(check);
    given.push(value);
    $('[data-score]').textContent = String(scoreRound(checks.map(c => c.right)).correct);
    dotList.children[index].className = check.right ? 'is-right' : 'is-wrong';

    // Show the answer on the sentence itself: every word with its color and label.
    sentenceBox.innerHTML = taggedHtml(sentence, check.marks);
    sentenceBox.dataset.mode = 'done';
    card.classList.add('is-revealed');
    palette.hidden = true;
    checkRow.hidden = true;
    for (const b of choices.querySelectorAll<HTMLButtonElement>('button')) {
      b.disabled = true;
      b.classList.toggle('is-answer', mode === 'name' && b.dataset.choice === sentence.words[question.index].tag);
    }
    button?.classList.add('is-chosen');

    const rightWords = check.marks.filter(mark => mark === 'hit').length;
    const headline = check.right ? 'Correct!' : mode === 'color' ? `${rightWords} of ${sentence.words.length} words right.` : 'Not quite.';
    verdict.innerHTML = `${check.right ? ICON.right : ICON.wrong}<span>${headline}</span>`;
    verdict.className = `pos-verdict ${check.right ? 'is-right' : 'is-wrong'}`;
    answerText.textContent = mode === 'color' ? 'Here is the reason for every word.' : `${answerLine(question)} Here is every word in the sentence.`;
    why.innerHTML = whyListHtml(question, check, value);
    next.textContent = index === round.length - 1 ? 'See your results' : 'Next sentence';
    feedback.hidden = false;
    live.textContent = `${headline} ${mode === 'color' ? '' : answerLine(question)}`;
    next.focus({ preventScroll: true });
    // Bring the verdict into view on a small screen, keeping the sentence on screen if it fits.
    const below = verdict.getBoundingClientRect().bottom + 80 - window.innerHeight;
    if (below > 0) window.scrollBy({ top: Math.min(below, Math.max(0, card.getBoundingClientRect().top - 8)) || below });
  }

  function describe(question: Question, value: unknown) {
    if (question.mode === 'tap') {
      const words = (value as number[]).map(i => `“${question.sentence.words[i].text}”`);
      return `You tapped ${words.join(', ')} for “${partById(question.tag).plural}”.`;
    }
    if (question.mode === 'name') return `You chose ${partById(value as string).name.toLowerCase()} for “${question.sentence.words[question.index].text}”.`;
    return '';
  }

  function finish() {
    const score = scoreRound(checks.map(c => c.right));
    const best = readBest();
    if (!(best[level] >= score.correct)) {
      best[level] = score.correct;
      try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch { /* private mode: the score is just not kept */ }
    }
    const counts = tally(round, checks);
    const practice = practiceNext(counts);
    track('parts_of_speech_round_complete', { level, score: score.correct, practice: practice ?? 'none' });
    $('[data-final]').textContent = String(score.correct);
    $('[data-final-total]').textContent = String(score.total);
    $('[data-message]').textContent = resultMessage(score);
    const unit = level === 3 ? 'words' : 'questions';
    const rows = PARTS.filter(part => counts[part.id]).map(part => `<tr${part.id === practice ? ' class="is-practice"' : ''}><th scope="row">${chipHtml(part.id)}</th><td>${counts[part.id].right} of ${counts[part.id].total} ${unit} right</td></tr>`).join('');
    const part = practice && partById(practice);
    $('[data-practice]').innerHTML = `<h3>${part ? `Practice next: ${part.plural}` : 'Nothing to practice at this level'}</h3>`
      + `<p>${part ? `${escapeHtml(part.definition)} A test to try: ${escapeHtml(part.test)}` : level < 3 ? 'You got every part of speech right. Try the next level.' : 'You got every part of speech right. Play a new round to see different sentences.'}</p>`
      + `<table class="pos-tally"><caption class="visually-hidden">How you did on each part of speech</caption><tbody>${rows}</tbody></table>`;
    const missed = round.map((question, i) => ({ question, i })).filter(({ i }) => !checks[i].right);
    $('[data-missed]').innerHTML = missed.length
      ? `<h3>${missed.length === 1 ? 'The sentence you missed' : `The ${missed.length} sentences you missed`}</h3><ol class="pos-missed">${missed.map(({ question, i }) => `<li><p class="pos-sentence">${taggedHtml(question.sentence, checks[i].marks)}</p><p>${escapeHtml(describe(question, given[i]))} ${escapeHtml(question.mode === 'tap' ? answerLine(question) : '')}</p><ul class="pos-why">${whyListHtml(question, checks[i], given[i], true)}</ul></li>`).join('')}</ol>`
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
    checks = [];
    given = [];
    const info = levelById(level);
    $('[data-level-name]').textContent = `${info.name} · ${info.grades}`;
    $('[data-length]').textContent = String(round.length);
    $('[data-score]').textContent = '0';
    dotList.innerHTML = round.map(() => '<li></li>').join('');
    // For teachers' links and for testing: which round is on screen.
    root!.dataset.gameLevel = String(level);
    root!.dataset.gameRound = String(seed);
    track('parts_of_speech_start', { level });
    show('play');
    ask();
    root!.scrollIntoView({ block: 'nearest' });
  }

  root.addEventListener('click', event => {
    const target = event.target as Element;
    const levelButton = target.closest<HTMLElement>('[data-level]');
    if (levelButton) return start(Number(levelButton.dataset.level));
    const word = target.closest<HTMLElement>('[data-word]');
    if (word) return tapWord(word);
    const paintButton = target.closest<HTMLElement>('[data-paint]');
    if (paintButton) return setPaint(paintButton.dataset.paint!);
    const choice = target.closest<HTMLElement>('[data-choice]');
    if (choice) return answer(choice.dataset.choice, choice);
    if (target.closest('[data-check]')) return answer(round[index].mode === 'tap' ? [...tapped].sort((a, b) => a - b) : [...painted]);
    if (target.closest('[data-next]')) { if (index === round.length - 1) finish(); else { index++; ask(); } return; }
    if (target.closest('[data-again]')) return start(level);
    if (target.closest('[data-same]')) return start(level, seed);
    if (target.closest('[data-quit], [data-levels]')) { show('start'); root.querySelector<HTMLElement>(`[data-level="${level}"]`)?.focus(); }
  });

  // Keyboard: the number keys pick a part of speech, from the palette (level 3) or as the answer (level 2).
  document.addEventListener('keydown', event => {
    if (root.dataset.showing !== 'play' || answered || event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((event.target as Element).tagName) || !/^[1-8]$/.test(event.key)) return;
    const { mode } = round[index];
    const group = mode === 'color' ? palette : mode === 'name' ? choices : null;
    const button = group?.querySelectorAll<HTMLElement>('button')[Number(event.key) - 1];
    if (!button) return;
    if (mode === 'color') setPaint(button.dataset.paint!);
    else answer(button.dataset.choice, button);
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
