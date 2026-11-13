import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/lib/plot-diagram.mjs';
import * as view from '../src/lib/plot-diagram-view.mjs';
import { analyze } from '../src/lib/readability.mjs';
import { activity, standards, WORKSHEET_TALE, WORKSHEET_ROUND } from '../src/lib/activities/plot-diagram.mjs';

const { STAGES, STAGE_IDS, EXTRAS, TALES, LIMITS } = m;
const strip = html => html.replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const words = text => text.split(/\s+/).filter(Boolean).length;
const everyText = tale => [tale.title, tale.origin, tale.characters, tale.setting, tale.problem, tale.summary, tale.tricky, ...tale.events.flatMap(item => [item.text, item.why])];

test('the five stages, in order, each with a definition and a one-line question', () => {
  assert.deepEqual(STAGE_IDS, ['exposition', 'rising', 'climax', 'falling', 'resolution']);
  assert.deepEqual(STAGES.map(stage => stage.name), ['Exposition', 'Rising action', 'Climax', 'Falling action', 'Resolution']);
  assert.deepEqual(STAGES.map(stage => stage.number), [1, 2, 3, 4, 5]);
  assert.equal(m.stageById('exposition').also, 'the beginning');
  assert.equal(m.stageById('resolution').also, 'the ending');
  for (const stage of STAGES) {
    assert.equal(m.stageById(stage.id), stage);
    assert.ok(stage.definition.length > 40 && stage.definition.endsWith('.'), stage.id);
    assert.match(stage.prompt, /^[A-Z][^?]{10,70}\?$/, `${stage.id}: one question`);
  }
  assert.equal(m.stageById('climax').prompt, 'What is the turning point?');
  assert.match(m.stageById('climax').definition, /turning point/);
  assert.deepEqual(EXTRAS.map(extra => extra.id), ['characters', 'setting', 'problem']);
  for (const extra of EXTRAS) assert.ok(extra.name.length > 3 && extra.prompt.endsWith('.') || extra.prompt.endsWith('?'), extra.id);
});

