// The Figurative Language Game's sentence bank and rules: pure data and functions, shared by the game, the
// examples on the page, the printable worksheet, the answer key and the tests.
//
// Every sentence was written for this site (the idioms are common English idioms, used as idioms). Each
// sentence shows exactly one device: no simile that is also an exaggeration, no metaphor that makes a thing
// act like a person, no accidental alliteration and no sound words outside the onomatopoeia items. Tests
// check the mechanical part of that; read a new sentence carefully before adding it.

export const ROUND_LENGTH = 10;

export const LEVELS = [
  { id: 1, name: 'Level 1', grades: 'Grades 3–4', ages: 'ages 8–10', about: 'Simile, metaphor or literal? Check whether the sentence compares two things at all.' },
  { id: 2, name: 'Level 2', grades: 'Grades 4–6', ages: 'ages 9–12', about: 'Four kinds: simile, metaphor, personification and hyperbole.' },
  { id: 3, name: 'Level 3', grades: 'Grades 6–8', ages: 'ages 11–14', about: 'Seven kinds, with idiom, alliteration and onomatopoeia. Some questions ask what a phrase means.' },
];

// `as` finishes the sentence "This is …". `signal` is what to look for. `examples` are two bank sentences.
export const DEVICES = [
  { id: 'simile', name: 'Simile', as: 'a simile', about: 'A simile compares two different things using the word “like” or “as”.', signal: 'The word “like” or “as” joining two different things.', ask: 'Are two different things compared with “like” or “as”?', examples: ['a01', 'a02'] },
  { id: 'metaphor', name: 'Metaphor', as: 'a metaphor', about: 'A metaphor says that one thing is another thing, to show how they are alike. It does not use “like” or “as”.', signal: 'One thing is called something it is not, with no “like” or “as”.', ask: 'Does it say one thing is another thing that it cannot really be?', examples: ['a12', 'b09'] },
  { id: 'personification', name: 'Personification', as: 'personification', about: 'Personification gives a human action or feeling to something that is not human.', signal: 'An object, a plant or the weather doing something that only a person does.', ask: 'Is a thing doing something only a person can do?', examples: ['b17', 'b21'] },
  { id: 'hyperbole', name: 'Hyperbole', as: 'hyperbole', about: 'Hyperbole is a huge exaggeration that nobody is meant to believe.', signal: 'A number, a size or an amount that is far too big to be true.', ask: 'Is something made far bigger than it could really be?', examples: ['b25', 'b29'] },
  { id: 'idiom', name: 'Idiom', as: 'an idiom', about: 'An idiom is a well-known phrase that means something different from what its words say.', signal: 'A phrase that makes no sense if you take the words one by one.', ask: 'Is it a common phrase whose words do not mean what they say?', examples: ['c01', 'c07'] },
  { id: 'alliteration', name: 'Alliteration', as: 'alliteration', about: 'Alliteration is the same beginning sound repeated in words that are close together.', signal: 'Three or more nearby words that begin with the same sound.', ask: 'Do several words in a row begin with the same sound?', examples: ['c16', 'c17'] },
  { id: 'onomatopoeia', name: 'Onomatopoeia', as: 'onomatopoeia', about: 'Onomatopoeia is a word that sounds like the noise it names.', signal: 'A sound word such as buzz, splash or bang.', ask: 'Is there a word that imitates a sound?', examples: ['c22', 'c23'] },
  { id: 'literal', name: 'Literal', as: 'literal', about: 'Literal language means exactly what it says. Nothing is compared and nothing is exaggerated.', signal: 'The words mean just what they say.', ask: 'Do the words mean exactly what they say?', examples: ['a23', 'a25'] },
];

// The choices offered at each level, in the order they are shown.
export const LEVEL_DEVICES = {
  1: ['simile', 'metaphor', 'literal'],
  2: ['simile', 'metaphor', 'personification', 'hyperbole'],
  3: ['simile', 'metaphor', 'personification', 'hyperbole', 'idiom', 'alliteration', 'onomatopoeia'],
};

