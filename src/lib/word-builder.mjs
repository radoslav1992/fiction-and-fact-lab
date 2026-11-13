// The Prefix and Suffix Word Builder's word list and rules: pure data and functions, shared by the tool, the
// tables on the page, the printable worksheet, the answer key and the tests.
//
// The list is curated by hand. Every word in it is a common English word, spelled the US way, that really is
// made of the parts shown: no false splits such as "re" + "ally". If you add a word, be sure of its spelling,
// its parts and its meaning, and choose words that follow the three spelling rules below without exception
// (tests/word-builder.test.mjs builds every word from its parts and compares the spelling).

/* ------------------------------------------------------------ word parts */
// `family` groups parts whose meanings are close, so a question never offers two of them as rival answers.
// `makes` says what kind of word a suffix makes, for the table on the page.
const prefix = (id, meaning, level, extra = {}) => ({ kind: 'prefix', id, label: `${id}-`, meaning, level, ...extra });
const suffix = (id, meaning, level, extra = {}) => ({ kind: 'suffix', id, label: `-${id.split(':')[0]}`, meaning, level, ...extra });
const root = (id, meaning, origin, extra = {}) => ({ kind: 'root', id, label: id, forms: [id], meaning, origin, level: 3, ...extra });

export const PREFIXES = [
  prefix('un', 'not, or the opposite of', 1, { family: 'not' }),
  prefix('re', 'again, or back', 1),
  prefix('dis', 'not, or the opposite of', 2, { family: 'not' }),
  prefix('mis', 'wrongly or badly', 2),
  prefix('pre', 'before', 2),
  prefix('non', 'not', 2, { family: 'not' }),
  prefix('over', 'too much, or over', 2),
  prefix('under', 'too little, or below', 2),
  prefix('trans', 'across', 3),
  prefix('ex', 'out', 3, { family: 'out' }),
  prefix('e', 'out', 3, { family: 'out', note: 'A short form of ex-.' }),
  prefix('im', 'in or into', 3, { family: 'in', note: 'The prefix in- is spelled im- before p.' }),
  prefix('in', 'in or into', 3, { family: 'in' }),
  prefix('con', 'together or with', 3),
  prefix('de', 'down or away, or undo', 3),
  prefix('inter', 'between', 3),
  prefix('contra', 'against', 3),
  prefix('peri', 'around', 3),
];

export const SUFFIXES = [
  suffix('ful', 'full of', 1, { makes: 'an adjective' }),
  suffix('less', 'without', 1, { makes: 'an adjective' }),
  suffix('er', 'more', 1, { makes: 'an adjective that compares' }),
  suffix('est', 'most', 1, { makes: 'an adjective that compares' }),
  suffix('er:who', 'a person or thing that does', 1, { family: 'who', makes: 'a noun' }),
  suffix('ing', 'happening now or going on', 1, { makes: 'a form of a verb' }),
  suffix('ed', 'happened in the past', 1, { makes: 'a form of a verb' }),
  suffix('ly', 'in a certain way', 1, { makes: 'an adverb' }),
  suffix('able', 'able to be', 2, { family: 'able', makes: 'an adjective' }),
  suffix('ness', 'the state of being', 2, { family: 'noun', makes: 'a noun' }),
  suffix('ment', 'the act or result of', 2, { family: 'noun', makes: 'a noun' }),
  suffix('ion', 'the act or result of', 2, { family: 'noun', makes: 'a noun', note: 'Often seen as -tion, because it so often follows a t: act + -ion = action.' }),
  suffix('ible', 'able to be', 3, { family: 'able', makes: 'an adjective' }),
  suffix('or', 'a person or thing that does', 3, { family: 'who', makes: 'a noun' }),
  suffix('ure', 'the act or result of', 3, { family: 'noun', makes: 'a noun' }),
  suffix('ence', 'the act or state of', 3, { family: 'noun', makes: 'a noun' }),
  suffix('y', 'a subject, an activity or its result', 3, { makes: 'a noun' }),
  suffix('logy', 'the study of', 3, { makes: 'a noun' }),
];

export const ROOTS = [
  root('port', 'carry', 'Latin'),
  root('spect', 'look', 'Latin', { family: 'look' }),
  root('struct', 'build', 'Latin'),
  root('dict', 'say', 'Latin'),
  root('rupt', 'break', 'Latin'),
  root('scrib', 'write', 'Latin', { label: 'scrib / script', forms: ['scribe', 'script'], family: 'write' }),
  root('aud', 'hear', 'Latin', { forms: ['aud', 'audi'] }),
  root('graph', 'write or draw', 'Greek', { family: 'write' }),
  root('tele', 'far', 'Greek'),
  root('micro', 'small', 'Greek'),
  root('photo', 'light', 'Greek'),
  root('bio', 'life', 'Greek'),
  root('geo', 'earth', 'Greek'),
  root('auto', 'self', 'Greek'),
  root('scope', 'look at', 'Greek', { family: 'look' }),
  root('phone', 'sound', 'Greek'),
  root('meter', 'measure', 'Greek', { forms: ['meter', 'metr'] }),
];