test('the story bank: six tales, each complete and well-formed', () => {
  assert.deepEqual(TALES.map(tale => tale.slug), ['three-little-pigs', 'cinderella', 'little-red-riding-hood', 'goldilocks-and-the-three-bears', 'jack-and-the-beanstalk', 'tortoise-and-the-hare']);
  assert.equal(new Set(TALES.map(tale => tale.title)).size, 6);
  for (const tale of TALES) {
    assert.match(tale.slug, /^[a-z]+(-[a-z]+)*$/, tale.slug);
    assert.equal(m.taleBySlug(tale.slug), tale);
    assert.ok(words(tale.summary) >= 60 && words(tale.summary) <= 90, `${tale.slug}: the summary has ${words(tale.summary)} words`);
    assert.ok(analyze(tale.summary).grade <= 7, `${tale.slug}: the summary reads at grade ${analyze(tale.summary).grade.toFixed(1)}`);
    assert.match(tale.origin, /^(a|one of) /, `${tale.slug}: origin reads on after a comma`);
    for (const field of ['characters', 'setting']) {
      assert.ok(tale[field].length >= 20 && tale[field].length <= 90, `${tale.slug}.${field}`);
      assert.ok(!tale[field].endsWith('.'), `${tale.slug}.${field} is a phrase, not a sentence`);
    }
    assert.match(tale.problem, /^[A-Z].{40,110}\.$/, `${tale.slug}.problem`);
    assert.match(tale.tricky, /^[A-Z].{80,220}\.$/, `${tale.slug}.tricky`);
    assert.match(tale.tricky, /climax/, `${tale.slug}: the tip is about the climax`);
    for (const text of everyText(tale)) {
      assert.ok(!/[—\n]|\s{2}|'|"/.test(text), `${tale.slug}: no em dashes, line breaks, double spaces or straight quotes in “${text}”`);
      assert.ok(!/undefined|NaN/.test(text), text);
    }
  }
  assert.equal(TALES.filter(tale => /Aesop/.test(tale.origin)).length, 1);
});

test('every tale: five to seven events in story order, one or two on each stage, exactly one climax', () => {
  for (const tale of TALES) {
    const { events } = tale;
    assert.ok(events.length >= 5 && events.length <= 7, `${tale.slug} has ${events.length} events`);
    assert.deepEqual(events.map(item => item.id), events.map((_, i) => i + 1), `${tale.slug}: numbered in story order`);
    for (const stage of STAGES) {
      const here = m.eventsFor(tale, stage.id);
      assert.ok(here.length >= 1 && here.length <= 2, `${tale.slug}: ${here.length} events on ${stage.id}`);
    }
    assert.equal(m.eventsFor(tale, 'climax').length, 1, `${tale.slug}: one climax`);
    assert.equal(m.climaxOf(tale).stage, 'climax');
    // The stages never go backward as the story goes on.
    const order = events.map(item => STAGE_IDS.indexOf(item.stage));
    assert.deepEqual(order, [...order].sort((a, b) => a - b), `${tale.slug}: stages in order`);
    for (const item of events) {
      assert.ok(STAGE_IDS.includes(item.stage), `${tale.slug} event ${item.id}`);
      assert.match(item.text, /^[A-Z].{40,140}\.$/, `${tale.slug} event ${item.id}: one or two plain sentences`);
      assert.ok(words(item.text) <= 26, `${tale.slug} event ${item.id} is short enough for a card`);
      assert.match(item.why, /^[A-Z].{25,95}\.$/, `${tale.slug} event ${item.id}: a one-line reason`);
    }
    // The reasons say what kind of moment it is, in the same words every time.
    assert.match(m.climaxOf(tale).why, /^It is the turning point: /, tale.slug);
    assert.match(m.eventsFor(tale, 'resolution')[0].why, /^It is the ending: /, tale.slug);
    assert.match(m.eventsFor(tale, 'exposition')[0].why, /^It introduces /, tale.slug);
    for (const item of m.eventsFor(tale, 'rising')) assert.match(item.why, /^The (problem|tension|action) /, `${tale.slug} event ${item.id}`);
    for (const item of m.eventsFor(tale, 'falling')) assert.match(item.why, /climax/, `${tale.slug} event ${item.id}`);
  }
});

test('no duplicates: every event and every summary appears once in the bank', () => {
  const texts = TALES.flatMap(tale => tale.events.map(item => item.text.toLowerCase()));
  assert.equal(new Set(texts).size, texts.length);
  assert.equal(new Set(TALES.map(tale => tale.summary)).size, TALES.length);
  for (const tale of TALES) assert.equal(new Set(tale.events.map(item => item.why)).size, tale.events.length, `${tale.slug}: each reason is its own`);
});

test('a diagram: empty, cleaned, counted', () => {
  const empty = m.emptyDiagram();
  assert.deepEqual(Object.keys(empty), ['title', 'author', 'stages', 'characters', 'setting', 'problem']);
  assert.deepEqual(Object.keys(empty.stages), STAGE_IDS);
  assert.ok(m.isEmptyDiagram(empty));
  assert.equal(m.filledStages(empty), 0);
  assert.deepEqual(m.cleanDiagram(null), empty);
  assert.deepEqual(m.cleanDiagram({ title: 7, stages: 'no', extra: 'x' }), empty);
  const messy = m.cleanDiagram({ title: '  The   Big\nRace ', author: 'A.\tWriter', stages: { climax: ' One.\r\n\r\n\r\nTwo.  \n', rising: 'x'.repeat(400), other: 'no' }, problem: ' a  b ' });
  assert.equal(messy.title, 'The Big Race');
  assert.equal(messy.author, 'A. Writer');
  assert.equal(messy.stages.climax, 'One.\nTwo.');
  assert.equal(messy.stages.rising.length, LIMITS.stage);
  assert.equal(messy.stages.other, undefined);
  assert.equal(messy.problem, 'a b');
  assert.equal(m.filledStages(messy), 2);
  assert.ok(!m.isEmptyDiagram(messy));
  assert.ok(!m.isEmptyDiagram({ ...empty, setting: 'A farm' }));
  // Limits count characters, not bytes, and never cut a character in half.
  assert.equal(Array.from(m.cleanDiagram({ title: '🙂'.repeat(100) }).title).length, LIMITS.title);
  assert.deepEqual(m.cleanDiagram(messy), messy, 'cleaning twice changes nothing');
});

test('the finished diagram of a tale holds every event on its own stage', () => {
  for (const tale of TALES) {
    const d = m.diagramFromTale(tale);
    assert.deepEqual(m.cleanDiagram(d), d, `${tale.slug}: fits the limits of the builder`);
    assert.equal(d.title, tale.title);
    assert.equal(m.filledStages(d), 5);
    for (const stage of STAGES) assert.deepEqual(d.stages[stage.id].split('\n'), m.eventsFor(tale, stage.id).map(item => item.text));
    assert.equal(d.problem, tale.problem);
  }
});

test('a diagram travels in a link and comes back the same', () => {
  const samples = [m.emptyDiagram(), ...TALES.map(m.diagramFromTale), m.cleanDiagram({ title: 'Ñandú & “quotes” <b>', author: 'Zoë', stages: { exposition: 'Line one\nLine two', climax: '日本語 🙂' }, setting: 'a/b?c#d' })];
  for (const d of samples) {
    const text = m.encodeDiagram(d);
    assert.match(text, /^[\w-]+$/, 'safe to put after # in a link');
    assert.deepEqual(m.decodeDiagram(text), d);
  }
  const full = m.cleanDiagram({ title: 'é'.repeat(200), author: 'é'.repeat(200), stages: Object.fromEntries(STAGE_IDS.map(id => [id, 'é'.repeat(400)])), characters: 'é'.repeat(400), setting: 'é'.repeat(400), problem: 'é'.repeat(400) });
  assert.ok(m.encodeDiagram(full).length < 8000, 'a full diagram still fits in a link');
  assert.deepEqual(m.decodeDiagram(m.encodeDiagram(full)), full);
  // Anything that is not a diagram is refused, and nothing is trusted: a link can be typed by anyone.
  for (const bad of ['', 'abc', '!!!!', 'e30', btoa('[2,"a"]'), btoa(JSON.stringify([1, 'a', 'b'])), btoa(JSON.stringify([1, 'a', 'b', 1, 2, 3, 4, 5, 6, 7, 8])), null, undefined, 12]) assert.equal(m.decodeDiagram(bad), null, String(bad));
  const long = [1, 'T'.repeat(500), '', ...STAGE_IDS.map(() => 'x'.repeat(900)), '', '', ''];
  const decoded = m.decodeDiagram(btoa(JSON.stringify(long)).replace(/=+$/, ''));
  assert.equal(decoded.title.length, LIMITS.title);
  assert.equal(decoded.stages.climax.length, LIMITS.stage);
});

test('rounds: every card once, the same for the same number, never in story order', () => {
  assert.equal(m.buildRound('no-such-story', 1), null);
  for (const tale of TALES) {
    const orders = new Set();
    for (let seed = 1; seed <= 300; seed++) {
      const round = m.buildRound(tale.slug, seed);
      assert.equal(round.tale, tale);
      assert.equal(round.seed, seed);
      const ids = round.cards.map(card => card.id);
      assert.deepEqual([...ids].sort((a, b) => a - b), tale.events.map(item => item.id), `${tale.slug} round ${seed}: every card once`);
      assert.notDeepEqual(ids, tale.events.map(item => item.id), `${tale.slug} round ${seed}: not in story order`);
      assert.deepEqual(m.buildRound(tale.slug, seed).cards, round.cards, 'the same again');
      orders.add(ids.join(''));
    }
    assert.ok(orders.size > 100, `${tale.slug}: ${orders.size} different orders in 300 rounds`);
  }
});

test('checking and scoring', () => {
  for (const tale of TALES) {
    const right = Object.fromEntries(tale.events.map(item => [item.id, item.stage]));
    const perfect = m.scoreRound(tale, right);
    assert.deepEqual([perfect.correct, perfect.total, perfect.perfect], [tale.events.length, tale.events.length, true]);
    for (const item of tale.events) {
      for (const stage of STAGES) {
        assert.equal(m.checkPlacement(item, stage.id), stage.id === item.stage);
        const line = m.feedback(item, stage.id);
        assert.ok(line.endsWith(item.why) && !/undefined/.test(line));
        if (stage.id === item.stage) assert.ok(line.startsWith('Right. '));
        else assert.ok(line.startsWith(`This belongs to the ${m.stageById(item.stage).name.toLowerCase()}. `), line);
      }
    }
    // Swap the climax and the resolution: two wrong, and the results say which.
    const climax = m.climaxOf(tale), ending = m.eventsFor(tale, 'resolution')[0];
    const swapped = m.scoreRound(tale, { ...right, [climax.id]: 'resolution', [ending.id]: 'climax' });
    assert.equal(swapped.correct, tale.events.length - 2);
    assert.equal(swapped.perfect, false);
    assert.deepEqual(swapped.results.filter(result => !result.right).map(result => result.event), [climax, ending]);
    assert.equal(swapped.results.find(result => result.event === climax).placed, 'resolution');
    // A card that was never placed is wrong, not an error.
    assert.equal(m.scoreRound(tale, {}).correct, 0);
    assert.equal(m.scoreRound(tale, {}).results[0].placed, null);
  }
  const messages = [6, 5, 4, 3, 2, 1, 0].map(correct => m.resultMessage({ correct, total: 6 }));
  assert.equal(new Set(messages).size, 4);
  assert.match(messages[0], /Every event is in the right place/);
  assert.equal(messages[1], messages[2]);
  assert.match(messages[3], /climax/);
});

test('example pages: unique titles and descriptions that fit a search result', () => {
  const metas = TALES.map(m.exampleMeta);
  assert.equal(new Set(metas.map(meta => meta.title)).size, 6);
  assert.equal(new Set(metas.map(meta => meta.description)).size, 6);
  assert.equal(new Set(metas.map(meta => meta.heading)).size, 6);
  TALES.forEach((tale, i) => {
    const { title, description, heading } = metas[i];
    assert.ok(title.startsWith(`Plot Diagram of ${tale.title}`) && title.length >= 15 && title.length <= 65, `${tale.slug}: title ${title?.length}`);
    assert.ok(description.includes(tale.title) && description.length >= 120 && description.length <= 155, `${tale.slug}: description ${description?.length}`);
    assert.equal(heading, `Plot diagram of ${tale.title}`);
    assert.equal(m.examplePath(tale), `/tools/plot-diagram/examples/${tale.slug}/`);
    assert.equal(m.practicePath(tale), `/tools/plot-diagram/?story=${tale.slug}`);
    assert.equal(m.practicePath(tale, 42), `/tools/plot-diagram/?story=${tale.slug}&round=42`);
  });
  assert.equal(metas[0].title, 'Plot Diagram of The Three Little Pigs: Story Mountain Example');
});

/* ------------------------------------------------------------ drawing */

test('text is measured and wrapped to fit', () => {
  assert.ok(view.textWidth('mmmm', 15) > view.textWidth('iiii', 15));
  assert.ok(view.textWidth('Climax', 15, 'bold') > view.textWidth('Climax', 15));
  assert.equal(view.textWidth('', 15), 0);
  assert.equal(view.textWidth('é', 10), view.textWidth('e', 10));
  for (const tale of TALES) {
    for (const item of tale.events) {
      const lines = view.wrapText(item.text, 216, 15);
      assert.equal(lines.map(line => line.text).join(' '), item.text, 'no word is lost or changed');
      for (const line of lines) assert.ok(view.textWidth(line.text, 15) <= 216, line.text);
    }
  }
  assert.deepEqual(view.wrapText('One.\nTwo.', 200, 15).map(line => [line.text, line.gap]), [['One.', false], ['Two.', true]]);
  assert.deepEqual(view.wrapText('', 200, 15), []);
  // A word wider than the box is cut, not lost. Extra lines end in an ellipsis.
  const cut = view.wrapText('x'.repeat(120), 100, 15);
  assert.ok(cut.length > 5 && cut.every(line => view.textWidth(line.text, 15) <= 100));
  assert.equal(cut.map(line => line.text).join(''), 'x'.repeat(120));
  const clipped = view.wrapText('The quick brown fox jumps over the lazy dog again and again', 100, 15, 'regular', 2);
  assert.equal(clipped.length, 2);
  assert.ok(clipped[1].text.endsWith('…') && view.textWidth(clipped[1].text, 15) <= 104);
});

const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const longest = m.cleanDiagram({ title: 'A very long title that goes on and on for as long as a title may', author: 'Someone With A Long Name', stages: Object.fromEntries(STAGE_IDS.map(id => [id, 'Many words fill this box. '.repeat(20)])), characters: 'c '.repeat(100), setting: 's '.repeat(100), problem: 'p '.repeat(100) });
const lopsided = m.cleanDiagram({ title: 'Lopsided', stages: { rising: 'A long build-up with many steps. '.repeat(9) } });
const layouts = [['empty', m.emptyDiagram(), { prompts: true }], ['blank', m.emptyDiagram(), { blank: { lines: 3 } }], ['longest', longest, {}], ['lopsided', lopsided, { prompts: true }], ...TALES.map(tale => [tale.slug, m.diagramFromTale(tale), {}])];

test('the mountain: boxes never overlap or leave the drawing, whatever is typed', () => {
  for (const [name, diagram, opts] of layouts) {
    const L = view.layoutDiagram(diagram, opts);
    const boxes = [...STAGE_IDS.map(id => L.boxes[id]), ...(L.notes ? [L.notes] : [])];
    boxes.forEach((box, i) => {
      assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.w <= L.width && box.y + box.h <= L.height, `${name}: box ${i} is inside the drawing`);
      for (const other of boxes.slice(i + 1)) assert.ok(!overlap(box, other), `${name}: boxes ${i} and ${boxes.indexOf(other)} overlap`);
    });
    // The climax is above the peak, the peak above the ground, the beginning and ending below the ground.
    assert.ok(L.boxes.climax.y + L.boxes.climax.h < L.peak && L.peak < L.base, name);
    assert.ok(L.boxes.exposition.y > L.base && L.boxes.resolution.y > L.base, name);
    assert.ok(L.boxes.rising.y + L.boxes.rising.h < L.base && L.boxes.falling.y + L.boxes.falling.h < L.base, name);
    assert.ok(L.boxes.rising.x + L.boxes.rising.w < L.markers.rising.x && L.markers.falling.x < L.boxes.falling.x, name);
    assert.deepEqual(STAGE_IDS.map(id => L.markers[id].x), STAGE_IDS.map(id => L.markers[id].x).sort((a, b) => a - b), `${name}: the markers run left to right`);
    assert.equal(L.markers.climax.y, L.peak);
    assert.ok(L.base - L.peak <= 430, `${name}: the mountain stays in proportion`);
  }
});

