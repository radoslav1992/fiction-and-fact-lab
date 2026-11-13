// The Context Clues Game's sentence bank and rules: pure data and functions, shared by the game, the examples
// on the page, the printable worksheet, the answer key and the tests.
//
// Rules for the bank. Every target word is a real, useful word, used correctly. The sentence itself holds
// the clue, so a reader who does not know the word can work it out. The right meaning is a plain definition
// of the word as it is used, and it never repeats the clue word for word. The three wrong meanings fit the
// sentence until the clue is read. Anything the sentences state is true and timeless.

export const DEFINITION = 'Context clues are the words around an unknown word that help you work out what it means.';

export const ROUND_LENGTH = 10;

// The five kinds of clue. `signals` are the words that often point to that kind of clue, `marks` the
// punctuation that does, and `examples` two sentences from the bank.
export const CLUE_TYPES = [
  { id: 'definition', name: 'Definition', what: 'The sentence stops to tell you the meaning, right beside the word.', look: 'Look for the meaning set apart by commas, dashes or parentheses, or after a signal word.', signals: ['or', 'which means', 'that means', 'meaning', 'which is', 'that is', 'which is to say'], marks: ['commas', 'dashes', 'parentheses'], examples: ['a02', 'c01'] },
  { id: 'synonym', name: 'Synonym', what: 'A word with nearly the same meaning is used nearby, for the same kind of thing.', look: 'Look in the next part of the sentence, or in the next sentence, for a word you know that does the same job.', signals: ['too', 'as well', 'just as', 'equally', 'another', 'again'], examples: ['a18', 'c08'] },
  { id: 'antonym', name: 'Antonym or contrast', what: 'A word with the opposite meaning is set against the word.', look: 'Look for a signal that the sentence is turning around. The unknown word means the opposite of the word you know.', signals: ['but', 'unlike', 'however', 'instead of', 'in contrast', 'while', 'whereas'], examples: ['b20', 'c15'] },
  { id: 'example', name: 'Example', what: 'The sentence lists examples of the word.', look: 'Ask what the examples have in common. That is the meaning.', signals: ['such as', 'for example', 'for instance', 'including', 'like'], examples: ['b26', 'c24'] },
  { id: 'inference', name: 'Inference', what: 'There is no signal word. The meaning comes from what is happening in the sentence.', look: 'Picture the scene, and ask what the word must mean for it to make sense.', signals: [], examples: ['c29', 'c34'] },
];
export const clueType = id => CLUE_TYPES.find(type => type.id === id);

export const LEVELS = [
  { id: 1, name: 'Level 1', grades: 'Grades 2–3', ages: 'ages 7–9', types: ['definition', 'synonym'], about: 'Definition and synonym clues. Read the sentence and choose what the word means.' },
  { id: 2, name: 'Level 2', grades: 'Grades 4–5', ages: 'ages 9–11', types: ['definition', 'synonym', 'antonym', 'example'], about: 'Adds antonym and example clues. Choose the meaning, or tap the words that are the clue.' },
  { id: 3, name: 'Level 3', grades: 'Grades 6–8', ages: 'ages 11–14', types: ['definition', 'synonym', 'antonym', 'example', 'inference'], about: 'Harder words and inference. Choose the meaning, tap the clue, or name the type of clue.' },
];

// One sentence: id, type of clue, the target word as it appears, the sentence, the clue (the exact words that
// carry the meaning), the signal word ('' when there is none), the right meaning, three wrong meanings, and
// the word in one more sentence. The level is the letter of the id: a = 1, b = 2, c = 3.
const item = (id, type, word, text, clues, signal, meaning, wrong, again) => ({ id, level: 'abc'.indexOf(id[0]) + 1, type, word, text, clues, signal, meaning, wrong, again });

