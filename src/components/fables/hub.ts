// The fables hub: shows the best quiz score this browser has kept for each fable (local storage only).
import { QUIZ_LENGTH } from '../../lib/fables.mjs';

let best: Record<string, number> = {};
try { best = JSON.parse(localStorage.getItem('fablesBest') || '{}') || {}; } catch { /* no saved scores */ }
for (const el of document.querySelectorAll<HTMLElement>('[data-fable-best]')) {
  const score = best[el.dataset.fableBest ?? ''];
  if (Number.isInteger(score)) el.textContent = `Your best: ${score} out of ${QUIZ_LENGTH}`;
}
