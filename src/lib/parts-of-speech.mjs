// The Parts of Speech Game's sentence bank and rules: pure data and functions, shared by the game, the examples
// on the page, the printable worksheet, the answer key and the tests.
//
// Every word of every sentence carries one tag, and each tag is meant to be the one any grammar teacher would
// give. To keep it that way the bank avoids every word whose job is open to argument. If you add a sentence,
// keep to these rules (tests/parts-of-speech.test.mjs checks most of them):
//   - 5 to 10 words, plain and kind; any fact in it is true.
//   - No word used in an unusual job, no -ing or -ed word used as a noun or an adjective ("swimming is fun",
//     "the broken cup"), no noun describing another noun ("apple pie"), no phrasal verbs ("give up"),
//     no "to" before a verb, no possessives (my, her, Sam's), no contractions, no numbers.
//   - None of the words whose class shifts: that, there, so, up, like, well, just, and others in AVOIDED below.
//   - A word has the same tag everywhere in the bank.
//   - Level 1 has one action verb per sentence and no pronouns or adverbs.

const N = 'noun', V = 'verb', ADJ = 'adjective', ADV = 'adverb', PRO = 'pronoun', PREP = 'preposition', CONJ = 'conjunction', ART = 'article';

// The eight labels the game uses, in the order of the palette.
export const PARTS = [
  { id: N, name: 'Noun', plural: 'nouns', short: 'noun', definition: 'A noun names a person, an animal, a place or a thing.', test: 'Can you put “the” in front of it? The dog, the library, the story. A name such as Maya is a noun too.' },
  { id: V, name: 'Verb', plural: 'verbs', short: 'verb', definition: 'A verb tells what someone or something does. Verbs such as is, are, was and were link a noun to a word that tells about it.', test: 'Can you change when it happens? The dog jumps today. The dog jumped yesterday.' },
  { id: ADJ, name: 'Adjective', plural: 'adjectives', short: 'adj.', definition: 'An adjective describes a noun. It tells what kind, what color or what size.', test: 'Does it fit in “the ___ thing” or after “it is very”? The tall thing. It is very tall.' },
  { id: ADV, name: 'Adverb', plural: 'adverbs', short: 'adv.', definition: 'An adverb tells how, when or how often something happens. An adverb such as “very” tells how much.', test: 'Does it answer “how?” or “how often?” about the verb? She ran quickly. They never eat lemons.' },
  { id: PRO, name: 'Pronoun', plural: 'pronouns', short: 'pron.', definition: 'A pronoun takes the place of a noun.', test: 'Can you swap it for a noun? “She reads a book” can become “Maya reads a book.”' },
  { id: PREP, name: 'Preposition', plural: 'prepositions', short: 'prep.', definition: 'A preposition links a noun or pronoun to the rest of the sentence. It often shows where or when.', test: 'Is there a noun or pronoun after it that it places? Under the table. With him. At noon.' },
  { id: CONJ, name: 'Conjunction', plural: 'conjunctions', short: 'conj.', definition: 'A conjunction joins words or parts of a sentence.', test: 'Does it join two things? A horse and a cow. We waited, but the rain continued.' },
  { id: ART, name: 'Article', plural: 'articles', short: 'art.', definition: 'An article comes before a noun. There are only three articles: a, an and the.', test: 'Is the word a, an or the? Then it is an article.' },
];
export const partById = id => PARTS.find(part => part.id === id);

export const LEVELS = [
  { id: 1, name: 'Level 1', grades: 'Grades 2–3', ages: 'ages 7–9', length: 10, asks: [N, V], allowed: [N, V, ADJ, PREP, CONJ, ART], about: 'Nouns and verbs. Tap all the nouns, or all the verbs, in a short sentence.' },
  { id: 2, name: 'Level 2', grades: 'Grades 3–5', ages: 'ages 8–11', length: 10, asks: [N, V, ADJ, ADV, PRO], allowed: [N, V, ADJ, ADV, PRO, PREP, CONJ, ART], about: 'Nouns, verbs, adjectives, adverbs and pronouns. Tap all of one kind, or name the highlighted word.' },
  { id: 3, name: 'Level 3', grades: 'Grades 5–8', ages: 'ages 10–14', length: 8, asks: [N, V, ADJ, ADV, PRO, PREP, CONJ, ART], allowed: [N, V, ADJ, ADV, PRO, PREP, CONJ, ART], about: 'All eight. Pick a part of speech, then tap words until the whole sentence is colored.' },
];
export const levelById = id => LEVELS.find(level => level.id === id);

// The choices the game makes where grammar books differ. The page prints these.
export const CONVENTIONS = [
  'The words a, an and the are tagged as articles. Some grammar books count articles as adjectives, and others call them determiners. In this game they are never adjectives.',
  'A helping verb and its main verb are both tagged as verbs. In “The birds are singing”, both “are” and “singing” are verbs. Helping verbs appear only at levels 2 and 3.',
  'The linking verbs is, are, was and were are verbs, even though nobody is doing anything.',
  'Names of people, such as Maya and Ben, are nouns.',
  'Words such as my, your, his and her before a noun are left out of the game, because grammar books do not agree on what to call them. So are numbers and words such as this, some and every.',
  'Interjections, such as “wow” and “ouch”, are a part of speech too, but they stand apart from the rest of a sentence, so the game does not use them.',
];

