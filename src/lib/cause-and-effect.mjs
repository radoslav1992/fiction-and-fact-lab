// The Cause and Effect Game's bank and rules: pure data and functions, shared by the game, the examples on
// the page, the printable worksheet, the answer key and the tests.
//
// Rules for the bank. Every causal link is real, true and beyond argument: everyday situations and school
// science. No history, no health claims, no social topics. Each sentence has exactly one cause and one
// effect, and they are exact pieces of the sentence, with only the signal word and punctuation between them.

export const DEFINITIONS = {
  cause: 'A cause is why something happens.',
  effect: 'An effect is what happens because of the cause.',
};

export const ROUND_LENGTH = 10;

export const LEVELS = [
  { id: 1, name: 'Level 1', grades: 'Grades 2–3', ages: 'ages 7–9', about: 'One sentence with “because” or “so”. Tap the cause, or tap the effect.' },
  { id: 2, name: 'Level 2', grades: 'Grades 4–5', ages: 'ages 9–11', about: 'More signal words. Tap the cause, the effect or the signal word, and match four causes to their effects.' },
  { id: 3, name: 'Level 3', grades: 'Grades 6–8', ages: 'ages 11–14', about: 'Short paragraphs with chains of causes, some with no signal word. Find what caused what, and what only came afterwards.' },
];

// Signal words, and where the cause and the effect sit around each one. `words` are the words to look for
// in a sentence; `example` is the id of a sentence in the bank.
export const SIGNALS = [
  { id: 'because', label: 'because', words: ['because'], follows: 'cause', tip: 'The cause comes right after “because”.', example: 'a01' },
  { id: 'since', label: 'since', words: ['since'], follows: 'cause', tip: 'The cause comes right after “since”.', example: 'b21' },
  { id: 'due to', label: 'due to', words: ['due to'], follows: 'cause', tip: 'The cause comes right after “due to”.', example: 'b08' },
  { id: 'so', label: 'so', words: ['so'], follows: 'effect', tip: 'The effect comes right after “so”.', example: 'a17' },
  { id: 'as a result', label: 'as a result', words: ['as a result'], follows: 'effect', tip: 'The effect comes right after “as a result”.', example: 'b05' },
  { id: 'therefore', label: 'therefore', words: ['therefore'], follows: 'effect', tip: 'The effect comes right after “therefore”.', example: 'b28' },
  { id: 'led to', label: 'led to', words: ['led to'], follows: 'effect', tip: 'The cause comes before “led to” and the effect after it.', example: 'b03' },
  { id: 'if then', label: 'if … then', words: ['if', 'then'], follows: 'both', tip: 'The cause comes after “if” and the effect after “then”.', example: 'b10' },
];
export const signalById = id => SIGNALS.find(signal => signal.id === id);

// One sentence: id, signal, the sentence, its cause and its effect (exact pieces of the sentence).
// The level is the letter of the id: a = 1, b = 2. Level 2 sentences come in sets of four for the matching
// question: b01–b04 are set 1, b05–b08 set 2, and so on. Within a set, each cause fits only its own effect.
const sentence = (id, signal, text, cause, effect) => {
  const level = 'abc'.indexOf(id[0]) + 1;
  return { id, level, kind: 'sentence', signal, text, cause, effect, ...(level === 2 ? { set: Math.ceil(Number(id.slice(1)) / 4) } : {}) };
};
// One paragraph for level 3. A chain: events[0] caused events[1], which caused events[2]. A fork: events[0]
// caused both events[1] and events[2]. `after` happened later and was not caused by any of them. `decoys`
// are things the paragraph does not say. `root` names events[0] in a few words, to finish the questions
// “… not caused by ___?” and “What was one effect of ___?”. `signals` lists the signal words in the text.
const paragraph = (id, kind, fields) => ({ id, level: 3, kind, signals: [], ...fields });