export const LEVELS = [
  { id: 1, name: 'Level 1', grades: 'Grades 2–3', ages: 'ages 7–9', about: 'The prefixes un- and re-, and the suffixes -ful, -less, -er, -est, -ing, -ed and -ly.' },
  { id: 2, name: 'Level 2', grades: 'Grades 4–5', ages: 'ages 9–11', about: 'Adds dis-, mis-, pre-, non-, over- and under-, and -able, -ness, -ment and -ion.' },
  { id: 3, name: 'Level 3', grades: 'Grades 6–8', ages: 'ages 11–14', about: 'Latin and Greek roots such as port, spect, struct, graph, tele and bio, and the words built from them.' },
];
export const levelById = id => LEVELS.find(level => level.id === id);
export const ROUND_LENGTH = 10;

/* ------------------------------------------------------- spelling rules */
export const RULES = [
  { id: 'drop-e', name: 'Drop the e', rule: 'When a word ends in a consonant and a silent e, and the suffix starts with a vowel, drop the e.', keeps: 'Keep the e when the suffix starts with a consonant: hope + -ful = hopeful.' },
  { id: 'double', name: 'Double the consonant', rule: 'When a one-syllable word ends in one vowel and one consonant, and the suffix starts with a vowel, double the consonant.', keeps: 'Do not double w, x or y, and do not double after two vowels or before a consonant: fix + -ed = fixed, read + -er = reader, sad + -ly = sadly.' },
  { id: 'y-to-i', name: 'Change y to i', rule: 'When a word ends in a consonant and y, change the y to i before a suffix.', keeps: 'Keep the y before -ing, and when a vowel comes before the y: carry + -ing = carrying, play + -ed = played.' },
];
export const ruleById = id => RULES.find(rule => rule.id === id);

/** Add a suffix to a word, applying the three rules: { text, rule } where rule is a RULES id or null. */
export function addSuffix(stem, ending) {
  const vowel = /^[aeiou]/.test(ending);
  if (/[^aeiou]y$/.test(stem) && !ending.startsWith('i')) return { text: stem.slice(0, -1) + 'i' + ending, rule: 'y-to-i' };
  if (vowel && /[^aeiou]e$/.test(stem)) return { text: stem.slice(0, -1) + ending, rule: 'drop-e' };
  if (vowel && /^[^aeiou]*[aeiou][^aeiouwxy]$/.test(stem)) return { text: stem + stem.at(-1) + ending, rule: 'double' };
  return { text: stem + ending, rule: null };
}