// Words the bank never uses, because their part of speech changes from sentence to sentence.
export const AVOIDED = ['that', 'there', 'so', 'up', 'like', 'well', 'just', 'down', 'out', 'off', 'before', 'after', 'since', 'until', 'fast', 'hard', 'early', 'late', 'home', 'today', 'tomorrow', 'yesterday', 'this', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'not'];

// Words that can be more than one part of speech, for the page. None of these sentences is in the game.
export const SHIFTERS = [
  { word: 'water', uses: [[N, 'The water is cold.'], [V, 'We water the plants.']] },
  { word: 'fast', uses: [[ADJ, 'It is a fast train.'], [ADV, 'The train goes fast.']] },
  { word: 'light', uses: [[N, 'Turn on the light.'], [ADJ, 'The box is light.'], [V, 'They light the candles.']] },
  { word: 'up', uses: [[ADV, 'The balloon went up.'], [PREP, 'The cat ran up the tree.']] },
  { word: 'after', uses: [[PREP, 'We played after lunch.'], [CONJ, 'We played after the rain stopped.']] },
  { word: 'paint', uses: [[N, 'The paint is wet.'], [V, 'They paint the fence.']] },
];

/* --------------------------------------------------------------- the bank */
// One sentence per line: [word, tag, why]. A comma belongs to the word before it; the final period is added.
// "why" finishes the sentence "It …". Articles need no "why": theirs is always "goes with the noun …".
const BANK = [
  // Level 1, grades 2–3: one action verb, clear nouns. The student taps all the nouns or all the verbs.
  ['a01', [['The', ART], ['brown', ADJ, 'describes the dog'], ['dog', N, 'names an animal'], ['chased', V, 'tells what the dog did'], ['a', ART], ['ball', N, 'names a thing']]],
  ['a02', [['A', ART], ['small', ADJ, 'describes the bird'], ['bird', N, 'names an animal'], ['sings', V, 'tells what the bird does'], ['in', PREP, 'shows where the bird sings'], ['the', ART], ['tree', N, 'names a plant']]],
  ['a03', [['Maya', N, 'names a person'], ['reads', V, 'tells what Maya does'], ['a', ART], ['book', N, 'names a thing'], ['at', PREP, 'shows where Maya reads'], ['the', ART], ['library', N, 'names a place']]],
  ['a04', [['The', ART], ['cat', N, 'names an animal'], ['sleeps', V, 'tells what the cat does'], ['on', PREP, 'shows where the cat sleeps'], ['a', ART], ['soft', ADJ, 'describes the bed'], ['bed', N, 'names a thing']]],
  ['a05', [['Ben', N, 'names a person'], ['kicked', V, 'tells what Ben did'], ['the', ART], ['ball', N, 'names a thing'], ['into', PREP, 'shows where the ball went'], ['the', ART], ['net', N, 'names a thing']]],
  ['a06', [['The', ART], ['farmer', N, 'names a person'], ['feeds', V, 'tells what the farmer does'], ['the', ART], ['hungry', ADJ, 'describes the pigs'], ['pigs', N, 'names animals']]],
  ['a07', [['A', ART], ['green', ADJ, 'describes the frog'], ['frog', N, 'names an animal'], ['jumped', V, 'tells what the frog did'], ['into', PREP, 'shows where the frog jumped'], ['the', ART], ['pond', N, 'names a place']]],
  ['a08', [['The', ART], ['children', N, 'names people'], ['built', V, 'tells what the children did'], ['a', ART], ['tall', ADJ, 'describes the tower'], ['tower', N, 'names a thing']]],
  ['a09', [['Rain', N, 'names a thing'], ['fell', V, 'tells what the rain did'], ['on', PREP, 'shows where the rain fell'], ['the', ART], ['old', ADJ, 'describes the roof'], ['roof', N, 'names a thing']]],
  ['a10', [['The', ART], ['baker', N, 'names a person'], ['makes', V, 'tells what the baker does'], ['fresh', ADJ, 'describes the bread'], ['bread', N, 'names a thing']]],
  ['a11', [['A', ART], ['rabbit', N, 'names an animal'], ['eats', V, 'tells what the rabbit does'], ['carrots', N, 'names things'], ['in', PREP, 'shows where the rabbit eats'], ['the', ART], ['garden', N, 'names a place']]],
  ['a12', [['The', ART], ['teacher', N, 'names a person'], ['wrote', V, 'tells what the teacher did'], ['a', ART], ['word', N, 'names a thing'], ['on', PREP, 'shows where the teacher wrote'], ['the', ART], ['board', N, 'names a thing']]],
  ['a13', [['Leo', N, 'names a person'], ['and', CONJ, 'joins “Leo” and “Ana”'], ['Ana', N, 'names a person'], ['carried', V, 'tells what Leo and Ana did'], ['the', ART], ['big', ADJ, 'describes the box'], ['box', N, 'names a thing']]],
  ['a14', [['The', ART], ['bus', N, 'names a thing'], ['stopped', V, 'tells what the bus did'], ['at', PREP, 'shows where the bus stopped'], ['the', ART], ['corner', N, 'names a place']]],
  ['a15', [['A', ART], ['spider', N, 'names an animal'], ['spins', V, 'tells what the spider does'], ['a', ART], ['web', N, 'names a thing'], ['in', PREP, 'shows where the spider spins'], ['the', ART], ['barn', N, 'names a place']]],
  ['a16', [['The', ART], ['wind', N, 'names a thing'], ['shook', V, 'tells what the wind did'], ['the', ART], ['tall', ADJ, 'describes the trees'], ['trees', N, 'names plants']]],
  ['a17', [['The', ART], ['boy', N, 'names a person'], ['drew', V, 'tells what the boy did'], ['a', ART], ['horse', N, 'names an animal'], ['and', CONJ, 'joins “a horse” and “a cow”'], ['a', ART], ['cow', N, 'names an animal']]],
  ['a18', [['Bees', N, 'names animals'], ['carry', V, 'tells what bees do'], ['pollen', N, 'names a thing'], ['from', PREP, 'shows where the pollen comes from'], ['the', ART], ['flowers', N, 'names plants']]],
  ['a19', [['The', ART], ['girl', N, 'names a person'], ['planted', V, 'tells what the girl did'], ['seeds', N, 'names things'], ['in', PREP, 'shows where the seeds went'], ['a', ART], ['pot', N, 'names a thing']]],
  ['a20', [['A', ART], ['fish', N, 'names an animal'], ['swims', V, 'tells what the fish does'], ['under', PREP, 'shows where the fish swims'], ['the', ART], ['wooden', ADJ, 'describes the bridge'], ['bridge', N, 'names a thing']]],
  ['a21', [['The', ART], ['chef', N, 'names a person'], ['stirred', V, 'tells what the chef did'], ['the', ART], ['hot', ADJ, 'describes the soup'], ['soup', N, 'names a thing']]],
  ['a22', [['Grandpa', N, 'names a person'], ['told', V, 'tells what Grandpa did'], ['a', ART], ['funny', ADJ, 'describes the story'], ['story', N, 'names a thing']]],
  ['a23', [['The', ART], ['moon', N, 'names a thing'], ['shines', V, 'tells what the moon does'], ['on', PREP, 'shows where the moon shines'], ['the', ART], ['quiet', ADJ, 'describes the lake'], ['lake', N, 'names a place']]],
  ['a24', [['The', ART], ['puppy', N, 'names an animal'], ['hid', V, 'tells what the puppy did'], ['under', PREP, 'shows where the puppy hid'], ['the', ART], ['table', N, 'names a thing']]],
  ['a25', [['A', ART], ['turtle', N, 'names an animal'], ['walked', V, 'tells what the turtle did'], ['across', PREP, 'shows where the turtle walked'], ['the', ART], ['warm', ADJ, 'describes the sand'], ['sand', N, 'names a thing']]],
  ['a26', [['The', ART], ['class', N, 'names a group of people'], ['sang', V, 'tells what the class did'], ['a', ART], ['song', N, 'names a thing'], ['for', PREP, 'shows who the song was for'], ['the', ART], ['visitors', N, 'names people']]],

  // Level 2, grades 3–5: adjectives, adverbs and pronouns join in. Linking verbs and a few helping verbs.
  ['b01', [['She', PRO, 'takes the place of a name'], ['quickly', ADV, 'tells how she opened the door'], ['opened', V, 'tells what she did'], ['the', ART], ['heavy', ADJ, 'describes the door'], ['door', N, 'names a thing']]],
  ['b02', [['The', ART], ['hungry', ADJ, 'describes the goat'], ['goat', N, 'names an animal'], ['ate', V, 'tells what the goat did'], ['the', ART], ['green', ADJ, 'describes the grass'], ['grass', N, 'names a plant'], ['slowly', ADV, 'tells how the goat ate']]],
  ['b03', [['We', PRO, 'takes the place of the names of the people speaking'], ['often', ADV, 'tells how often we walk'], ['walk', V, 'tells what we do'], ['to', PREP, 'shows where we walk'], ['the', ART], ['park', N, 'names a place']]],
  ['b04', [['The', ART], ['soup', N, 'names a thing'], ['was', V, 'links “soup” to the word that describes it'], ['very', ADV, 'tells how hot'], ['hot', ADJ, 'describes the soup']]],
  ['b05', [['He', PRO, 'takes the place of a name'], ['carefully', ADV, 'tells how he carried the glass'], ['carried', V, 'tells what he did'], ['the', ART], ['full', ADJ, 'describes the glass'], ['glass', N, 'names a thing']]],
  ['b06', [['They', PRO, 'takes the place of the names of some people'], ['never', ADV, 'tells how often they eat lemons'], ['eat', V, 'tells what they do'], ['sour', ADJ, 'describes the lemons'], ['lemons', N, 'names things']]],
  ['b07', [['The', ART], ['little', ADJ, 'describes the kitten'], ['kitten', N, 'names an animal'], ['purred', V, 'tells what the kitten did'], ['softly', ADV, 'tells how the kitten purred']]],
  ['b08', [['I', PRO, 'takes the place of the name of the person speaking'], ['gave', V, 'tells what I did'], ['him', PRO, 'takes the place of a name'], ['a', ART], ['red', ADJ, 'describes the apple'], ['apple', N, 'names a thing']]],
  ['b09', [['The', ART], ['old', ADJ, 'describes the clock'], ['clock', N, 'names a thing'], ['ticks', V, 'tells what the clock does'], ['loudly', ADV, 'tells how the clock ticks'], ['in', PREP, 'shows where the clock ticks'], ['the', ART], ['hall', N, 'names a place']]],
  ['b10', [['You', PRO, 'takes the place of the name of the person spoken to'], ['always', ADV, 'tells how often you tell jokes'], ['tell', V, 'tells what you do'], ['funny', ADJ, 'describes the jokes'], ['jokes', N, 'names things']]],
  ['b11', [['The', ART], ['stars', N, 'names things'], ['were', V, 'links “stars” to the word that describes them'], ['bright,', ADJ, 'describes the stars'], ['and', CONJ, 'joins the two halves of the sentence'], ['the', ART], ['sky', N, 'names a thing'], ['was', V, 'links “sky” to the word that describes it'], ['dark', ADJ, 'describes the sky']]],
  ['b12', [['It', PRO, 'takes the place of the name of an animal or a thing'], ['sleeps', V, 'tells what it does'], ['quietly', ADV, 'tells how it sleeps'], ['under', PREP, 'shows where it sleeps'], ['the', ART], ['porch', N, 'names a place']]],
  ['b13', [['A', ART], ['gentle', ADJ, 'describes the breeze'], ['breeze', N, 'names a thing'], ['moved', V, 'tells what the breeze did'], ['the', ART], ['thin', ADJ, 'describes the curtains'], ['curtains', N, 'names things']]],
  ['b14', [['She', PRO, 'takes the place of a name'], ['is', V, 'links “she” to what she is'], ['a', ART], ['brave', ADJ, 'describes the firefighter'], ['firefighter', N, 'names a person']]],
  ['b15', [['The', ART], ['children', N, 'names people'], ['laughed', V, 'tells what the children did'], ['happily', ADV, 'tells how the children laughed'], ['at', PREP, 'links “the clown” to “laughed”'], ['the', ART], ['clown', N, 'names a person']]],
  ['b16', [['We', PRO, 'takes the place of the names of the people speaking'], ['saw', V, 'tells what we did'], ['a', ART], ['huge', ADJ, 'describes the whale'], ['whale', N, 'names an animal']]],
  ['b17', [['The', ART], ['yellow', ADJ, 'describes the bus'], ['bus', N, 'names a thing'], ['stopped', V, 'tells what the bus did'], ['suddenly', ADV, 'tells how the bus stopped']]],
  ['b18', [['They', PRO, 'takes the place of the names of some people'], ['gladly', ADV, 'tells how they helped'], ['helped', V, 'tells what they did'], ['us', PRO, 'takes the place of the names of the people speaking'], ['with', PREP, 'links “the heavy bags” to “helped”'], ['the', ART], ['heavy', ADJ, 'describes the bags'], ['bags', N, 'names things']]],
  ['b19', [['The', ART], ['river', N, 'names a place'], ['is', V, 'links “river” to the words that describe it'], ['deep', ADJ, 'describes the river'], ['and', CONJ, 'joins “deep” and “cold”'], ['cold', ADJ, 'describes the river']]],
  ['b20', [['I', PRO, 'takes the place of the name of the person speaking'], ['sometimes', ADV, 'tells how often I read'], ['read', V, 'tells what I do'], ['long', ADJ, 'describes the stories'], ['stories', N, 'names things']]],
  ['b21', [['The', ART], ['birds', N, 'names animals'], ['are', V, 'is a helping verb that works with “singing”'], ['singing', V, 'is the main verb: it tells what the birds are doing'], ['sweetly', ADV, 'tells how the birds are singing']]],
  ['b22', [['A', ART], ['parrot', N, 'names an animal'], ['can', V, 'is a helping verb that works with “learn”'], ['learn', V, 'is the main verb: it tells what a parrot can do'], ['new', ADJ, 'describes the words'], ['words', N, 'names things']]],
  ['b23', [['She', PRO, 'takes the place of a name'], ['will', V, 'is a helping verb that works with “fix”'], ['fix', V, 'is the main verb: it tells what she will do'], ['the', ART], ['wooden', ADJ, 'describes the fence'], ['fence', N, 'names a thing']]],
  ['b24', [['The', ART], ['proud', ADJ, 'describes the lion'], ['lion', N, 'names an animal'], ['roared', V, 'tells what the lion did'], ['loudly', ADV, 'tells how the lion roared']]],
  ['b25', [['We', PRO, 'takes the place of the names of the people speaking'], ['carefully', ADV, 'tells how we washed the boots'], ['washed', V, 'tells what we did'], ['the', ART], ['muddy', ADJ, 'describes the boots'], ['boots', N, 'names things']]],
  ['b26', [['The', ART], ['morning', N, 'names a time of day'], ['was', V, 'links “morning” to the words that describe it'], ['cold', ADJ, 'describes the morning'], ['and', CONJ, 'joins “cold” and “windy”'], ['windy', ADJ, 'describes the morning']]],
  ['b27', [['He', PRO, 'takes the place of a name'], ['threw', V, 'tells what he did'], ['the', ART], ['ball,', N, 'names a thing'], ['and', CONJ, 'joins the two halves of the sentence'], ['I', PRO, 'takes the place of the name of the person speaking'], ['caught', V, 'tells what I did'], ['it', PRO, 'takes the place of “the ball”']]],
  ['b28', [['The', ART], ['shy', ADJ, 'describes the deer'], ['deer', N, 'names an animal'], ['ran', V, 'tells what the deer did'], ['quickly', ADV, 'tells how the deer ran'], ['into', PREP, 'shows where the deer ran'], ['the', ART], ['forest', N, 'names a place']]],
  ['b29', [['You', PRO, 'takes the place of the name of the person spoken to'], ['are', V, 'links “you” to what you are'], ['a', ART], ['good', ADJ, 'describes the friend'], ['friend', N, 'names a person']]],
  ['b30', [['They', PRO, 'takes the place of the names of some people'], ['usually', ADV, 'tells how often they eat at noon'], ['eat', V, 'tells what they do'], ['lunch', N, 'names a meal'], ['at', PREP, 'shows when they eat'], ['noon', N, 'names a time of day']]],

  // Level 3, grades 5–8: all eight labels. The student colors every word.
  ['c01', [['The', ART], ['fox', N, 'names an animal'], ['ran', V, 'tells what the fox did'], ['quickly', ADV, 'tells how the fox ran'], ['across', PREP, 'shows where the fox ran'], ['the', ART], ['empty', ADJ, 'describes the field'], ['field', N, 'names a place']]],
  ['c02', [['She', PRO, 'takes the place of a name'], ['laughed', V, 'tells what she did'], ['because', CONJ, 'joins what happened to the reason for it'], ['the', ART], ['puppy', N, 'names an animal'], ['chased', V, 'tells what the puppy did'], ['a', ART], ['leaf', N, 'names a thing']]],
  ['c03', [['We', PRO, 'takes the place of the names of the people speaking'], ['waited', V, 'tells what we did'], ['under', PREP, 'shows where we waited'], ['a', ART], ['tree,', N, 'names a plant'], ['but', CONJ, 'joins the two halves of the sentence'], ['the', ART], ['rain', N, 'names a thing'], ['continued', V, 'tells what the rain did']]],
  ['c04', [['A', ART], ['tiny', ADJ, 'describes the mouse'], ['mouse', N, 'names an animal'], ['hid', V, 'tells what the mouse did'], ['behind', PREP, 'shows where the mouse hid'], ['the', ART], ['old', ADJ, 'describes the clock'], ['clock', N, 'names a thing']]],
  ['c05', [['He', PRO, 'takes the place of a name'], ['and', CONJ, 'joins “he” and “I”'], ['I', PRO, 'takes the place of the name of the person speaking'], ['often', ADV, 'tells how often we play'], ['play', V, 'tells what he and I do'], ['chess', N, 'names a game'], ['in', PREP, 'shows where we play'], ['the', ART], ['library', N, 'names a place']]],
  ['c06', [['The', ART], ['soup', N, 'names a thing'], ['is', V, 'links “soup” to the word that describes it'], ['hot,', ADJ, 'describes the soup'], ['but', CONJ, 'joins the two halves of the sentence'], ['the', ART], ['bread', N, 'names a thing'], ['is', V, 'links “bread” to the word that describes it'], ['cold', ADJ, 'describes the bread']]],
  ['c07', [['They', PRO, 'takes the place of the names of some people'], ['walked', V, 'tells what they did'], ['slowly', ADV, 'tells how they walked'], ['through', PREP, 'shows where they walked'], ['the', ART], ['quiet', ADJ, 'describes the museum'], ['museum', N, 'names a place']]],
  ['c08', [['The', ART], ['owl', N, 'names an animal'], ['hunted', V, 'tells what the owl did'], ['at', PREP, 'shows when the owl hunted'], ['night', N, 'names a time'], ['and', CONJ, 'joins “hunted at night” and “slept during the day”'], ['slept', V, 'tells what the owl did'], ['during', PREP, 'shows when the owl slept'], ['the', ART], ['day', N, 'names a time']]],
  ['c09', [['Although', CONJ, 'joins the two halves of the sentence'], ['the', ART], ['hill', N, 'names a place'], ['was', V, 'links “hill” to the word that describes it'], ['steep,', ADJ, 'describes the hill'], ['we', PRO, 'takes the place of the names of the people speaking'], ['climbed', V, 'tells what we did'], ['it', PRO, 'takes the place of “the hill”']]],
  ['c10', [['The', ART], ['girl', N, 'names a person'], ['with', PREP, 'links “the red hat” to “girl”'], ['the', ART], ['red', ADJ, 'describes the hat'], ['hat', N, 'names a thing'], ['waved', V, 'tells what the girl did'], ['at', PREP, 'links “us” to “waved”'], ['us', PRO, 'takes the place of the names of the people speaking']]],
  ['c11', [['You', PRO, 'takes the place of the name of the person spoken to'], ['can', V, 'is a helping verb that works with “sit”'], ['sit', V, 'is the main verb: it tells what you can do'], ['beside', PREP, 'shows where you can sit'], ['me', PRO, 'takes the place of the name of the person speaking'], ['or', CONJ, 'joins “beside me” and “behind them”'], ['behind', PREP, 'shows where you can sit'], ['them', PRO, 'takes the place of the names of some people']]],
  ['c12', [['A', ART], ['bright', ADJ, 'describes the rainbow'], ['rainbow', N, 'names a thing'], ['appeared', V, 'tells what the rainbow did'], ['above', PREP, 'shows where the rainbow appeared'], ['the', ART], ['wet', ADJ, 'describes the hills'], ['hills', N, 'names places']]],
  ['c13', [['If', CONJ, 'joins the two halves of the sentence'], ['the', ART], ['bell', N, 'names a thing'], ['rings,', V, 'tells what the bell does'], ['we', PRO, 'takes the place of the names of the people speaking'], ['quietly', ADV, 'tells how we leave'], ['leave', V, 'tells what we do'], ['the', ART], ['room', N, 'names a place']]],
  ['c14', [['The', ART], ['baby', N, 'names a person'], ['slept', V, 'tells what the baby did'], ['while', CONJ, 'joins the two halves of the sentence'], ['the', ART], ['dog', N, 'names an animal'], ['barked', V, 'tells what the dog did'], ['loudly', ADV, 'tells how the dog barked']]],
  ['c15', [['I', PRO, 'takes the place of the name of the person speaking'], ['always', ADV, 'tells how often I share'], ['share', V, 'tells what I do'], ['a', ART], ['snack', N, 'names a thing'], ['with', PREP, 'links “him” to “share”'], ['him', PRO, 'takes the place of a name']]],
  ['c16', [['The', ART], ['brave', ADJ, 'describes the knight'], ['knight', N, 'names a person'], ['rode', V, 'tells what the knight did'], ['into', PREP, 'shows where the knight rode'], ['the', ART], ['dark', ADJ, 'describes the forest'], ['forest', N, 'names a place']]],
  ['c17', [['She', PRO, 'takes the place of a name'], ['poured', V, 'tells what she did'], ['the', ART], ['milk', N, 'names a thing'], ['carefully', ADV, 'tells how she poured'], ['into', PREP, 'shows where the milk went'], ['a', ART], ['tall', ADJ, 'describes the glass'], ['glass', N, 'names a thing']]],
  ['c18', [['The', ART], ['ducks', N, 'names animals'], ['and', CONJ, 'joins “the ducks” and “the geese”'], ['the', ART], ['geese', N, 'names animals'], ['swam', V, 'tells what the birds did'], ['on', PREP, 'shows where they swam'], ['the', ART], ['calm', ADJ, 'describes the lake'], ['lake', N, 'names a place']]],
  ['c19', [['We', PRO, 'takes the place of the names of the people speaking'], ['never', ADV, 'tells how often we run'], ['run', V, 'tells what we do'], ['in', PREP, 'shows where'], ['the', ART], ['hall', N, 'names a place'], ['or', CONJ, 'joins “in the hall” and “on the stairs”'], ['on', PREP, 'shows where'], ['the', ART], ['stairs', N, 'names a place']]],
  ['c20', [['A', ART], ['friendly', ADJ, 'describes the dolphin. It ends in -ly, but it is not an adverb'], ['dolphin', N, 'names an animal'], ['swam', V, 'tells what the dolphin did'], ['beside', PREP, 'shows where the dolphin swam'], ['the', ART], ['small', ADJ, 'describes the boat'], ['boat', N, 'names a thing']]],
  ['c21', [['He', PRO, 'takes the place of a name'], ['was', V, 'links “he” to the word that describes him'], ['very', ADV, 'tells how sleepy'], ['sleepy,', ADJ, 'describes him'], ['but', CONJ, 'joins the two halves of the sentence'], ['he', PRO, 'takes the place of a name'], ['finished', V, 'tells what he did'], ['the', ART], ['puzzle', N, 'names a thing']]],
  ['c22', [['The', ART], ['kite', N, 'names a thing'], ['drifted', V, 'tells what the kite did'], ['gently', ADV, 'tells how the kite drifted'], ['above', PREP, 'shows where the kite drifted'], ['the', ART], ['tall', ADJ, 'describes the trees'], ['trees', N, 'names plants']]],
  ['c23', [['They', PRO, 'takes the place of the names of some people'], ['sang', V, 'tells what they did'], ['loudly,', ADV, 'tells how they sang'], ['and', CONJ, 'joins the two halves of the sentence'], ['we', PRO, 'takes the place of the names of the people speaking'], ['clapped', V, 'tells what we did'], ['for', PREP, 'links “them” to “clapped”'], ['them', PRO, 'takes the place of the names of some people']]],
  ['c24', [['The', ART], ['cat', N, 'names an animal'], ['sat', V, 'tells what the cat did'], ['between', PREP, 'shows where the cat sat'], ['a', ART], ['pillow', N, 'names a thing'], ['and', CONJ, 'joins “a pillow” and “a basket”'], ['a', ART], ['basket', N, 'names a thing']]],
  ['c25', [['I', PRO, 'takes the place of the name of the person speaking'], ['will', V, 'is a helping verb that works with “call”'], ['call', V, 'is the main verb: it tells what I will do'], ['you', PRO, 'takes the place of the name of the person spoken to'], ['unless', CONJ, 'joins the two halves of the sentence'], ['the', ART], ['storm', N, 'names a thing'], ['arrives', V, 'tells what the storm does']]],
  ['c26', [['The', ART], ['young', ADJ, 'describes the artist'], ['artist', N, 'names a person'], ['proudly', ADV, 'tells how the artist showed the picture'], ['showed', V, 'tells what the artist did'], ['us', PRO, 'takes the place of the names of the people speaking'], ['a', ART], ['picture', N, 'names a thing']]],
  ['c27', [['A', ART], ['long', ADJ, 'describes the train'], ['train', N, 'names a thing'], ['rolled', V, 'tells what the train did'], ['slowly', ADV, 'tells how the train rolled'], ['into', PREP, 'shows where the train rolled'], ['the', ART], ['station', N, 'names a place']]],
  ['c28', [['She', PRO, 'takes the place of a name'], ['gave', V, 'tells what she did'], ['me', PRO, 'takes the place of the name of the person speaking'], ['a', ART], ['book', N, 'names a thing'], ['about', PREP, 'links “a clever spider” to “book”'], ['a', ART], ['clever', ADJ, 'describes the spider'], ['spider', N, 'names an animal']]],
];