export const ITEMS = [
  // Level 1, grades 2–3. Effect first, then “because” and the cause.
  sentence('a01', 'because', 'The ice cube melted because the room was warm.', 'the room was warm', 'The ice cube melted'),
  sentence('a02', 'because', 'The grass is wet because it rained last night.', 'it rained last night', 'The grass is wet'),
  sentence('a03', 'because', 'We wore coats because it was cold outside.', 'it was cold outside', 'We wore coats'),
  sentence('a04', 'because', 'The plant drooped because nobody watered it.', 'nobody watered it', 'The plant drooped'),
  sentence('a05', 'because', 'The baby woke up because the dog barked.', 'the dog barked', 'The baby woke up'),
  sentence('a06', 'because', 'Mia was late for school because she missed the bus.', 'she missed the bus', 'Mia was late for school'),
  sentence('a07', 'because', 'The window broke because a ball hit it.', 'a ball hit it', 'The window broke'),
  sentence('a08', 'because', 'The puddle dried up because the Sun came out.', 'the Sun came out', 'The puddle dried up'),
  sentence('a09', 'because', 'Ben turned on the lamp because the room was dark.', 'the room was dark', 'Ben turned on the lamp'),
  sentence('a10', 'because', 'The balloon popped because it touched a sharp thorn.', 'it touched a sharp thorn', 'The balloon popped'),
  sentence('a11', 'because', 'The kite flew high because the wind was strong.', 'the wind was strong', 'The kite flew high'),
  sentence('a12', 'because', 'My boots are dirty because I walked through the mud.', 'I walked through the mud', 'My boots are dirty'),
  sentence('a13', 'because', 'The birds flew away because the cat jumped at them.', 'the cat jumped at them', 'The birds flew away'),
  sentence('a14', 'because', 'The pond froze because the night was very cold.', 'the night was very cold', 'The pond froze'),
  sentence('a15', 'because', 'Sam opened the window because the kitchen was too hot.', 'the kitchen was too hot', 'Sam opened the window'),
  sentence('a16', 'because', 'The cars stopped because the light turned red.', 'the light turned red', 'The cars stopped'),
  // Level 1. Cause first, then “so” and the effect.
  sentence('a17', 'so', 'It started to rain, so we opened our umbrellas.', 'It started to rain', 'we opened our umbrellas'),
  sentence('a18', 'so', 'The bell rang, so the children lined up.', 'The bell rang', 'the children lined up'),
  sentence('a19', 'so', 'The glass fell off the table, so it broke.', 'The glass fell off the table', 'it broke'),
  sentence('a20', 'so', 'The Sun went down, so the sky grew dark.', 'The Sun went down', 'the sky grew dark'),
  sentence('a21', 'so', 'Lee forgot her lunch, so she was hungry at noon.', 'Lee forgot her lunch', 'she was hungry at noon'),
  sentence('a22', 'so', 'The door was locked, so we could not get in.', 'The door was locked', 'we could not get in'),
  sentence('a23', 'so', 'The wind blew hard, so the leaves fell from the tree.', 'The wind blew hard', 'the leaves fell from the tree'),
  sentence('a24', 'so', 'Tom left his bike in the rain, so the seat got wet.', 'Tom left his bike in the rain', 'the seat got wet'),
  sentence('a25', 'so', 'The soup was too hot, so Ana blew on it.', 'The soup was too hot', 'Ana blew on it'),
  sentence('a26', 'so', 'The road was icy, so the bus drove slowly.', 'The road was icy', 'the bus drove slowly'),
  sentence('a27', 'so', 'Jo watered the seeds every day, so they began to grow.', 'Jo watered the seeds every day', 'they began to grow'),
  sentence('a28', 'so', 'The battery ran down, so the toy robot stopped moving.', 'The battery ran down', 'the toy robot stopped moving'),
  sentence('a29', 'so', 'The dog was thirsty, so it drank from its bowl.', 'The dog was thirsty', 'it drank from its bowl'),
  sentence('a30', 'so', 'It snowed all night, so the yard was white in the morning.', 'It snowed all night', 'the yard was white in the morning'),
  sentence('a31', 'so', 'The alarm clock rang, so Nia woke up.', 'The alarm clock rang', 'Nia woke up'),
  sentence('a32', 'so', 'The cup had a crack, so the juice leaked out.', 'The cup had a crack', 'the juice leaked out'),

  // Level 2, grades 4–5. Matching set 1.
  sentence('b01', 'since', 'Since the Moon blocked the Sun, the sky went dark for a few minutes.', 'the Moon blocked the Sun', 'the sky went dark for a few minutes'),
  sentence('b02', 'therefore', 'The bread was left in a damp bag for two weeks. Therefore, mold grew on the bread.', 'The bread was left in a damp bag for two weeks', 'mold grew on the bread'),
  sentence('b03', 'led to', 'A crack in the pipe led to a puddle under the sink.', 'A crack in the pipe', 'a puddle under the sink'),
  sentence('b04', 'if then', 'If you rub your hands together quickly, then your hands get warm.', 'you rub your hands together quickly', 'your hands get warm'),
  // Matching set 2.
  sentence('b05', 'as a result', 'No rain fell for two months. As a result, the stream dried up.', 'No rain fell for two months', 'the stream dried up'),
  sentence('b06', 'because', 'Because the kettle was boiling, steam rose from its spout.', 'the kettle was boiling', 'steam rose from its spout'),
  sentence('b07', 'therefore', 'The clock’s battery ran down. Therefore, the hands of the clock stopped moving.', 'The clock’s battery ran down', 'the hands of the clock stopped moving'),
  sentence('b08', 'due to', 'The picnic was moved indoors due to the storm.', 'the storm', 'The picnic was moved indoors'),
  // Matching set 3.
  sentence('b09', 'due to', 'The ferry stayed in the harbor due to high waves.', 'high waves', 'The ferry stayed in the harbor'),
  sentence('b10', 'if then', 'If you put a glass of water in the freezer, then the water turns to ice.', 'you put a glass of water in the freezer', 'the water turns to ice'),
  sentence('b11', 'since', 'Since the plant was kept in a dark closet, its leaves turned pale.', 'the plant was kept in a dark closet', 'its leaves turned pale'),
  sentence('b12', 'since', 'Since the tire had a nail in it, the air slowly leaked out.', 'the tire had a nail in it', 'the air slowly leaked out'),
  // Matching set 4.
  sentence('b13', 'if then', 'If you drop a rubber ball on a hard floor, then the ball bounces back up.', 'you drop a rubber ball on a hard floor', 'the ball bounces back up'),
  sentence('b14', 'due to', 'Due to thick fog, the drivers could see only a short way ahead.', 'thick fog', 'the drivers could see only a short way ahead'),
  sentence('b15', 'because', 'Because the Earth spins, day follows night.', 'the Earth spins', 'day follows night'),
  sentence('b16', 'led to', 'An overfilled pot led to a spill on the stove.', 'An overfilled pot', 'a spill on the stove'),
  // Matching set 5.
  sentence('b17', 'led to', 'A night of heavy snow led to closed roads in the morning.', 'A night of heavy snow', 'closed roads in the morning'),
  sentence('b18', 'if then', 'If you mix blue paint with yellow paint, then you get green paint.', 'you mix blue paint with yellow paint', 'you get green paint'),
  sentence('b19', 'therefore', 'The magnet was held close to the paper clips. Therefore, the clips jumped toward the magnet.', 'The magnet was held close to the paper clips', 'the clips jumped toward the magnet'),
  sentence('b20', 'led to', 'A hole in the fence led to rabbits in the vegetable patch.', 'A hole in the fence', 'rabbits in the vegetable patch'),
  // Matching set 6.
  sentence('b21', 'since', 'We lit candles since the power had gone out.', 'the power had gone out', 'We lit candles'),
  sentence('b22', 'as a result', 'The lake froze over. As a result, the ducks could not swim there.', 'The lake froze over', 'the ducks could not swim there'),
  sentence('b23', 'if then', 'If you leave a chocolate bar in a hot car, then the chocolate melts.', 'you leave a chocolate bar in a hot car', 'the chocolate melts'),
  sentence('b24', 'since', 'Since the tide went out, the rocks on the beach were uncovered.', 'the tide went out', 'the rocks on the beach were uncovered'),
  // Matching set 7.
  sentence('b25', 'as a result', 'The bike chain was left out in the rain all winter. As a result, the chain rusted.', 'The bike chain was left out in the rain all winter', 'the chain rusted'),
  sentence('b26', 'due to', 'The flashlight would not turn on due to dead batteries.', 'dead batteries', 'The flashlight would not turn on'),
  sentence('b27', 'because', 'Because the guitar string was pulled too tight, the string snapped.', 'the guitar string was pulled too tight', 'the string snapped'),
  sentence('b28', 'therefore', 'The Earth is tilted as it travels around the Sun. Therefore, we have seasons.', 'The Earth is tilted as it travels around the Sun', 'we have seasons'),
  // Matching set 8.
  sentence('b29', 'led to', 'The strong wind led to broken branches all over the yard.', 'The strong wind', 'broken branches all over the yard'),
  sentence('b30', 'as a result', 'The Sun shone through the falling rain. As a result, a rainbow appeared.', 'The Sun shone through the falling rain', 'a rainbow appeared'),
  sentence('b31', 'due to', 'The school play was delayed due to a lost costume.', 'a lost costume', 'The school play was delayed'),
  sentence('b32', 'as a result', 'The drummer hit the drum. As a result, the drum skin shook and made a sound.', 'The drummer hit the drum', 'the drum skin shook and made a sound'),

  // Level 3, grades 6–8. Chains: the first event caused the second, and the second caused the third.
  paragraph('c01', 'chain', {
    text: 'The temperature dropped below freezing overnight, so the water in the birdbath turned to ice. Because the water was frozen, the sparrows could not drink from it in the morning. At noon, the mail carrier brought a package.',
    events: ['The temperature dropped below freezing.', 'The water in the birdbath turned to ice.', 'The sparrows could not drink from the birdbath.'],
    after: 'The mail carrier brought a package.', decoys: ['Someone emptied the birdbath.'], root: 'the freezing night', signals: ['so', 'Because'],
    askCause: 'What caused the water in the birdbath to turn to ice?', askEffect: 'What was the effect of the water turning to ice?',
  }),
  paragraph('c02', 'chain', {
    text: 'Nora forgot to close the freezer door. By morning, the ice cream had melted. A sticky puddle spread across the freezer shelf. After breakfast, Nora rode her bike to school.',
    events: ['Nora forgot to close the freezer door.', 'The ice cream melted.', 'A sticky puddle spread across the freezer shelf.'],
    after: 'Nora rode her bike to school.', decoys: ['The power went out during the night.'], root: 'the open freezer door',
    askCause: 'What caused the ice cream to melt?', askEffect: 'What was the effect of the ice cream melting?',
  }),
  paragraph('c03', 'chain', {
    text: 'Heavy rain fell on the hills all night. The river rose and spilled over its banks. As a result, the footpath beside the river was under water by morning. That evening, the town library opened at its usual time.',
    events: ['Heavy rain fell on the hills all night.', 'The river rose and spilled over its banks.', 'The footpath beside the river was under water.'],
    after: 'The town library opened at its usual time.', decoys: ['Workers closed the footpath for repairs.'], root: 'the heavy rain', signals: ['As a result'],
    askCause: 'What caused the river to rise and spill over its banks?', askEffect: 'What was the effect of the river spilling over its banks?',
  }),
  paragraph('c04', 'chain', {
    text: 'The Sun warmed a puddle on the playground. The water slowly turned into water vapor and rose into the air. By lunchtime, the puddle was gone. After school, the janitor locked the gate.',
    events: ['The Sun warmed the puddle.', 'The water turned into water vapor and rose into the air.', 'The puddle was gone.'],
    after: 'The janitor locked the gate.', decoys: ['Someone swept the water away.'], root: 'the Sun’s warmth',
    askCause: 'What caused the water to turn into water vapor?', askEffect: 'What was the effect of the water turning into water vapor?',
  }),
  paragraph('c05', 'chain', {
    text: 'During the storm, a branch fell on the power line. The electricity in the house went off, so the refrigerator stopped running. The next day, a new family moved in across the street.',
    events: ['A branch fell on the power line.', 'The electricity in the house went off.', 'The refrigerator stopped running.'],
    after: 'A new family moved in across the street.', decoys: ['Someone unplugged the refrigerator.'], root: 'the fallen branch', signals: ['so'],
    askCause: 'What caused the electricity in the house to go off?', askEffect: 'What was the effect of the electricity going off?',
  }),
  paragraph('c06', 'chain', {
    text: 'Jamal left his bike outside all winter. Rain and snow soaked the chain week after week. By spring, the chain was covered in rust. In April, Jamal’s class visited the science museum.',
    events: ['Jamal left his bike outside all winter.', 'Rain and snow soaked the chain.', 'The chain was covered in rust.'],
    after: 'Jamal’s class visited the science museum.', decoys: ['Jamal oiled the chain.'], root: 'leaving the bike outside',
    askCause: 'What caused the chain to be soaked by rain and snow?', askEffect: 'What was the effect of rain and snow soaking the chain?',
  }),
  paragraph('c07', 'chain', {
    text: 'The classroom plant sat on a shelf far from the window. Because it got very little light, it could not make enough food. Its leaves turned yellow and began to drop. On Friday, the class had a spelling test.',
    events: ['The plant got very little light.', 'The plant could not make enough food.', 'Its leaves turned yellow and began to drop.'],
    after: 'The class had a spelling test.', decoys: ['Someone gave the plant too much water.'], root: 'the lack of light', signals: ['Because'],
    askCause: 'What caused the plant to make too little food?', askEffect: 'What was the effect of the plant making too little food?',
  }),
  paragraph('c08', 'chain', {
    text: 'The cook left a metal spoon in a pot of hot soup. Heat traveled up the spoon. When he took hold of the handle, it was too hot to hold. He served the soup at six o’clock.',
    events: ['A metal spoon was left in a pot of hot soup.', 'Heat traveled up the spoon.', 'The handle was too hot to hold.'],
    after: 'The soup was served at six o’clock.', decoys: ['The spoon had been lying in the sunshine.'], root: 'leaving the spoon in the hot soup',
    askCause: 'What caused heat to travel up the spoon?', askEffect: 'What was the effect of heat traveling up the spoon?',
  }),
  paragraph('c09', 'chain', {
    text: 'Earthworms tunneled through the garden soil all spring. Their tunnels let air and water reach deeper into the ground, so the roots of the bean plants grew more easily. In the fall, the gardener painted the fence.',
    events: ['Earthworms tunneled through the garden soil.', 'Air and water reached deeper into the ground.', 'The roots of the bean plants grew more easily.'],
    after: 'The gardener painted the fence.', decoys: ['The gardener watered the beans twice a day.'], root: 'the earthworms’ tunneling', signals: ['so'],
    askCause: 'What caused air and water to reach deeper into the ground?', askEffect: 'What was the effect of air and water reaching deeper into the ground?',
  }),
  paragraph('c10', 'chain', {
    text: 'A truck spilled gravel on the bike path. Tara’s front wheel skidded on the loose stones. She had to put a foot down to keep from falling. Two days later, the city held its spring parade.',
    events: ['A truck spilled gravel on the bike path.', 'Tara’s front wheel skidded.', 'Tara had to put a foot down to keep from falling.'],
    after: 'The city held its spring parade.', decoys: ['Tara’s tire went flat.'], root: 'the spilled gravel',
    askCause: 'What caused Tara’s front wheel to skid?', askEffect: 'What was the effect of the wheel skidding?',
  }),
  paragraph('c11', 'chain', {
    text: 'In the fall, the days grew shorter. With less sunlight, the maple tree stopped making green chlorophyll in its leaves. The green faded, and yellow and orange showed through. A week later, the school held its book fair.',
    events: ['The days grew shorter.', 'The maple tree stopped making green chlorophyll.', 'The green faded, and yellow and orange showed through.'],
    after: 'The school held its book fair.', decoys: ['The tree did not get enough water.'], root: 'the shorter days',
    askCause: 'What caused the maple tree to stop making green chlorophyll?', askEffect: 'What was the effect of the tree no longer making chlorophyll?',
  }),
  paragraph('c12', 'chain', {
    text: 'Each winter, water froze in a small crack in the boulder. Water expands when it freezes, so the ice pushed the crack wider. After many winters, the boulder split in two. Years later, a hiking trail was built nearby.',
    events: ['Water froze in a crack in the boulder.', 'The ice pushed the crack wider.', 'The boulder split in two.'],
    after: 'A hiking trail was built nearby.', decoys: ['Lightning struck the boulder.'], root: 'the freezing water', signals: ['so'],
    askCause: 'What caused the crack to be pushed wider?', askEffect: 'What was the effect of the crack growing wider, winter after winter?',
  }),
  paragraph('c13', 'chain', {
    text: 'Bright stage lights shone on the ice swan for an hour. Its thin neck melted through. The swan’s head dropped onto the table. When the party ended, the guests collected their coats.',
    events: ['Bright stage lights shone on the ice swan for an hour.', 'The swan’s thin neck melted through.', 'The swan’s head dropped onto the table.'],
    after: 'The guests collected their coats.', decoys: ['A guest bumped into the table.'], root: 'the heat of the stage lights',
    askCause: 'What caused the swan’s neck to melt through?', askEffect: 'What was the effect of the neck melting through?',
  }),
  paragraph('c14', 'chain', {
    text: 'On Saturday afternoon, the wind dropped completely. Since there was no wind to fill the sails, the sailboat stopped moving. The crew had to row back to the dock. On Sunday, they visited the lighthouse.',
    events: ['The wind dropped completely.', 'The sailboat stopped moving.', 'The crew had to row back to the dock.'],
    after: 'The crew visited the lighthouse.', decoys: ['The boat ran onto a sandbar.'], root: 'the drop in the wind', signals: ['Since'],
    askCause: 'What caused the sailboat to stop moving?', askEffect: 'What was the effect of the sailboat stopping?',
  }),
  paragraph('c15', 'chain', {
    text: 'Ben shook the can of soda before he opened it. When he pulled the tab, soda sprayed all over the table. He spent ten minutes wiping it up. After that, he did his math homework.',
    events: ['Ben shook the can of soda before he opened it.', 'Soda sprayed all over the table.', 'Ben spent ten minutes wiping up.'],
    after: 'Ben did his math homework.', decoys: ['The can had a hole in it.'], root: 'shaking the can',
    askCause: 'What caused the soda to spray all over the table?', askEffect: 'What was the effect of the soda spraying over the table?',
  }),
  paragraph('c16', 'chain', {
    text: 'A beaver built a dam across the stream. Water backed up behind the dam and formed a pond. Because there was now a pond, ducks and frogs came to live there. The following year, a farmer nearby bought a new tractor.',
    events: ['A beaver built a dam across the stream.', 'Water backed up and formed a pond.', 'Ducks and frogs came to live there.'],
    after: 'A farmer nearby bought a new tractor.', decoys: ['Heavy rain flooded the valley.'], root: 'the beaver’s dam', signals: ['Because'],
    askCause: 'What caused water to back up and form a pond?', askEffect: 'What was the effect of the pond forming?',
  }),
  paragraph('c17', 'chain', {
    text: 'Someone left the gate of the sheep pen open. The sheep wandered out onto the road. Cars had to stop and wait until the farmer led the sheep back. That night, the Moon was full.',
    events: ['Someone left the gate of the sheep pen open.', 'The sheep wandered out onto the road.', 'Cars had to stop and wait.'],
    after: 'The Moon was full that night.', decoys: ['A dog chased the sheep out of the pen.'], root: 'the open gate',
    askCause: 'What caused the sheep to wander onto the road?', askEffect: 'What was the effect of the sheep wandering onto the road?',
  }),
  paragraph('c18', 'chain', {
    text: 'The baker forgot to add yeast to the dough. Without yeast, no gas bubbles formed, so the dough did not rise. The loaf came out of the oven flat and heavy. That afternoon, the bakery got a delivery of flour.',
    events: ['The baker forgot to add yeast.', 'The dough did not rise.', 'The loaf came out flat and heavy.'],
    after: 'The bakery got a delivery of flour.', decoys: ['The oven was not hot enough.'], root: 'leaving out the yeast', signals: ['so'],
    askCause: 'What caused the dough not to rise?', askEffect: 'What was the effect of the dough not rising?',
  }),
  paragraph('c19', 'chain', {
    text: 'The toast burned, and smoke drifted up to the ceiling. The smoke alarm went off. Its noise woke the baby. At nine o’clock, Grandma called to say hello.',
    events: ['Smoke from the burned toast drifted up to the ceiling.', 'The smoke alarm went off.', 'The noise woke the baby.'],
    after: 'Grandma called to say hello.', decoys: ['Someone rang the doorbell.'], root: 'the smoke from the toast',
    askCause: 'What caused the smoke alarm to go off?', askEffect: 'What was the effect of the smoke alarm going off?',
  }),
  paragraph('c20', 'chain', {
    text: 'Thick clouds covered the Sun all day. The solar panels on the roof made far less electricity than usual. Therefore, the battery was only half charged by evening. The next morning, the family ate pancakes.',
    events: ['Thick clouds covered the Sun all day.', 'The solar panels made far less electricity than usual.', 'The battery was only half charged by evening.'],
    after: 'The family ate pancakes.', decoys: ['A solar panel fell off the roof.'], root: 'the thick clouds', signals: ['Therefore'],
    askCause: 'What caused the solar panels to make less electricity?', askEffect: 'What was the effect of the panels making less electricity?',
  }),
  paragraph('c21', 'chain', {
    text: 'A truck broke down in the middle of the bridge. Cars lined up behind it for a mile. The city bus, stuck in the line, reached the school twenty minutes late. That afternoon, it began to drizzle.',
    events: ['A truck broke down on the bridge.', 'Cars lined up behind the truck for a mile.', 'The city bus reached the school twenty minutes late.'],
    after: 'It began to drizzle.', decoys: ['The bridge was closed for painting.'], root: 'the broken-down truck',
    askCause: 'What caused cars to line up for a mile?', askEffect: 'What was the effect of the long line of cars?',
  }),
  // Level 3. Forks: one cause with two effects.
  paragraph('c22', 'fork', {
    text: 'A heavy snowstorm hit the town on Sunday night. The schools stayed closed on Monday. All over town, tree branches bent under the weight of the snow. On Friday evening, the town choir gave its concert.',
    events: ['A heavy snowstorm hit the town.', 'The schools stayed closed on Monday.', 'Tree branches bent under the weight of the snow.'],
    after: 'The town choir gave its concert.', decoys: ['The river flooded.', 'The roads were crowded with cars.'], root: 'the snowstorm',
    askCause: 'What caused the schools to stay closed on Monday?',
  }),
  paragraph('c23', 'fork', {
    text: 'No rain fell for six weeks. Because of the dry weather, the grass in the park turned brown. The pond also shrank to half its size. In September, a new slide was put in the playground.',
    events: ['No rain fell for six weeks.', 'The grass in the park turned brown.', 'The pond shrank to half its size.'],
    after: 'A new slide was put in the playground.', decoys: ['The park was closed to visitors.', 'The gardeners cut the grass too short.'], root: 'the six dry weeks', signals: ['Because of'],
    askCause: 'What caused the grass in the park to turn brown?',
  }),
  paragraph('c24', 'fork', {
    text: 'The power went out across the neighborhood at dusk. The streetlights stayed dark. In the houses, families lit candles and looked for flashlights. On Thursday, the weather turned warmer.',
    events: ['The power went out across the neighborhood.', 'The streetlights stayed dark.', 'Families lit candles and looked for flashlights.'],
    after: 'The weather turned warmer.', decoys: ['The Moon lit up the street.', 'The stores stayed open late.'], root: 'the power cut',
    askCause: 'What caused the streetlights to stay dark?',
  }),
  paragraph('c25', 'fork', {
    text: 'A strong wind blew across the lake on Saturday. It pushed the sailboats along quickly. On the beach, it knocked over the umbrellas. Later in the week, the lifeguards painted their tower.',
    events: ['A strong wind blew across the lake.', 'The sailboats moved along quickly.', 'The umbrellas on the beach were knocked over.'],
    after: 'The lifeguards painted their tower.', decoys: ['It began to rain.', 'The lake froze over.'], root: 'the strong wind',
    askCause: 'What caused the sailboats to move along quickly?',
  }),
  paragraph('c26', 'fork', {
    text: 'The Sun came out after a week of clouds. The snow on the roof began to melt. Indoors, a warm patch of light appeared on the kitchen floor. That weekend, Mom fixed the squeaky door.',
    events: ['The Sun came out.', 'The snow on the roof began to melt.', 'A warm patch of light appeared on the kitchen floor.'],
    after: 'Mom fixed the squeaky door.', decoys: ['Someone turned up the heating.', 'More snow fell on the roof.'], root: 'the Sun coming out',
    askCause: 'What caused the snow on the roof to begin melting?',
  }),
  paragraph('c27', 'fork', {
    text: 'Grandpa watered the garden every evening in July. As a result, the tomato plants grew tall. The extra water also helped weeds sprout between the rows. In August, his neighbor built a birdhouse.',
    events: ['Grandpa watered the garden every evening.', 'The tomato plants grew tall.', 'Weeds sprouted between the rows.'],
    after: 'His neighbor built a birdhouse.', decoys: ['Rabbits ate the lettuce.', 'The soil dried out.'], root: 'the evening watering', signals: ['As a result'],
    askCause: 'What caused the tomato plants to grow tall?',
  }),
  paragraph('c28', 'fork', {
    text: 'The heater in the classroom broke on a January morning. The students kept their coats on all day. The water in the fish tank cooled by a few degrees. The next week, the class went on a trip to the zoo.',
    events: ['The classroom heater broke.', 'The students kept their coats on all day.', 'The water in the fish tank cooled by a few degrees.'],
    after: 'The class went on a trip to the zoo.', decoys: ['Someone left the door open.', 'The fish tank sprang a leak.'], root: 'the broken heater',
    askCause: 'What caused the students to keep their coats on all day?',
  }),
  paragraph('c29', 'fork', {
    text: 'One night in October, the temperature fell far below freezing. The tomato plants in the garden died. On the pond, a thin sheet of ice formed along the edge. The following week, the school held its fall fair.',
    events: ['The temperature fell far below freezing.', 'The tomato plants in the garden died.', 'A thin sheet of ice formed along the edge of the pond.'],
    after: 'The school held its fall fair.', decoys: ['Deer ate the tomato plants.', 'The pond dried up.'], root: 'the freezing night',
    askCause: 'What caused the tomato plants to die?',
  }),
  paragraph('c30', 'fork', {
    text: 'In spring, the river flooded the low field. The water left behind a layer of fertile mud, so the soil became better for crops. The flood also washed away the old wooden fence. That summer, the farmer’s daughter learned to drive the tractor.',
    events: ['The river flooded the low field.', 'The soil became better for crops.', 'The old wooden fence was washed away.'],
    after: 'The farmer’s daughter learned to drive the tractor.', decoys: ['The farmer sold the field.', 'Cows knocked down the fence.'], root: 'the flood', signals: ['so'],
    askCause: 'What caused the soil to become better for crops?',
  }),
  paragraph('c31', 'fork', {
    text: 'The old oak fell in a windstorm. With the big tree gone, more sunlight reached the forest floor. Beetles soon moved into the fallen trunk. The next day, the first snow of winter fell.',
    events: ['The old oak fell.', 'More sunlight reached the forest floor.', 'Beetles moved into the fallen trunk.'],
    after: 'The first snow of winter fell.', decoys: ['Rangers cut the oak down.', 'The forest floor grew darker.'], root: 'the fall of the oak',
    askCause: 'What caused more sunlight to reach the forest floor?',
  }),
  paragraph('c32', 'fork', {
    text: 'The Sun set at six o’clock. Within an hour, the air had cooled by several degrees. Along the street, the lamps switched on by themselves. Later that evening, a neighbor practiced the trumpet.',
    events: ['The Sun set.', 'The air cooled by several degrees.', 'The street lamps switched on by themselves.'],
    after: 'A neighbor practiced the trumpet.', decoys: ['Clouds covered the sky.', 'The power went out.'], root: 'the sunset',
    askCause: 'What caused the air to cool by several degrees?',
  }),
  paragraph('c33', 'fork', {
    text: 'Mia opened the window on a windy day. As a result, her papers blew off the desk. The door also slammed shut. After dinner, she finished her drawing.',
    events: ['Mia opened the window on a windy day.', 'Her papers blew off the desk.', 'The door slammed shut.'],
    after: 'Mia finished her drawing.', decoys: ['The cat jumped onto the desk.', 'The window cracked.'], root: 'opening the window', signals: ['As a result'],
    askCause: 'What caused the papers to blow off the desk?',
  }),
  paragraph('c34', 'fork', {
    text: 'Because rain fell all afternoon, the baseball game was called off. The dry creek bed also began to run with water. In the evening, Dad made soup.',
    events: ['Rain fell all afternoon.', 'The baseball game was called off.', 'The dry creek bed began to run with water.'],
    after: 'Dad made soup.', decoys: ['The field lights broke.', 'The creek froze.'], root: 'the afternoon rain', signals: ['Because'],
    askCause: 'What caused the baseball game to be called off?',
  }),
];

