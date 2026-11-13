// The Plot Diagram Builder's model: the five stages of a plot diagram, the story bank for the practice mode,
// and the rules. Pure data and functions, shared by the tool, the example pages, the printable worksheet,
// the answer key and the tests.
//
// The six tales are old public-domain stories, retold here in our own words. Every event belongs to exactly
// one stage, and each tale has exactly one climax event: the moment that decides the main problem. If you
// add a tale or an event, keep to that rule, and never split a turning point across two cards.

/* --------------------------------------------------------------- stages */

export const STAGES = [
  {
    id: 'exposition', number: 1, name: 'Exposition', also: 'the beginning',
    definition: 'The start of the story. We meet the characters, see the setting and learn how things stand before the action begins.',
    prompt: 'What do we learn at the start, before the trouble begins?',
  },
  {
    id: 'rising', number: 2, name: 'Rising action',
    definition: 'The problem appears and grows. One event leads to the next, and the tension builds.',
    prompt: 'What problem starts, and how does it grow?',
  },
  {
    id: 'climax', number: 3, name: 'Climax',
    definition: 'The turning point: the most tense moment, when the main problem is decided. After it, we know how things will turn out.',
    prompt: 'What is the turning point?',
  },
  {
    id: 'falling', number: 4, name: 'Falling action',
    definition: 'What happens right after the climax, because of it. The tension drops and loose ends are tied up.',
    prompt: 'What happens because of the turning point?',
  },
  {
    id: 'resolution', number: 5, name: 'Resolution', also: 'the ending',
    definition: 'The ending. The problem is over, and we see how life is for the characters now.',
    prompt: 'How does the story end?',
  },
];
export const STAGE_IDS = STAGES.map(stage => stage.id);
export const stageById = id => STAGES.find(stage => stage.id === id);

// Optional boxes beside the mountain.
export const EXTRAS = [
  { id: 'characters', name: 'Characters', prompt: 'Who is in the story?' },
  { id: 'setting', name: 'Setting', prompt: 'Where and when does it happen?' },
  { id: 'problem', name: 'Problem', prompt: 'What does the main character have to deal with? This is also called the conflict.' },
];

/* ------------------------------------------------------- the story bank */

const event = (stage, text, why) => ({ stage, text, why });