/* ------------------------------------------------------------- the list */
// One word per line: [word, parts, definition]. In `parts`, "un-" is a prefix, "-ness" is a suffix and
// anything else is a base word or (at level 3) a root. "-er:who" is the -er of "teacher"; "-er" is the -er of
// "taller". Words ending in -ing, -ed, -er (more), -est, -ly and -ness may leave the definition out: it is
// then made from the suffix ("more tall", "in a quick way", "the state of being happy").
const LEVEL_1 = [
  // un-
  ['unhappy', 'un- happy', 'not happy'],
  ['unkind', 'un- kind', 'not kind'],
  ['unsafe', 'un- safe', 'not safe'],
  ['unfair', 'un- fair', 'not fair'],
  ['untidy', 'un- tidy', 'not tidy; messy'],
  ['unclear', 'un- clear', 'not clear; hard to understand'],
  ['unsure', 'un- sure', 'not sure'],
  ['untrue', 'un- true', 'not true'],
  ['uneven', 'un- even', 'not even; bumpy or not equal'],
  ['unlock', 'un- lock', 'to open a lock'],
  ['unpack', 'un- pack', 'to take things out of a bag or a box'],
  ['unwrap', 'un- wrap', 'to take the wrapping off'],
  ['untie', 'un- tie', 'to undo a knot or a bow'],
  ['undo', 'un- do', 'to reverse something that was done'],
  // re-
  ['reread', 're- read', 'to read again'],
  ['rewrite', 're- write', 'to write again'],
  ['rebuild', 're- build', 'to build again'],
  ['replay', 're- play', 'to play again'],
  ['refill', 're- fill', 'to fill again'],
  ['retell', 're- tell', 'to tell again'],
  ['reuse', 're- use', 'to use again'],
  ['repaint', 're- paint', 'to paint again'],
  ['restart', 're- start', 'to start again'],
  ['redo', 're- do', 'to do again'],
  ['reheat', 're- heat', 'to heat again'],
  // -ful
  ['helpful', 'help -ful', 'full of help; ready to help'],
  ['careful', 'care -ful', 'full of care; taking care'],
  ['hopeful', 'hope -ful', 'full of hope'],
  ['joyful', 'joy -ful', 'full of joy'],
  ['useful', 'use -ful', 'full of use; good for doing a job'],
  ['colorful', 'color -ful', 'full of color'],
  ['playful', 'play -ful', 'full of play; liking to play'],
  ['thankful', 'thank -ful', 'full of thanks; glad'],
  ['cheerful', 'cheer -ful', 'full of cheer; happy'],
  ['peaceful', 'peace -ful', 'full of peace; calm'],
  ['painful', 'pain -ful', 'full of pain; hurting'],
  ['beautiful', 'beauty -ful', 'full of beauty; lovely to look at'],
  // -less
  ['careless', 'care -less', 'without care'],
  ['hopeless', 'hope -less', 'without hope'],
  ['helpless', 'help -less', 'without help; not able to help yourself'],
  ['useless', 'use -less', 'without use; not good for any job'],
  ['endless', 'end -less', 'without an end'],
  ['fearless', 'fear -less', 'without fear'],
  ['harmless', 'harm -less', 'without harm; not able to hurt anyone'],
  ['painless', 'pain -less', 'without pain'],
  ['cloudless', 'cloud -less', 'without clouds'],
  ['spotless', 'spot -less', 'without a spot; very clean'],
  ['sleepless', 'sleep -less', 'without sleep'],
  // -er (more) and -est (most)
  ['taller', 'tall -er'], ['tallest', 'tall -est'],
  ['smaller', 'small -er'], ['smallest', 'small -est'],
  ['faster', 'fast -er'], ['fastest', 'fast -est'],
  ['kinder', 'kind -er'], ['kindest', 'kind -est'],
  ['bigger', 'big -er'], ['biggest', 'big -est'],
  ['hotter', 'hot -er'], ['hottest', 'hot -est'],
  ['nicer', 'nice -er'], ['nicest', 'nice -est'],
  ['safer', 'safe -er'], ['safest', 'safe -est'],
  ['happier', 'happy -er'], ['happiest', 'happy -est'],
  ['easier', 'easy -er'], ['easiest', 'easy -est'],
  // -er (a person who)
  ['teacher', 'teach -er:who', 'a person who teaches'],
  ['player', 'play -er:who', 'a person who plays'],
  ['helper', 'help -er:who', 'a person who helps'],
  ['reader', 'read -er:who', 'a person who reads'],
  ['writer', 'write -er:who', 'a person who writes'],
  ['runner', 'run -er:who', 'a person who runs'],
  ['baker', 'bake -er:who', 'a person who bakes'],
  ['swimmer', 'swim -er:who', 'a person who swims'],
  ['farmer', 'farm -er:who', 'a person who farms'],
  ['painter', 'paint -er:who', 'a person who paints'],
  ['builder', 'build -er:who', 'a person who builds'],
  ['singer', 'sing -er:who', 'a person who sings'],
  // -ing
  ['playing', 'play -ing'], ['jumping', 'jump -ing'], ['reading', 'read -ing'], ['helping', 'help -ing'], ['painting', 'paint -ing'],
  ['hoping', 'hope -ing'], ['baking', 'bake -ing'], ['writing', 'write -ing'], ['smiling', 'smile -ing'],
  ['running', 'run -ing'], ['swimming', 'swim -ing'], ['hopping', 'hop -ing'], ['sitting', 'sit -ing'],
  ['carrying', 'carry -ing'], ['trying', 'try -ing'],
  // -ed
  ['played', 'play -ed'], ['jumped', 'jump -ed'], ['helped', 'help -ed'], ['painted', 'paint -ed'],
  ['hoped', 'hope -ed'], ['baked', 'bake -ed'], ['smiled', 'smile -ed'], ['used', 'use -ed'],
  ['hopped', 'hop -ed'], ['stopped', 'stop -ed'], ['planned', 'plan -ed'],
  ['carried', 'carry -ed'], ['tried', 'try -ed'],
  // -ly
  ['quickly', 'quick -ly'], ['slowly', 'slow -ly'], ['kindly', 'kind -ly'], ['safely', 'safe -ly'], ['quietly', 'quiet -ly'], ['loudly', 'loud -ly'],
  ['bravely', 'brave -ly'], ['softly', 'soft -ly'], ['nicely', 'nice -ly'], ['sadly', 'sad -ly'],
  ['happily', 'happy -ly'], ['easily', 'easy -ly'],
  // Two parts added
  ['unhelpful', 'un- help -ful', 'not helpful'],
  ['unkindly', 'un- kind -ly'], ['unhappily', 'un- happy -ly'],
  ['unlocked', 'un- lock -ed'], ['unpacked', 'un- pack -ed'], ['replayed', 're- play -ed'], ['repainted', 're- paint -ed'],
  ['rebuilding', 're- build -ing'], ['rereading', 're- read -ing'],
  ['carefully', 'care -ful -ly'], ['carelessly', 'care -less -ly'], ['hopefully', 'hope -ful -ly'], ['helpfully', 'help -ful -ly'], ['playfully', 'play -ful -ly'], ['cheerfully', 'cheer -ful -ly'],
];