// One maker per device. `signal` is the list of exact words in the sentence that give the device away, in
// reading order. The explanation is built from the other fields, so it always names the signal.
const item = (id, device, text, signal, why, more) => ({ id, level: 'abc'.indexOf(id[0]) + 1, device, text, signal, why, ...more });
/** A simile: `a` is compared to `b` with the signal word(s). */
const simile = (id, text, signal, a, b) => item(id, 'simile', text, [signal], `${signal === 'like' ? 'The word “like” compares' : `The words “${signal}” compare`} ${a} to ${b}.`);
/** A metaphor: `a` is called `b`. */
const metaphor = (id, text, signal, a, b) => item(id, 'metaphor', text, [signal], `It calls ${a} ${b}, without using “like” or “as”.`);
/** Personification: `thing` does `action` (written so that "cannot really <action>" reads well). */
const person = (id, text, signal, thing, action) => item(id, 'personification', text, [signal], `${thing[0].toUpperCase()}${thing.slice(1)} cannot really ${action}. That is something a person does.`);
/** Hyperbole: it really means that `meaning`. `meanings` (level 3) are three choices, the right one first. */
const hyperbole = (id, text, signal, meaning, meanings) => item(id, 'hyperbole', text, [signal], `“${signal}” is far too much to be true. It is an exaggeration. It really means that ${meaning}.`, meanings && { meanings });
/** An idiom: here the phrase means `meaning`. `meanings` are three choices, the right one first. */
const idiom = (id, text, signal, meaning, meanings) => item(id, 'idiom', text, [signal], `The words “${signal}” do not mean what they say. Here they mean “${meaning}”.`, { meanings });
/** Alliteration: `words` all begin with `sound`. */
const alliteration = (id, text, words, sound) => item(id, 'alliteration', text, words, `${words.length} words close together begin with the same ${sound} sound.`);
/** Onomatopoeia: `word` imitates a sound. */
const sound = (id, text, word) => item(id, 'onomatopoeia', text, [word], `“${word[0].toUpperCase()}${word.slice(1)}” is a sound word. Say it aloud and you can hear the noise it names.`);
/** A literal sentence: `signal` is the trap word, if there is one, and `why` says what it is doing. */
const literal = (id, text, signal, why) => item(id, 'literal', text, signal ? [signal] : [], why);