const BANK = [
  {
    slug: 'three-little-pigs',
    title: 'The Three Little Pigs',
    origin: 'a traditional tale',
    characters: 'Three little pigs and a hungry wolf',
    setting: 'Three small houses near the woods, once upon a time',
    problem: 'A hungry wolf wants to catch the pigs, and he can blow weak houses down.',
    summary: 'Three little pigs leave home to build houses of their own. The first pig builds with straw and the second with sticks, because that is quick. The third pig works hard and builds with bricks. Then a hungry wolf comes. He blows down the straw house and the stick house, and the two pigs run to their brother. The wolf cannot blow down the brick house, so he climbs down the chimney and falls into a pot of hot water. He runs away, and the pigs live safely together.',
    tricky: 'The wolf blowing down the first two houses is exciting, but it is not the climax, because the pigs are still in danger. The climax comes at the brick house, where the wolf’s last plan fails.',
    events: [
      event('exposition', 'Three little pigs leave home. One builds a house of straw, one of sticks and one of bricks.', 'It introduces the characters and their houses before any trouble starts.'),
      event('rising', 'A hungry wolf blows down the straw house, and the first pig runs to the stick house.', 'The problem appears: a wolf is after the pigs.'),
      event('rising', 'The wolf blows down the stick house too, and both pigs run to the brick house.', 'The problem grows: only one house is left.'),
      event('climax', 'The wolf cannot blow down the brick house. He climbs down the chimney and falls into a pot of hot water.', 'It is the turning point: the wolf’s last plan fails, so we know the pigs will be safe.'),
      event('falling', 'The wolf howls, jumps out of the pot and runs off into the woods.', 'It happens because of the climax, and the danger fades.'),
      event('resolution', 'The wolf never comes back, and the three pigs live safely in the brick house.', 'It is the ending: the problem is over for good.'),
    ],
  },
  {
    slug: 'cinderella',
    title: 'Cinderella',
    origin: 'a traditional fairy tale',
    characters: 'Cinderella, her stepmother, two stepsisters, a fairy godmother and a prince',
    setting: 'A kingdom long ago: Cinderella’s home and the royal palace',
    problem: 'Cinderella’s stepfamily treats her as a servant and tries to keep her from a happier life.',
    summary: 'Cinderella lives with her stepmother and two stepsisters. They make her do all the work. The prince holds a ball, but she is told to stay home. Her fairy godmother sends her there in a fine gown and glass slippers. The magic will end at midnight. Cinderella dances with the prince. Then the clock strikes, she runs, and she loses a slipper. The prince searches the kingdom for its owner. The slipper fits Cinderella. The prince asks her to marry him, and they live happily ever after.',
    tricky: 'Midnight at the ball is exciting, but it is not the climax. After it, we still do not know whether the prince will ever find Cinderella. The moment the slipper fits settles that.',
    events: [
      event('exposition', 'Cinderella lives with her stepmother and two stepsisters, who make her do all the housework.', 'It introduces Cinderella and her life at home before the action begins.'),
      event('rising', 'Helped by her fairy godmother, Cinderella dances with the prince at the ball. At midnight she has to run, and she loses a glass slipper.', 'The action builds: the prince wants to find her, but he does not know who she is.'),
      event('rising', 'The prince takes the slipper from house to house. Cinderella’s stepsisters try it on, but it does not fit them.', 'The tension grows as the search reaches Cinderella’s own house.'),
      event('climax', 'Cinderella tries on the glass slipper, and it fits perfectly.', 'It is the turning point: the prince has found her, so we know her life is about to change.'),
      event('falling', 'The prince asks Cinderella to marry him, and she forgives her stepsisters.', 'It happens because of the climax, and it ties up the loose ends.'),
      event('resolution', 'Cinderella and the prince are married and live happily ever after.', 'It is the ending: Cinderella’s hard life is over.'),
    ],
  },
  {
    slug: 'little-red-riding-hood',
    title: 'Little Red Riding Hood',
    origin: 'a traditional fairy tale',
    characters: 'Little Red Riding Hood, her mother, her grandmother, a wolf and a woodcutter',
    setting: 'A forest path and Grandmother’s cottage, long ago',
    problem: 'A sly wolf wants to catch Little Red Riding Hood and her grandmother.',
    summary: 'Little Red Riding Hood sets out with a basket of food for her grandmother. Her mother tells her to stay on the path. In the forest she meets a wolf and tells him where she is going. The wolf runs ahead, shuts Grandmother in a cupboard and waits in her bed. When Little Red Riding Hood arrives, he leaps out at her. A woodcutter hears her shout and chases the wolf away. Grandmother is set free, and everyone is safe.',
    tricky: 'Meeting the wolf in the forest starts the trouble, so it belongs to the rising action. The climax comes at the cottage, when the wolf leaps out and the woodcutter stops him.',
    events: [
      event('exposition', 'Little Red Riding Hood’s mother gives her a basket of food for Grandmother and tells her to stay on the path.', 'It introduces the main character, her errand and the rule she is given.'),
      event('rising', 'In the forest Little Red Riding Hood meets a wolf and tells him the way to Grandmother’s cottage.', 'The problem appears: now the wolf knows where to go.'),
      event('rising', 'The wolf runs ahead, shuts Grandmother in a cupboard and gets into her bed wearing her nightcap.', 'The problem grows: the wolf has set a trap.'),
      event('climax', 'The wolf leaps out of the bed at Little Red Riding Hood, but a woodcutter hears her shout, bursts in and drives him out.', 'It is the turning point: the wolf’s trap fails and help has come, so we know she will be safe.'),
      event('falling', 'The wolf runs off into the forest, and the woodcutter lets Grandmother out of the cupboard.', 'It happens because of the climax, and the danger fades.'),
      event('resolution', 'Everyone is safe, and Little Red Riding Hood promises to stay on the path from now on.', 'It is the ending: the problem is over and she has learned a lesson.'),
    ],
  },
  {
    slug: 'goldilocks-and-the-three-bears',
    title: 'Goldilocks and the Three Bears',
    origin: 'a traditional tale',
    characters: 'Goldilocks, Father Bear, Mother Bear and Baby Bear',
    setting: 'The three bears’ cottage in the forest, one morning',
    problem: 'Goldilocks goes into the bears’ cottage without asking and uses their things.',
    summary: 'Three bears leave their porridge to cool and go for a walk in the forest. A girl named Goldilocks finds their cottage and walks in. She tastes the porridge, sits in the chairs and tries the beds. Baby Bear’s things feel just right, so she eats his porridge, breaks his chair and falls asleep in his bed. The bears come home and find her there. Goldilocks wakes, sees the three bears and runs away. They never see her again.',
    tricky: 'The bears coming home builds the tension, but the climax is one step later, when they find Goldilocks and she wakes up. That is the moment the whole story has been building toward.',
    events: [
      event('exposition', 'Three bears live in a cottage in the forest. One morning they go for a walk while their porridge cools.', 'It introduces the bears and their home before the trouble starts.'),
      event('rising', 'Goldilocks walks into the empty cottage. She eats Baby Bear’s porridge, breaks his chair and falls asleep in his bed.', 'The problem appears: she is using things that are not hers.'),
      event('rising', 'The bears come home. They find the porridge eaten and the chair broken, and they go upstairs to look.', 'The tension grows: the bears are getting closer to finding her.'),
      event('climax', 'The bears find Goldilocks in Baby Bear’s bed. She wakes up and sees three bears looking at her.', 'It is the turning point: she has been found, and it is the most tense moment in the story.'),
      event('falling', 'Goldilocks jumps out of bed, runs down the stairs and dashes out of the door.', 'It happens because of the climax, and the tension drops as she gets away.'),
      event('resolution', 'Goldilocks never comes back, and the three bears have their cottage to themselves again.', 'It is the ending: the problem is over.'),
    ],
  },
  {
    slug: 'jack-and-the-beanstalk',
    title: 'Jack and the Beanstalk',
    origin: 'a traditional fairy tale',
    characters: 'Jack, his mother and a giant',
    setting: 'A poor cottage and a giant’s castle in the clouds, long ago',
    problem: 'Jack and his mother are very poor, and the treasure that could help them is guarded by a giant.',
    summary: 'Jack and his mother are so poor that she sends him to sell their cow. Jack swaps it for magic beans instead, and overnight a huge beanstalk grows. He climbs it to a giant’s castle in the clouds and takes a hen that lays golden eggs. The giant wakes and chases him. Jack reaches the ground first and chops the beanstalk down, so the giant cannot follow. With the hen’s golden eggs, Jack and his mother are never poor again.',
    tricky: 'The chase is thrilling, but it is still rising action, because Jack is not safe yet. The climax is the moment the beanstalk falls and the giant can no longer reach him.',
    events: [
      event('exposition', 'Jack and his mother are very poor, so she sends him to market to sell their cow.', 'It introduces Jack, his mother and how things stand at the start.'),
      event('rising', 'Jack swaps the cow for magic beans. By morning a huge beanstalk has grown up into the clouds.', 'The action starts to build: the beanstalk leads somewhere new.'),
      event('rising', 'Jack climbs to a giant’s castle and takes a hen that lays golden eggs. The giant wakes and chases him.', 'The tension grows: now Jack is in danger.'),
      event('climax', 'Jack reaches the ground and chops through the beanstalk. It crashes down, and the giant cannot follow.', 'It is the turning point: with the beanstalk gone, Jack is safe from the giant.'),
      event('falling', 'Jack shows the hen to his mother, and it lays a golden egg.', 'It comes right after the climax, and the tension drops: the danger has passed.'),
      event('resolution', 'With a golden egg every day, Jack and his mother are never poor again.', 'It is the ending: the problem from the start of the story is solved.'),
    ],
  },
  {
    slug: 'tortoise-and-the-hare',
    title: 'The Tortoise and the Hare',
    origin: 'one of Aesop’s fables',
    characters: 'A hare, a tortoise and the other animals',
    setting: 'A path through the fields on a warm day',
    problem: 'A fast hare and a slow tortoise race each other, and the hare is sure he cannot lose.',
    summary: 'A hare is proud of his speed and laughs at a tortoise for being slow. The tortoise challenges him to a race, and the hare agrees. When the race starts, the hare shoots far ahead. He is so sure of winning that he lies down for a nap. The tortoise keeps plodding along, step after step. The hare wakes and dashes for the finish, but the tortoise crosses the line first. The hare learns that slow and steady wins the race.',
    tricky: 'The hare falling asleep is what lets the tortoise win, but it is not the climax. The race is decided only when the tortoise crosses the finish line.',
    events: [
      event('exposition', 'A hare is proud of how fast he can run, and he often laughs at a tortoise for being slow.', 'It introduces the two characters and how things stand between them.'),
      event('rising', 'The tortoise challenges the hare to a race. When it starts, the hare shoots far ahead.', 'The problem appears: the race is on, and the tortoise looks sure to lose.'),
      event('rising', 'Sure that he will win, the hare lies down under a tree and falls asleep. The tortoise keeps walking.', 'The tension grows: now the tortoise has a chance.'),
      event('climax', 'The hare wakes up and dashes for the finish, but the tortoise crosses the line first.', 'It is the turning point: the race is decided, and the tortoise has won.'),
      event('falling', 'The other animals cheer for the tortoise, and the hare hangs his head.', 'It happens because of the climax, and the tension drops.'),
      event('resolution', 'The hare never laughs at the tortoise again. He has learned that slow and steady wins the race.', 'It is the ending: the problem is over and the lesson is learned.'),
    ],
  },
];