const LEVEL_2 = [
  // dis-
  ['disagree', 'dis- agree', 'to not agree; to have a different opinion'],
  ['dislike', 'dis- like', 'to not like'],
  ['disappear', 'dis- appear', 'to go out of sight; the opposite of appear'],
  ['disobey', 'dis- obey', 'to not obey'],
  ['disconnect', 'dis- connect', 'to undo a connection'],
  ['dishonest', 'dis- honest', 'not honest'],
  ['distrust', 'dis- trust', 'to not trust'],
  ['disorder', 'dis- order', 'a lack of order; a mess'],
  ['discomfort', 'dis- comfort', 'a lack of comfort'],
  ['disapprove', 'dis- approve', 'to not approve; to think something is wrong'],
  // mis-
  ['misspell', 'mis- spell', 'to spell wrongly'],
  ['misplace', 'mis- place', 'to put something in the wrong place'],
  ['misread', 'mis- read', 'to read wrongly'],
  ['mislead', 'mis- lead', 'to lead someone to a wrong idea'],
  ['misbehave', 'mis- behave', 'to behave badly'],
  ['misunderstand', 'mis- understand', 'to understand wrongly'],
  ['miscount', 'mis- count', 'to count wrongly'],
  ['misuse', 'mis- use', 'to use in the wrong way'],
  ['mismatch', 'mis- match', 'to match wrongly'],
  ['misjudge', 'mis- judge', 'to judge wrongly'],
  ['mishear', 'mis- hear', 'to hear wrongly'],
  ['misprint', 'mis- print', 'a mistake in something printed'],
  // pre-
  ['preheat', 'pre- heat', 'to heat an oven before cooking'],
  ['preview', 'pre- view', 'to view ahead of time; an early look'],
  ['prepay', 'pre- pay', 'to pay ahead of time'],
  ['preschool', 'pre- school', 'a school for children who are too young for kindergarten'],
  ['prehistoric', 'pre- historic', 'from the time before history was written down'],
  ['pretest', 'pre- test', 'a test given before a lesson or a unit'],
  ['precook', 'pre- cook', 'to cook ahead of time'],
  ['premix', 'pre- mix', 'to mix ahead of time'],
  ['preteen', 'pre- teen', 'a child who is almost a teenager'],
  ['preset', 'pre- set', 'to set ahead of time'],
  ['prefix', 'pre- fix', 'a word part that is fixed before a base word'],
  // non-
  ['nonsense', 'non- sense', 'words or ideas that make no sense'],
  ['nonfiction', 'non- fiction', 'writing about real people, things and events; not fiction'],
  ['nonstop', 'non- stop', 'without stopping'],
  ['nonliving', 'non- living', 'not living; not alive'],
  ['nontoxic', 'non- toxic', 'not toxic; not poisonous'],
  ['nonstick', 'non- stick', 'made so that food does not stick'],
  ['nonfat', 'non- fat', 'with no fat in it'],
  // over-
  ['oversleep', 'over- sleep', 'to sleep too long'],
  ['overcook', 'over- cook', 'to cook too long'],
  ['overflow', 'over- flow', 'to flow over the edge'],
  ['overpay', 'over- pay', 'to pay too much'],
  ['overheat', 'over- heat', 'to get too hot'],
  ['overdo', 'over- do', 'to do too much'],
  ['overload', 'over- load', 'to load too much'],
  ['overfill', 'over- fill', 'to fill too much'],
  ['overeat', 'over- eat', 'to eat too much'],
  ['overuse', 'over- use', 'to use too much'],
  // under-
  ['undercook', 'under- cook', 'to cook too little'],
  ['underpay', 'under- pay', 'to pay too little'],
  ['underuse', 'under- use', 'to use too little'],
  ['underground', 'under- ground', 'below the ground'],
  ['underwater', 'under- water', 'below the surface of the water'],
  ['undersea', 'under- sea', 'below the surface of the sea'],
  ['underline', 'under- line', 'to draw a line below a word'],
  ['underfoot', 'under- foot', 'below your feet; on the ground'],
  // -able
  ['breakable', 'break -able', 'able to be broken'],
  ['washable', 'wash -able', 'able to be washed'],
  ['readable', 'read -able', 'able to be read; easy to read'],
  ['enjoyable', 'enjoy -able', 'able to be enjoyed'],
  ['comfortable', 'comfort -able', 'giving comfort; feeling at ease'],
  ['usable', 'use -able', 'able to be used'],
  ['lovable', 'love -able', 'able to be loved; easy to love'],
  ['fixable', 'fix -able', 'able to be fixed'],
  ['teachable', 'teach -able', 'able to be taught'],
  ['affordable', 'afford -able', 'able to be afforded; not too costly'],
  ['acceptable', 'accept -able', 'able to be accepted; good enough'],
  ['dependable', 'depend -able', 'able to be depended on'],
  ['agreeable', 'agree -able', 'pleasant; ready to agree'],
  ['believable', 'believe -able', 'able to be believed'],
  ['drinkable', 'drink -able', 'able to be drunk; safe to drink'],
  ['adjustable', 'adjust -able', 'able to be adjusted'],
  ['bendable', 'bend -able', 'able to be bent'],
  // -ness
  ['happiness', 'happy -ness'], ['kindness', 'kind -ness'], ['sadness', 'sad -ness'], ['darkness', 'dark -ness'], ['weakness', 'weak -ness'],
  ['softness', 'soft -ness'], ['goodness', 'good -ness'], ['fairness', 'fair -ness'], ['brightness', 'bright -ness'], ['loudness', 'loud -ness'],
  ['quietness', 'quiet -ness'], ['fitness', 'fit -ness'], ['laziness', 'lazy -ness'], ['silliness', 'silly -ness'], ['emptiness', 'empty -ness'],
  // -ment
  ['movement', 'move -ment', 'the act of moving'],
  ['enjoyment', 'enjoy -ment', 'the act of enjoying; pleasure'],
  ['payment', 'pay -ment', 'the act of paying; money that is paid'],
  ['agreement', 'agree -ment', 'the act of agreeing; a plan that people agree on'],
  ['treatment', 'treat -ment', 'the way someone or something is treated'],
  ['excitement', 'excite -ment', 'the state of being excited'],
  ['improvement', 'improve -ment', 'the act of improving; a change that makes something better'],
  ['statement', 'state -ment', 'something that is stated'],
  ['shipment', 'ship -ment', 'goods that are shipped together'],
  ['amazement', 'amaze -ment', 'the state of being amazed'],
  ['equipment', 'equip -ment', 'the things you are equipped with for a job or a sport'],
  ['pavement', 'pave -ment', 'a paved surface'],
  ['placement', 'place -ment', 'the act of placing something'],
  ['measurement', 'measure -ment', 'the act of measuring; a size found by measuring'],
  ['announcement', 'announce -ment', 'something that is announced'],
  ['amusement', 'amuse -ment', 'the state of being amused; fun'],
  ['achievement', 'achieve -ment', 'something that is achieved'],
  ['development', 'develop -ment', 'the act of developing; growth'],
  // -ion
  ['action', 'act -ion', 'the act of doing something; something that is done'],
  ['collection', 'collect -ion', 'the act of collecting; a group of things that were collected'],
  ['invention', 'invent -ion', 'the act of inventing; something that was invented'],
  ['protection', 'protect -ion', 'the act of protecting; something that keeps you safe'],
  ['direction', 'direct -ion', 'the act of directing; the way something points or moves'],
  ['subtraction', 'subtract -ion', 'the act of subtracting one number from another'],
  ['connection', 'connect -ion', 'the act of connecting; a link'],
  ['correction', 'correct -ion', 'the act of correcting; a change that fixes a mistake'],
  ['selection', 'select -ion', 'the act of selecting; a choice'],
  ['education', 'educate -ion', 'the act of educating; teaching and learning'],
  ['celebration', 'celebrate -ion', 'the act of celebrating; a party for a special day'],
  ['decoration', 'decorate -ion', 'the act of decorating; something that decorates'],
  ['creation', 'create -ion', 'the act of creating; something that was created'],
  ['location', 'locate -ion', 'the act of locating; the place where something is'],
  ['pollution', 'pollute -ion', 'the act of polluting; harmful things in air, water or soil'],
  ['rotation', 'rotate -ion', 'the act of rotating; a turn around a center'],
  ['migration', 'migrate -ion', 'the act of migrating; a move from one region to another'],
  ['donation', 'donate -ion', 'the act of donating; a gift to help others'],
  // Two parts added
  ['unbreakable', 'un- break -able', 'not able to be broken'],
  ['uncomfortable', 'un- comfort -able', 'not comfortable'],
  ['unreadable', 'un- read -able', 'not able to be read'],
  ['unbelievable', 'un- believe -able', 'not able to be believed'],
  ['unacceptable', 'un- accept -able', 'not acceptable'],
  ['reusable', 're- use -able', 'able to be used again'],
  ['disagreeable', 'dis- agree -able', 'not pleasant'],
  ['disagreement', 'dis- agree -ment', 'the act of disagreeing; a difference of opinion'],
  ['overpayment', 'over- pay -ment', 'a payment that is too much'],
  ['prepayment', 'pre- pay -ment', 'a payment made ahead of time'],
  ['reaction', 're- act -ion', 'an action in answer to something'],
  ['unhappiness', 'un- happy -ness'], ['unkindness', 'un- kind -ness'], ['unfairness', 'un- fair -ness'],
  ['carelessness', 'care -less -ness'], ['helpfulness', 'help -ful -ness'], ['thankfulness', 'thank -ful -ness'],
];