export const ITEMS = [
  // Level 1, grades 2–3. Definition clues: the sentence tells you the meaning.
  item('a01', 'definition', 'enormous', 'The dog next door is enormous, or very big.', ['very big'], 'or', 'very large', ['very friendly', 'very noisy', 'very old'], 'An enormous truck blocked the road.'),
  item('a02', 'definition', 'drowsy', 'After lunch, Ben felt drowsy, which means sleepy.', ['sleepy'], 'which means', 'ready to fall asleep', ['full of food', 'ready to play', 'a little sad'], 'The warm car made the baby drowsy.'),
  item('a03', 'definition', 'ancient', 'The castle is ancient, which means it is very, very old.', ['it is very, very old'], 'which means', 'from a time long, long ago', ['made of gray stone', 'far from any town', 'open to visitors'], 'We saw ancient tools at the museum.'),
  item('a04', 'definition', 'furious', 'The goose was furious, or very angry, when we came near its nest.', ['very angry'], 'or', 'filled with anger', ['filled with fear', 'very hungry', 'very sleepy'], 'Dad was furious when the wind blew his hat into the pond.'),
  item('a05', 'definition', 'fragile', 'The glass bird is fragile. That means it breaks easily.', ['it breaks easily'], 'That means', 'easy to break', ['pretty to look at', 'hard to find', 'cold to touch'], 'Pack the fragile eggs at the top of the bag.'),
  item('a06', 'definition', 'damp', 'The towel was damp, or a little wet.', ['a little wet'], 'or', 'slightly wet', ['soft and thick', 'nice and warm', 'too small'], 'The grass is damp early in the morning.'),
  item('a07', 'definition', 'swift', 'A swift horse, one that runs very fast, won the race.', ['one that runs very fast'], '', 'quick', ['young', 'lucky', 'gentle'], 'The swift river carried the leaf away.'),
  item('a08', 'definition', 'timid', 'The kitten was timid, which means shy and easily scared.', ['shy and easily scared'], 'which means', 'easily frightened', ['soft and fluffy', 'full of energy', 'always hungry'], 'A timid deer peeked out from the trees.'),
  item('a09', 'definition', 'weary', 'By evening, the hikers were weary, or very tired.', ['very tired'], 'or', 'worn out and needing rest', ['lost in the woods', 'full of cheer', 'cold and wet'], 'The weary farmer sat down in the shade.'),
  item('a10', 'definition', 'chilly', 'It is chilly today, which means a little cold.', ['a little cold'], 'which means', 'cool enough to need a sweater', ['windy enough to fly a kite', 'wet enough to need boots', 'bright enough to need a hat'], 'Bring a jacket, because the evening will be chilly.'),
  item('a11', 'definition', 'peculiar', 'The bird made a peculiar sound, which means a strange one.', ['a strange one'], 'which means', 'odd and not usual', ['loud and clear', 'soft and sweet', 'short and sharp'], 'The soup had a peculiar smell.'),
  item('a12', 'definition', 'purchase', 'Dad went to the store to purchase, or buy, some milk.', ['buy'], 'or', 'pay money to get', ['look for', 'carry home', 'taste'], 'You can purchase a ticket at the door.'),
  item('a13', 'definition', 'glanced', 'Mia glanced at the clock. That means she took a quick look.', ['she took a quick look'], 'That means', 'looked for just a moment', ['stared for a long time', 'pointed a finger', 'made a face'], 'He glanced at the sky and saw dark clouds.'),
  item('a14', 'definition', 'annual', 'The town has an annual fair, which means it happens once every year.', ['it happens once every year'], 'which means', 'taking place each year', ['very large', 'free to enter', 'held outdoors'], 'Our annual family picnic is in June.'),
  item('a15', 'definition', 'vanished', 'The rabbit vanished (went out of sight) behind the bush.', ['went out of sight'], '', 'disappeared', ['fell asleep', 'ate some grass', 'dug a hole'], 'The Sun vanished behind a cloud.'),
  item('a16', 'definition', 'aquarium', 'We keep our fish in an aquarium, which is a glass tank filled with water.', ['a glass tank filled with water'], 'which is', 'a clear container where fish live', ['a small pond in the yard', 'a wooden box with a lid', 'a room at the pet store'], 'The class aquarium has three snails in it.'),
  // Level 1. Synonym clues: a word with nearly the same meaning is used nearby.
  item('a17', 'synonym', 'gigantic', 'A gigantic whale swam past the boat. We had never seen such a huge animal.', ['huge'], '', 'very, very big', ['very fast', 'gray and smooth', 'friendly'], 'A gigantic balloon floated over the parade.'),
  item('a18', 'synonym', 'exhausted', 'Tom was exhausted after the game, and his sister was just as tired.', ['tired'], 'just as', 'with no energy left', ['very proud', 'covered in mud', 'ready for more'], 'The exhausted puppy fell asleep on the mat.'),
  item('a19', 'synonym', 'delighted', 'Ana was delighted with her gift. Her brother was happy with his, too.', ['happy'], 'too', 'very pleased', ['careful', 'bored', 'busy'], 'Grandpa was delighted to see us.'),
  item('a20', 'synonym', 'soggy', 'My socks were soggy after the rain. My shoes were just as wet.', ['wet'], 'just as', 'soaked with water', ['full of holes', 'covered in dirt', 'too tight'], 'Nobody likes a soggy sandwich.'),
  item('a21', 'synonym', 'chuckled', 'Dad chuckled at the joke, and Grandma laughed quietly, too.', ['laughed quietly'], 'too', 'gave a soft laugh', ['let out a groan', 'clapped loudly', 'looked puzzled'], 'The baby chuckled when the dog sneezed.'),
  item('a22', 'synonym', 'brief', 'The first song was brief. The second one was short, too.', ['short'], 'too', 'not lasting long', ['very loud', 'hard to sing', 'slow and gentle'], 'We took a brief rest and then walked on.'),
  item('a23', 'synonym', 'leaped', 'The frog leaped onto a rock. Then it jumped again, into the pond.', ['jumped'], 'again', 'made a big hop through the air', ['crawled slowly', 'slid on its belly', 'dropped from a tree'], 'The cat leaped from the fence to the roof.'),
  item('a24', 'synonym', 'cozy', 'Our tent was cozy, and the cabin was just as warm and comfortable.', ['warm and comfortable'], 'just as', 'warm and pleasant to rest in', ['small and dark', 'new and clean', 'far from town'], 'The cat found a cozy spot by the fire.'),
  item('a25', 'synonym', 'frightened', 'The thunder frightened the puppy. It scared the cat as well.', ['scared'], 'as well', 'made afraid', ['woke up', 'soaked', 'pleased'], 'A loud bang frightened the birds away.'),
  item('a26', 'synonym', 'tidy', 'Leo keeps his desk tidy. His room is neat, too.', ['neat'], 'too', 'clean and in order', ['brand new', 'very small', 'full of toys'], 'Please keep the bookshelf tidy.'),
  item('a27', 'synonym', 'discovered', 'Jen discovered a shell in the sand. Then she found a crab under a rock, too.', ['found'], 'too', 'came upon for the first time', ['buried deep down', 'dropped by mistake', 'drew a picture of'], 'We discovered a nest in the old tree.'),
  item('a28', 'synonym', 'hurried', 'Kim hurried to the bus stop, and Jo rushed there as well.', ['rushed'], 'as well', 'moved quickly', ['walked slowly', 'rode a bike', 'got a ride'], 'We hurried inside when the rain began.'),
  item('a29', 'synonym', 'silent', 'The classroom was silent. The hall was just as quiet.', ['quiet'], 'just as', 'without any sound', ['without any people', 'without any light', 'without any heat'], 'The forest was silent after the snow.'),
  item('a30', 'synonym', 'repair', 'Dad will repair the bike today. Tomorrow he will fix the gate as well.', ['fix'], 'as well', 'make a broken thing work again', ['sell a thing to someone', 'paint a thing a new color', 'put a thing away'], 'A plumber came to repair the leaky pipe.'),
  item('a31', 'synonym', 'grin', 'Pat had a grin on her face, and Max had a big smile, too.', ['a big smile'], 'too', 'a wide, happy look', ['a spot of paint', 'a funny mask', 'a bit of jam'], 'Her grin showed that she had won.'),
  item('a32', 'synonym', 'strolled', 'We strolled along the beach. Later, we walked slowly through the park as well.', ['walked slowly'], 'as well', 'went on foot without hurrying', ['ran races', 'rode bikes', 'flew kites'], 'Two ducks strolled across the road.'),

  // Level 2, grades 4–5. Definition clues.
  item('b01', 'definition', 'nocturnal', 'Most bats are nocturnal, which means they are active at night.', ['they are active at night'], 'which means', 'awake and busy after dark', ['able to fly', 'covered in fur', 'afraid of people'], 'A nocturnal animal sleeps during the day.'),
  item('b02', 'definition', 'habitat', 'The pond is a habitat, or natural home, for many frogs.', ['natural home'], 'or', 'the place where an animal or plant normally lives', ['a park where animals are kept for visitors', 'a path that animals follow each year', 'a group of animals of the same kind'], 'The desert is a harsh habitat for most plants.'),
  item('b03', 'definition', 'drought', 'Last summer there was a drought, a long time with almost no rain.', ['a long time with almost no rain'], '', 'a long dry period', ['a strong storm', 'a big harvest', 'a town festival'], 'During the drought, the grass turned brown.'),
  item('b04', 'definition', 'transparent', 'Clean glass is transparent (you can see right through it).', ['you can see right through it'], '', 'clear enough to look through', ['easy to break', 'smooth and cold', 'made from sand'], 'The water was so transparent that we could count the pebbles.'),
  item('b05', 'definition', 'migrate', 'Each fall, many geese migrate, or travel to a warmer place for the winter.', ['travel to a warmer place for the winter'], 'or', 'move from one region to another when the seasons change', ['build new nests', 'grow thicker feathers', 'gather in noisy flocks'], 'Some whales migrate thousands of miles each year.'),
  item('b06', 'definition', 'predator', 'A hawk is a predator, which is an animal that hunts other animals for food.', ['an animal that hunts other animals for food'], 'which is', 'a creature that catches and eats other creatures', ['a bird that flies very high', 'an animal with sharp eyesight', 'a creature that lives alone'], 'The mouse hid from the predator.'),
  item('b07', 'definition', 'flexible', 'The garden hose is flexible – it bends easily without breaking.', ['it bends easily without breaking'], '', 'able to curve and twist', ['long enough to reach far', 'full of water', 'light to carry'], 'A cat has a very flexible body.'),
  item('b08', 'definition', 'vacant', 'The lot next door is vacant, meaning empty and not in use.', ['empty and not in use'], 'meaning', 'with nothing and no one in it', ['up for sale', 'covered in weeds', 'very large'], 'We found a vacant seat near the front.'),
  // Level 2. Synonym clues.
  item('b09', 'synonym', 'scarce', 'Water was scarce in the desert, and food was just as hard to find.', ['hard to find'], 'just as', 'available only in small amounts', ['too warm to enjoy', 'too salty to swallow', 'heavy to carry'], 'In a dry year, green grass is scarce.'),
  item('b10', 'synonym', 'cautious', 'Dana is cautious on icy steps, and her dad is careful there, too.', ['careful'], 'too', 'watching out for danger', ['moving very quickly', 'in a cheerful mood', 'feeling very cold'], 'A cautious driver slows down in the rain.'),
  item('b11', 'synonym', 'courageous', 'The courageous firefighter climbed the ladder, and her equally brave partner followed.', ['brave'], 'equally', 'willing to do something frightening', ['very strong', 'well trained', 'in a great hurry'], 'It was courageous of him to speak in front of the whole school.'),
  item('b12', 'synonym', 'conceal', 'The fox tried to conceal its den with leaves, and it hid the path with branches as well.', ['hid'], 'as well', 'keep from being seen', ['keep warm and dry', 'make larger', 'mark clearly'], 'Clouds conceal the top of the mountain.'),
  item('b13', 'synonym', 'frequent', 'Rain is frequent here in spring, and fog is just as common.', ['common'], 'just as', 'happening often', ['falling heavily', 'gladly welcomed', 'icy cold'], 'She makes frequent trips to the library.'),
  item('b14', 'synonym', 'assist', 'A guide will assist the hikers, and a ranger will help them as well.', ['help'], 'as well', 'give support to', ['walk behind', 'keep count of', 'take photos of'], 'Can you assist me with these heavy boxes?'),
  item('b15', 'synonym', 'gleaming', 'The gleaming trumpet lay in its case beside an equally shiny flute.', ['shiny'], 'equally', 'bright with reflected light', ['very expensive', 'out of tune', 'made long ago'], 'After the rain, the wet street was gleaming under the lamps.'),
  item('b16', 'synonym', 'error', 'I found one error in my sum, and my partner found another mistake.', ['mistake'], 'another', 'something done wrong', ['a very large number', 'a difficult question', 'a missing page'], 'A spelling error can change the meaning of a sentence.'),
  // Level 2. Antonym or contrast clues: a word with the opposite meaning is set against the word.
  item('b17', 'antonym', 'rigid', 'A rubber band is stretchy, but a steel bar is rigid.', ['stretchy'], 'but', 'stiff and hard to bend', ['heavy to lift', 'shiny and smooth', 'cold to touch'], 'The tent pole must stay rigid in the wind.'),
  item('b18', 'antonym', 'temporary', 'The first bridge was temporary, but the new stone one is built to last.', ['built to last'], 'but', 'meant to be used for only a short time', ['made of wood', 'too narrow for cars', 'painted bright red'], 'We put up a temporary fence until the wall was fixed.'),
  item('b19', 'antonym', 'generous', 'Unlike his selfish cousin, Raj is generous with his toys.', ['selfish'], 'Unlike', 'glad to share with others', ['very careful', 'rather rough', 'easily bored'], 'It was generous of her to give up her seat.'),
  item('b20', 'antonym', 'shallow', 'The lake is deep in the middle, but it is shallow near the shore.', ['deep'], 'but', 'only a short way down to the bottom', ['thick with mud', 'pleasantly warm', 'covered in rocks'], 'Toddlers splashed in the shallow end of the pool.'),
  item('b21', 'antonym', 'ordinary', 'Most days at school are ordinary, but the day of the science fair was special.', ['special'], 'but', 'usual and not different in any way', ['long and tiring', 'busy and loud', 'calm and quiet'], 'It looked like an ordinary rock until we saw it sparkle.'),
  item('b22', 'antonym', 'expand', 'Metal will expand when it is heated; however, it shrinks again as it cools.', ['shrinks'], 'however', 'grow larger', ['become softer', 'change color', 'begin to glow'], 'A balloon will expand as you blow air into it.'),
  item('b23', 'antonym', 'reveal', 'Instead of hiding the answer, the teacher chose to reveal it.', ['hiding'], 'Instead of', 'show or make known', ['say a second time', 'change to something else', 'rub out'], 'The curtain opened to reveal the stage.'),
  item('b24', 'antonym', 'seldom', 'Jo often walks to school, but she seldom takes the bus.', ['often'], 'but', 'not many times', ['every day', 'early in the morning', 'together with friends'], 'It seldom rains in the desert.'),
  // Level 2. Example clues: the sentence lists examples of the word.
  item('b25', 'example', 'utensils', 'Utensils such as spoons, whisks and spatulas hung on the wall.', ['spoons, whisks and spatulas'], 'such as', 'tools held in the hand for cooking or eating', ['machines that run on electricity', 'foods kept in a kitchen', 'pictures used for decoration'], 'Wash the utensils after you finish cooking.'),
  item('b26', 'example', 'beverages', 'The stand sells beverages such as lemonade, milk and iced tea.', ['lemonade, milk and iced tea'], 'such as', 'drinks of any kind', ['frozen desserts', 'fresh fruits', 'baked snacks'], 'Hot beverages are served in mugs.'),
  item('b27', 'example', 'garments', 'The trunk held old garments, including coats, dresses and scarves.', ['coats, dresses and scarves'], 'including', 'pieces of clothing', ['pieces of furniture', 'family photographs', 'toys from long ago'], 'Wool garments keep you warm in winter.'),
  item('b28', 'example', 'precipitation', 'Precipitation, for example rain, snow or hail, fills the rivers.', ['rain, snow or hail'], 'for example', 'water that falls from clouds to the ground', ['air that moves fast', 'changes in temperature', 'water that flows to the sea'], 'A desert gets very little precipitation.'),
  item('b29', 'example', 'landforms', 'The map shows landforms, including mountains, valleys and plains.', ['mountains, valleys and plains'], 'including', 'natural shapes of the Earth’s surface', ['kinds of weather', 'large cities', 'bodies of water'], 'Hills and cliffs are landforms, too.'),
  item('b30', 'example', 'appliances', 'The store sells appliances like toasters, washers and refrigerators.', ['toasters, washers and refrigerators'], 'like', 'machines that do jobs around the home', ['pieces of furniture', 'tools for the garden', 'foods for breakfast'], 'The new kitchen has three appliances.'),
  item('b31', 'example', 'crops', 'The valley is known for crops such as wheat, corn and beans.', ['wheat, corn and beans'], 'such as', 'plants grown in fields for food', ['animals kept on farms', 'trees grown for wood', 'flowers that grow wild'], 'A late frost can damage the crops.'),
  item('b32', 'example', 'emotions', 'The actor showed emotions, for instance joy, fear and surprise.', ['joy, fear and surprise'], 'for instance', 'strong feelings', ['magic tricks', 'funny costumes', 'dance steps'], 'Music can stir up many emotions.'),

  // Level 3, grades 6–8. Definition clues.
  item('c01', 'definition', 'meticulous', 'Ines is meticulous, that is, extremely careful about every small detail.', ['extremely careful about every small detail'], 'that is', 'taking great care to get each little thing right', ['quick to finish a task', 'proud of past work', 'happy to work alone'], 'A meticulous editor checks every comma.'),
  item('c02', 'definition', 'arid', 'Much of the region is arid, meaning it receives very little rain.', ['it receives very little rain'], 'meaning', 'extremely dry', ['far from any city', 'flat and open', 'very hot'], 'Few trees grow on the arid plain.'),
  item('c03', 'definition', 'obsolete', 'The old map is obsolete, which means it is out of date and no longer useful.', ['it is out of date and no longer useful'], 'which means', 'no longer used because something newer has replaced it', ['hard to read', 'worth a lot of money', 'torn at the edges'], 'New tools can make older ones obsolete.'),
  item('c04', 'definition', 'novice', 'The first class is for the novice (a person who is new to an activity).', ['a person who is new to an activity'], '', 'a beginner', ['a teacher', 'a young child', 'a paying member'], 'As a novice, she skated close to the wall.'),
  item('c05', 'definition', 'dormant', 'In winter the maple tree is dormant, or alive but not growing.', ['alive but not growing'], 'or', 'in a resting state, with growth paused', ['bare of leaves', 'covered in snow', 'easy to cut down'], 'The seeds lay dormant until the spring rain.'),
  item('c06', 'definition', 'collaborate', 'The two classes will collaborate – work together – on a mural.', ['work together'], '', 'join forces on a shared task', ['compete to see who is better', 'vote to choose a winner', 'take turns watching'], 'Scientists from many countries collaborate on space research.'),
  item('c07', 'definition', 'concise', 'Her report was concise, which is to say brief and to the point.', ['brief and to the point'], 'which is to say', 'short and clear, with no wasted words', ['full of surprising facts', 'neatly typed', 'handed in early'], 'A concise summary fits on one page.'),
  // Level 3. Synonym clues.
  item('c08', 'synonym', 'abundant', 'Berries were abundant along the trail, and nuts were just as plentiful.', ['plentiful'], 'just as', 'present in large amounts', ['ripe and sweet', 'hard to reach', 'safe to eat'], 'Rain is abundant in a rainforest.'),
  item('c09', 'synonym', 'tranquil', 'The lake was tranquil at dawn, and the woods around it were equally calm.', ['calm'], 'equally', 'peaceful and still', ['covered in mist', 'bitterly cold', 'bright with color'], 'She read in a tranquil corner of the library.'),
  item('c10', 'synonym', 'elated', 'Sam was elated by the news, and his teammates were overjoyed as well.', ['overjoyed'], 'as well', 'filled with great happiness', ['left confused', 'caught off guard', 'made nervous'], 'The elated crowd cheered for ten minutes.'),
  item('c11', 'synonym', 'immense', 'An immense oak stood by the gate, and an equally huge boulder sat beside it.', ['huge'], 'equally', 'extremely large', ['very old', 'dark and twisted', 'bare of leaves'], 'From the plane, the desert looked immense.'),
  item('c12', 'synonym', 'perplexed', 'The riddle perplexed the whole class, and it puzzled the teacher, too.', ['puzzled'], 'too', 'thoroughly confused', ['amused', 'bored', 'annoyed'], 'The strange tracks perplexed the hikers.'),
  item('c13', 'synonym', 'durable', 'These boots are durable, and the laces are just as long-lasting.', ['long-lasting'], 'just as', 'able to stand up to hard use', ['waterproof', 'comfortable', 'expensive'], 'A durable backpack can survive years of school.'),
  item('c14', 'synonym', 'prompt', 'Her reply was prompt, and the delivery was just as quick.', ['quick'], 'just as', 'done without delay', ['polite', 'short', 'handwritten'], 'Thank you for your prompt answer.'),
  // Level 3. Antonym or contrast clues.
  item('c15', 'antonym', 'reluctant', 'Mia was eager to try the high dive, but her brother was reluctant.', ['eager'], 'but', 'unwilling and holding back', ['too short to be allowed', 'already very good at it', 'busy somewhere else'], 'The reluctant puppy would not step into the bath.'),
  item('c16', 'antonym', 'frugal', 'Unlike her brother, who spends every dollar he gets, Tess is frugal.', ['who spends every dollar he gets'], 'Unlike', 'careful not to waste money', ['good at arithmetic', 'generous with gifts', 'fond of shopping'], 'A frugal shopper compares prices.'),
  item('c17', 'antonym', 'brittle', 'Fresh twigs bend easily, whereas dry ones are brittle.', ['bend easily'], 'whereas', 'hard but quick to snap', ['light in weight', 'dark brown', 'good for building nests'], 'Old paper turns yellow and brittle.'),
  item('c18', 'antonym', 'vague', 'The first set of directions was vague, but the second was clear and exact.', ['clear and exact'], 'but', 'fuzzy, without enough detail', ['very long', 'written by hand', 'out of date'], 'He gave a vague answer about where he had been.'),
  item('c19', 'antonym', 'sparse', 'Trees are dense in the valley; on the windy ridge, however, they are sparse.', ['dense'], 'however', 'thinly scattered', ['bent by the wind', 'short and stubby', 'very old'], 'Grass is sparse in the desert.'),
  item('c20', 'antonym', 'gradual', 'The first change was sudden; the second, in contrast, was gradual.', ['sudden'], 'in contrast', 'happening slowly, a little at a time', ['easy to notice', 'for the better', 'planned in advance'], 'The gradual slope was easy to climb.'),
  item('c21', 'antonym', 'lenient', 'Our old coach was strict, while the new one is lenient.', ['strict'], 'while', 'easygoing about rules', ['very experienced', 'full of energy', 'hard to hear'], 'The librarian was lenient about the late book.'),
  // Level 3. Example clues.
  item('c22', 'example', 'hazards', 'The trail has hazards such as loose rocks, icy patches and fallen branches.', ['loose rocks, icy patches and fallen branches'], 'such as', 'things that could cause harm', ['signs that mark the way', 'small wild animals', 'places to rest'], 'Fog is one of the hazards that ships face.'),
  item('c23', 'example', 'gestures', 'She answered with gestures, such as a wave, a nod and a shrug.', ['a wave, a nod and a shrug'], 'such as', 'movements of the body that send a message', ['short spoken words', 'quick written notes', 'changes in her voice'], 'A thumbs-up and a bow are friendly gestures.'),
  item('c24', 'example', 'obstacles', 'The course was full of obstacles, including walls, ropes and muddy pits.', ['walls, ropes and muddy pits'], 'including', 'things that get in the way', ['prizes for the winners', 'people who cheer', 'rules to follow'], 'Fallen trees were obstacles on the path.'),
  item('c25', 'example', 'celestial', 'The telescope showed celestial objects, for example stars, planets and moons.', ['stars, planets and moons'], 'for example', 'belonging to the sky or outer space', ['too small to see without help', 'made of rock and metal', 'moving at great speed'], 'A comet is a celestial object with a glowing tail.'),
  item('c26', 'example', 'percussion', 'Percussion instruments, for instance drums, cymbals and tambourines, keep the beat.', ['drums, cymbals and tambourines'], 'for instance', 'played by being hit or shaken', ['played by blowing air', 'played with a bow', 'played by pressing keys'], 'The xylophone belongs to the percussion family.'),
  item('c27', 'example', 'traits', 'The puppies share traits such as curly fur, floppy ears and brown eyes.', ['curly fur, floppy ears and brown eyes'], 'such as', 'features that a person or animal has', ['favorite games', 'daily habits', 'pet names'], 'Patience and kindness are useful traits in a teacher.'),
  item('c28', 'example', 'vessels', 'Vessels like canoes, ferries and tugboats crowded the harbor.', ['canoes, ferries and tugboats'], 'like', 'craft that travel on water', ['birds that live by the sea', 'buildings beside a dock', 'workers who load cargo'], 'Large vessels need deep water.'),
  // Level 3. Inference: no signal word. The meaning comes from what is happening.
  item('c29', 'inference', 'famished', 'Leo had skipped breakfast and lunch. By four o’clock he was famished, and he ate three sandwiches in a row.', ['skipped breakfast and lunch', 'ate three sandwiches in a row'], '', 'extremely hungry', ['extremely tired', 'extremely bored', 'extremely late'], 'After the long hike, we were famished.'),
  item('c30', 'inference', 'drenched', 'Ana forgot her umbrella and walked home through the storm. She arrived drenched, with water dripping from her hair.', ['walked home through the storm', 'water dripping from her hair'], '', 'soaked through', ['very late', 'out of breath', 'in a bad mood'], 'The sprinkler left the dog drenched.'),
  item('c31', 'inference', 'illegible', 'Rain had smeared the ink on the note. It was illegible, so we had to phone Grandpa and ask what he had written.', ['Rain had smeared the ink', 'ask what he had written'], '', 'impossible to read', ['very short', 'written in pencil', 'meant for someone else'], 'His handwriting was so illegible that he typed the letter.'),
  item('c32', 'inference', 'nimble', 'The nimble goat hopped from ledge to ledge up the cliff and never once slipped.', ['hopped from ledge to ledge', 'never once slipped'], '', 'quick and light in movement', ['stubborn and bad-tempered', 'hungry for fresh grass', 'large and heavy'], 'A nimble squirrel ran along the fence.'),
  item('c33', 'inference', 'tedious', 'Sorting ten thousand beads by color was tedious. After an hour, Kai was yawning and checking the clock every minute.', ['Sorting ten thousand beads by color', 'yawning and checking the clock every minute'], '', 'long, dull and tiring', ['risky', 'costly', 'hard to understand'], 'Copying the list by hand was a tedious job.'),
  item('c34', 'inference', 'deserted', 'The playground was deserted. The swings hung still, and not one voice could be heard.', ['The swings hung still', 'not one voice could be heard'], '', 'empty of people', ['newly built', 'closed for repairs', 'full of litter'], 'At midnight the streets were deserted.'),
  item('c35', 'inference', 'sturdy', 'The sturdy table did not even wobble when four of us climbed onto it.', ['did not even wobble when four of us climbed onto it'], '', 'strongly built', ['freshly painted', 'low to the ground', 'easy to move'], 'Sturdy boots are best for a rocky trail.'),
];