function build([id, list]) {
  const words = list.map(([raw, tag, why]) => {
    const text = raw.replace(/,$/, '');
    return { text, tag, why, after: raw.length > text.length ? ',' : '' };
  });
  words.forEach((word, i) => {
    word.index = i;
    if (word.tag === ART) {
      const noun = words.slice(i + 1).find(next => next.tag === N);
      word.why = `goes with the noun “${noun?.text}”`;
    }
  });
  words.at(-1).after = '.';
  return { id, level: 'abc'.indexOf(id[0]) + 1, words, text: words.map(word => word.text + word.after).join(' ') };
}

export const SENTENCES = BANK.map(build);
export const sentenceById = id => SENTENCES.find(sentence => sentence.id === id);
export const sentencesFor = level => SENTENCES.filter(sentence => sentence.level === level);

/** The positions of the words with this tag in a sentence. */
export const targets = (sentence, tag) => sentence.words.filter(word => word.tag === tag).map(word => word.index);

// Names of people in the bank: they keep their capital letter wherever they are shown.
export const NAMES = ['Maya', 'Ben', 'Leo', 'Ana', 'Grandpa'];
/** A word as it is written away from its sentence: lower case unless it is a name or "I". */
export const plainWord = word => (NAMES.includes(word.text) || word.text === 'I' ? word.text : word.text.toLowerCase());

