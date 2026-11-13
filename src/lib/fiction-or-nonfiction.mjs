// The Fiction or Nonfiction Game's bank and rules: pure data and functions, shared by the game, the examples
// on the page, the printable worksheet, the answer key and the tests.
//
// Everything here was written for this site. Fiction items use invented characters and titles only (the
// fables and fairy tales are traditional tales retold in our own words). Every statement inside a
// nonfiction item is meant to be true, timeless and uncontroversial: school science and nature. The two
// people the biographies are about, Maria Mitchell and Wilson Bentley, lived in the 1800s, and one
// historical-fiction item mentions the Wright brothers’ flights of 1903.
// If you add an item, keep to those rules and make sure it has exactly one defensible answer.

export const DEFINITIONS = {
  fiction: 'Fiction is writing that an author made up. The characters and events come from the author’s imagination.',
  nonfiction: 'Nonfiction is writing about the real world. It gives facts and true information about real people, places, animals and events.',
};

export const ROUND_LENGTH = 10;

export const LEVELS = [
  { id: 1, name: 'Level 1', grades: 'Grades 2–3', ages: 'ages 7–9', about: 'Clear cases. Read one or two sentences and choose Fiction or Nonfiction.' },
  { id: 2, name: 'Level 2', grades: 'Grades 4–5', ages: 'ages 9–11', about: 'Short passages and book descriptions, with stories that seem real and true accounts told like stories.' },
  { id: 3, name: 'Level 3', grades: 'Grades 6–8', ages: 'ages 11–14', about: 'Name the genre, from fable and fantasy to biography and persuasive text.' },
];

export const KIND_NAME = { fiction: 'Fiction', nonfiction: 'Nonfiction' };

// The clues named in Level 2 explanations.
export const CLUES = {
  characters: { kind: 'fiction', name: 'made-up characters' },
  dialogue: { kind: 'fiction', name: 'dialogue' },
  thoughts: { kind: 'fiction', name: 'a character’s thoughts or feelings' },
  impossible: { kind: 'fiction', name: 'things that could not happen' },
  plot: { kind: 'fiction', name: 'a problem that gets solved' },
  facts: { kind: 'nonfiction', name: 'facts you can check' },
  dates: { kind: 'nonfiction', name: 'dates or numbers' },
  real: { kind: 'nonfiction', name: 'a real event told in order' },
  headings: { kind: 'nonfiction', name: 'headings' },
  contents: { kind: 'nonfiction', name: 'a table of contents' },
  glossary: { kind: 'nonfiction', name: 'a glossary' },
  index: { kind: 'nonfiction', name: 'an index' },
  diagrams: { kind: 'nonfiction', name: 'diagrams with labels' },
  photos: { kind: 'nonfiction', name: 'photographs' },
  maps: { kind: 'nonfiction', name: 'maps' },
  steps: { kind: 'nonfiction', name: 'steps to follow' },
};

// What to look for in each kind of writing: the features table on the page.
export const FEATURES = [
  { look: 'Who is in it', fiction: 'Made-up characters. Animals and objects may talk.', nonfiction: 'Real people, animals, places and things.' },
  { look: 'What happens', fiction: 'A plot: a problem, events and an ending.', nonfiction: 'Facts, explanations, steps to follow or real events.' },
  { look: 'Speech and thoughts', fiction: 'Dialogue in quotation marks, and the private thoughts and feelings of the characters.', nonfiction: 'Mostly explanation. Any quotations are words that real people said.' },
  { look: 'Could it happen?', fiction: 'Sometimes it could not: magic, dragons, time travel.', nonfiction: 'It is meant to be true, and you can check it.' },
  { look: 'Parts of the book', fiction: 'Chapters, and often illustrations.', nonfiction: 'A table of contents, headings, diagrams, maps, photographs with captions, a glossary and an index.' },
  { look: 'Why it was written', fiction: 'To entertain, and to make you think and feel.', nonfiction: 'To inform, to explain, to teach how to do something or to persuade.' },
  { look: 'How you read it', fiction: 'From the beginning to the end.', nonfiction: 'Often in any order: you can go straight to the part you need.' },
];

// The thirteen genres of Level 3. `kind` is the side of the library each one sits on; poetry can be either.
// `as` finishes the sentence "This is …". `example` is the bank item shown in the genre guide on the page.
export const GENRES = [
  { id: 'fable', name: 'Fable', as: 'a fable', kind: 'fiction', about: 'A very short story, often with animals that talk and act like people, that teaches a lesson called a moral.', look: 'Talking animals, a short plot and a moral stated at the end.', example: 'c01' },
  { id: 'fairy-tale', name: 'Fairy tale', as: 'a fairy tale', kind: 'fiction', about: 'An old tale of magic, often about kings, queens, princes and princesses, in which good is rewarded.', look: '“Once upon a time”, royalty, spells and magic helpers, “happily ever after”.', example: 'c04' },
  { id: 'fantasy', name: 'Fantasy', as: 'fantasy', kind: 'fiction', about: 'A made-up story set in an imaginary world, or one with magic and creatures that do not exist.', look: 'Magic, wizards, dragons, invented lands with their own maps.', example: 'c07' },
  { id: 'science-fiction', name: 'Science fiction', as: 'science fiction', kind: 'fiction', about: 'A made-up story built on science and technology that do not exist yet, often set in the future or in space.', look: 'Future dates, spaceships, robots, time machines, other planets.', example: 'c10' },
  { id: 'realistic-fiction', name: 'Realistic fiction', as: 'realistic fiction', kind: 'fiction', about: 'A made-up story set in the present day, with characters and events that could be real.', look: 'Invented characters, an everyday modern setting, no magic.', example: 'c13' },
  { id: 'historical-fiction', name: 'Historical fiction', as: 'historical fiction', kind: 'fiction', about: 'A made-up story set in a real time and place in the past.', look: 'A date or period from history, real places and events, invented main characters.', example: 'c16' },
  { id: 'mystery', name: 'Mystery', as: 'a mystery', kind: 'fiction', about: 'A made-up story about a puzzle or a crime that the characters solve.', look: 'A detective, clues, suspects and a solution at the end.', example: 'c19' },
  { id: 'poetry', name: 'Poetry', as: 'poetry', kind: 'either', about: 'Writing set out in lines and stanzas, often with rhythm and rhyme, that uses few words to share a feeling or a picture.', look: 'Short lines, stanzas, rhyme, rhythm and word pictures.', example: 'c22' },
  { id: 'biography', name: 'Biography', as: 'a biography', kind: 'nonfiction', about: 'The true story of a real person’s life, written by someone else.', look: 'A real person, dates, events in time order, “he” or “she”.', example: 'c27' },
  { id: 'autobiography', name: 'Autobiography', as: 'an autobiography', kind: 'nonfiction', about: 'The true story of a real person’s life, written by that person.', look: '“I” and “my”, the writer’s own memories, events in time order.', example: 'c29' },
  { id: 'informational', name: 'Informational text', as: 'informational text', kind: 'nonfiction', about: 'Writing that explains a topic with facts.', look: 'Facts, definitions, headings, diagrams, a glossary and an index.', example: 'c33' },
  { id: 'how-to', name: 'How-to (procedural)', as: 'a how-to text', kind: 'nonfiction', about: 'Writing that tells you how to make or do something, step by step.', look: 'A list of materials, numbered steps, and words such as first, next and finally.', example: 'c37' },
  { id: 'persuasive', name: 'Persuasive text', as: 'persuasive text', kind: 'nonfiction', about: 'Writing that tries to get the reader to agree with an opinion or to do something.', look: 'An opinion, reasons that support it, words such as should, and a request to act.', example: 'c41' },
];