const LEVEL_3 = [
  // port: carry
  ['transport', 'trans- port', 'to carry people or things from one place to another'],
  ['export', 'ex- port', 'to send goods out of a country to be sold'],
  ['import', 'im- port', 'to bring goods into a country to be sold'],
  ['report', 're- port', 'to bring back news; to tell about something'],
  ['portable', 'port -able', 'able to be carried'],
  ['porter', 'port -er:who', 'a person who carries bags'],
  ['reporter', 're- port -er:who', 'a person who reports the news'],
  // spect: look
  ['inspect', 'in- spect', 'to look into something closely'],
  ['respect', 're- spect', 'to look up to; to think highly of'],
  ['inspector', 'in- spect -or', 'a person who inspects things'],
  ['inspection', 'in- spect -ion', 'the act of inspecting; a close look'],
  ['respectful', 're- spect -ful', 'full of respect; polite'],
  ['disrespect', 'dis- re- spect', 'a lack of respect'],
  // struct: build
  ['construct', 'con- struct', 'to build by putting parts together'],
  ['instruct', 'in- struct', 'to teach; to build knowledge in someone'],
  ['structure', 'struct -ure', 'something that is built; the way parts are put together'],
  ['construction', 'con- struct -ion', 'the act of building'],
  ['instruction', 'in- struct -ion', 'the act of teaching; a step that tells you what to do'],
  ['instructor', 'in- struct -or', 'a person who instructs others'],
  ['destruction', 'de- struct -ion', 'the act of destroying; the opposite of building'],
  ['reconstruct', 're- con- struct', 'to construct again'],
  // dict: say
  ['predict', 'pre- dict', 'to say what will happen before it happens'],
  ['contradict', 'contra- dict', 'to say the opposite of what someone has said'],
  ['prediction', 'pre- dict -ion', 'something that is predicted'],
  ['predictable', 'pre- dict -able', 'able to be predicted; not a surprise'],
  ['unpredictable', 'un- pre- dict -able', 'not able to be predicted'],
  ['contradiction', 'contra- dict -ion', 'a statement that says the opposite of another'],
  // rupt: break
  ['erupt', 'e- rupt', 'to break out or burst out, as lava does from a volcano'],
  ['interrupt', 'inter- rupt', 'to break into what someone is saying or doing'],
  ['rupture', 'rupt -ure', 'a break or a burst'],
  ['eruption', 'e- rupt -ion', 'the act of erupting'],
  ['interruption', 'inter- rupt -ion', 'the act of interrupting; a break in what someone is doing'],
  // scrib, script: write
  ['describe', 'de- scribe', 'to write down or say what something is like'],
  ['inscribe', 'in- scribe', 'to write or carve words on something'],
  ['description', 'de- script -ion', 'words that tell what something is like'],
  ['inscription', 'in- script -ion', 'words written or carved on something'],
  // aud: hear
  ['audible', 'aud -ible', 'able to be heard'],
  ['audience', 'audi -ence', 'the people who gather to hear or watch something'],
  // graph: write or draw
  ['autograph', 'auto graph', 'a person’s own name, written by that person'],
  ['photograph', 'photo graph', 'a picture made with a camera, which records light'],
  ['telegraph', 'tele graph', 'an old system for sending messages far away along wires'],
  ['biography', 'bio graph -y', 'the story of a person’s life, written by someone else'],
  ['autobiography', 'auto bio graph -y', 'the story of a person’s life, written by that person'],
  ['geography', 'geo graph -y', 'the study of the earth’s lands, waters and places'],
  ['photography', 'photo graph -y', 'the art of taking photographs'],
  ['photographer', 'photo graph -er:who', 'a person who takes photographs'],
  // tele: far
  ['telephone', 'tele phone', 'a device for talking with someone far away'],
  ['telescope', 'tele scope', 'a tool that makes things that are far away look closer'],
  ['television', 'tele vision', 'a device that shows moving pictures sent from far away'],
  // micro: small
  ['microscope', 'micro scope', 'a tool that makes very small things look larger'],
  ['microphone', 'micro phone', 'a device that picks up sounds so they can be made louder or recorded'],
  ['microwave', 'micro wave', 'a very short wave of energy; an oven that cooks with these waves'],
  ['microchip', 'micro chip', 'a very small piece of material that holds electronic circuits'],
  ['microbiology', 'micro bio -logy', 'the study of living things that are too small to see without a microscope'],
  // photo: light
  ['photosynthesis', 'photo synthesis', 'the way green plants use light to make their own food'],
  ['photocopy', 'photo copy', 'a copy of a page made by a machine that uses light'],
  // bio: life
  ['biology', 'bio -logy', 'the study of living things'],
  ['biosphere', 'bio sphere', 'the parts of the Earth where living things are found'],
  // geo: earth
  ['geology', 'geo -logy', 'the study of rocks and of how the Earth was formed'],
  ['geometry', 'geo metr -y', 'the part of math about shapes, lines and angles; the name means earth measuring'],
  // auto: self
  ['automobile', 'auto mobile', 'a car; the name means moving by itself'],
  ['autopilot', 'auto pilot', 'a system that steers a plane or a ship by itself'],
  // meter: measure, and scope: look at
  ['perimeter', 'peri- meter', 'the distance around the edge of a shape'],
  ['periscope', 'peri- scope', 'a tube with mirrors for looking around or over something'],
];