test('the drawing shows every word of the diagram, and nothing unsafe', () => {
  for (const tale of TALES) {
    const d = m.diagramFromTale(tale);
    const svg = view.diagramSvg(d);
    const text = strip(svg);
    assert.match(svg, /^<svg class="pd-svg pd-wide" viewBox="0 0 880 \d+" role="img" aria-label="Story mountain for [^"]+">/);
    for (const stage of STAGES) assert.ok(svg.includes(`data-stage="${stage.id}"`) && text.includes(stage.name), stage.id);
    // Every word of every event is in the drawing (lines are broken, so compare word by word).
    const drawn = text.split(' ');
    for (const item of tale.events) for (const word of item.text.split(' ')) assert.ok(drawn.includes(word), `${tale.slug}: “${word}”`);
    for (const word of [...tale.title.split(' '), ...tale.problem.split(' ')]) assert.ok(drawn.includes(word), `${tale.slug}: “${word}”`);
    assert.ok(!/undefined|NaN/.test(svg), tale.slug);
    assert.ok(!/ id="/.test(svg), 'no ids, so several drawings can share a page');
    const html = view.diagramHtml(d);
    const stack = strip(html.slice(html.indexOf('<div class="pd-stack">')));
    for (const item of tale.events) assert.ok(stack.includes(item.text), `${tale.slug}: the stacked list has “${item.text}”`);
    assert.equal((html.match(/<svg /g) ?? []).length, 2, 'the wide mountain and the small one');
  }
  const nasty = m.cleanDiagram({ title: '<script>alert(1)</script>', stages: { climax: '"><img src=x onerror=alert(1)>' }, setting: '<b>x</b> & y' });
  const html = view.diagramHtml(nasty, { prompts: true });
  assert.ok(!/<script|<img|<b>/.test(html), 'typed text is escaped');
  assert.ok(html.includes('&lt;b&gt;x&lt;/b&gt; &amp; y'));
});

test('an empty diagram shows the questions; a worksheet shows lines to write on', () => {
  const empty = view.diagramSvg(m.emptyDiagram(), { prompts: true });
  for (const stage of STAGES) assert.ok(strip(empty).includes(stage.prompt.split(' ').slice(0, 3).join(' ')), stage.id);
  assert.equal((empty.match(/class="pd-marker is-empty"/g) ?? []).length, 5);
  assert.ok(strip(empty).includes('Story title'));
  const half = view.diagramHtml(m.cleanDiagram({ stages: { climax: 'The race is won.' } }), { prompts: true });
  assert.equal((half.match(/class="pd-marker is-empty"/g) ?? []).length, 8, 'four empty markers on each of the two mountains');
  const blank = view.diagramSvg(m.emptyDiagram(), { blank: { lines: 3 } });
  assert.equal((blank.match(/class="pd-rule"/g) ?? []).length, 15, 'three lines in each of the five boxes');
  assert.match(blank, /aria-label="A blank story mountain/);
  assert.ok(!blank.includes('is-empty'));
  for (const stage of STAGES) assert.match(view.stageIconSvg(stage.id), /^<svg class="pd-icon".*pd-icon-part.*<\/svg>$/);
  const mini = view.miniMountainSvg();
  for (const stage of STAGES) assert.ok(mini.includes(`>${stage.name}<`));
});

/* ---------------------------------------------------------- worksheet */

test('the worksheet and its answer key are built from the bank', () => {
  const [events, mountain, questions] = activity.sections;
  const tale = m.taleBySlug(WORKSHEET_TALE);
  assert.deepEqual(events.cards, m.buildRound(WORKSHEET_TALE, WORKSHEET_ROUND).cards, 'the cards are a round of the practice mode');
  assert.equal(events.tale, tale);
  assert.equal(mountain.tale, tale);
  assert.equal(events.type, 'plot-diagram');
  assert.equal(events.task, 'events');
  assert.equal(mountain.task, 'mountain');
  assert.ok(events.heading.includes(tale.title) && activity.steps[1].includes(tale.title));
  // The cards are mixed up: not in story order, and the stage numbers are not simply 1 to 5.
  assert.notDeepEqual(events.cards.map(card => card.id), tale.events.map(item => item.id));
  assert.deepEqual([...events.cards].sort((a, b) => a.id - b.id), tale.events);
  // The intro lists the five stages by number and says how many stages hold two events.
  for (const stage of STAGES) assert.ok(events.intro.includes(`${stage.number} ${stage.name}`));
  const doubles = STAGES.filter(stage => m.eventsFor(tale, stage.id).length === 2).length;
  assert.equal(doubles, 1);
  assert.ok(events.intro.includes('One stage has two events.'));
  // Question 1 names the climax by its letter on the worksheet.
  const letter = 'ABCDEFGH'[events.cards.indexOf(m.climaxOf(tale))];
  assert.ok(questions.items[0].a.startsWith(`Event ${letter}: “${m.climaxOf(tale).text}” ${m.climaxOf(tale).why}`));
  const falling = 'ABCDEFGH'[events.cards.indexOf(m.eventsFor(tale, 'falling')[0])], ending = 'ABCDEFGH'[events.cards.indexOf(m.eventsFor(tale, 'resolution')[0])];
  assert.ok(questions.items[1].a.includes(`event ${falling} is the falling action and event ${ending} is the resolution`));
  assert.equal(mountain.lookFor.length, 2);
  assert.deepEqual(activity.standards, Object.keys(standards));
  assert.equal(activity.tool, 'plot-diagram');
});