export const itemById = id => ITEMS.find(entry => entry.id === id);
export const itemsFor = (level, kind) => ITEMS.filter(entry => entry.level === level && (!kind || entry.kind === kind));
/** The level 2 sentences in their sets of four for the matching question: [[item × 4] × 8]. */
export const MATCH_SETS = Array.from({ length: 8 }, (_, i) => itemsFor(2).filter(entry => entry.set === i + 1));

/* ------------------------------------------------------------ sentences */

const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const sentenceCase = text => text[0].toUpperCase() + text.slice(1);

/** A sentence's cause and effect in the order they appear: [{ text, kind, start }], kind = 'cause' | 'effect'. */
export function parts(entry) {
  return [['cause', entry.cause], ['effect', entry.effect]]
    .map(([kind, text]) => ({ text, kind, start: entry.text.indexOf(text) }))
    .sort((a, b) => a.start - b.start);
}

/** Where the signal words sit in a sentence, outside the cause and the effect: [[start, end], …]. */
export function signalRanges(entry) {
  const taken = parts(entry).map(part => [part.start, part.start + part.text.length]);
  const out = [];
  for (const word of signalById(entry.signal).words) {
    const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(word)}(?![\\p{L}\\p{N}])`, 'giu');
    for (const match of entry.text.matchAll(pattern)) {
      const start = match.index, end = start + match[0].length;
      if (!taken.some(([a, b]) => start < b && end > a)) out.push([start, end]);
    }
  }
  return out.sort((a, b) => a[0] - b[0]);
}

/** The signal as it is written in the sentence: “because”, “As a result”, “If … then”. */
export const signalText = entry => signalRanges(entry).map(([start, end]) => entry.text.slice(start, end)).join(' … ');

/** The sentence as pieces of text: [{ text, kind }], kind = null | 'cause' | 'effect' | 'signal'. */
export function pieces(entry) {
  const marked = [
    ...parts(entry).map(part => ({ start: part.start, end: part.start + part.text.length, kind: part.kind })),
    ...signalRanges(entry).map(([start, end]) => ({ start, end, kind: 'signal' })),
  ].sort((a, b) => a.start - b.start);
  const out = [];
  let at = 0;
  for (const { start, end, kind } of marked) {
    if (start > at) out.push({ text: entry.text.slice(at, start), kind: null });
    out.push({ text: entry.text.slice(start, end), kind });
    at = end;
  }
  if (at < entry.text.length) out.push({ text: entry.text.slice(at), kind: null });
  return out;
}

/** The sentence's words with their positions, and whether each one is part of the signal: [{ text, start, end, signal }]. */
export function words(entry) {
  const marked = signalRanges(entry);
  return [...entry.text.matchAll(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)].map(m => {
    const start = m.index, end = start + m[0].length;
    return { text: m[0], start, end, signal: marked.some(([a, b]) => start >= a && end <= b) };
  });
}

/** The sentence with one part left out for the student to write: “The grass is wet because ______.” */
export function stem(entry, missing) {
  return entry.text.replace(entry[missing], '______');
}

/* ----------------------------------------------------------- paragraphs */

/** The question a paragraph asks in each mode, with its right answer and three wrong ones (not shuffled). */
export function paragraphQuestion(entry, mode) {
  const [first, second, third] = entry.events;
  const [decoy, decoy2] = entry.decoys;
  if (mode === 'what-caused') return { prompt: entry.askCause, answer: first, wrong: [third, entry.after, decoy] };
  if (mode === 'what-effect') {
    return entry.kind === 'chain'
      ? { prompt: entry.askEffect, answer: third, wrong: [first, entry.after, decoy] }
      : { prompt: `What was one effect of ${entry.root}?`, answer: third, wrong: [entry.after, decoy, decoy2] };
  }
  return { prompt: `Which of these happened afterwards, but was not caused by ${entry.root}?`, answer: entry.after, wrong: [second, third, decoy] };
}

/* --------------------------------------------------------- explanations */

/** Why the answer is what it is, in a few plain sentences. */
export function explain(question) {
  if (question.mode === 'match') return `The pairs are: ${question.items.map(entry => `“${sentenceCase(entry.cause)}” caused “${entry.effect}”`).join('; ')}.`;
  const entry = question.item;
  if (entry.level < 3) {
    const signal = signalById(entry.signal);
    return `The cause is “${entry.cause}”: it tells why. The effect is “${entry.effect}”: it tells what happened. The signal is “${signalText(entry)}”. ${signal.tip}`;
  }
  const [first, second, third] = entry.events;
  const links = entry.kind === 'chain'
    ? `This is a chain. Cause: ${first} Its effect: ${second} That effect was the cause of the next one: ${third}`
    : `This is one cause with two effects. Cause: ${first} One effect: ${second} Another effect: ${third}`;
  return `${links} Only afterwards: ${entry.after} It came later, but ${entry.root} did not cause it.`;
}

/** The right answer to a paragraph question, as a line of feedback. */
export function answerLine(question) {
  if (question.mode === 'what-caused') return `The cause: ${question.answer}`;
  if (question.mode === 'what-effect') return `The effect: ${question.answer}`;
  return `Only this just came later: ${question.answer} Coming after something is not the same as being caused by it.`;
}

/** Why a wrong option of a paragraph question is wrong. Empty for the right answer. */
export function whyNot(question, option) {
  const entry = question.item;
  if (option === question.answer) return '';
  if (entry.decoys.includes(option)) return 'The paragraph does not say that.';
  if (option === entry.after) return 'That only happened afterwards. Nothing in the paragraph links it to the other events.';
  if (question.mode === 'after') return `That happened because of ${entry.root}, so it is an effect.`;
  if (question.mode === 'what-caused') return entry.kind === 'chain' ? 'That came later in the chain. It is an effect, not the cause.' : 'That is another effect of the same cause.';
  return 'That is the cause, not the effect.';
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

const repeat = (value, times) => Array.from({ length: times }, () => value);

/**
 * Ten questions for a level, the same every time for the same seed.
 * Level 1: [{ item, mode }], five "cause" and five "effect" questions (tap that part of the sentence), with
 * four to six “because” sentences and the rest “so” sentences.
 * Level 2: three "cause", three "effect" and three "signal" (tap the signal word) questions, plus one
 * { mode: 'match', items, order }: four causes to match to four effects. `order` is the order the effects
 * are shown in: slot k holds the effect of items[order[k]].
 * Level 3: [{ item, mode, prompt, options, answer }] about ten paragraphs: four "what-caused", three
 * "what-effect" and three "after" questions, each with four options.
 */
export function buildRound(level, seed) {
  const random = seededRandom(seed);
  if (level === 1) {
    const because = 4 + Math.floor(random() * 3);
    const chosen = [
      ...shuffled(itemsFor(1).filter(entry => entry.signal === 'because'), random).slice(0, because),
      ...shuffled(itemsFor(1).filter(entry => entry.signal === 'so'), random).slice(0, ROUND_LENGTH - because),
    ];
    const modes = shuffled([...repeat('cause', 5), ...repeat('effect', 5)], random);
    return shuffled(chosen, random).map((entry, i) => ({ item: entry, mode: modes[i] }));
  }
  if (level === 2) {
    const set = MATCH_SETS[Math.floor(random() * MATCH_SETS.length)];
    let order = shuffled([0, 1, 2, 3], random);
    // Never show the effects in the same order as their causes.
    if (order.every((value, i) => value === i)) order = [1, 2, 3, 0];
    const modes = shuffled([...repeat('cause', 3), ...repeat('effect', 3), ...repeat('signal', 3)], random);
    const round = shuffled(itemsFor(2).filter(entry => !set.includes(entry)), random).slice(0, ROUND_LENGTH - 1).map((entry, i) => ({ item: entry, mode: modes[i] }));
    round.splice(1 + Math.floor(random() * (ROUND_LENGTH - 1)), 0, { mode: 'match', items: set, order });
    return round;
  }
  const modes = shuffled([...repeat('what-caused', 4), ...repeat('what-effect', 3), ...repeat('after', 3)], random);
  return shuffled(itemsFor(3), random).slice(0, ROUND_LENGTH).map((entry, i) => {
    const { prompt, answer, wrong } = paragraphQuestion(entry, modes[i]);
    return { item: entry, mode: modes[i], prompt, options: shuffled([answer, ...wrong], random), answer };
  });
}

/**
 * Is the answer right? "cause" and "effect": the index of the part tapped (see parts). "signal": the index of
 * the word tapped (see words). "match": a list with the slot chosen for each cause, in order. The paragraph
 * questions: the index of the option chosen.
 */
export function checkAnswer(question, answer) {
  const { item: entry, mode } = question;
  if (mode === 'cause' || mode === 'effect') return parts(entry)[answer]?.kind === mode;
  if (mode === 'signal') return words(entry)[answer]?.signal === true;
  if (mode === 'match') return Array.isArray(answer) && answer.length === question.items.length && answer.every((slot, i) => question.order[slot] === i);
  return question.options[answer] === question.answer;
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
  if (correct === total) return 'A perfect round. You can tell a cause from an effect every time.';
  if (correct >= total * 0.8) return 'Great work. Look over the ones you missed, then try for a perfect round.';
  if (correct >= total * 0.5) return 'Good start. Read the explanations for the ones you missed and play again.';
  return 'Keep going. Ask two questions each time: what happened? Why did it happen?';
}
