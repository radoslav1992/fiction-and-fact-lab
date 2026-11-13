// The Reading Level Checker in the browser: re-analyze the text on every change and redraw the results
// that ReadingLevelChecker.astro rendered on the server. Nothing leaves the page.
import { analyze } from '../../lib/readability.mjs';
import { display, notices, markedHtml, MARKED_WORD_LIMIT } from '../../lib/readability-view.mjs';
import { sampleById } from '../../lib/reading-samples.mjs';
import { track } from '../../lib/analytics';

const root = document.querySelector<HTMLElement>('[data-checker]');
if (root) {
  const field = root.querySelector<HTMLTextAreaElement>('[data-text]')!;
  const marked = root.querySelector<HTMLElement>('[data-marked]')!;
  const meter = root.querySelector<HTMLElement>('[data-meter]')!;
  const noticeList = root.querySelector<HTMLElement>('[data-notices]')!;
  const status = root.querySelector<HTMLElement>('[data-status]')!;
  const truncated = root.querySelector<HTMLElement>('[data-truncated]')!;
  const outputs = [...root.querySelectorAll<HTMLElement>('[data-out]')];
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-sample]')];
  let source = 'sample';
  let announce = 0;
  let report = 0;

  function render() {
    const text = field.value;
    const analysis = analyze(text);
    const d: Record<string, string> = display(analysis);
    for (const el of outputs) el.textContent = d[el.dataset.out!];
    meter.style.setProperty('--ease', d.easePosition);
    marked.innerHTML = markedHtml(text, analysis);
    truncated.hidden = analysis.words.length <= MARKED_WORD_LIMIT;
    noticeList.replaceChildren(...notices(analysis).map(message => Object.assign(document.createElement('li'), { textContent: message })));
    for (const chip of chips) chip.setAttribute('aria-pressed', String(sampleById(chip.dataset.sample).text === text));
    // Tell screen readers the result once typing pauses, and count the check (never the text itself).
    clearTimeout(announce);
    announce = window.setTimeout(() => { status.textContent = analysis.empty ? 'The box is empty.' : `${d.grade}, ${d.ages}. Flesch Reading Ease ${d.ease}, ${d.easeLabel}.`; }, 900);
    clearTimeout(report);
    if (!analysis.empty) report = window.setTimeout(() => track('reading_level_check', { source, words: analysis.counts.words, grade: Math.round(analysis.grade) }), 3000);
  }

  function load(id: string) {
    const sample = sampleById(id);
    if (!sample) return false;
    field.value = sample.text;
    source = 'sample';
    track('reading_sample', { sample: id });
    render();
    return true;
  }

  // Short texts are redrawn on every keystroke; a very long one waits for a pause in the typing.
  let pending = 0;
  field.addEventListener('input', () => {
    source = 'typed';
    clearTimeout(pending);
    if (field.value.length < 20000) render();
    else pending = window.setTimeout(render, 250);
  });
  root.addEventListener('click', event => {
    const target = event.target as Element;
    const chip = target.closest<HTMLElement>('[data-sample]');
    if (chip) load(chip.dataset.sample!);
    if (target.closest('[data-clear]')) { field.value = ''; source = 'typed'; render(); field.focus(); }
  });
  for (const box of root.querySelectorAll<HTMLInputElement>('[data-toggle]')) {
    const apply = () => marked.classList.toggle(`show-${box.dataset.toggle}`, box.checked);
    box.addEventListener('change', apply);
    apply();
  }

  // A worksheet link can open the checker with a sample already loaded: ?sample=leaves
  const wanted = new URLSearchParams(location.search).get('sample');
  // The browser may have restored text typed before a reload, so draw whatever is in the box now.
  if (!(wanted && load(wanted))) { if (field.value !== field.defaultValue) source = 'typed'; render(); }
}