/** Why a word has its tag, as two short sentences: “dog” is a noun. It names an animal. */
export function explainWord(word) {
  const part = partById(word.tag);
  return `“${word.text}” is ${/^[aeiou]/i.test(part.name) ? 'an' : 'a'} ${part.name.toLowerCase()}. It ${word.why}.`;
}

/** Up to `count` different words with this tag, in bank order, each with the sentence it came from. */
export function examplesOf(tag, count = 4, level = 3) {
  const seen = new Set();
  const out = [];
  for (const sentence of SENTENCES.filter(sentence => sentence.level <= level)) {
    for (const word of sentence.words) {
      const shown = plainWord(word);
      if (word.tag !== tag || seen.has(shown)) continue;
      seen.add(shown);
      out.push({ word: shown, sentence });
      if (out.length === count) return out;
    }
  }
  return out;
}

/* ----------------------------------------------------------------- rounds */

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
 * The questions of a round, the same every time for the same seed: [{ sentence, mode, tag, index }].
 *   mode "tap":   tap every word that is a `tag` (levels 1 and 2).
 *   mode "name":  say what part of speech the word at `index` is (level 2).
 *   mode "color": give every word its part of speech (level 3).
 * Level 1 asks about nouns and verbs five times each. Level 2 has five "tap" and five "name" questions and
 * spreads them over its five parts of speech, so each one is asked about twice.
 */