// Genres that overlap: a fairy tale is a kind of fantasy, a mystery set today is also realistic, and in
// school standards "informational text" can include biographies and how-to texts. No Level 3 question
// offers both genres of a pair, so there is never a second answer a teacher could defend.
export const OVERLAPS = [
  ['fairy-tale', 'fantasy'],
  ['fable', 'fantasy'],
  ['mystery', 'realistic-fiction'],
  ['historical-fiction', 'realistic-fiction'],
  ['informational', 'biography'],
  ['informational', 'autobiography'],
  ['informational', 'how-to'],
];

// Level 1: one or two sentences. `why` is the explanation shown after the answer.
const fic1 = (id, text, why) => ({ id, level: 1, kind: 'fiction', form: 'passage', text, why });
const non1 = (id, text, why) => ({ id, level: 1, kind: 'nonfiction', form: 'passage', text, why });
// Level 2: a passage or a description of an invented book. `clues` are keys of CLUES, `marks` are the exact
// words in the text that give it away, `tricky` marks the two tricky kinds: a made-up story that seems real
// ('realistic') and a true account told like a story ('true-story').
const fic2 = (id, form, text, clues, marks, why, tricky) => ({ id, level: 2, kind: 'fiction', form, text, clues, marks, why, ...(tricky && { tricky }) });
const non2 = (id, form, text, clues, marks, why, tricky) => ({ id, level: 2, kind: 'nonfiction', form, text, clues, marks, why, ...(tricky && { tricky }) });
// Level 3: name the genre. `options` are the genres offered (the answer among them), `marks` the giveaways.
const genre = (id, answer, form, text, options, marks, why) => ({ id, level: 3, genre: answer, form, text, options, marks, why });