const byId = list => Object.fromEntries(list.map(part => [part.id, part]));
const PREFIX = byId(PREFIXES), SUFFIX = byId(SUFFIXES);
const ROOT_FORM = Object.fromEntries(ROOTS.flatMap(part => part.forms.map(form => [form, part])));
const aOrAn = word => (/^[aeiou]/.test(word) ? 'an' : 'a');
// Definitions made from the last suffix, for the endings that only change a word's form.
const MADE = {
  'ing': stem => `the action “${stem}”, happening now or going on`,
  'ed': stem => `the action “${stem}”, in the past`,
  'er': stem => `more ${stem}`,
  'est': stem => `most ${stem}`,
  'ly': stem => `in ${aOrAn(stem)} ${stem} way`,
  'ness': stem => `the state of being ${stem}`,
};

function parsePart(token, level) {
  if (token.endsWith('-')) return { ...PREFIX[token.slice(0, -1)], text: token.slice(0, -1) };
  if (token.startsWith('-')) return { ...SUFFIX[token.slice(1)], text: token.slice(1).split(':')[0] };
  if (level === 3 && ROOT_FORM[token]) return { ...ROOT_FORM[token], text: token };
  return { kind: 'base', id: token, label: token, text: token, meaning: null, level: 1 };
}

/** Put parts together, applying the spelling rules where a suffix is added: { word, changes: [{ rule, stem, suffix }] }. */
export function spell(parts) {
  const front = [];
  let stem = '';
  const changes = [];
  for (const part of parts) {
    if (part.kind === 'prefix' && !stem) front.push(part.text);
    else if (part.kind === 'suffix') {
      const added = addSuffix(stem, part.text);
      if (added.rule) changes.push({ rule: added.rule, stem, suffix: part.label });
      stem = added.text;
    } else stem += part.text;
  }
  return { word: front.join('') + stem, changes };
}

function build([word, pattern, definition], level) {
  const parts = pattern.split(' ').map(token => parsePart(token, level));
  const spelled = spell(parts);
  const last = parts.at(-1);
  const made = !definition && last.kind === 'suffix' ? MADE[last.id]?.(spell(parts.slice(0, -1)).word) : undefined;
  return { word, level, parts, definition: definition ?? made, plain: Boolean(definition), spelled: spelled.word, changes: spelled.changes };
}

export const WORDS = [...LEVEL_1.map(entry => build(entry, 1)), ...LEVEL_2.map(entry => build(entry, 2)), ...LEVEL_3.map(entry => build(entry, 3))];
export const wordsFor = level => WORDS.filter(word => word.level === level);
export const wordByText = text => WORDS.find(word => word.word === text);
/** A word's parts as it is built: “un- + happy + -ness”. */
export const partsLine = word => word.parts.map(part => (part.kind === 'root' ? part.text : part.label)).join(' + ');
/** The name of a part as it appears in one word: “un-”, “-ness”, “happy”, “script”. */
export const partLabel = part => (part.kind === 'root' || part.kind === 'base' ? part.text : part.label);
export const KIND_NAME = { prefix: 'prefix', suffix: 'suffix', root: 'root', base: 'base word' };

