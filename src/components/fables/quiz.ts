// The questions on a fable page. Answers are checked against the bank in fables.mjs, the score is shown on
// the page, and the best score for each fable is kept in this browser (local storage). Nothing is sent anywhere.
import { fableBySlug, questions, feedback, scoreQuiz, quizMessage, QUIZ_LENGTH } from '../../lib/fables.mjs';
import { track } from '../../lib/analytics';

const BEST_KEY = 'fablesBest';
const root = document.querySelector<HTMLElement>('[data-quiz]');
const fable = root && fableBySlug(root.dataset.fable);

if (root && fable) {
  const list = questions(fable);
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const items = [...root.querySelectorAll<HTMLElement>('[data-q]')];
  const result = $('[data-result]'), live = $('[data-live]');
  let answers: (boolean | undefined)[] = [];

  const readBest = (): Record<string, number> => { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') || {}; } catch { return {}; } };
  const results = () => answers.filter(answer => answer !== undefined) as boolean[];

  function showScore() {
    const score = scoreQuiz(results());
    $('[data-answered]').textContent = String(score.answered);
    $('[data-right]').textContent = String(score.correct);
    return score;
  }

  function answer(item: HTMLElement, button: HTMLElement) {
    const index = Number(item.dataset.q), choice = Number(button.dataset.choice);
    if (answers[index] !== undefined) return;
    const question = list[index];
    const right = choice === question.answer;
    answers[index] = right;
    // The buttons stay focusable, so the keyboard focus is not lost: they are marked as switched off instead.
    item.querySelectorAll<HTMLElement>('[data-choice]').forEach((other, c) => {
      other.setAttribute('aria-disabled', 'true');
      other.classList.toggle('is-answer', c === question.answer);
    });
    button.classList.add('is-chosen');
    const why = item.querySelector<HTMLElement>('[data-why]')!;
    why.textContent = feedback(question, choice);
    why.className = `fb-why ${right ? 'is-right' : 'is-wrong'}`;
    why.hidden = false;

    const score = showScore();
    let spoken = feedback(question, choice);
    if (score.done) {
      const best = readBest();
      if (!(best[fable!.slug] >= score.correct)) {
        best[fable!.slug] = score.correct;
        try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch { /* private mode: the score is just not kept */ }
      }
      $('[data-final]').textContent = String(score.correct);
      $('[data-best]').textContent = `Your best on this fable: ${Math.max(best[fable!.slug] ?? 0, score.correct)} out of ${QUIZ_LENGTH}`;
      $('[data-message]').textContent = quizMessage(score);
      result.hidden = false;
      spoken += ` You got ${score.correct} out of ${QUIZ_LENGTH}. ${quizMessage(score)}`;
      track('fable_quiz_complete', { fable: fable!.slug, score: score.correct });
    }
    live.textContent = spoken;
  }

  function reset() {
    answers = [];
    for (const item of items) {
      for (const button of item.querySelectorAll<HTMLElement>('[data-choice]')) {
        button.removeAttribute('aria-disabled');
        button.classList.remove('is-answer', 'is-chosen');
      }
      const why = item.querySelector<HTMLElement>('[data-why]')!;
      why.hidden = true;
      why.textContent = '';
    }
    result.hidden = true;
    live.textContent = 'The questions are ready to try again.';
    showScore();
    items[0].querySelector<HTMLElement>('[data-choice]')?.focus({ preventScroll: true });
    root!.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  root.addEventListener('click', event => {
    const target = event.target as Element;
    const button = target.closest<HTMLElement>('[data-choice]');
    const item = button?.closest<HTMLElement>('[data-q]');
    if (button && item) return answer(item, button);
    if (target.closest('[data-again]')) reset();
  });
  root.dataset.ready = 'true';
}
