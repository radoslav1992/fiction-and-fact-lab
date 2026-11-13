// The Fact or Opinion Game's statement bank and rules: pure data and functions, shared by the game, the
// examples on the page, the printable worksheet, the answer key and the tests.
//
// Every "fact" here is meant to be true, checkable, timeless and uncontroversial: school science, nature,
// geography, maths and everyday life. No records that change, no politics, religion, health advice, brands
// or living people. Opinions are clearly opinions and kind. If you add a statement, keep to those rules.

export const DEFINITIONS = {
  fact: 'A fact is a statement that can be checked and shown to be true.',
  opinion: 'An opinion is what someone thinks, feels or believes. People can disagree about it.',
};

export const ROUND_LENGTH = 10;

export const LEVELS = [
  { id: 1, name: 'Level 1', grades: 'Grades 2–3', ages: 'ages 7–9', about: 'Clear cases. Read the statement and choose Fact or Opinion.' },
  { id: 2, name: 'Level 2', grades: 'Grades 4–5', ages: 'ages 9–11', about: 'Trickier. Opinions with numbers and real things in them, and facts that sound surprising.' },
  { id: 3, name: 'Level 3', grades: 'Grades 6–8', ages: 'ages 11–14', about: 'Mixed sentences. Tap the part that is an opinion, or the clue word that gives it away.' },
];

// Clue words that often signal an opinion, grouped by the job they do.
export const CLUE_WORDS = [
  { job: 'Comparing', words: ['best', 'worst', 'better', 'nicest', 'most interesting'], example: 'Dogs are the best pets.' },
  { job: 'Judging', words: ['beautiful', 'boring', 'delicious', 'scary', 'wonderful'], example: 'Math is boring.' },
  { job: 'Saying what people ought to do', words: ['should', 'ought to', 'must'], example: 'Everyone should have a pet.' },
  { job: 'Too much or too little', words: ['too', 'too much', 'not enough'], example: 'Winter is too cold.' },
  { job: 'Saying it is your own view', words: ['I think', 'I believe', 'I feel', 'in my opinion'], example: 'I think soccer is the greatest game.' },
];

const fact = (id, level, text, why) => ({ id, level, kind: 'fact', text, why });
const opinion = (id, level, text, clues, why) => ({ id, level, kind: 'opinion', text, clues, why });
// A sentence with a fact and an opinion in it. `opinion` is the exact part of `text` that is the opinion.
const mixed = (id, text, opinionPart, clues) => ({ id, level: 3, kind: 'mixed', text, opinion: opinionPart, clues });