export const ITEMS = [
  // ---------------------------------------------------------------- Level 1, grades 3–4: similes
  simile('a01', 'The clouds were like fluffy pillows.', 'like', 'the clouds', 'fluffy pillows'),
  simile('a02', 'The lake was as smooth as glass.', 'as smooth as', 'the lake', 'glass'),
  simile('a03', 'Grandpa’s hair is as white as snow.', 'as white as', 'Grandpa’s hair', 'snow'),
  simile('a04', 'The full moon was like a silver coin.', 'like', 'the full moon', 'a silver coin'),
  simile('a05', 'The rabbit’s ears felt like velvet.', 'like', 'the rabbit’s ears', 'velvet'),
  simile('a06', 'The tall grass moved like waves on the sea.', 'like', 'the tall grass', 'waves on the sea'),
  simile('a07', 'The raindrops on the leaf were like tiny glass beads.', 'like', 'the raindrops', 'tiny glass beads'),
  simile('a08', 'The apple was as red as a fire truck.', 'as red as', 'the apple', 'a fire truck'),
  simile('a09', 'The tent glowed like a lantern in the dark.', 'like', 'the tent', 'a lantern'),
  simile('a10', 'The puppy curled up like a furry ball.', 'like', 'the puppy', 'a furry ball'),
  simile('a11', 'Her new boots were as shiny as mirrors.', 'as shiny as', 'her new boots', 'mirrors'),
  // ---------------------------------------------------------------- Level 1: metaphors
  metaphor('a12', 'The snow was a white blanket over the town.', 'was a white blanket', 'the snow', 'a white blanket'),
  metaphor('a13', 'The stars were bright lamps in the night sky.', 'were bright lamps', 'the stars', 'bright lamps'),
  metaphor('a14', 'The frozen pond was a sheet of glass.', 'was a sheet of glass', 'the frozen pond', 'a sheet of glass'),
  metaphor('a15', 'The baby’s laugh was a tiny bell.', 'was a tiny bell', 'the baby’s laugh', 'a tiny bell'),
  metaphor('a16', 'The clouds were white sheep in a blue field.', 'were white sheep', 'the clouds', 'white sheep'),
  metaphor('a17', 'The big tree was an umbrella for our picnic.', 'was an umbrella', 'the big tree', 'an umbrella'),
  metaphor('a18', 'The fog was a gray curtain across the road.', 'was a gray curtain', 'the fog', 'a gray curtain'),
  metaphor('a19', 'The hose was a long snake in the yard.', 'was a long snake', 'the hose', 'a long snake'),
  metaphor('a20', 'The dandelions were little suns in the grass.', 'were little suns', 'the dandelions', 'little suns'),
  metaphor('a21', 'The quiet lake was a mirror for the trees.', 'was a mirror', 'the quiet lake', 'a mirror'),
  metaphor('a22', 'The evening sun was a gold coin.', 'was a gold coin', 'the evening sun', 'a gold coin'),
  // ---------------------------------------------------------------- Level 1: literal sentences
  literal('a23', 'I like to read books about sharks.', 'like', 'Here “like” means “enjoy”. Nothing is being compared.'),
  literal('a24', 'My cousin works as a lifeguard in the summer.', 'as', 'Here “as” tells you what job my cousin does. Nothing is being compared.'),
  literal('a25', 'A robin is a bird.', 'is a bird', 'A robin really is a bird. This is a plain fact, not a metaphor.'),
  literal('a26', 'The lake was calm this morning.', null, 'It tells you plainly what the lake was like. Nothing is compared to anything else.'),
  literal('a27', 'As the bus stopped, we lined up at the door.', 'As', 'Here “as” means “when”. Nothing is being compared.'),
  literal('a28', 'My dog is a beagle.', 'is a beagle', 'A beagle is a kind of dog, so this is simply true. It is not a metaphor.'),
  literal('a29', 'Snow covered the roof of our house.', null, 'It says what happened in plain words. Nothing is compared to anything else.'),
  literal('a30', 'She would like a glass of water.', 'like', 'Here “like” means “want”. Nothing is being compared.'),
  literal('a31', 'My grandmother is a doctor.', 'is a doctor', 'She really is a doctor. The sentence states her job. It is not a metaphor.'),
  literal('a32', 'We counted nine stars after dinner.', null, 'It says what we did in plain words. Nothing is compared to anything else.'),

  // ---------------------------------------------------------------- Level 2, grades 4–6: similes
  simile('b01', 'Smoke rose from the chimney like a long gray ribbon.', 'like', 'the smoke', 'a long gray ribbon'),
  simile('b02', 'His explanation was as clear as a mountain stream.', 'as clear as', 'his explanation', 'a mountain stream'),
  simile('b03', 'The line of ants moved like a little train.', 'like', 'the line of ants', 'a little train'),
  simile('b04', 'The wet road shone like polished metal.', 'like', 'the wet road', 'polished metal'),
  simile('b05', 'Her words were as gentle as a summer breeze.', 'as gentle as', 'her words', 'a summer breeze'),
  simile('b06', 'The dancer’s arms were as graceful as a swan’s neck.', 'as graceful as', 'the dancer’s arms', 'a swan’s neck'),
  simile('b07', 'The hot-air balloon drifted over the valley like a soap bubble.', 'like', 'the hot-air balloon', 'a soap bubble'),
  simile('b08', 'The rowing team moved together like one machine.', 'like', 'the rowing team', 'one machine'),
  // ---------------------------------------------------------------- Level 2: metaphors
  metaphor('b09', 'The library is a treasure chest of stories.', 'is a treasure chest', 'the library', 'a treasure chest'),
  metaphor('b10', 'The city at night was a jewelry box of lights.', 'was a jewelry box', 'the city at night', 'a jewelry box'),
  metaphor('b11', 'Her memory is a photo album she can open at any time.', 'is a photo album', 'her memory', 'a photo album'),
  metaphor('b12', 'The thunderclouds were dark mountains in the sky.', 'were dark mountains', 'the thunderclouds', 'dark mountains'),
  metaphor('b13', 'The cat’s eyes were two green lamps in the dark hallway.', 'were two green lamps', 'the cat’s eyes', 'two green lamps'),
  metaphor('b14', 'The highway was a gray ribbon between the hills.', 'was a gray ribbon', 'the highway', 'a gray ribbon'),
  metaphor('b15', 'At recess, the playground was a beehive.', 'was a beehive', 'the playground', 'a beehive'),
  metaphor('b16', 'My aunt’s garden was a quilt of bright flowers.', 'was a quilt', 'my aunt’s garden', 'a quilt'),
  // ---------------------------------------------------------------- Level 2: personification
  person('b17', 'The moon smiled down on the quiet town.', 'smiled', 'the moon', 'smile'),
  person('b18', 'The flowers danced in the breeze.', 'danced', 'flowers', 'dance'),
  person('b19', 'The leaves waved goodbye to summer.', 'waved goodbye', 'leaves', 'wave goodbye'),
  person('b20', 'The stars winked at us from the night sky.', 'winked', 'stars', 'wink'),
  person('b21', 'My pencil refused to write another word.', 'refused', 'a pencil', 'refuse to do something'),
  person('b22', 'The books on the shelf waited patiently for a reader.', 'waited patiently', 'books', 'wait patiently'),
  person('b23', 'The first snow tiptoed onto the rooftops during the night.', 'tiptoed', 'snow', 'tiptoe'),
  person('b24', 'My homework glared at me from the kitchen table.', 'glared', 'homework', 'glare at anyone'),
  // ---------------------------------------------------------------- Level 2: hyperbole
  hyperbole('b25', 'We waited in line for a hundred years.', 'a hundred years', 'the wait was very long'),
  hyperbole('b26', 'I have read that book nine hundred times.', 'nine hundred times', 'the speaker has read the book many times'),
  hyperbole('b27', 'My cousin asks a billion questions every morning.', 'a billion questions', 'the cousin asks a great many questions'),
  hyperbole('b28', 'My backpack weighs more than a truck this morning.', 'weighs more than a truck', 'the backpack is very heavy'),
  hyperbole('b29', 'I was so tired I could have slept for a year.', 'slept for a year', 'the speaker was very tired'),
  hyperbole('b30', 'The line for ice cream reached all the way to the moon.', 'all the way to the moon', 'the line was very long'),
  hyperbole('b31', 'It is so cold today that my words froze in the air.', 'my words froze in the air', 'the day is very cold'),
  hyperbole('b32', 'Dad has told us a million times to shut the door.', 'a million times', 'Dad has said it many times'),

  // ---------------------------------------------------------------- Level 3, grades 6–8: idioms
  // The first meaning in each list is the right one.
  idiom('c01', 'Please don’t spill the beans about the surprise party.', 'spill the beans', 'tell the secret', ['Please don’t tell anyone the secret.', 'Please don’t drop food on the floor.', 'Please don’t arrive late.']),
  idiom('c02', 'The coach told a joke to break the ice at the first practice.', 'break the ice', 'help everyone relax and start talking', ['The joke helped everyone relax and start talking.', 'The joke cracked the frozen water on the field.', 'The joke ended the practice early.']),
  idiom('c03', 'I have a quiz on Friday, so I need to hit the books tonight.', 'hit the books', 'study', ['I need to study tonight.', 'I need to punch my books tonight.', 'I need to put my books away tonight.']),
  idiom('c04', 'Lena stayed home because she was feeling under the weather.', 'under the weather', 'a little sick', ['Lena felt a little sick.', 'Lena was standing outside in the rain.', 'Lena was afraid of storms.']),
  idiom('c05', 'Marco got cold feet just before the school play.', 'got cold feet', 'became too nervous to go on', ['Marco became too nervous to go on.', 'Marco’s toes were freezing.', 'Marco forgot to wear his shoes.']),
  idiom('c06', 'My sister and I rarely see eye to eye about music.', 'see eye to eye', 'agree', ['We rarely agree about music.', 'We rarely look at each other.', 'We are not the same height.']),
  idiom('c07', 'We visit the ocean once in a blue moon.', 'once in a blue moon', 'very rarely', ['We visit the ocean very rarely.', 'We visit the ocean when the moon looks blue.', 'We visit the ocean every month.']),
  idiom('c08', 'Joining three clubs was a mistake. I had bitten off more than I could chew.', 'bitten off more than I could chew', 'taken on more than I could manage', ['I had taken on more than I could manage.', 'I had eaten too much food.', 'I had left all three clubs.']),
  idiom('c09', 'After two hours of raking leaves, we decided to call it a day.', 'call it a day', 'stop working', ['We decided to stop working.', 'We decided to give the day a name.', 'We decided to work until dark.']),
  // ---------------------------------------------------------------- Level 3: hyperbole
  hyperbole('c10', 'This math problem will take me until I am ninety to finish.', 'until I am ninety', 'the problem will take a very long time', ['The problem will take a very long time.', 'The speaker will be ninety years old when it is done.', 'The problem is quick and easy.']),
  hyperbole('c11', 'I am so hungry that I could eat everything in the grocery store.', 'everything in the grocery store', 'the speaker is very hungry', ['The speaker is very hungry.', 'The speaker plans to buy the whole store.', 'The speaker has just eaten.']),
  hyperbole('c12', 'There were a zillion people at the fair on Saturday.', 'a zillion people', 'the fair was very crowded', ['The fair was very crowded.', 'Someone counted exactly a zillion people.', 'Almost nobody came to the fair.']),
  hyperbole('c13', 'Grandpa has told that camping story eight million times.', 'eight million times', 'Grandpa has told the story many times', ['Grandpa has told the story many times.', 'Grandpa has told the story exactly eight million times.', 'Grandpa has never told the story.']),
  hyperbole('c14', 'It was so hot that we melted into puddles on the sidewalk.', 'melted into puddles', 'the day was very hot', ['The day was very hot.', 'People really turned into water.', 'The day was cool and rainy.']),
  hyperbole('c15', 'The car ride to my aunt’s farm lasted nine hundred days.', 'nine hundred days', 'the ride felt very long', ['The ride felt very long.', 'The ride really lasted more than two years.', 'The ride was very short.']),
  // ---------------------------------------------------------------- Level 3: alliteration
  alliteration('c16', 'Sara sold seven sandwiches on Saturday.', ['Sara', 'sold', 'seven', 'sandwiches', 'Saturday'], '“s”'),
  alliteration('c17', 'Dan’s dog dug deep ditches down by the dock.', ['Dan’s', 'dog', 'dug', 'deep', 'ditches', 'down', 'dock'], '“d”'),
  alliteration('c18', 'Careful Carla carried cups of cold cocoa.', ['Careful', 'Carla', 'carried', 'cups', 'cold', 'cocoa'], 'hard “c”'),
  alliteration('c19', 'Wendy washed the white wagon on Wednesday.', ['Wendy', 'washed', 'white', 'wagon', 'Wednesday'], '“w”'),
  alliteration('c20', 'Twelve tired travelers took the train to town.', ['Twelve', 'tired', 'travelers', 'took', 'train', 'town'], '“t”'),
  alliteration('c21', 'Little lizards lay on the long, low logs.', ['Little', 'lizards', 'lay', 'long', 'low', 'logs'], '“l”'),
  // ---------------------------------------------------------------- Level 3: onomatopoeia
  sound('c22', 'A fly buzzed past my ear.', 'buzzed'),
  sound('c23', 'Splash! The frog jumped into the pond.', 'Splash'),
  sound('c24', 'The door shut with a loud bang.', 'bang'),
  sound('c25', 'Dry leaves crunched under our boots.', 'crunched'),
  sound('c26', 'The microwave beeped when the soup was ready.', 'beeped'),
  sound('c27', 'The snake gave a sharp hiss.', 'hiss'),
  // ---------------------------------------------------------------- Level 3: similes
  simile('c28', 'The rumor moved through the class like ripples across a pond.', 'like', 'the rumor', 'ripples across a pond'),
  simile('c29', 'Her voice was as steady as a metronome.', 'as steady as', 'her voice', 'a metronome'),
  simile('c30', 'The old map was as fragile as a dry leaf.', 'as fragile as', 'the old map', 'a dry leaf'),
  simile('c31', 'Thoughts of that summer returned like faint music.', 'like', 'thoughts of that summer', 'faint music'),
  // ---------------------------------------------------------------- Level 3: metaphors
  metaphor('c32', 'The moon was a pale lantern above the harbor.', 'was a pale lantern', 'the moon', 'a pale lantern'),
  metaphor('c33', 'Her notebook was a garden of half-grown ideas.', 'was a garden', 'her notebook', 'a garden'),
  metaphor('c34', 'The red barn was an island in an ocean of wheat.', 'was an island', 'the red barn', 'an island'),
  metaphor('c35', 'Doubt was a small pebble in my shoe.', 'was a small pebble', 'doubt', 'a small pebble'),
  // ---------------------------------------------------------------- Level 3: personification
  person('c36', 'The clock on the wall stared down at the nervous class.', 'stared down', 'a clock', 'stare at anyone'),
  person('c37', 'The river hurried past the village, too busy to stop.', 'too busy to stop', 'a river', 'be busy'),
  person('c38', 'The mountains kept their secrets from the climbers.', 'kept their secrets', 'mountains', 'keep secrets'),
  person('c39', 'The final chapter begged me to keep reading.', 'begged', 'a chapter', 'beg'),
  person('c40', 'My phone decided to take a nap in the middle of the call.', 'decided to take a nap', 'a phone', 'decide to take a nap'),
];