export const ITEMS = [
  // ---------------------------------------------------------------- Level 1, grades 2–3: fiction
  fic1('a01', 'The fox put on his red boots and said, “Let’s fly to the moon.”', 'A real fox cannot talk or wear boots. The author made this up.'),
  fic1('a02', 'A tiny dragon lived inside Mia’s lunchbox and toasted her sandwiches.', 'Dragons are not real. This comes from the author’s imagination.'),
  fic1('a03', 'Every night, the toys in Ben’s room woke up and had a party.', 'Toys cannot wake up or have parties. Someone imagined it.'),
  fic1('a04', 'The old oak tree bent down and told the children a secret.', 'Trees cannot bend down or speak. This could not really happen.'),
  fic1('a05', 'Once upon a time, a princess kept a pet cloud on a string.', 'Nobody can keep a cloud as a pet. “Once upon a time” is how many made-up stories begin.'),
  fic1('a06', 'Max the mouse drove his little green car to the cheese shop.', 'Mice cannot drive cars or go shopping. The author made Max up.'),
  fic1('a07', 'The moon came down one night and danced with the owls.', 'The Moon cannot come down or dance. This is make-believe.'),
  fic1('a08', 'A wizard waved his wand and turned the rain into lemonade.', 'Wizards and magic wands are make-believe.'),
  fic1('a09', 'Pip the penguin packed her suitcase and bought a train ticket to the beach.', 'A real penguin cannot pack a suitcase or buy a ticket. Pip is a made-up character.'),
  fic1('a10', 'The three bears sat down at the table. “Who ate our soup?” asked the smallest bear.', 'Bears do not sit at tables or talk. This is a made-up story.'),
  fic1('a11', 'Lila opened the tiny door in the tree and stepped into a land of giants.', 'There is no land of giants behind a door in a tree. The author invented it.'),
  fic1('a12', 'The rabbit asked the river, “May I cross?” and the river said yes.', 'Rabbits and rivers cannot talk. This could not really happen.'),
  fic1('a13', 'When Sam sneezed, he floated up to the ceiling and bumped his head on the lamp.', 'People do not float when they sneeze. This could not really happen.'),
  fic1('a14', 'The snowman tipped his hat and walked into town to buy carrots.', 'A snowman cannot walk or go shopping. Someone imagined it.'),
  fic1('a15', 'Grandpa’s shoes could talk, and they grumbled about every long walk.', 'Shoes cannot talk. The author made this up.'),
  fic1('a16', 'The frog king wore a tiny crown and ruled the whole pond.', 'Frogs are not kings and do not wear crowns. This is make-believe.'),
  // ---------------------------------------------------------------- Level 1: nonfiction
  non1('a17', 'A frog begins its life as a tadpole in the water.', 'This is true information about real frogs. You could check it in a science book.'),
  non1('a18', 'Honeybees collect nectar from flowers and use it to make honey.', 'This tells facts about real bees. Nothing in it is made up.'),
  non1('a19', 'The Sun is a star. It gives the Earth light and heat.', 'These are facts about the real Sun. You could check them.'),
  non1('a20', 'Penguins are birds that cannot fly, but they are strong swimmers.', 'This gives true information about real penguins.'),
  non1('a21', 'A caterpillar changes into a butterfly inside a chrysalis.', 'This is a fact about real caterpillars. It also teaches a science word, chrysalis.'),
  non1('a22', 'Plants need water, air and light to grow.', 'This is a fact about real plants. You could test it yourself.'),
  non1('a23', 'The Earth has one moon. It takes about a month to travel around the Earth.', 'These are facts about the real Moon. You could check them.'),
  non1('a24', 'Spiders have eight legs. Many spiders spin webs to catch insects.', 'This gives facts about real spiders. You can count the legs.'),
  non1('a25', 'A baby kangaroo is called a joey. It grows inside its mother’s pouch.', 'This is true information about real kangaroos.'),
  non1('a26', 'Rain falls from clouds. The water runs into streams, rivers and lakes.', 'This explains something real about weather and water.'),
  non1('a27', 'Whales live in the ocean, but they must come up to breathe air.', 'This is a fact about real whales. Nothing in it is made up.'),
  non1('a28', 'There are seven days in a week and twelve months in a year.', 'These are facts. You can count them on a calendar.'),
  non1('a29', 'Most owls hunt at night. Their big eyes help them see in dim light.', 'This gives true information about real owls.'),
  non1('a30', 'Ants are insects. An ant has six legs and two feelers called antennae.', 'These are facts about real ants. You could check them with a magnifying glass.'),
  non1('a31', 'Ice is frozen water. It melts when it gets warm.', 'This is a fact. You can test it with an ice cube.'),
  non1('a32', 'Most bats sleep hanging upside down during the day and fly at night.', 'This is true information about real bats.'),

  // ---------------------------------------------------------------- Level 2, grades 4–5: fiction
  fic2('b01', 'passage', 'Nora stared at the empty hook where her jacket should have been. “Did anyone see my blue jacket?” she asked. Nobody answered. Her face went hot as she thought about telling Mom it was lost again.', ['dialogue', 'thoughts'], ['“Did anyone see my blue jacket?” she asked', 'she thought about telling Mom'], 'Everything here could really happen, but Nora is a made-up character. The writer lets us hear her speak and tells us her private thoughts.', 'realistic'),
  fic2('b02', 'passage', 'It was the last inning, and Diego’s hands were shaking. “You can do this,” said Coach Ray. Diego took a deep breath and swung. The ball sailed over the fence, and the whole team ran out to cheer.', ['characters', 'dialogue'], ['“You can do this,” said Coach Ray'], 'A game like this could happen at any ballpark, but the author invented Diego and Coach Ray. The scene has dialogue and builds to an exciting ending, the way stories do.', 'realistic'),
  fic2('b03', 'passage', 'Priya had practiced her spelling words all week. On Friday she walked onto the stage and looked for Grandpa in the crowd. He gave her a thumbs-up. “I am ready,” she told herself.', ['characters', 'thoughts'], ['“I am ready,” she told herself'], 'A spelling bee is a real kind of event, but Priya is a made-up character. Only a storyteller can tell you what someone says silently to herself.', 'realistic'),
  fic2('b04', 'passage', 'Biscuit the puppy had chewed another shoe. “That is the third one this week,” groaned Dad. Owen hid the shoe behind his back and tried not to laugh.', ['characters', 'dialogue'], ['“That is the third one this week,” groaned Dad'], 'Puppies really do chew shoes, but the author invented this family. The dialogue and the funny scene tell you it is a story.', 'realistic'),
  fic2('b05', 'passage', 'Tessa followed the silver cat through the garden gate. On the other side, the trees were made of glass and the river flowed uphill. “Hurry,” said the cat. “The queen of the wind is waiting for you.”', ['impossible', 'dialogue'], ['the trees were made of glass and the river flowed uphill', '“Hurry,” said the cat'], 'Trees are not made of glass, rivers do not flow uphill and cats do not talk. A story with things that could not happen is fiction.'),
  fic2('b06', 'passage', 'The old turtle climbed onto a rock and cleared his throat. “Friends,” he said to the frogs and fish, “the pond is drying up. We must dig a new one.” The frogs fetched their tiny shovels and got to work.', ['impossible', 'dialogue'], ['“Friends,” he said', 'their tiny shovels'], 'Turtles do not make speeches and frogs do not use shovels. The animals act like people, so the story is made up.'),
  fic2('b07', 'passage', 'Captain Ivo steered the school bus past the rings of Saturn. “Next stop, the Moon Museum,” he called. The students pressed their noses to the windows while a robot handed out snacks.', ['impossible', 'dialogue'], ['steered the school bus past the rings of Saturn', '“Next stop, the Moon Museum,” he called'], 'No school bus can fly to Saturn. The author imagined the trip, the captain and the students.'),
  fic2('b08', 'passage', 'Jalen wanted to win the art contest more than anything. He painted late into the evening, but the sky in his picture still looked wrong. Then he remembered his sister’s advice about mixing colors. He added a little orange, and at last the sunset glowed.', ['thoughts', 'plot'], ['Jalen wanted to win the art contest more than anything', 'at last the sunset glowed'], 'It could happen, but it is told as a story. A made-up boy has a problem, and the story ends when he solves it. The writer also tells us what Jalen wants and remembers.', 'realistic'),
  fic2('b09', 'description', 'A chapter book about a girl named Wren who starts at a new school and is afraid she will never make a friend. The author made up Wren, her school and everything that happens to her.', ['characters'], ['The author made up Wren'], 'Nothing in the book is impossible, but the people and events are invented. A made-up story is fiction, even when it seems real.', 'realistic'),
  fic2('b10', 'description', 'A picture book in which a bear, a goose and a hedgehog open a bakery and argue about who gets to wear the chef’s hat.', ['impossible'], ['open a bakery and argue'], 'Animals do not run bakeries or argue about hats. The author imagined these characters.'),
  fic2('b11', 'description', 'A novel about twin brothers who find a strange clock in their attic and use it to travel back in time to see living dinosaurs.', ['impossible', 'characters'], ['travel back in time'], 'Nobody can travel back in time. The twins and their adventure come from the author’s imagination.'),
  fic2('b12', 'description', 'A book of ten short stories about a class of invented fourth graders. Each story has a problem, such as a lost hamster or a rained-out field trip, and ends when the characters solve it.', ['characters', 'plot'], ['invented fourth graders', 'ends when the characters solve it'], 'The stories could happen in a real school, but the students are invented. Each story is built around a problem and its solution.', 'realistic'),
  fic2('b13', 'description', 'A story about Leo, a boy the author imagined, who spends a summer on his aunt’s farm. The farm chores in the book are true to life, but Leo and his aunt never existed.', ['characters'], ['a boy the author imagined', 'never existed'], 'True details do not make a story nonfiction. The main character and the events were imagined by the author.', 'realistic'),
  fic2('b14', 'passage', 'Long ago, a poor shoemaker had only enough leather for one last pair of shoes. He cut out the pieces and went to bed. In the morning the shoes were finished, stitched in the night by two tiny elves.', ['impossible'], ['Long ago', 'two tiny elves'], 'Elves are make-believe, and “Long ago” is a common way to begin a made-up tale.'),
  fic2('b15', 'description', 'A funny book written as the diary of Kit, a fifth grader who does not exist. The author invented every entry, from the science fair disaster to the class trip.', ['characters'], ['a fifth grader who does not exist', 'The author invented every entry'], 'A diary can be real or made up. This one is fiction, because the author invented Kit and wrote the entries for her.', 'realistic'),
  fic2('b16', 'passage', 'Hana’s kite was stuck at the top of the tallest tree in the park. “I will never get it down,” she sighed. Then a gust of wind shook the branches, and the kite dropped right into her arms. Hana laughed all the way home.', ['dialogue', 'plot'], ['“I will never get it down,” she sighed'], 'Nothing here is impossible, but it is a story about a made-up girl. It has dialogue, a problem and a happy ending.', 'realistic'),
  fic2('b17', 'description', 'A graphic novel about a girl whose shadow slips away from her feet at night and goes on adventures of its own.', ['impossible'], ['goes on adventures of its own'], 'A shadow cannot leave a person or have adventures. This could not happen, so the book is fiction.'),
  fic2('b18', 'passage', 'The moving truck drove away, and Marcus sat down on the steps of his new house. Across the street, a boy was bouncing a basketball. Marcus wanted to say hello, but he felt too shy. “Want to play?” the boy called.', ['thoughts', 'dialogue'], ['Marcus wanted to say hello, but he felt too shy', '“Want to play?” the boy called'], 'Moving to a new house is a real kind of event, but Marcus is a made-up character. The writer tells us his feelings and lets us hear the other boy speak.', 'realistic'),
  // ---------------------------------------------------------------- Level 2: nonfiction
  non2('b19', 'passage', 'A volcano is an opening in the Earth’s crust. Deep underground, rock is so hot that it melts. This melted rock is called magma. When it reaches the surface, it is called lava.', ['facts'], ['This melted rock is called magma'], 'Every sentence gives information about real volcanoes that you can check. There are no characters and no story.'),
  non2('b20', 'passage', 'A honeybee colony normally has one queen, and she lays the eggs. The worker bees do the other jobs. They build the wax comb, gather nectar and pollen, and guard the hive.', ['facts'], ['The worker bees do the other jobs'], 'It gives facts about how real honeybees live. Nothing is made up, and nobody in it speaks or has an adventure.'),
  non2('b21', 'passage', 'Water is always on the move. The Sun warms the water in oceans and lakes, and some of it rises into the air as a gas called water vapor. High in the sky the vapor cools and forms clouds. Later the water falls back to Earth as rain or snow.', ['facts'], ['a gas called water vapor'], 'It explains how water really moves between the sea, the sky and the land. It also explains a science word, as many nonfiction books do.'),
  non2('b22', 'passage', 'The Moon does not make its own light. It shines because sunlight bounces off it. As the Moon travels around the Earth, we see different amounts of its bright side. That is why its shape seems to change during the month.', ['facts'], ['That is why'], 'It uses facts to explain something real: the changing shape of the Moon. “That is why” shows the writer is explaining, not telling a story.'),
  non2('b23', 'passage', 'Many bats find their way in the dark by using sound. A bat makes high squeaks and listens for the echoes that bounce back. The echoes tell the bat where an insect or a branch is. This is called echolocation.', ['facts'], ['This is called echolocation'], 'It gives true information about real bats and teaches a science word. There are no characters and no plot.'),
  non2('b24', 'passage', 'On a warm night, a mother sea turtle crawls out of the ocean and up the beach. She digs a hole in the sand with her back flippers and lays about a hundred eggs. Then she covers the nest and returns to the sea. About two months later, the baby turtles hatch and hurry down to the water.', ['real', 'dates'], ['about a hundred eggs', 'About two months later'], 'It reads like a story, but it is a true account of how sea turtles nest. There are no made-up names, no talking and no magic, only facts told in order.', 'true-story'),
  non2('b25', 'passage', 'At the start of the Antarctic winter, a mother emperor penguin lays a single egg. She passes it to the father and walks to the sea to find food. He balances the egg on his feet and keeps it warm under a fold of skin. For about two months he stands in the cold and does not eat.', ['real', 'dates'], ['a single egg', 'For about two months'], 'It is told in order, like a story, but everything in it is true of real emperor penguins. The penguins have no names and do not speak.', 'true-story'),
  non2('b26', 'passage', 'A monarch caterpillar hangs upside down from a twig and sheds its skin one last time. Underneath is a smooth green case called a chrysalis. Inside it, the caterpillar’s body changes. After ten days or so, the case splits open and a butterfly climbs out with damp, crumpled wings.', ['real', 'facts'], ['called a chrysalis', 'After ten days or so'], 'It tells what really happens when a caterpillar becomes a butterfly. It reads like a story, but it is made of facts you can check, and it teaches a science word.', 'true-story'),
  non2('b27', 'passage', 'A young salmon hatches in a stream and swims down the river to the ocean. There it grows large and strong. When it is fully grown, it swims back up the river, leaping over rocks and small waterfalls. At last it reaches the stream where its life began, and there the salmon lay their eggs.', ['real', 'facts'], ['the stream where its life began'], 'It follows a salmon from beginning to end, like a story, but it is a true account of how real salmon live. Nothing is invented.', 'true-story'),
  non2('b28', 'passage', 'For twenty-one days the hen keeps her eggs warm. Inside one egg, a chick begins to tap at the shell with a small hard bump on its beak, called an egg tooth. Crack by crack, it breaks a ring around the shell. After many hours of work, the wet chick pushes its way out.', ['real', 'dates'], ['For twenty-one days', 'called an egg tooth'], 'It tells what really happens when a chick hatches, in the order it happens. The number of days and the name of the egg tooth are facts you can check.', 'true-story'),
  non2('b29', 'passage', 'A beaver cuts down a young tree with its strong front teeth. It drags the branches to a stream and piles them up with mud and stones. Slowly the dam grows, and the water behind it spreads into a pond. In the pond the beaver builds its home, called a lodge.', ['real', 'facts'], ['called a lodge'], 'It reads like a story, but it is a true account of how real beavers build. The beaver has no name and does not talk or think like a person.', 'true-story'),
  non2('b30', 'passage', 'A bean seed lies in damp soil. It soaks up water and swells until its coat splits. First a root pushes down into the ground. A few days later a green shoot bends upward and reaches the light.', ['real', 'facts'], ['First a root pushes down'], 'It tells what really happens when a seed sprouts, step by step. You could plant a bean and watch it yourself.', 'true-story'),
  non2('b31', 'description', 'A book that explains how volcanoes form, with labeled diagrams, a glossary of science words and an index at the back.', ['diagrams', 'glossary', 'index'], ['labeled diagrams', 'a glossary of science words', 'an index'], 'A book that explains a real topic is nonfiction. Diagrams, a glossary and an index help readers find and understand information.'),
  non2('b32', 'description', 'A book about the planets with a table of contents, a heading for each planet and photographs with captions.', ['contents', 'headings', 'photos'], ['a table of contents', 'a heading for each planet', 'photographs with captions'], 'The book gives information about real planets. A table of contents, headings and photographs with captions are features of nonfiction.'),
  non2('b33', 'description', 'A guide to the birds of North America. Each page has a photograph, a map of where the bird lives and facts about its nest and eggs.', ['photos', 'maps', 'facts'], ['a photograph', 'a map of where the bird lives', 'facts about its nest and eggs'], 'A guide to real birds is nonfiction. Photographs, maps and facts help readers identify the birds they see.'),
  non2('b34', 'description', 'A book that tells how the first railroad across the United States was built in the 1860s, using old photographs, maps and newspaper reports from the time.', ['dates', 'photos', 'maps'], ['in the 1860s', 'old photographs, maps and newspaper reports'], 'It tells the story of a real event from history. The date and the photographs, maps and reports from the time show that it is a true account.', 'true-story'),
  non2('b35', 'description', 'A cookbook for children. Each recipe lists the ingredients and gives numbered steps, with a photograph of the finished dish.', ['steps', 'photos'], ['lists the ingredients', 'numbered steps'], 'A cookbook teaches how to do something real. Lists of ingredients and numbered steps are features of nonfiction.'),
  non2('b36', 'description', 'A true account of a winter that a team of scientists spent at a research station in Antarctica, with a map of the station, the date of each event and the scientists’ own photographs.', ['real', 'maps', 'photos'], ['A true account', 'a map of the station', 'the scientists’ own photographs'], 'It tells about real people and a real event, in order. The map, the dates and the photographs are records of what happened.', 'true-story'),

  // ---------------------------------------------------------------- Level 3, grades 6–8: name the genre
  // Fable
  genre('c01', 'fable', 'passage', 'A hungry fox saw ripe grapes hanging high on a vine. He jumped and jumped but could not reach them. “They are probably sour anyway,” he said as he walked off. Moral: It is easy to scorn what you cannot have.', ['fable', 'fairy-tale', 'realistic-fiction', 'poetry', 'biography'], ['“They are probably sour anyway,” he said', 'Moral:'], 'It is very short, the main character is an animal that talks, and it ends with a lesson, the moral.'),
  genre('c02', 'fable', 'passage', 'A hare laughed at a tortoise for being slow, so the tortoise asked for a race. The hare ran far ahead and stopped for a nap. The tortoise kept walking and crossed the finish line first. Moral: Slow and steady wins the race.', ['fable', 'science-fiction', 'historical-fiction', 'mystery', 'how-to'], ['the tortoise asked for a race', 'Moral:'], 'Two animals act like people in a very short story, and the last line states the moral.'),
  genre('c03', 'fable', 'description', 'A book of thirty very short stories. In each one, animals such as a lion, a mouse or a crow speak and act like people, and the last line states a lesson about how to behave.', ['fable', 'fairy-tale', 'mystery', 'informational', 'persuasive'], ['very short stories', 'speak and act like people', 'the last line states a lesson'], 'Very short stories, animals that speak, and a lesson stated at the end are the marks of a fable.'),
  // Fairy tale
  genre('c04', 'fairy-tale', 'passage', 'Once upon a time, a kind girl was made to sweep the floors by her stepmother. On the night of the royal ball, a fairy godmother turned a pumpkin into a coach and sent her to the palace. The prince danced with her, and in the end they lived happily ever after.', ['fable', 'fairy-tale', 'science-fiction', 'realistic-fiction', 'biography'], ['Once upon a time', 'a fairy godmother turned a pumpkin into a coach', 'happily ever after'], 'It begins “Once upon a time”, it has magic and a prince, and it ends “happily ever after”.'),
  genre('c05', 'fairy-tale', 'passage', 'Long ago, in a kingdom by the sea, a wicked spell put a princess to sleep for a hundred years. A thick forest of thorns grew around the castle. Then a prince found his way inside and broke the spell, and everyone in the castle woke up.', ['fable', 'fairy-tale', 'mystery', 'autobiography', 'how-to'], ['Long ago, in a kingdom by the sea', 'a wicked spell', 'Then a prince'], 'It is an old tale of a kingdom, a princess, a prince and a magic spell. There is no moral at the end, so it is not a fable.'),
  genre('c06', 'fairy-tale', 'description', 'A collection of old tales that begin “Once upon a time.” They are full of kings, queens, giants and enchanted objects, and the good characters are rewarded in the end.', ['fairy-tale', 'science-fiction', 'realistic-fiction', 'poetry', 'informational'], ['“Once upon a time.”', 'kings, queens, giants and enchanted objects'], 'These are old tales of royalty and enchantment, in which good is rewarded.'),
  // Fantasy
  genre('c07', 'fantasy', 'passage', 'Kessa pressed her hand against the dragon’s warm scales and whispered the flying spell. The dragon spread his wings, and they rose above the floating islands of Tavelorn. Far below, the wizard’s army was marching toward the crystal gate.', ['fantasy', 'science-fiction', 'historical-fiction', 'mystery', 'biography'], ['the flying spell', 'the floating islands of Tavelorn', 'the wizard’s army'], 'A dragon, a spell, a wizard and an invented land: the story runs on magic, not on science.'),
  genre('c08', 'fantasy', 'description', 'A long novel set in an imaginary land, with a map of it at the front. A young shepherd learns that he can speak to storms, and he must return a stolen magic crown to the elves before an evil sorcerer finds him.', ['fantasy', 'science-fiction', 'realistic-fiction', 'autobiography', 'persuasive'], ['an imaginary land', 'a stolen magic crown', 'an evil sorcerer'], 'The setting is an invented world, and the plot depends on magic, elves and a sorcerer.'),
  genre('c09', 'fantasy', 'passage', 'The spell book snapped at Odo’s fingers when he tried to open it. “Feed it a rhyme first,” said the raven on the shelf. Odo sighed. Lessons at the Academy of Small Magic were never easy.', ['fantasy', 'science-fiction', 'historical-fiction', 'poetry', 'biography'], ['The spell book snapped at Odo’s fingers', 'the Academy of Small Magic'], 'A book of spells that bites and a school of magic cannot exist. Magic is the mark of fantasy.'),
  // Science fiction
  genre('c10', 'science-fiction', 'passage', 'In the year 2490, Mira’s family lived in a glass dome on Mars. Each morning a robot named Tock checked her oxygen suit before she rode the hover-bus to school. Today the class was taking a rocket to study the moons of Jupiter.', ['fantasy', 'science-fiction', 'historical-fiction', 'autobiography', 'how-to'], ['In the year 2490', 'a glass dome on Mars', 'a robot named Tock'], 'It is set in the future, on another planet, and everything unusual in it comes from technology: a dome, a robot, a rocket.'),
  genre('c11', 'science-fiction', 'passage', 'The time machine hummed as Dr. Okafor typed in the date. She had built it from spare computer parts and a new kind of battery. If her calculations were right, it would carry her three hundred years into the future.', ['fantasy', 'science-fiction', 'mystery', 'biography', 'persuasive'], ['The time machine', 'built it from spare computer parts', 'her calculations'], 'The impossible thing here is a machine, built by a scientist with parts and calculations. Invented science, not magic, is the mark of science fiction.'),
  genre('c12', 'science-fiction', 'description', 'A story about a crew of space explorers whose ship is run by a talking computer. When they land on a distant planet, they must use science and new inventions to survive.', ['fantasy', 'science-fiction', 'realistic-fiction', 'poetry', 'informational'], ['space explorers', 'a talking computer', 'science and new inventions'], 'It has a spaceship, a distant planet and problems that are solved with inventions, not with magic.'),
  // Realistic fiction
  genre('c13', 'realistic-fiction', 'passage', 'Amara checked her phone again. Still no message from Jo. They had not spoken since the argument at soccer practice, and the school dance was tomorrow. She typed “I’m sorry” and held her thumb over the send button.', ['fantasy', 'science-fiction', 'realistic-fiction', 'biography', 'persuasive'], ['her phone', 'the argument at soccer practice', 'the school dance'], 'The characters are invented, but the setting is the present day and everything could really happen. There is no magic and no future technology.'),
  genre('c14', 'realistic-fiction', 'description', 'A novel about an invented boy named Tomas who lives in a city apartment today. He wants to make the basketball team while he helps to look after his little sister. Nothing magical happens: the story could take place in any neighborhood.', ['fairy-tale', 'science-fiction', 'realistic-fiction', 'autobiography', 'how-to'], ['an invented boy', 'today', 'could take place in any neighborhood'], 'The character is made up, the setting is the present day, and the story could really happen.'),
  genre('c15', 'realistic-fiction', 'passage', 'The bell rang, and Lena still had no partner for the science project. She pretended to read the poster on the wall. Then the new girl tapped her on the shoulder. “Do you want to work with me?” she asked.', ['fable', 'science-fiction', 'realistic-fiction', 'poetry', 'biography'], ['the science project', '“Do you want to work with me?” she asked'], 'It is a story, with a character’s feelings and dialogue, set in an ordinary school of today. Everything in it could happen.'),
  // Historical fiction
  genre('c16', 'historical-fiction', 'passage', 'In the spring of 1848, twelve-year-old Hattie walked beside her family’s covered wagon on the long trail to Oregon. Hattie is a made-up character, but thousands of real families made the same journey. Each night she wrote in her diary by the light of the campfire.', ['fantasy', 'science-fiction', 'historical-fiction', 'biography', 'autobiography'], ['In the spring of 1848', 'Hattie is a made-up character', 'thousands of real families made the same journey'], 'The time, the place and the journey are real history, but the main character is invented.'),
  genre('c17', 'historical-fiction', 'description', 'A novel set in ancient Egypt during the building of a pyramid. The author invented the main character, a stonecutter’s son, but the tools, food and clothing in the story match what historians know about the time.', ['fairy-tale', 'historical-fiction', 'mystery', 'biography', 'how-to'], ['set in ancient Egypt', 'The author invented the main character'], 'The main character is invented, but he lives in a real period of the past, shown with true details of daily life.'),
  genre('c18', 'historical-fiction', 'passage', 'It was 1903, and Will had never seen anything like the flying machine on the sand dunes. He was only a made-up boy in a story, but the windy beach and the Wright brothers’ flights that December were real. “Will it truly fly?” he asked his uncle.', ['fable', 'science-fiction', 'historical-fiction', 'poetry', 'biography'], ['It was 1903', 'a made-up boy in a story', 'were real'], 'A real event from the past, the Wright brothers’ flights of 1903, is seen through the eyes of an invented character.'),
  // Mystery
  genre('c19', 'mystery', 'passage', 'The trophy had vanished from the locked gym, and the only clue was a trail of muddy footprints. Detective Zoe Park studied her list of three suspects. One of them was not telling the truth, and she meant to find out who.', ['fantasy', 'historical-fiction', 'mystery', 'biography', 'how-to'], ['the only clue', 'Detective Zoe Park', 'three suspects'], 'Something is missing, and a detective works through clues and suspects to find out who took it.'),
  genre('c20', 'mystery', 'description', 'A story in which two cousins try to work out who has been leaving secret notes in the library. They collect clues, question suspects and follow a false lead before they solve the puzzle in the last chapter.', ['fable', 'science-fiction', 'mystery', 'poetry', 'autobiography'], ['collect clues, question suspects', 'solve the puzzle in the last chapter'], 'The whole plot is a puzzle. The characters gather clues and question suspects until they solve it.'),
  genre('c21', 'mystery', 'passage', 'Who had taken the painting? Sam looked at the open window, the broken flowerpot and the single red button on the floor. Each clue pointed to a different person. He opened his notebook and began to write down what each suspect had said.', ['fairy-tale', 'science-fiction', 'mystery', 'biography', 'persuasive'], ['Who had taken the painting?', 'Each clue', 'each suspect'], 'It opens with a question to solve, and the character studies clues and suspects to answer it.'),
  // Poetry
  genre('c22', 'poetry', 'passage', 'The rain taps soft on the window pane,\nThe gutters fill and sing,\nThe puddles shine along the lane,\nAnd the garden drinks the spring.', ['fable', 'mystery', 'poetry', 'informational', 'persuasive'], ['pane', 'sing', 'lane', 'spring'], 'It is written in short lines, not in paragraphs, and the ends of the lines rhyme: pane with lane, sing with spring.'),
  genre('c23', 'poetry', 'description', 'A book of short pieces written in lines and stanzas instead of paragraphs. Many of them rhyme, and the writer uses rhythm and word pictures to share feelings about the seasons.', ['fairy-tale', 'science-fiction', 'poetry', 'biography', 'how-to'], ['lines and stanzas instead of paragraphs', 'rhyme', 'rhythm and word pictures'], 'Lines and stanzas, rhyme, rhythm and word pictures are the marks of poetry.'),
  genre('c24', 'poetry', 'passage', 'Autumn leaves come spinning down,\nGold and red and rusty brown.\nThey whisper as they reach the ground,\nA soft and crackling, papery sound.', ['fable', 'realistic-fiction', 'poetry', 'informational', 'persuasive'], ['down', 'brown', 'ground', 'sound'], 'It is set out in short lines with a steady beat, and the lines rhyme in pairs: down with brown, ground with sound.'),
  // Biography
  genre('c25', 'biography', 'description', 'This book tells the true life story of a real botanist who collected plants on four continents, from her childhood to her old age. It was written by another author, who read her letters and talked with people who knew her.', ['fantasy', 'historical-fiction', 'biography', 'autobiography', 'how-to'], ['the true life story of a real botanist', 'written by another author'], 'It is the true story of a real person’s whole life, and someone else wrote it. That makes it a biography, not an autobiography.'),
  genre('c26', 'biography', 'passage', 'Wilson Bentley was a real person, born on a farm in Vermont in 1865. As a teenager he studied snowflakes through a microscope. In 1885 he fitted a camera to the microscope and photographed a single snow crystal, and in his lifetime he photographed more than five thousand of them.', ['fable', 'historical-fiction', 'biography', 'autobiography', 'persuasive'], ['was a real person', 'born on a farm in Vermont in 1865', 'he'], 'It tells the life of a real person in time order, with dates, and it calls him “he”. The writer is someone else.'),
  genre('c27', 'biography', 'passage', 'Maria Mitchell was born in 1818 on the island of Nantucket. Her father taught her to use a telescope when she was a girl. In 1847 she discovered a comet, and she later became a professor of astronomy. This true account of her life was written by a historian.', ['fairy-tale', 'historical-fiction', 'biography', 'autobiography', 'how-to'], ['was born in 1818', 'This true account of her life was written by a historian'], 'It is a true account of a real person’s life, told in time order with dates, and it was written by someone else.'),
  genre('c28', 'biography', 'description', 'A book about the life of a real composer who lived three hundred years ago. The author, a music teacher, tells the events in order, from the composer’s birth to his last concert, and includes a timeline of important dates.', ['science-fiction', 'mystery', 'poetry', 'biography', 'autobiography'], ['the life of a real composer', 'The author, a music teacher', 'a timeline of important dates'], 'It is about a real person’s life, in time order, and the author is a different person from the subject.'),
  // Autobiography
  genre('c29', 'autobiography', 'passage', 'This is the true story of my own life. I was born on a sheep farm, the youngest of six children. I learned to fly a plane before I learned to drive a car, and for forty years I delivered mail to villages in the mountains.', ['fantasy', 'realistic-fiction', 'biography', 'autobiography', 'how-to'], ['the true story of my own life', 'I was born'], 'The writer is telling the true story of his or her own life, and so uses “I” and “my”.'),
  genre('c30', 'autobiography', 'description', 'In this book, a retired sea captain looks back on her own life. She wrote it herself, so she uses “I” and “my” as she tells true stories from her childhood, her first voyage and her last.', ['historical-fiction', 'mystery', 'poetry', 'biography', 'autobiography'], ['her own life', 'She wrote it herself', '“I” and “my”'], 'The captain wrote the true story of her own life herself. If someone else had written it, it would be a biography.'),
  genre('c31', 'autobiography', 'passage', 'I wrote this book to tell how I became a doctor. Everything in it really happened to me. My story begins in the small town where I grew up, and where I first bandaged the paw of a neighbor’s dog.', ['fairy-tale', 'science-fiction', 'biography', 'autobiography', 'persuasive'], ['I wrote this book', 'Everything in it really happened to me'], 'The writer says the events are true and happened to “me”. The author and the subject are the same person.'),
  genre('c32', 'autobiography', 'description', 'A chef tells the true story of his own life in his own words, from washing dishes at fourteen to opening his first restaurant. The book is written with “I” from the first page to the last.', ['fable', 'historical-fiction', 'biography', 'autobiography', 'how-to'], ['the true story of his own life in his own words', 'written with “I”'], 'It is the story of a life, not a book of recipes, and the chef wrote it himself.'),
  // Informational text
  genre('c33', 'informational', 'passage', 'Earthquakes happen when huge blocks of rock under the ground suddenly slip past each other. The place where they slip is called a fault. Scientists measure the shaking with an instrument called a seismograph.', ['fable', 'science-fiction', 'poetry', 'informational', 'persuasive'], ['is called a fault', 'an instrument called a seismograph'], 'It explains a topic with facts and science words. There are no characters, and the writer is not arguing for an opinion.'),
  genre('c34', 'informational', 'description', 'A book about rainforests with chapter headings, labeled diagrams, photographs with captions, a glossary and an index. It explains where rainforests grow and which plants and animals live in them.', ['fantasy', 'historical-fiction', 'mystery', 'informational', 'persuasive'], ['chapter headings, labeled diagrams, photographs with captions, a glossary and an index', 'It explains'], 'Its purpose is to explain a real topic, and it has the text features that help readers find information.'),
  genre('c35', 'informational', 'passage', 'Honey is made by honeybees. The bees collect sweet nectar from flowers and carry it back to the hive. There they fan it with their wings until much of the water dries out and it thickens into honey.', ['fairy-tale', 'realistic-fiction', 'poetry', 'informational', 'persuasive'], ['Honey is made by honeybees'], 'Every sentence gives facts that explain how honey is made. Nobody is trying to change your mind, and there is no story.'),
  genre('c36', 'informational', 'passage', 'The planets in our solar system travel around the Sun. The four closest to the Sun are small and rocky. The four farthest are much larger and are made mostly of gas and ice.', ['fable', 'science-fiction', 'mystery', 'informational', 'persuasive'], ['The four closest to the Sun are small and rocky'], 'It gives facts about the real planets. Science fiction would tell a made-up story about them. This passage only explains.'),
  // How-to
  genre('c37', 'how-to', 'passage', 'How to plant a bean seed. You will need a cup, soil, water and a bean. First, fill the cup with soil. Next, push the bean about an inch deep and cover it. Finally, water the soil and put the cup in a sunny place.', ['realistic-fiction', 'poetry', 'biography', 'how-to', 'persuasive'], ['How to', 'You will need', 'First,', 'Next,', 'Finally,'], 'It lists what you need and then gives the steps in order, with the words first, next and finally.'),
  genre('c38', 'how-to', 'description', 'A craft book with twenty projects. Each one starts with a list of materials and then gives numbered steps, with a drawing for every step, so that readers can make the project themselves.', ['fairy-tale', 'science-fiction', 'mystery', 'biography', 'how-to'], ['a list of materials', 'numbered steps'], 'Lists of materials and numbered steps tell readers how to make something. Another name for a how-to text is a procedural text.'),
  genre('c39', 'how-to', 'passage', 'Making a paper airplane takes six steps. Step 1: Fold a sheet of paper in half the long way, then open it again. Step 2: Fold the two top corners down to the center line. Keep following the steps in order until the plane is ready to fly.', ['fable', 'historical-fiction', 'autobiography', 'how-to', 'persuasive'], ['Step 1:', 'Step 2:', 'following the steps in order'], 'It gives numbered steps that tell the reader exactly what to do, in order.'),
  genre('c40', 'how-to', 'passage', 'How to make a bookmark. 1. Cut a strip of card as long as your hand. 2. Decorate one side with markers. 3. Punch a hole near the top. 4. Tie a piece of ribbon through the hole.', ['mystery', 'poetry', 'autobiography', 'how-to', 'persuasive'], ['How to', '1. Cut', '2. Decorate', '3. Punch', '4. Tie'], 'The title begins “How to”, and each numbered step starts with an action word: cut, decorate, punch, tie.'),
  // Persuasive text
  genre('c41', 'persuasive', 'passage', 'Our school should plant a vegetable garden. First, students would learn how food grows. Second, the garden would give us fresh vegetables for lunch. Please sign the garden club’s letter to the principal today.', ['fable', 'realistic-fiction', 'poetry', 'informational', 'persuasive'], ['should', 'Please sign'], 'The writer gives an opinion with “should”, backs it up with reasons and ends by asking the reader to do something.'),
  genre('c42', 'persuasive', 'description', 'A letter to a newspaper in which the writer argues that every neighborhood needs a public library. She gives three reasons, answers people who disagree, and ends by asking readers to support the idea.', ['fairy-tale', 'mystery', 'biography', 'how-to', 'persuasive'], ['the writer argues', 'three reasons', 'asking readers to support the idea'], 'The writer argues for an opinion, gives reasons and asks readers to agree. The purpose is to persuade.'),
  genre('c43', 'persuasive', 'passage', 'Everyone in our class ought to read for twenty minutes a day. Reading builds your vocabulary, and it lets you visit places you may never see. So pick up a book tonight. You will be glad you did.', ['science-fiction', 'historical-fiction', 'poetry', 'informational', 'persuasive'], ['ought to', 'So pick up a book tonight'], 'It states an opinion with “ought to”, gives reasons and tells the reader what to do. An informational text would explain, not urge.'),
  genre('c44', 'persuasive', 'passage', 'The best pet for a small apartment is a cat. Cats are quiet, they keep themselves clean, and they do not need to be walked. If your family is choosing a pet, I urge you to choose a cat.', ['fantasy', 'mystery', 'biography', 'how-to', 'persuasive'], ['The best pet', 'I urge you'], 'It opens with an opinion, “the best pet”, supports it with reasons and ends by urging the reader to act.'),
];