export const STATEMENTS = [
  // Level 1, grades 2–3: clear cases.
  fact('a01', 1, 'A triangle has three sides.', 'You can count the sides.'),
  fact('a02', 1, 'There are seven days in a week.', 'You can count them on a calendar.'),
  fact('a03', 1, 'Ice is frozen water.', 'You can check it: put water in a freezer and it turns to ice.'),
  fact('a04', 1, 'A spider has eight legs.', 'You can count the legs.'),
  fact('a05', 1, 'The Sun gives us light.', 'You can see it for yourself on any sunny day.'),
  fact('a06', 1, 'Fish live in water.', 'You can check it by watching fish or reading about them.'),
  fact('a07', 1, 'A year has twelve months.', 'You can count them on a calendar.'),
  fact('a08', 1, 'Birds have feathers.', 'You can look at a bird and see them.'),
  fact('a09', 1, 'Two plus two equals four.', 'You can check it by counting.'),
  fact('a10', 1, 'Plants need water to grow.', 'You can test it: a plant with no water stops growing.'),
  fact('a11', 1, 'A square has four corners.', 'You can count the corners.'),
  fact('a12', 1, 'The Earth goes around the Sun.', 'Scientists have measured it, and you can look it up.'),
  fact('a13', 1, 'Bees make honey.', 'You can look it up, or ask a beekeeper.'),
  fact('a14', 1, 'An hour has sixty minutes.', 'You can count the minutes on a clock.'),
  fact('a15', 1, 'A bicycle has two wheels.', 'You can count the wheels.'),
  fact('a16', 1, 'A baby cat is called a kitten.', 'You can look the word up in a dictionary.'),
  opinion('a17', 1, 'Dogs are the best pets.', ['best'], 'Someone else might say cats or fish are the best pets.'),
  opinion('a18', 1, 'Pizza tastes better than soup.', ['better'], 'It depends on who is eating. Some people like soup more.'),
  opinion('a19', 1, 'Blue is the prettiest color.', ['prettiest'], 'People like different colors.'),
  opinion('a20', 1, 'Math is boring.', ['boring'], 'Many people think math is fun.'),
  opinion('a21', 1, 'Summer is the most fun season.', ['most fun'], 'Some people have more fun in winter.'),
  opinion('a22', 1, 'Spiders are scary.', ['scary'], 'Some people are not scared of spiders at all.'),
  opinion('a23', 1, 'Reading is more fun than drawing.', ['more fun'], 'Some people would rather draw.'),
  opinion('a24', 1, 'Apples are yummy.', ['yummy'], 'Not everyone likes the taste of apples.'),
  opinion('a25', 1, 'Monday is the worst day of the week.', ['worst'], 'Some people like Mondays.'),
  opinion('a26', 1, 'Everyone should have a pet.', ['should'], 'It tells people what to do. Not everyone agrees.'),
  opinion('a27', 1, 'Cats are cuter than dogs.', ['cuter'], 'People find different animals cute.'),
  opinion('a28', 1, 'I think soccer is the greatest game.', ['I think', 'greatest'], '“I think” tells you it is one person’s view.'),
  opinion('a29', 1, 'Chocolate ice cream is delicious.', ['delicious'], 'Some people do not like chocolate ice cream.'),
  opinion('a30', 1, 'Butterflies are beautiful.', ['beautiful'], 'It is a feeling about butterflies. You cannot measure beauty.'),
  opinion('a31', 1, 'Winter is too cold.', ['too'], 'Some people like cold weather.'),
  opinion('a32', 1, 'Carrots taste awful.', ['awful'], 'Many people like the taste of carrots.'),

  // Level 2, grades 4–5: facts that sound surprising, and opinions with numbers or real things in them.
  fact('b01', 2, 'Sound cannot travel through empty space.', 'It sounds odd, but it can be tested. Sound needs something to travel through, such as air or water.'),
  fact('b02', 2, 'To a plant scientist, a tomato is a fruit.', 'It can be checked: a tomato grows from a flower and holds the seeds, which is what makes a fruit.'),
  fact('b03', 2, 'An octopus has three hearts.', 'It is surprising, but scientists who study octopuses have counted them.'),
  fact('b04', 2, 'Bats are mammals.', 'It can be checked: bats have fur and feed their babies milk.'),
  fact('b05', 2, 'Whales breathe air.', 'It can be checked: whales come to the surface to breathe through a blowhole.'),
  fact('b06', 2, 'The Sun is a star.', 'Astronomers have studied it. It only looks different because it is so close to us.'),
  fact('b07', 2, 'Light travels faster than sound.', 'It can be measured. It is why you see lightning before you hear thunder.'),
  fact('b08', 2, 'A spider is not an insect.', 'You can check it: insects have six legs and spiders have eight.'),
  fact('b09', 2, 'Water takes up more space when it freezes.', 'You can test it: a full bottle of water bulges when it freezes.'),
  fact('b10', 2, 'A penguin is a bird that cannot fly.', 'It can be checked by watching penguins or reading about them.'),
  fact('b11', 2, 'The Moon does not make its own light.', 'Scientists have shown that moonlight is sunlight bouncing off the Moon.'),
  fact('b12', 2, 'Sharks are fish.', 'It can be checked: sharks have gills and fins and live in water all their lives.'),
  fact('b13', 2, 'More of the Earth’s surface is covered by water than by land.', 'It can be measured, and you can see it on a globe.'),
  fact('b14', 2, 'A dolphin is a mammal, not a fish.', 'It can be checked: dolphins breathe air and feed their babies milk.'),
  fact('b15', 2, 'Zero is an even number.', 'It can be checked with math: an even number can be divided by two with nothing left over, and zero divided by two is zero.'),
  fact('b16', 2, 'A koala is not a bear.', 'It can be checked: koalas carry their babies in a pouch, like kangaroos.'),
  fact('b17', 2, 'Mushrooms are not plants.', 'Scientists put mushrooms in a different group, the fungi. They cannot make food from sunlight.'),
  opinion('b18', 2, 'A 30-minute recess is too short.', ['too'], 'The number can be checked, but “too short” is a judgment. Someone else might think 30 minutes is plenty.'),
  opinion('b19', 2, 'The Pacific is the most beautiful ocean.', ['most beautiful'], 'The Pacific Ocean is real, but nobody can measure which ocean is the most beautiful.'),
  opinion('b20', 2, 'Saturn is the coolest planet in the solar system.', ['coolest'], 'Saturn is real, but “coolest” is a feeling. Someone else might pick Mars.'),
  opinion('b21', 2, 'Two hours of homework is too much.', ['too much'], 'You can time two hours, but “too much” is a judgment that people disagree about.'),
  opinion('b22', 2, 'Everyone should read 20 books every year.', ['should'], '“Should” tells people what to do. The number does not make it a fact.'),
  opinion('b23', 2, 'Winter is the worst of the four seasons.', ['worst'], 'There are four seasons, but which one is worst depends on who you ask.'),
  opinion('b24', 2, 'Triangles are more interesting than squares.', ['more interesting'], 'Both shapes are real, but “interesting” is a feeling.'),
  opinion('b25', 2, 'Mars would be the most exciting planet to visit.', ['most exciting'], 'Mars is real, but people would be excited by different planets.'),
  opinion('b26', 2, 'Seven is the nicest number.', ['nicest'], 'Seven is a real number, but there is no way to check which number is nicest.'),
  opinion('b27', 2, 'Dinosaurs were the most amazing animals that ever lived.', ['most amazing'], 'Dinosaurs really lived, but “most amazing” is a judgment.'),
  opinion('b28', 2, 'Lunch should last a full hour.', ['should'], '“Should” gives a view about what ought to happen.'),
  opinion('b29', 2, 'A 100-page book is too long for a bedtime story.', ['too long'], 'You can count the pages, but “too long” depends on the reader.'),
  opinion('b30', 2, 'The violin makes a prettier sound than the drum.', ['prettier'], 'Both instruments are real, but people like different sounds.'),
  opinion('b31', 2, 'Rainforests are the most interesting places on Earth.', ['most interesting'], 'Rainforests are real, but someone else might find deserts more interesting.'),
  opinion('b32', 2, 'It is better to have two small dogs than one big dog.', ['better'], 'The numbers are only counting dogs. “Better” is the judgment.'),
  opinion('b33', 2, 'I believe owls are the wisest birds.', ['I believe', 'wisest'], '“I believe” tells you it is one person’s view.'),
  opinion('b34', 2, 'Gold is prettier than silver.', ['prettier'], 'Both metals are real, but which looks prettier is a matter of taste.'),

  // Level 3, grades 6–8: one sentence, a fact and an opinion together.
  mixed('c01', 'Bees make honey, and honey is the tastiest thing you can put on toast.', 'honey is the tastiest thing you can put on toast', ['tastiest']),
  mixed('c02', 'The Moon orbits the Earth, and it looks most beautiful when it is full.', 'it looks most beautiful when it is full', ['most beautiful']),
  mixed('c03', 'Spiders have eight legs, which makes them the creepiest animals in the garden.', 'which makes them the creepiest animals in the garden', ['creepiest']),
  mixed('c04', 'Although whales are mammals, they are less interesting than sharks.', 'they are less interesting than sharks', ['less interesting']),
  mixed('c05', 'A week has seven days, and Saturday is the best one.', 'Saturday is the best one', ['best']),
  mixed('c06', 'Water freezes at 0 degrees Celsius, so winter is a miserable season.', 'winter is a miserable season', ['miserable']),
  mixed('c07', 'Triangles, which have three sides, are the nicest shapes to draw.', 'are the nicest shapes to draw', ['nicest']),
  mixed('c08', 'I think owls are wonderful, and it is true that most owls hunt at night.', 'I think owls are wonderful', ['I think', 'wonderful']),
  mixed('c09', 'The best season is autumn, when the leaves of many trees change color.', 'The best season is autumn', ['best']),
  mixed('c10', 'Mercury, the dullest planet, is the closest planet to the Sun.', 'the dullest planet', ['dullest']),
  mixed('c11', 'Penguins are birds that cannot fly, but they are the funniest swimmers to watch.', 'they are the funniest swimmers to watch', ['funniest']),
  mixed('c12', 'The Sun is a star, and sunsets are prettier than sunrises.', 'sunsets are prettier than sunrises', ['prettier']),
  mixed('c13', 'Everyone should visit a desert, a place that gets very little rain.', 'Everyone should visit a desert', ['should']),
  mixed('c14', 'A hexagon has six sides, which makes it too tricky to draw.', 'which makes it too tricky to draw', ['too']),
  mixed('c15', 'Bats are the scariest animals, even though they are mammals like us.', 'Bats are the scariest animals', ['scariest']),
  mixed('c16', 'Plants need sunlight to grow, so a sunny garden is the loveliest place to sit.', 'a sunny garden is the loveliest place to sit', ['loveliest']),
  mixed('c17', 'An octopus has eight arms, and that makes it the strangest animal in the sea.', 'that makes it the strangest animal in the sea', ['strangest']),
  mixed('c18', 'A piano has black keys and white keys, and it is the best instrument for beginners.', 'it is the best instrument for beginners', ['best']),
  mixed('c19', 'Rain is water that falls from clouds, and rainy days are boring.', 'rainy days are boring', ['boring']),
  mixed('c20', 'It is wonderful that many parts of the world have four seasons.', 'It is wonderful that', ['wonderful']),
  mixed('c21', 'Sound travels more slowly than light, which is the most amazing fact in science.', 'which is the most amazing fact in science', ['most amazing']),
  mixed('c22', 'A dictionary lists words in alphabetical order, and reading one is dull.', 'reading one is dull', ['dull']),
  mixed('c23', 'Sadly, woolly mammoths died out thousands of years ago.', 'Sadly', ['Sadly']),
  mixed('c24', 'The Earth takes about 365 days to go around the Sun, which is far too long to wait for a birthday.', 'which is far too long to wait for a birthday', ['too long']),
  mixed('c25', 'Cheese is made from milk, and it tastes better when it is melted.', 'it tastes better when it is melted', ['better']),
  mixed('c26', 'Maps show where places are, and old maps are more beautiful than new ones.', 'old maps are more beautiful than new ones', ['more beautiful']),
  mixed('c27', 'Ants live in groups called colonies, and watching them is fascinating.', 'watching them is fascinating', ['fascinating']),
  mixed('c28', 'A rainbow can appear when the Sun shines through raindrops, and it is the most magical sight in the sky.', 'it is the most magical sight in the sky', ['most magical']),
  mixed('c29', 'Snow is made of ice crystals, and playing in it is more fun than swimming.', 'playing in it is more fun than swimming', ['more fun']),
  mixed('c30', 'A tomato is a fruit to a plant scientist, but it tastes terrible in a fruit salad.', 'it tastes terrible in a fruit salad', ['terrible']),
  mixed('c31', 'A library lends books, and it is the most peaceful place in town.', 'it is the most peaceful place in town', ['most peaceful']),
  mixed('c32', 'Frogs are amphibians, and their croaking is an annoying sound.', 'their croaking is an annoying sound', ['annoying']),
];