export const itemById = id => ITEMS.find(entry => entry.id === id);
export const itemsFor = (level, type) => ITEMS.filter(entry => entry.level === level && (!type || entry.type === type));

/* ------------------------------------------------------------ sentences */

const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Where a word or phrase sits in a text as whole words: [start, end], or null. Capitals are ignored. */
export function findPhrase(text, phrase) {
  const match = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(phrase)}(?![\\p{L}\\p{N}])`, 'iu').exec(text);
  return match ? [match.index, match.index + match[0].length] : null;
}

/** The marked stretches of a sentence, in order: [{ start, end, kind }], kind = 'word' | 'clue' | 'signal'. */
export function ranges(entry) {
  const found = [
    [entry.word, 'word'],
    ...entry.clues.map(clue => [clue, 'clue']),
    ...(entry.signal ? [[entry.signal, 'signal']] : []),
  ].map(([phrase, kind]) => {
    const at = findPhrase(entry.text, phrase);
    return { start: at[0], end: at[1], kind };
  });
  return found.sort((a, b) => a.start - b.start);
}

/**
 * The sentence as pieces of plain and marked text: [{ text, kind }], kind = null | 'word' | 'clue' | 'signal'.
 * With `reveal` false only the target word is marked, which is how the sentence looks before the answer.
 */
export function pieces(entry, reveal = true) {
  const out = [];
  let at = 0;
  for (const { start, end, kind } of ranges(entry).filter(range => reveal || range.kind === 'word')) {
    if (start > at) out.push({ text: entry.text.slice(at, start), kind: null });
    out.push({ text: entry.text.slice(start, end), kind });
    at = end;
  }
  if (at < entry.text.length) out.push({ text: entry.text.slice(at), kind: null });
  return out;
}

/**
 * The sentence's words with their positions: [{ text, start, end, target, clue }]. `target` is the word being
 * asked about. `clue` is true for every word of the clue and of the signal: tapping any of them is right.
 */
export function words(entry) {
  const marked = ranges(entry);
  const inside = (start, end, kinds) => marked.some(range => kinds.includes(range.kind) && start >= range.start && end <= range.end);
  return [...entry.text.matchAll(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)].map(m => {
    const start = m.index, end = start + m[0].length;
    return { text: m[0], start, end, target: inside(start, end, ['word']), clue: inside(start, end, ['clue', 'signal']) };
  });
}

const quoted = list => list.map(text => `“${text}”`).join(' and ');
/** How the definition is set apart when there is no signal word: by parentheses, dashes or commas. */
function punctuationNote(entry) {
  if (entry.text.includes('(')) return 'The parentheses set it apart.';
  if (entry.text.includes(' – ')) return entry.text.split(' – ').length > 2 ? 'The dashes set it apart.' : 'The dash sets it apart.';
  return entry.text.split(',').length > 2 ? 'The commas set it apart.' : 'The comma sets it apart.';
}

/** What the clue is and how it works, in a sentence or two. */
export function clueNote(entry) {
  const clue = quoted(entry.clues);
  const signal = entry.signal ? ` The signal is “${entry.signal}”.` : '';
  if (entry.type === 'definition') return `The sentence tells you the meaning: ${clue}.${signal || ` ${punctuationNote(entry)}`}`;
  if (entry.type === 'synonym') return `${clue} means nearly the same as “${entry.word}”.${signal}`;
  if (entry.type === 'antonym') return `${clue} is the opposite idea.${signal}`;
  if (entry.type === 'example') return `The examples show what kind of thing is meant: ${clue}.${signal}`;
  return `There is no signal word. The clue is what is happening: ${clue}.`;
}

/** The meaning as a sentence: “enormous” means very large. */
export const meaningSentence = entry => `“${entry.word}” means ${entry.meaning}.`;

/** Everything shown after an answer, as one piece of plain text (also read out to screen readers). */
export function explain(entry) {
  return `${meaningSentence(entry)} Clue type: ${clueType(entry.type).name.toLowerCase()}. ${clueNote(entry)} One more sentence: ${entry.again}`;
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
 * Ten questions for a level, the same every time for the same seed: [{ item, mode, options }].
 * mode "meaning": choose what the word means from `options` (the right meaning and the three wrong ones, shuffled).
 * mode "clue": tap a word of the clue. mode "type": name the type of clue.
 * Level 1 is all "meaning", with four to six definition clues and the rest synonym clues.
 * Level 2 has two or three sentences of each of its four clue types: six "meaning" and four "clue" questions.
 * Level 3 has two sentences of each of the five types: four "meaning", three "clue" and three "type" questions.
 * An inference clue is never a "clue" question, because its clue is the whole situation.
 */
export function buildRound(level, seed) {
  const random = seededRandom(seed);
  const { types } = LEVELS.find(entry => entry.id === level);
  const definitions = 4 + Math.floor(random() * 3);
  const counts = level === 1 ? [definitions, ROUND_LENGTH - definitions] : level === 2 ? shuffled([3, 3, 2, 2], random) : repeat(2, 5);
  const chosen = shuffled(types.flatMap((type, i) => shuffled(itemsFor(level, type), random).slice(0, counts[i])), random);
  const modes = level === 1 ? repeat('meaning', ROUND_LENGTH)
    : level === 2 ? shuffled([...repeat('meaning', 6), ...repeat('clue', 4)], random)
    : shuffled([...repeat('meaning', 3), ...repeat('clue', 3), ...repeat('type', 2)], random);
  const inferenceModes = shuffled(['meaning', 'type'], random);
  return chosen.map(entry => ({
    item: entry,
    mode: level === 3 && entry.type === 'inference' ? inferenceModes.pop() : modes.pop(),
    options: shuffled([entry.meaning, ...entry.wrong], random),
  }));
}

/**
 * Is the answer right? For "meaning" the answer is the index of the option chosen; for "clue" it is the index
 * of the word tapped (see words); for "type" it is the id of a clue type.
 */
export function checkAnswer(question, answer) {
  const { item: entry, mode, options } = question;
  if (mode === 'meaning') return options[answer] === entry.meaning;
  if (mode === 'clue') return words(entry)[answer]?.clue === true;
  return answer === entry.type;
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
  if (correct === total) return 'A perfect round. You used the clue every time.';
  if (correct >= total * 0.8) return 'Great work. Look over the ones you missed, then try for a perfect round.';
  if (correct >= total * 0.5) return 'Good start. Read the clue notes for the ones you missed and play again.';
  return 'Keep going. Read the whole sentence, look for a signal word, and try each meaning in place of the word.';
}