export function buildRound(levelId, seed) {
  const level = levelById(levelId);
  const random = seededRandom(seed);
  const chosen = shuffled(sentencesFor(levelId), random).slice(0, level.length);
  if (levelId === 3) return chosen.map(sentence => ({ sentence, mode: 'color' }));
  // Level 1: every sentence has nouns and a verb, so the ten questions are five of each in a shuffled order.
  if (levelId === 1) {
    const tags = shuffled(chosen.map((_, i) => level.asks[i % level.asks.length]), random);
    return chosen.map((sentence, i) => ({ sentence, mode: 'tap', tag: tags[i] }));
  }
  const modes = shuffled(chosen.map((_, i) => (i % 2 ? 'name' : 'tap')), random);
  // Each part of speech is wanted the same number of times; a question takes the most wanted one its sentence has.
  const wanted = Object.fromEntries(level.asks.map(tag => [tag, level.length / level.asks.length]));
  const order = shuffled(level.asks, random);
  return chosen.map((sentence, i) => {
    const present = order.filter(tag => targets(sentence, tag).length > 0);
    const tag = present.reduce((best, next) => (wanted[next] > wanted[best] ? next : best));
    wanted[tag]--;
    if (modes[i] === 'tap') return { sentence, mode: 'tap', tag };
    const places = targets(sentence, tag);
    return { sentence, mode: 'name', tag, index: places[Math.floor(random() * places.length)] };
  });
}