export const statementById = id => STATEMENTS.find(statement => statement.id === id);
export const statementsFor = (level, kind) => STATEMENTS.filter(statement => statement.level === level && (!kind || statement.kind === kind));

/* ------------------------------------------------------------ sentences */

/**
 * A mixed sentence cut into its fact and opinion parts, in order: [{ text, kind, start }].
 * The parts together are the whole sentence: a piece with no letters in it (the final period) stays with
 * the part before it.
 */
export function parts(item) {
  const at = item.text.indexOf(item.opinion);
  const cuts = [[0, at, 'fact'], [at, at + item.opinion.length, 'opinion'], [at + item.opinion.length, item.text.length, 'fact']];
  const out = [];
  for (const [start, end, kind] of cuts) {
    const text = item.text.slice(start, end);
    if (/\p{L}/u.test(text)) out.push({ text, kind, start });
    else if (out.length) out.at(-1).text += text;
  }
  return out;
}

/** Where each clue word or phrase sits in the statement: [[start, end], …]. */
export function clueRanges(item) {
  const from = item.kind === 'mixed' ? item.text.indexOf(item.opinion) : 0;
  return (item.clues ?? []).map(clue => {
    const start = item.text.indexOf(clue, from);
    return [start, start + clue.length];
  });
}

/** The statement's words with their positions, and whether each one is part of a clue: [{ text, start, end, clue }]. */
export function words(item) {
  const ranges = clueRanges(item);
  return [...item.text.matchAll(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)].map(m => {
    const start = m.index, end = start + m[0].length;
    return { text: m[0], start, end, clue: ranges.some(([a, b]) => start >= a && end <= b) };
  });
}