export const itemById = id => ITEMS.find(item => item.id === id);
export const genreById = id => GENRES.find(g => g.id === id);
/** Fiction, nonfiction or (for a poem) either: the side of the library an item belongs to. */
export const kindOf = item => (item.level === 3 ? genreById(item.genre).kind : item.kind);
/** The right answer to an item: 'fiction' or 'nonfiction' at levels 1 and 2, a genre id at level 3. */
export const answerOf = item => (item.level === 3 ? item.genre : item.kind);
/** The items of a level, and optionally of one kind (levels 1 and 2) or one genre (level 3). */
export const itemsFor = (level, answer) => ITEMS.filter(item => item.level === level && (!answer || answerOf(item) === answer));
/** The name of an answer as a student sees it: "Fiction", "Historical fiction". */
export const answerName = answer => KIND_NAME[answer] ?? genreById(answer)?.name;

/* ----------------------------------------------------------------- text */

/** Where each giveaway phrase sits in the text, in reading order: [[start, end], …]. */
export function markRanges(item) {
  const ranges = [];
  let from = 0;
  for (const mark of item.marks ?? []) {
    const start = item.text.indexOf(mark, from);
    ranges.push([start, start + mark.length]);
    from = start + mark.length;
  }
  return ranges;
}

/** The text as pieces of plain text and giveaway text, for showing the clues: [{ text, mark }]. */
export function pieces(item) {
  const out = [];
  let at = 0;
  for (const [start, end] of markRanges(item)) {
    if (start > at) out.push({ text: item.text.slice(at, start), mark: false });
    out.push({ text: item.text.slice(start, end), mark: true });
    at = end;
  }
  if (at < item.text.length) out.push({ text: item.text.slice(at), mark: false });
  return out;
}