/**
 * Check an answer. Returns { right, marks }, with one mark per word:
 *   "hit" (found, or tagged correctly), "missed" (should have been tapped), "wrong" (tapped or tagged wrongly),
 *   or null (not part of the question).
 * The answer is: for "tap" the list of positions tapped; for "name" a tag; for "color" a list with a tag per word.
 */
export function checkAnswer(question, answer) {
  const { sentence, mode } = question;
  let marks;
  if (mode === 'tap') {
    const tapped = new Set(answer ?? []);
    marks = sentence.words.map(word => (word.tag === question.tag ? (tapped.has(word.index) ? 'hit' : 'missed') : tapped.has(word.index) ? 'wrong' : null));
  } else if (mode === 'name') {
    marks = sentence.words.map(word => (word.index === question.index ? (answer === word.tag ? 'hit' : 'wrong') : null));
  } else {
    marks = sentence.words.map(word => (answer?.[word.index] === word.tag ? 'hit' : 'wrong'));
  }
  return { right: marks.every(mark => mark === 'hit' || mark === null), marks };
}

/** The spoken or written answer to a question: “The nouns are dog and ball.” */
export function answerLine(question) {
  const { sentence, mode } = question;
  const list = words => (words.length < 3 ? words.join(' and ') : `${words.slice(0, -1).join(', ')} and ${words.at(-1)}`);
  if (mode === 'tap') {
    const found = targets(sentence, question.tag).map(i => `“${sentence.words[i].text}”`);
    const part = partById(question.tag);
    return found.length === 1 ? `The only ${part.name.toLowerCase()} is ${found[0]}.` : `The ${part.plural} are ${list(found)}.`;
  }
  if (mode === 'name') return explainWord(sentence.words[question.index]);
  return `${sentence.words.length} words, each with its part of speech.`;
}