/** The statement as pieces of plain text and clue text, for showing the clue words: [{ text, clue }]. */
export function withClues(item, from = 0, to = item.text.length) {
  const pieces = [];
  let at = from;
  for (const [start, end] of clueRanges(item).filter(([a, b]) => a >= from && b <= to).sort((a, b) => a[0] - b[0])) {
    if (start > at) pieces.push({ text: item.text.slice(at, start), clue: false });
    pieces.push({ text: item.text.slice(start, end), clue: true });
    at = end;
  }
  if (at < to) pieces.push({ text: item.text.slice(at, to), clue: false });
  return pieces;
}

/** Why the answer is what it is, in a sentence or two. */
export function explain(item) {
  const clues = (item.clues ?? []).map(clue => `“${clue}”`).join(' and ');
  const clueSentence = item.clues?.length > 1 ? `The clue words are ${clues}.` : `The clue word is ${clues}.`;
  if (item.kind === 'fact') return `This is a fact. ${item.why}`;
  if (item.kind === 'opinion') return `This is an opinion. ${clueSentence} ${item.why}`;
  return `The opinion is “${item.opinion}”. ${clueSentence} People can disagree about it. The rest of the sentence can be checked.`;
}

/* --------------------------------------------------------------- rounds */

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

/**
 * Ten questions for a level, the same every time for the same seed: [{ item, mode }].
 * Levels 1 and 2 ask "fact or opinion?" (mode "sort") about four to six facts and the rest opinions.
 * Level 3 uses mixed sentences: tap the opinion part (mode "part") or tap a clue word (mode "clue"), five of each.
 */