// Events are numbered in story order: the id of an event is its place in the tale (1, 2, 3, …).
export const TALES = BANK.map(tale => ({ ...tale, events: tale.events.map((item, i) => ({ id: i + 1, ...item })) }));
export const taleBySlug = slug => TALES.find(tale => tale.slug === slug);
export const eventsFor = (tale, stageId) => tale.events.filter(item => item.stage === stageId);
export const climaxOf = tale => eventsFor(tale, 'climax')[0];

/* ----------------------------------------------------------- a diagram */

// The most characters each box of a diagram holds.
export const LIMITS = { title: 80, author: 60, stage: 280, extra: 160 };

/** A diagram with nothing in it: { title, author, stages: { exposition, … }, characters, setting, problem }. */
export function emptyDiagram() {
  return { title: '', author: '', stages: Object.fromEntries(STAGE_IDS.map(id => [id, ''])), ...Object.fromEntries(EXTRAS.map(extra => [extra.id, ''])) };
}

const tidy = (value, limit, lines) => {
  let text = typeof value === 'string' ? value : '';
  text = text.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ');
  text = lines ? text.replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{2,}/g, '\n') : text.replace(/\s+/g, ' ');
  return Array.from(text.trim()).slice(0, limit).join('').trim();
};

/** Any object made safe to show: every box a trimmed string, no longer than its limit. */
export function cleanDiagram(input) {
  const from = input && typeof input === 'object' ? input : {};
  const stages = from.stages && typeof from.stages === 'object' ? from.stages : {};
  return {
    title: tidy(from.title, LIMITS.title),
    author: tidy(from.author, LIMITS.author),
    stages: Object.fromEntries(STAGE_IDS.map(id => [id, tidy(stages[id], LIMITS.stage, true)])),
    ...Object.fromEntries(EXTRAS.map(extra => [extra.id, tidy(from[extra.id], LIMITS.extra, true)])),
  };
}