/** What a spelling change did, as a sentence. */
export function changeLine(change) {
  const stem = `“${change.stem}”`;
  if (change.rule === 'drop-e') return `The e in ${stem} is dropped before ${change.suffix}.`;
  if (change.rule === 'double') return `The last letter of ${stem} is doubled before ${change.suffix}.`;
  return `The y in ${stem} changes to i before ${change.suffix}.`;
}

/** What each part of a word means, as sentences. Base words are left out. */
export function meaningLines(word) {
  return word.parts.filter(part => part.kind !== 'base').map(part => `${part.kind === 'root' ? `The root “${part.text}”` : `“${part.label}”`} means “${part.meaning}”.`);
}

/** A whole word explained: its parts, what they mean, any spelling change and the definition. */
export function explain(word) {
  const capital = word.word[0].toUpperCase() + word.word.slice(1);
  return [`${partsLine(word)} = ${word.word}.`, ...meaningLines(word), ...word.changes.map(changeLine), `${capital}: ${word.definition}.`].join(' ');
}

/** Words from the list that show a spelling rule, for the page. */
export function examplesOfRule(rule, count = 4) {
  const fits = WORDS.filter(word => word.changes.length === 1 && word.changes[0].rule === rule && word.parts.length === 2);
  const out = [];
  // Different base words, and as many different suffixes as the list allows.
  for (const fresh of [true, false]) {
    for (const word of fits) {
      if (out.length === count) return out;
      if (out.some(item => item.parts[0].text === word.parts[0].text)) continue;
      if (fresh && out.some(item => item.parts[1].label === word.parts[1].label)) continue;
      out.push(word);
    }
  }
  return out;
}
/** Words from the list that use a part, for the tables on the page. */
export const examplesOfPart = (part, count = 3) => WORDS.filter(word => word.parts.some(item => item.kind === part.kind && item.id === part.id)).slice(0, count);

/* ------------------------------------------------------------ build mode */
// In build mode a base word (or, at level 3, a root) sits in the middle, with at most one part before it and
// one part after it. A word can be built if it has that shape.
const isMiddle = (word, i) => (word.level === 3 ? word.parts[i].kind === 'root' : word.parts[i].kind === 'base') && i <= 1 && word.parts.length - 1 - i <= 1;
const tileOf = part => ({ label: partLabel(part), kind: part.kind, meaning: part.meaning });
const buildsFrom = (word, middle) => word.parts.findIndex((part, i) => part.text === middle && isMiddle(word, i));
const inLevel = (word, level) => (level === 3 ? word.level === 3 : word.level <= level);

/** The words that can be built around a middle at a level. */
export const familyOf = (level, middle) => WORDS.filter(word => inLevel(word, level) && buildsFrom(word, middle) >= 0);

/** The words of a level that build mode can make: all but the few with two prefixes or two suffixes. */
export const buildableFor = level => wordsFor(level).filter(word => word.parts.some((part, i) => isMiddle(word, i)));

/** The base words (levels 1 and 2) or roots (level 3) offered in build mode, in alphabetical order. */
export function middlesFor(level) {
  const texts = new Set();
  for (const word of wordsFor(level)) word.parts.forEach((part, i) => { if (isMiddle(word, i)) texts.add(part.text); });
  return [...texts].sort().map(text => {
    const part = ROOT_FORM[text] && level === 3 ? ROOT_FORM[text] : null;
    return { text, kind: part ? 'root' : 'base', meaning: part?.meaning ?? null, origin: part?.origin ?? null, count: familyOf(level, text).length };
  });
}

const TILE_LIMIT = 8;
function pool(level, side) {
  const tiles = new Map();
  for (const word of WORDS.filter(word => inLevel(word, level))) {
    word.parts.forEach((part, i) => {
      if (!isMiddle(word, i)) return;
      const neighbor = word.parts[i + side];
      if (!neighbor) return;
      // The two suffixes spelled -er share one tile, which carries both meanings.
      const tile = tiles.get(partLabel(neighbor)) ?? tileOf(neighbor);
      if (tile.meaning !== neighbor.meaning && !tile.meaning?.includes(neighbor.meaning)) tile.meaning = `${tile.meaning}; or ${neighbor.meaning}`;
      tiles.set(tile.label, tile);
    });
  }
  const order = [...PREFIXES.map(part => part.label), ...SUFFIXES.map(part => part.label), ...ROOTS.flatMap(part => part.forms)];
  const rank = label => (order.includes(label) ? order.indexOf(label) : order.length);
  return [...tiles.values()].sort((a, b) => rank(a.label) - rank(b.label) || (a.label < b.label ? -1 : 1));
}

/**
 * The tiles shown around a middle: { before, after }, each a list of { label, kind, meaning }.
 * Every part that makes a word with this middle is there, plus others from the level (up to eight a side), so
 * some choices make a word and some do not. A side is empty when, at level 3, no part ever goes there.
 */