export function buildRound(level, seed) {
  const random = seededRandom(seed);
  if (level === 3) {
    const modes = shuffled(Array.from({ length: ROUND_LENGTH }, (_, i) => (i % 2 ? 'clue' : 'part')), random);
    return shuffled(statementsFor(3), random).slice(0, ROUND_LENGTH).map((item, i) => ({ item, mode: modes[i] }));
  }
  const facts = 4 + Math.floor(random() * 3);
  const chosen = [
    ...shuffled(statementsFor(level, 'fact'), random).slice(0, facts),
    ...shuffled(statementsFor(level, 'opinion'), random).slice(0, ROUND_LENGTH - facts),
  ];
  return shuffled(chosen, random).map(item => ({ item, mode: 'sort' }));
}

/**
 * Is the answer right? For "sort" the answer is 'fact' or 'opinion'; for "part" it is the index of the part
 * tapped (see parts); for "clue" it is the index of the word tapped (see words).
 */
export function checkAnswer(question, answer) {
  const { item, mode } = question;
  if (mode === 'sort') return answer === item.kind;
  if (mode === 'part') return parts(item)[answer]?.kind === 'opinion';
  return words(item)[answer]?.clue === true;
}

/** Score for a finished round, from a list of true (right) and false (wrong): correct, total, best streak. */
export function scoreRound(results) {
  let streak = 0, bestStreak = 0;
  for (const right of results) {
    streak = right ? streak + 1 : 0;
    bestStreak = Math.max(bestStreak, streak);
  }
  const correct = results.filter(Boolean).length;
  return { correct, total: results.length, bestStreak, perfect: results.length > 0 && correct === results.length };
}

/** A short, kind message for the results screen. */
export function resultMessage({ correct, total }) {
  if (correct === total) return 'A perfect round. You can tell a fact from an opinion every time.';
  if (correct >= total * 0.8) return 'Great work. Look over the ones you missed, then try for a perfect round.';
  if (correct >= total * 0.5) return 'Good start. Read the explanations for the ones you missed and play again.';
  return 'Keep going. Ask two questions each time: can I check it? Could someone disagree?';
}