/** How many of the five stages have something written in them. */
export const filledStages = diagram => STAGE_IDS.filter(id => diagram.stages[id]).length;
export const isEmptyDiagram = diagram => !diagram.title && !diagram.author && filledStages(diagram) === 0 && EXTRAS.every(extra => !diagram[extra.id]);

/** The finished diagram of a tale from the bank: two events in one stage are written on two lines. */
export function diagramFromTale(tale) {
  return {
    title: tale.title,
    author: '',
    stages: Object.fromEntries(STAGE_IDS.map(id => [id, eventsFor(tale, id).map(item => item.text).join('\n')])),
    characters: tale.characters,
    setting: tale.setting,
    problem: tale.problem,
  };
}

/* ------------------------------------------------- a diagram in a link */

// A diagram travels in the part of a link after "#", which browsers never send to a server. It is a list
// [version, title, author, the five stages, characters, setting, problem] as JSON, UTF-8, base64url.
const VERSION = 1;

/** The text to put after "#d=" in a link. */
export function encodeDiagram(diagram) {
  const d = cleanDiagram(diagram);
  const list = [VERSION, d.title, d.author, ...STAGE_IDS.map(id => d.stages[id]), ...EXTRAS.map(extra => d[extra.id])];
  const bytes = new TextEncoder().encode(JSON.stringify(list));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** The diagram held in a link, cleaned, or null if the text is not one. */
export function decodeDiagram(text) {
  try {
    if (typeof text !== 'string' || !/^[\w-]{4,12000}$/.test(text)) return null;
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const list = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    const size = 3 + STAGE_IDS.length + EXTRAS.length;
    if (!Array.isArray(list) || list[0] !== VERSION || list.length !== size || list.slice(1).some(item => typeof item !== 'string')) return null;
    const [, title, author, ...rest] = list;
    return cleanDiagram({
      title, author,
      stages: Object.fromEntries(STAGE_IDS.map((id, i) => [id, rest[i]])),
      ...Object.fromEntries(EXTRAS.map((extra, i) => [extra.id, rest[STAGE_IDS.length + i]])),
    });
  } catch {
    return null;
  }
}

/* ------------------------------------------------------ sort the events */

/** A small seeded random number generator (mulberry32), so a round can be built again from its number. */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(list, random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const inStoryOrder = cards => cards.every((card, i) => i === 0 || card.id > cards[i - 1].id);

/**
 * The event cards of a tale in a shuffled order, the same every time for the same round number:
 * { tale, seed, cards }. The cards never come out in story order, which would give the answer away.
 */
export function buildRound(slug, seed) {
  const tale = taleBySlug(slug);
  if (!tale) return null;
  const random = seededRandom(seed);
  let cards = shuffled(tale.events, random);
  while (inStoryOrder(cards)) cards = shuffled(tale.events, random);
  return { tale, seed, cards };
}

/** Is this event on the right stage? */
export const checkPlacement = (item, stageId) => item.stage === stageId;

/**
 * Score for a tale once every card is placed. `placements` maps an event id to the stage it was put on.
 * Returns { correct, total, perfect, results: [{ event, placed, right }] } in story order.
 */
export function scoreRound(tale, placements) {
  const results = tale.events.map(item => ({ event: item, placed: placements[item.id] ?? null, right: checkPlacement(item, placements[item.id]) }));
  const correct = results.filter(result => result.right).length;
  return { correct, total: results.length, perfect: correct === results.length, results };
}

/** The one-line reason shown on a card after checking. */
export function feedback(item, placed) {
  if (checkPlacement(item, placed)) return `Right. ${item.why}`;
  return `This belongs to the ${stageById(item.stage).name.toLowerCase()}. ${item.why}`;
}

/** A short, kind message for the score. */
export function resultMessage({ correct, total }) {
  if (correct === total) return 'Every event is in the right place. You know how this story is built.';
  if (correct >= total - 2) return 'Nearly there. Read the reasons on the cards you missed, then fix them.';
  if (correct >= total / 2) return 'Good start. Find the climax first: it is the moment that decides the problem.';
  return 'Keep going. Read the story again, find the problem, then look for the moment that decides it.';
}

/* -------------------------------------------------------------- pages */

export const TOOL_PATH = '/tools/plot-diagram/';
export const examplePath = tale => `${TOOL_PATH}examples/${tale.slug}/`;
/** The link that opens the practice mode on one tale, with the round number if the order matters. */
export const practicePath = (tale, seed) => `${TOOL_PATH}?story=${tale.slug}${seed ? `&round=${seed}` : ''}`;

/** Title and description of a tale's example page. Each fits a search result: the longest form that fits is used. */
export function exampleMeta(tale) {
  const titles = [`Plot Diagram of ${tale.title}: Story Mountain Example`, `Plot Diagram of ${tale.title}: Story Mountain`, `Plot Diagram of ${tale.title}`];
  const descriptions = [
    `See the plot diagram of ${tale.title}: its exposition, rising action, climax, falling action and resolution on a story mountain, with each event explained.`,
    `Plot diagram of ${tale.title}: the exposition, rising action, climax, falling action and resolution on a story mountain, with each event explained.`,
    `Plot diagram of ${tale.title}: exposition, rising action, climax, falling action and resolution on a story mountain, each explained.`,
  ];
  return {
    title: titles.find(text => text.length <= 65),
    description: descriptions.find(text => text.length >= 120 && text.length <= 155),
    heading: `Plot diagram of ${tale.title}`,
  };
}