/**
 * How a round went, part of speech by part of speech: { noun: { right, total }, … }.
 * A "tap" or "name" question counts once, for the part of speech it asked about. In a "color" question every
 * word counts, for the part of speech it really is.
 */
export function tally(round, checks) {
  const out = {};
  const add = (tag, right) => {
    out[tag] ??= { right: 0, total: 0 };
    out[tag].total++;
    if (right) out[tag].right++;
  };
  round.forEach((question, i) => {
    if (!checks[i]) return;
    if (question.mode === 'color') question.sentence.words.forEach(word => add(word.tag, checks[i].marks[word.index] === 'hit'));
    else add(question.tag, checks[i].right);
  });
  return out;
}

/** The part of speech to practice next: the one with the lowest share right, or null after a perfect round. */
export function practiceNext(counts) {
  const missed = PARTS.map(part => ({ id: part.id, ...counts[part.id] })).filter(row => row.total > 0 && row.right < row.total);
  if (!missed.length) return null;
  return missed.reduce((worst, row) => {
    const a = worst.right / worst.total, b = row.right / row.total;
    return b < a || (b === a && row.total - row.right > worst.total - worst.right) ? row : worst;
  }).id;
}

/** Score for a finished round, from a list of true (right) and false (wrong). */
export function scoreRound(results) {
  const correct = results.filter(Boolean).length;
  return { correct, total: results.length, perfect: results.length > 0 && correct === results.length };
}

/** A short, kind message for the results screen. */
export function resultMessage({ correct, total }) {
  if (correct === total) return 'A perfect round. Every sentence was right.';
  if (correct >= total * 0.8) return 'Great work. Look over the sentences you missed, then try for a perfect round.';
  if (correct >= total * 0.5) return 'Good start. Read the reason for each word you missed and play again.';
  return 'Keep going. Take one word at a time and ask: what job is this word doing in the sentence?';
}