export const itemById = id => ITEMS.find(entry => entry.id === id);
export const deviceById = id => DEVICES.find(device => device.id === id);
/** The sentences of a level, and optionally of one device. */
export const itemsFor = (level, device) => ITEMS.filter(entry => entry.level === level && (!device || entry.device === device));

/* ----------------------------------------------------------------- text */

/** Where each signal word or phrase sits in the sentence, in reading order: [[start, end], …]. */
export function signalRanges(entry) {
  const ranges = [];
  let from = 0;
  for (const signal of entry.signal) {
    const start = entry.text.indexOf(signal, from);
    ranges.push([start, start + signal.length]);
    from = start + signal.length;
  }
  return ranges;
}

/** The sentence as pieces of plain text and signal text: [{ text, mark }]. */
export function pieces(entry) {
  const out = [];
  let at = 0;
  for (const [start, end] of signalRanges(entry)) {
    if (start > at) out.push({ text: entry.text.slice(at, start), mark: false });
    out.push({ text: entry.text.slice(start, end), mark: true });
    at = end;
  }
  if (at < entry.text.length) out.push({ text: entry.text.slice(at), mark: false });
  return out;
}

/** Why the answer is what it is: the device, then the signal that gives it away. */
export function explain(entry) {
  return `This is ${deviceById(entry.device).as}. ${entry.why}`;
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

function shuffled(items, random) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Ten questions for a level, the same every time for the same seed: [{ item, mode, choices }].
 * Mode "device" asks which kind of figurative language the sentence shows; `choices` are the level's
 * devices in their fixed order. Mode "meaning" (level 3 only) asks what an idiom or a hyperbole means;
 * `choices` are the positions of the item's three meanings in the order they are shown (0 is the right one).
 * Level 1: three or four each of simile, metaphor and literal. Level 2: two or three of each of four devices.
 * Level 3: one sentence for each of the seven devices, plus two idioms and one hyperbole to explain.
 */
export function buildRound(level, seed) {
  const random = seededRandom(seed);
  const devices = LEVEL_DEVICES[level];
  const pools = Object.fromEntries(devices.map(device => [device, shuffled(itemsFor(level, device), random)]));
  const device = entry => ({ item: entry, mode: 'device', choices: devices });
  const meaning = entry => ({ item: entry, mode: 'meaning', choices: shuffled([0, 1, 2], random) });
  let questions;
  if (level === 3) {
    questions = [...devices.map(id => device(pools[id][0])), meaning(pools.idiom[1]), meaning(pools.idiom[2]), meaning(pools.hyperbole[1])];
  } else {
    const each = Math.floor(ROUND_LENGTH / devices.length);
    const extra = shuffled(devices, random).slice(0, ROUND_LENGTH - each * devices.length);
    questions = devices.flatMap(id => pools[id].slice(0, each + (extra.includes(id) ? 1 : 0))).map(device);
  }
  return shuffled(questions, random);
}

/** Is the answer right? For "device" the answer is a device id; for "meaning" it is the position (0, 1 or 2) of a meaning in the item's list. */
export function checkAnswer(question, answer) {
  if (!question.choices.includes(answer)) return false;
  return question.mode === 'meaning' ? answer === 0 : answer === question.item.device;
}

/** The words of a choice as a student sees them: a device name, or one of the item's meanings. */
export const choiceText = (question, choice) => (question.mode === 'meaning' ? question.item.meanings[choice] : deviceById(choice).name);

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
  if (correct === total) return 'A perfect round. You can spot figurative language every time.';
  if (correct >= total * 0.8) return 'Great work. Look over the ones you missed, then try for a perfect round.';
  if (correct >= total * 0.5) return 'Good start. Read the explanations for the ones you missed and play again.';
  return 'Keep going. Look for the signal each time: “like” or “as”, a thing acting like a person, a giant exaggeration.';
}