export function tilesFor(level, middle) {
  const family = familyOf(level, middle);
  const pick = side => {
    const all = pool(level, side);
    const needed = new Set(family.map(word => word.parts[buildsFrom(word, middle) + side]).filter(Boolean).map(partLabel));
    // At level 3 a root such as "tele" only ever starts a word, so a side that nothing fits is left empty.
    if (level === 3 && needed.size === 0) return [];
    const chosen = new Set(needed);
    // Fill up with other tiles: first the kinds this middle really takes (suffixes for "port", roots for "tele"),
    // starting at a place that depends on the middle so each one gets a different mix.
    const kinds = new Set(all.filter(tile => needed.has(tile.label)).map(tile => tile.kind));
    const start = [...middle].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
    const turned = all.map((_, i) => all[(start + i) % all.length]);
    for (const tile of [...turned.filter(tile => kinds.has(tile.kind)), ...turned.filter(tile => !kinds.has(tile.kind))]) {
      if (chosen.size >= Math.max(TILE_LIMIT, needed.size)) break;
      chosen.add(tile.label);
    }
    return all.filter(tile => chosen.has(tile.label) && tile.label !== middle);
  };
  return { before: pick(-1), after: pick(1) };
}

/** The word made by a middle with the chosen tiles (labels, or null for none), or null if it is not in the list. */
export function lookup(level, before, middle, after) {
  return familyOf(level, middle).find(word => {
    const i = buildsFrom(word, middle);
    const labels = word.parts.map(partLabel);
    return (labels[i - 1] ?? null) === (before ?? null) && (labels[i + 1] ?? null) === (after ?? null);
  }) ?? null;
}

/* --------------------------------------------------------- challenge mode */

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

const ALL_PARTS = [...PREFIXES, ...SUFFIXES, ...ROOTS];
// Other parts of the same kind that could be offered next to the right answer. Level 1 borrows the level 2
// prefixes so that there are enough to choose from.
function rivals(part, level) {
  const reach = Math.max(level, 2);
  return ALL_PARTS.filter(other => other.kind === part.kind && other.level <= reach && other.id !== part.id
    && other.label !== part.label && other.meaning !== part.meaning && !(part.family && other.family === part.family));
}
const options = (right, others, random) => shuffled([right, ...shuffled(others, random).slice(0, 3)], random);

/** The places where a word is cut into its parts: “unbreakable” → [2, 7]. Only for words with no spelling change. */
export function cuts(word) {
  const out = [];
  let at = 0;
  for (const part of word.parts.slice(0, -1)) out.push(at += part.text.length);
  return out;
}

// Which words suit each kind of question.
const canAskPart = word => word.plain && word.parts.length === 2 && word.parts.some(part => part.kind !== 'base');
const canBreak = word => word.changes.length === 0 && word.word.length <= 13;
const canAskMeaning = word => word.parts.some(part => part.kind !== 'base');
export const QUESTION_KINDS = { part: canAskPart, break: canBreak, meaning: canAskMeaning };

/**
 * Ten questions for a level, the same every time for the same seed. Each has { kind, word, prompt } and:
 *   kind "part":    a part is missing; choose it from `options` (labels). `shown` is the word with a gap.
 *   kind "break":   cut the word into its parts; `answer` is the list of cut places.
 *   kind "meaning": say what `part` means in the word; choose from `options` (meanings).
 * Four "part", three "break" and three "meaning" questions, each about a different word.
 */
export function buildRound(level, seed) {
  const random = seededRandom(seed);
  const kinds = shuffled(['part', 'part', 'part', 'part', 'break', 'break', 'break', 'meaning', 'meaning', 'meaning'], random);
  const piles = Object.fromEntries(Object.entries(QUESTION_KINDS).map(([kind, fits]) => [kind, shuffled(wordsFor(level).filter(fits), random)]));
  const used = new Set();
  return kinds.map(kind => {
    const word = piles[kind].find(item => !used.has(item.word));
    used.add(word.word);
    if (kind === 'break') return { kind, word, prompt: `Break “${word.word}” into its ${word.parts.length} parts.`, answer: cuts(word) };
    const asked = shuffled(word.parts.filter(part => part.kind !== 'base'), random)[0];
    const name = KIND_NAME[asked.kind];
    if (kind === 'meaning') {
      const others = [...new Set(rivals(asked, level).map(part => part.meaning))];
      return { kind, word, part: asked, prompt: `What does the ${name} “${partLabel(asked)}” mean in “${word.word}”?`, options: options(asked.meaning, others, random), answer: asked.meaning };
    }
    const shown = word.parts.map(part => (part === asked ? '___' : partLabel(part))).join(' + ');
    const others = [...new Set(rivals(asked, level).map(part => (part.kind === 'root' ? part.forms[0] : part.label)))].filter(label => label !== partLabel(asked));
    return { kind, word, part: asked, shown, prompt: `Which ${name} makes a word that means “${word.definition}”?`, options: options(partLabel(asked), others, random), answer: partLabel(asked) };
  });
}

/** Is the answer right? For "break" the answer is a list of cut places; otherwise it is the option chosen. */
export function checkAnswer(question, answer) {
  if (question.kind === 'break') return Array.isArray(answer) && [...answer].sort((a, b) => a - b).join() === question.answer.join();
  return answer === question.answer;
}

/** Score for a finished round, from a list of true (right) and false (wrong). */
export function scoreRound(results) {
  const correct = results.filter(Boolean).length;
  return { correct, total: results.length, perfect: results.length > 0 && correct === results.length };
}

/** A short, kind message for the results screen. */
export function resultMessage({ correct, total }) {
  if (correct === total) return 'A perfect round. You know your word parts.';
  if (correct >= total * 0.8) return 'Great work. Look over the ones you missed, then try for a perfect round.';
  if (correct >= total * 0.5) return 'Good start. Build the words you missed in Build mode, then play again.';
  return 'Keep going. Find a part you know inside the word first, then work out the rest.';
}