const list = names => (names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`);
/** The clues of a Level 2 item in words: "dialogue and a character’s thoughts and feelings". */
export const clueNames = item => list((item.clues ?? []).map(key => CLUES[key].name));

/** Why the answer is what it is, in a sentence or two. */
export function explain(item) {
  if (item.level === 3) return `This is ${genreById(item.genre).as}. ${item.why}`;
  const clues = item.clues?.length ? ` ${item.clues.length > 1 ? 'Clues' : 'Clue'}: ${clueNames(item)}.` : '';
  return `This is ${item.kind}.${clues} ${item.why}`;
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

const GENRE_ORDER = GENRES.map(g => g.id);

/**
 * Ten questions for a level, the same every time for the same seed: [{ item, mode, choices }].
 * Levels 1 and 2 ask "fiction or nonfiction?" (mode "sort") about four to six fiction items and the rest
 * nonfiction. Level 3 asks for the genre (mode "genre") of ten items from ten different genres: five fiction
 * genres, four nonfiction genres and one more. `choices` are the answers offered, in a fixed order.
 */
export function buildRound(level, seed) {
  const random = seededRandom(seed);
  if (level === 3) {
    const ofKind = kind => shuffled(GENRES.filter(g => g.kind === kind), random).map(g => g.id);
    const fiction = ofKind('fiction'), nonfiction = ofKind('nonfiction'), either = ofKind('either');
    const rest = shuffled([...fiction.slice(5), ...nonfiction.slice(4), ...either], random);
    const genres = [...fiction.slice(0, 5), ...nonfiction.slice(0, 4), rest[0]];
    const chosen = genres.map(id => shuffled(itemsFor(3, id), random)[0]);
    return shuffled(chosen, random).map(item => ({ item, mode: 'genre', choices: GENRE_ORDER.filter(id => item.options.includes(id)) }));
  }
  const fiction = 4 + Math.floor(random() * 3);
  const chosen = [
    ...shuffled(itemsFor(level, 'fiction'), random).slice(0, fiction),
    ...shuffled(itemsFor(level, 'nonfiction'), random).slice(0, ROUND_LENGTH - fiction),
  ];
  return shuffled(chosen, random).map(item => ({ item, mode: 'sort', choices: ['fiction', 'nonfiction'] }));
}

/** Is the answer right? The answer is 'fiction' or 'nonfiction' for "sort" and a genre id for "genre". */
export function checkAnswer(question, answer) {
  return question.choices.includes(answer) && answer === answerOf(question.item);
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
  if (correct === total) return 'A perfect round. You know your way around both sides of the library.';
  if (correct >= total * 0.8) return 'Great work. Look over the ones you missed, then try for a perfect round.';
  if (correct >= total * 0.5) return 'Good start. Read the explanations for the ones you missed and play again.';
  return 'Keep going. Ask each time: did the author make this up, or is it about the real world?';
}
