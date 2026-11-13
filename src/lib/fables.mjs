// Fables Read-Along: the ten fables and everything asked about them. Pure data and functions, shared by the
// fable pages, the hub, the printable worksheet, the answer key and the tests.
//
// The fables are traditional ones credited to Aesop, retold for this site in our own words. No published
// translation is quoted. Each keeps the traditional plot and the traditional moral. Two are told gently, and
// the hub page says so: the ant shares her food, and the goose runs away.
//
// How a fable is written down here, so that it is easy to check:
//   - `story` is a list of paragraphs, and each paragraph is a list of sentences, one per line. The read-aloud
//     player speaks one sentence at a time, so the sentences are written out and never guessed by a rule.
//   - `moral` is the last sentence of the fable. It is typed once and added to the end of the text.
//   - A question lists the RIGHT answer first and then the two wrong ones. The order the choices are shown in
//     is worked out by rightPosition(), so the right answer is not always choice A.
import { ALOUD_WPM, readingSeconds } from './readability.mjs';

export const DEFINITIONS = {
  fable: 'A fable is a very short story that teaches a lesson. Its characters are often animals that talk and act like people.',
  moral: 'A moral is the lesson a story teaches about how to act or how to treat others.',
};

/** Questions on every fable page: four about the story and one about the moral. */
export const STORY_QUESTIONS = 4;
export const QUIZ_LENGTH = STORY_QUESTIONS + 1;
/** The same two numbers as words, for sentences on the pages (a test keeps them in step). */
export const STORY_QUESTIONS_WORD = 'four';
export const QUIZ_LENGTH_WORD = 'five';
export const LETTERS = ['A', 'B', 'C'];
export const MORAL_QUESTION = 'What is the moral of this fable?';

const word = (text, meaning) => ({ word: text, meaning });
// q(question, the right answer, [two wrong answers], a one-line explanation)
const q = (question, right, wrong, why) => ({ kind: 'story', q: question, right, wrong, why });
// moralQ(the moral in other words, [two lessons the fable does not teach], a one-line explanation)
const moralQ = (right, wrong, why) => ({ kind: 'moral', q: MORAL_QUESTION, right, wrong, why });

const BANK = [
  {
    slug: 'tortoise-and-hare',
    title: 'The Tortoise and the Hare',
    theme: 'Keeping at it',
    summary: 'A speedy hare is so sure of winning a race that he stops for a nap, and a slow tortoise walks past him.',
    characters: ['the hare', 'the tortoise'],
    story: [
      [
        'A hare was very proud of how fast he could run.',
        'He liked to laugh at the tortoise, who walked slowly on his short legs.',
        '“You are so slow,” said the hare.',
        '“Do you ever get anywhere?”',
      ],
      [
        '“I get where I am going,” said the tortoise.',
        '“Let us have a race, and you will see.”',
        'The hare thought this was a great joke, so he agreed.',
      ],
      [
        'The race began, and the hare shot ahead.',
        'Soon he was so far in front that he could not even see the tortoise.',
        '“I have plenty of time,” he thought.',
        'He lay down under a shady tree for a short rest, and he fell fast asleep.',
      ],
      [
        'The tortoise did not stop.',
        'Step by step, he plodded along the path.',
        'He passed the sleeping hare and kept on going.',
      ],
      [
        'When the hare woke up, the sun was low in the sky.',
        'He ran as fast as he could, but it was too late.',
        'The tortoise had already crossed the finish line.',
      ],
    ],
    moral: 'Slow and steady wins the race.',
    vocabulary: [
      word('proud', 'very pleased with yourself about something you can do'),
      word('shady', 'out of the bright sun'),
      word('plodded', 'walked slowly, with heavy steps'),
      word('steady', 'going on at the same pace, without stopping'),
    ],
    questions: [
      q('Who said that the two animals should have a race?', 'The tortoise.', ['The hare.', 'Nobody. The race began by accident.'], 'The tortoise said, “Let us have a race, and you will see.”'),
      q('What did the hare do when he was far ahead?', 'He lay down under a tree and fell asleep.', ['He ran back to find the tortoise.', 'He stopped to eat some grass.'], 'He lay down under a shady tree for a short rest, and he fell fast asleep.'),
      q('Why did the hare think it was safe to rest?', 'He was so far ahead that he felt sure he would still win.', ['He had hurt his leg.', 'The tortoise had asked him to wait.'], 'He could not even see the tortoise behind him, so he thought, “I have plenty of time.”'),
      q('How did the tortoise win the race?', 'He kept on walking and never stopped.', ['He found a shorter path.', 'He ran faster than the hare at the end.'], 'The tortoise did not stop. Step by step, he passed the sleeping hare and reached the finish line.'),
      moralQ('If you keep working steadily, you can do better than someone who is quick but stops trying.', ['The fastest runner always wins in the end.', 'It is unkind to race against your friends.'], 'The slow tortoise won because he kept going. The fast hare lost because he stopped.'),
    ],
    discussion: 'Think of something you learned a little at a time, such as riding a bike or reading. How did keeping at it help you?',
  },
  {
    slug: 'lion-and-mouse',
    title: 'The Lion and the Mouse',
    theme: 'Kindness',
    summary: 'A lion lets a little mouse go free, and later the mouse saves the lion from a hunter’s net.',
    characters: ['the lion', 'the mouse'],
    story: [
      [
        'A lion lay asleep in the shade.',
        'A little mouse ran across his paw by mistake and woke him up.',
        'The lion caught the mouse under his big paw and roared.',
      ],
      [
        '“Please let me go,” squeaked the mouse.',
        '“If you do, I will help you one day.”',
        'The lion laughed.',
        'How could a tiny mouse ever help the king of the animals?',
        'Still, the idea made him smile, so he lifted his paw and let her go.',
      ],
      [
        'A few days later, the lion walked into a hunter’s net.',
        'He pulled and twisted, but the strong ropes held him tight.',
        'He roared so loudly that the whole forest could hear.',
      ],
      [
        'The mouse knew that roar.',
        'She ran to the lion and began to chew the ropes with her sharp teeth.',
        'She chewed and chewed.',
        'One rope broke, and then another, until the lion was free.',
      ],
      [
        '“You laughed at me,” said the mouse, “but now you see that even a mouse can help a lion.”',
      ],
    ],
    moral: 'A kind act is never wasted, and even a small friend can be a great help.',
    vocabulary: [
      word('squeaked', 'spoke in a small, high voice'),
      word('net', 'a trap made of ropes tied together, with holes between them'),
      word('twisted', 'turned his body one way and then the other'),
      word('chew', 'to bite something again and again'),
    ],
    questions: [
      q('How did the mouse wake the lion?', 'She ran across his paw by mistake.', ['She squeaked in his ear.', 'She pulled his tail.'], 'A little mouse ran across his paw by mistake and woke him up.'),
      q('Why did the lion laugh at the mouse’s promise?', 'He did not believe that such a small animal could ever help him.', ['The mouse had told him a joke.', 'He was glad to have a new friend.'], 'The story asks, “How could a tiny mouse ever help the king of the animals?” That is what the lion was thinking.'),
      q('How did the mouse know that the lion was in trouble?', 'She heard his loud roar and knew it was his.', ['A bird flew to tell her.', 'She saw the hunter carrying the net.'], 'The lion roared so loudly that the whole forest could hear, and the mouse knew that roar.'),
      q('How did the mouse set the lion free?', 'She chewed through the ropes with her teeth.', ['She untied the knots with her paws.', 'She called the hunter to open the net.'], 'She chewed and chewed. One rope broke, and then another, until the lion was free.'),
      moralQ('Being kind is worth it, and someone small can still give great help.', ['Big animals should never trust small ones.', 'It is dangerous to fall asleep in the forest.'], 'The lion was kind to the mouse, and the small mouse was the one who saved him.'),
    ],
    discussion: 'Tell about a time when someone small or young helped with something big. What did they do?',
  },
  {
    slug: 'boy-who-cried-wolf',
    title: 'The Boy Who Cried Wolf',
    theme: 'Honesty',
    summary: 'A bored boy tricks his village by shouting “Wolf!” when there is none, so nobody comes when a real wolf appears.',
    characters: ['the boy', 'the villagers', 'the wolf'],
    story: [
      [
        'A boy looked after the village sheep on a hill.',
        'All day he sat alone, and he grew bored.',
        'One afternoon he thought of a trick.',
      ],
      [
        '“Wolf! Wolf!” he shouted.',
        '“A wolf is after the sheep!”',
        'The villagers dropped their work and ran up the hill to help.',
        'There was no wolf.',
        'The boy laughed at their worried faces, and they walked back down, shaking their heads.',
      ],
      [
        'The next day he played the same trick.',
        'Again the villagers came running, and again they found no wolf.',
      ],
      [
        'Then, one evening, a real wolf crept out of the woods.',
        'The frightened boy shouted as loudly as he could.',
        '“Wolf! Please come! This time it is real!”',
        'Down in the village, the people heard him.',
        '“He is only fooling us again,” they said, and nobody came.',
      ],
      [
        'The wolf chased the sheep far away over the hill.',
        'The boy walked home alone, very sorry for his tricks.',
      ],
    ],
    moral: 'If you tell lies, people will not believe you even when you tell the truth.',
    vocabulary: [
      word('villagers', 'the people who live in a village'),
      word('bored', 'unhappy because there is nothing interesting to do'),
      word('trick', 'something you do to fool people'),
      word('crept', 'moved slowly and quietly'),
    ],
    questions: [
      q('What was the boy’s job?', 'To look after the village sheep.', ['To carry water up the hill.', 'To chase wolves out of the woods.'], 'The story begins, “A boy looked after the village sheep on a hill.”'),
      q('Why did the boy shout “Wolf!” the first time?', 'He was bored and wanted to play a trick.', ['He saw a wolf near the sheep.', 'He wanted the villagers to bring him food.'], 'He sat alone all day and grew bored, so he thought of a trick. There was no wolf.'),
      q('What did the villagers find the first two times they ran up the hill?', 'No wolf at all.', ['A wolf running away.', 'A wolf hiding behind a rock.'], 'The first time, “There was no wolf.” The second time, “again they found no wolf.”'),
      q('Why did nobody come when the real wolf appeared?', 'The villagers thought the boy was tricking them again.', ['The villagers could not hear him.', 'The villagers were all asleep.'], 'The people heard him, but they said, “He is only fooling us again.”'),
      moralQ('If you often lie, people stop trusting you, even when you are telling the truth.', ['Looking after sheep is a job for grown-ups.', 'You should always shout loudly when you need help.'], 'The boy lied twice, so the villagers did not believe him the one time he told the truth.'),
    ],
    discussion: 'Why is it hard to trust someone who has tricked you before? What could the boy do to win back the villagers’ trust?',
  },
  {
    slug: 'ant-and-grasshopper',
    title: 'The Ant and the Grasshopper',
    theme: 'Planning ahead',
    summary: 'A grasshopper sings all summer while an ant stores food, and when winter comes he has to ask her for help.',
    characters: ['the ant', 'the grasshopper'],
    story: [
      [
        'All summer long, a grasshopper sat in the sun and sang.',
        'Nearby, an ant walked back and forth, carrying seeds to her nest.',
      ],
      [
        '“Come and sing with me,” said the grasshopper.',
        '“Why work so hard on such a fine day?”',
        '“I am storing food for the winter,” said the ant.',
        '“You should do the same.”',
        '“Winter is far away,” laughed the grasshopper, and he went on singing.',
      ],
      [
        'Then winter came.',
        'Snow covered the fields, and there was nothing left to eat.',
        'Cold and hungry, the grasshopper knocked on the ant’s door.',
      ],
      [
        '“Please, may I have a little food?” he asked.',
        '“I sang all summer, and I saved nothing.”',
      ],
      [
        'The ant looked at her full storeroom and then at the shivering grasshopper.',
        '“Come in, and I will share my food with you,” she said.',
        '“But next summer, gather your food first and sing afterward.”',
        'The grasshopper thanked her, and he never forgot what he had learned.',
      ],
    ],
    moral: 'It is wise to get ready today for what you will need tomorrow.',
    vocabulary: [
      word('storing', 'putting something away to use later'),
      word('shivering', 'shaking because of the cold'),
      word('gather', 'to collect things and bring them together'),
      word('wise', 'showing good sense'),
    ],
    questions: [
      q('What did the ant do all summer?', 'She carried seeds to her nest.', ['She sang in the sun.', 'She slept in her nest.'], 'The ant walked back and forth, carrying seeds to her nest.'),
      q('Why did the grasshopper not store any food?', 'He thought winter was far away, so he went on singing.', ['He could not find any seeds.', 'The ant had taken all the food.'], 'He laughed, “Winter is far away,” and he went on singing.'),
      q('Why did the grasshopper knock on the ant’s door?', 'He was cold and hungry and had no food.', ['He wanted to teach the ant a song.', 'He had brought some food to share.'], 'Snow covered the fields and there was nothing left to eat. He was cold and hungry, and he had saved nothing.'),
      q('In this telling of the fable, what did the ant do when the grasshopper asked for food?', 'She let him in and shared her food.', ['She shut the door and sent him away.', 'She told him to come back in the spring.'], 'The ant said, “Come in, and I will share my food with you.”'),
      moralQ('Do the work now, so that you are ready for harder times later.', ['Singing is a waste of time.', 'Winter is the best season of the year.'], 'The ant had food in winter because she got ready in summer. The grasshopper did not get ready and went hungry.'),
    ],
    discussion: 'What is one thing you can do today that will help you next week or next month?',
  },
  {
    slug: 'fox-and-grapes',
    title: 'The Fox and the Grapes',
    theme: 'Making excuses',
    summary: 'A hungry fox cannot reach a bunch of grapes, so he walks away saying that they must be sour.',
    characters: ['the fox'],
    story: [
      [
        'One hot afternoon, a hungry fox walked through a garden.',
        'High above him, a bunch of purple grapes hung from a vine.',
        'They looked round, ripe and full of juice.',
        '“Those grapes are just what I want,” said the fox.',
      ],
      [
        'He stood on his back legs and stretched, but he could not reach them.',
        'He took a few steps back, ran and jumped.',
        'His teeth snapped shut on nothing but air.',
        'He tried again and again.',
        'Each time, the grapes stayed just out of reach.',
      ],
      [
        'At last the fox was hot, tired and still hungry.',
        'He looked up at the grapes one more time.',
        'Then he lifted his nose in the air and walked away.',
      ],
      [
        '“I never wanted those grapes anyway,” he said.',
        '“I am sure they are sour.”',
      ],
    ],
    moral: 'It is easy to say you do not want something when you cannot have it.',
    vocabulary: [
      word('vine', 'a climbing plant with long stems; grapes grow on vines'),
      word('ripe', 'fully grown and ready to eat'),
      word('stretched', 'reached up as far as he could'),
      word('sour', 'having a sharp taste, like a lemon'),
    ],
    questions: [
      q('Where were the grapes?', 'High up on a vine.', ['On the ground under a tree.', 'In a basket in the garden.'], 'High above the fox, a bunch of purple grapes hung from a vine.'),
      q('How did the fox try to get the grapes?', 'He stretched and jumped, again and again.', ['He climbed up the vine.', 'He shook the vine until the grapes fell.'], 'He stood on his back legs and stretched. Then he ran and jumped, again and again.'),
      q('Did the fox ever taste the grapes?', 'No. He never reached them.', ['Yes. He ate one, and it was sour.', 'Yes. He ate the whole bunch.'], 'Each time he jumped, the grapes stayed just out of reach, and then he walked away.'),
      q('Why did the fox say that the grapes were sour?', 'He could not get them, so he pretended he did not want them.', ['He had tasted grapes from that vine before.', 'Another animal had told him so.'], 'He wanted the grapes at the start. He called them sour only after he failed to reach them.'),
      moralQ('People sometimes pretend that a thing is no good, just because they cannot have it.', ['Grapes that grow high up are always sour.', 'You should never pick fruit in a garden.'], 'The fox never tasted the grapes. Saying they were sour made it easier for him to give up.'),
    ],
    discussion: 'The fox said the grapes were sour, but he never tasted one. What could he have said that was true?',
  },
  {
    slug: 'crow-and-pitcher',
    title: 'The Crow and the Pitcher',
    theme: 'Solving problems',
    summary: 'A thirsty crow cannot reach the water in a tall pitcher until she drops in pebbles to make it rise.',
    characters: ['the crow'],
    story: [
      [
        'It had not rained for many weeks, and a crow was very thirsty.',
        'She flew over the dry fields, looking for water.',
        'At last she saw a tall pitcher standing in a garden.',
      ],
      [
        'The crow flew down and looked inside.',
        'There was a little water at the bottom.',
        'She pushed her beak into the pitcher, but the neck was narrow and the water was too low.',
        'She could not reach a single drop.',
      ],
      [
        'She tried to tip the pitcher over, but it was too heavy.',
        'The crow did not give up.',
        'She stood still and thought.',
      ],
      [
        'Then she saw some pebbles on the ground.',
        'She picked one up in her beak and dropped it into the pitcher.',
        'The water rose a tiny bit.',
        'She dropped in another pebble, and then another.',
      ],
      [
        'Pebble by pebble, the water climbed higher.',
        'At last it was high enough to reach, and the crow drank until she was no longer thirsty.',
      ],
    ],
    moral: 'Little by little, a clever plan can solve a hard problem.',
    vocabulary: [
      word('pitcher', 'a tall jug for holding water'),
      word('narrow', 'not wide'),
      word('pebbles', 'small, smooth stones'),
      word('rose', 'went up'),
    ],
    questions: [
      q('Why was the crow so thirsty?', 'It had not rained for many weeks.', ['She had flown across the sea.', 'She had been singing all day.'], 'The story begins, “It had not rained for many weeks, and a crow was very thirsty.”'),
      q('Why could the crow not drink from the pitcher at first?', 'The water was too low for her beak to reach.', ['The pitcher was empty.', 'The pitcher had a lid on it.'], 'The neck was narrow and the water was too low. She could not reach a single drop.'),
      q('What happened each time a pebble went into the pitcher?', 'The water rose a little.', ['The pitcher cracked a little.', 'Some water spilled out.'], 'After the first pebble, “The water rose a tiny bit.” Pebble by pebble, it climbed higher.'),
      q('What does the crow’s plan show about her?', 'She thinks carefully and does not give up.', ['She is strong enough to tip a heavy pitcher.', 'She waits for someone else to help her.'], 'When she could not tip the pitcher, she did not give up. She stood still, thought, and found another way.'),
      moralQ('Thinking carefully and working bit by bit can solve a hard problem.', ['You should always carry water with you.', 'Big birds are smarter than small birds.'], 'The crow could not reach the water by force. A clever idea and many small pebbles did the job.'),
    ],
    discussion: 'Tell about a problem you solved by trying a new idea. What did you try first that did not work?',
  },
  {
    slug: 'town-mouse-and-country-mouse',
    title: 'The Town Mouse and the Country Mouse',
    theme: 'Feeling safe',
    summary: 'A country mouse visits her cousin in town, where the food is rich but danger is never far away.',
    characters: ['the town mouse', 'the country mouse', 'the dog'],
    story: [
      [
        'A town mouse went to visit his cousin in the country.',
        'The country mouse lived in a snug hole under a hedge.',
        'For supper she set out the best food she had: a few beans, some seeds and a crust of bread.',
      ],
      [
        'The town mouse nibbled a little and shook his head.',
        '“How can you live on such plain food?” he asked.',
        '“Come home with me, and you will eat like a king.”',
      ],
      [
        'So the two mice traveled to the town.',
        'That night they crept into a grand dining room.',
        'The table was covered with what was left of a feast: cake, cheese and sweet fruit.',
        'The country mouse had never tasted anything so good.',
      ],
      [
        'Suddenly the door flew open, and a big dog ran in, barking.',
        'The mice raced to a hole in the wall and hid there, shaking.',
      ],
      [
        'When all was quiet, the country mouse said goodbye.',
        '“Your food is fine, cousin, but I am going home,” she said.',
        '“I would rather eat my plain seeds in peace than eat your cake in fear.”',
      ],
    ],
    moral: 'A simple life that is safe is better than a rich life full of fear.',
    vocabulary: [
      word('snug', 'small, warm and comfortable'),
      word('nibbled', 'ate with very small bites'),
      word('plain', 'simple, with nothing fancy about it'),
      word('feast', 'a large, special meal'),
    ],
    questions: [
      q('What did the country mouse set out for supper?', 'Beans, seeds and a crust of bread.', ['Cake, cheese and sweet fruit.', 'Nothing at all.'], 'She set out the best food she had: a few beans, some seeds and a crust of bread.'),
      q('Why did the town mouse ask his cousin to come to the town?', 'He thought her food was too plain and wanted to show her better food.', ['He was afraid to travel home alone.', 'He wanted her to meet the dog.'], 'He asked, “How can you live on such plain food?” and promised that she would eat like a king.'),
      q('What frightened the mice in the dining room?', 'A big dog ran in, barking.', ['A cat jumped onto the table.', 'A cook shouted at them.'], 'Suddenly the door flew open, and a big dog ran in, barking.'),
      q('Why did the country mouse decide to go home?', 'She would rather be safe with plain food than afraid with fine food.', ['She did not like the taste of the cake.', 'The town mouse told her to leave.'], 'She said, “I would rather eat my plain seeds in peace than eat your cake in fear.”'),
      moralQ('It is better to have a little and feel safe than to have a lot and live in fear.', ['Town food always tastes better than country food.', 'You should never visit your cousins.'], 'The town had better food, but the country mouse chose her simple home because she was safe there.'),
    ],
    discussion: 'Which home would you choose: the quiet hole under the hedge, or the house with fine food and a dog? Give your reasons.',
  },
  {
    slug: 'north-wind-and-sun',
    title: 'The North Wind and the Sun',
    theme: 'Gentleness',
    summary: 'The North Wind and the Sun each try to make a traveler take off his cloak, to see which of them is stronger.',
    characters: ['the North Wind', 'the Sun', 'the traveler'],
    story: [
      [
        'The North Wind and the Sun argued about which of them was stronger.',
        'While they argued, a traveler came along the road, wrapped in a warm cloak.',
      ],
      [
        '“Let us settle this,” said the Sun.',
        '“Whoever can make that traveler take off his cloak is the stronger one.”',
        '“That will be easy, so I will go first,” said the North Wind.',
      ],
      [
        'The North Wind blew with all his might.',
        'Leaves flew from the trees, and dust whirled along the road.',
        'But the harder the wind blew, the tighter the traveler held his cloak around him.',
        'At last the North Wind was out of breath, and he gave up.',
      ],
      [
        'Then it was the Sun’s turn.',
        'The Sun came out from behind a cloud and shone gently.',
        'The air grew warm, and the traveler loosened his cloak.',
        'The Sun shone a little more, and the traveler began to feel hot.',
        'Soon he took off his cloak and sat down to rest in the shade of a tree.',
      ],
      [
        'The North Wind had to agree that the Sun had won.',
      ],
    ],
    moral: 'Gentleness and kindness often work better than force.',
    vocabulary: [
      word('traveler', 'a person who is on a journey'),
      word('cloak', 'a long, loose coat without sleeves'),
      word('might', 'strength'),
      word('loosened', 'made less tight'),
    ],
    questions: [
      q('What were the North Wind and the Sun arguing about?', 'Which of them was stronger.', ['Which of them was older.', 'Which of them was kinder.'], 'The story begins, “The North Wind and the Sun argued about which of them was stronger.”'),
      q('How did they agree to choose the winner?', 'The one who made the traveler take off his cloak would win.', ['The one who blew the most leaves off the trees would win.', 'The one who made the traveler walk faster would win.'], 'The Sun said, “Whoever can make that traveler take off his cloak is the stronger one.”'),
      q('What did the traveler do when the wind blew harder?', 'He held his cloak more tightly around him.', ['He took off his cloak.', 'He ran back home.'], 'The harder the wind blew, the tighter the traveler held his cloak around him.'),
      q('Why did the traveler take off his cloak in the end?', 'The warm sunshine made him feel hot.', ['The wind blew it off his back.', 'The Sun asked him to take it off.'], 'The Sun shone, the air grew warm, and the traveler began to feel hot. Soon he took off his cloak.'),
      moralQ('Being gentle can get more done than using force.', ['The wind is always weaker than the sun.', 'Travelers should always wear a cloak.'], 'The Wind’s force only made the traveler hold on tighter. The Sun’s gentle warmth did what force could not.'),
    ],
    discussion: 'Think of a time when asking kindly worked better than shouting or pushing. What happened?',
  },
  {
    slug: 'dog-and-his-reflection',
    title: 'The Dog and His Reflection',
    theme: 'Being content',
    summary: 'A dog carrying a bone sees his own reflection in a stream and loses his bone by trying to grab a second one.',
    characters: ['the dog'],
    story: [
      [
        'A dog found a big, juicy bone.',
        'He held it tightly in his mouth and trotted home to enjoy it in peace.',
      ],
      [
        'On the way, he came to a narrow bridge over a quiet stream.',
        'As he crossed, he looked down into the water.',
        'There he saw a dog looking up at him, and that dog had a bone too.',
      ],
      [
        'The dog did not know that he was looking at himself.',
        'The still water was showing him his own reflection, like a mirror.',
        '“That bone looks even bigger than mine,” he thought.',
        '“I want it as well.”',
      ],
      [
        'He opened his mouth to snap at the other bone.',
        'Splash!',
        'His own bone fell into the stream and sank out of sight.',
      ],
      [
        'The dog stared at the water.',
        'The dog in the stream had no bone now either.',
        'He walked home with nothing at all.',
      ],
    ],
    moral: 'If you are greedy for more, you may lose what you already have.',
    vocabulary: [
      word('trotted', 'ran with short, quick steps'),
      word('reflection', 'the picture you see in a mirror or in still water'),
      word('snap', 'to bite at something quickly'),
      word('greedy', 'wanting more than you need'),
    ],
    questions: [
      q('What was the dog carrying home?', 'A big, juicy bone.', ['A stick from the woods.', 'A ball.'], 'The story begins, “A dog found a big, juicy bone.” He held it in his mouth and trotted home.'),
      q('What did the dog really see in the water?', 'His own reflection.', ['Another dog swimming in the stream.', 'A fish with a bone.'], 'The dog did not know that he was looking at himself. The still water was showing him his own reflection.'),
      q('Why did the dog open his mouth?', 'He wanted to grab the bone he saw in the water.', ['He wanted a drink from the stream.', 'He wanted to bark at a friend.'], 'He thought, “I want it as well,” and he opened his mouth to snap at the other bone.'),
      q('What happened to the dog’s own bone?', 'It fell into the stream and sank.', ['Another dog ran off with it.', 'He buried it beside the bridge.'], 'His own bone fell into the stream and sank out of sight.'),
      moralQ('Wanting more than you need can make you lose what you have.', ['You should never carry food across a bridge.', 'Dogs should stay away from water.'], 'The dog had a good bone. He lost it only because he tried to get a second one.'),
    ],
    discussion: 'The dog already had a good bone. Why do you think he wanted the other one too? How do you know when you have enough?',
  },
  {
    slug: 'goose-and-golden-eggs',
    title: 'The Goose That Laid the Golden Eggs',
    theme: 'Greed',
    summary: 'A farmer whose goose lays one golden egg a day wants all the gold at once, and he ends up with none.',
    characters: ['the farmer', 'the goose'],
    story: [
      [
        'A farmer had a goose.',
        'One morning he found a shining yellow egg in her nest.',
        'It was as heavy as a stone.',
        'He looked closely and could hardly believe his eyes, because the egg was made of gold.',
      ],
      [
        'Every morning after that, the goose laid one more golden egg.',
        'The farmer sold the eggs, and little by little he grew rich.',
      ],
      [
        'But the richer he grew, the more he wanted.',
        '“One egg a day is too slow,” he grumbled.',
        '“I want all of the gold at once.”',
      ],
      [
        'So one morning he did not wait for the egg.',
        'He rushed into the shed, shouting, and tore the nest apart to look for more gold.',
        'There was nothing in the straw.',
        'The frightened goose flapped her wings, ran out of the door and never came back.',
      ],
      [
        'Now the farmer had no goose and no more golden eggs.',
        '“I had a treasure every day,” he said, “and I lost it because I could not wait.”',
      ],
    ],
    moral: 'Those who are greedy for everything at once can lose all they have.',
    vocabulary: [
      word('grumbled', 'complained in a low, unhappy voice'),
      word('tore', 'pulled something to pieces'),
      word('frightened', 'afraid'),
      word('treasure', 'something that is worth a great deal'),
    ],
    questions: [
      q('What was special about the goose’s eggs?', 'They were made of gold.', ['They were as big as stones.', 'They hatched in one day.'], 'The farmer looked closely and saw that the egg was made of gold.'),
      q('How often did the goose lay a golden egg?', 'One every morning.', ['One every week.', 'Ten every day.'], 'Every morning after that, the goose laid one more golden egg.'),
      q('Why did the farmer tear the nest apart?', 'He wanted all the gold at once and would not wait.', ['He wanted to build the goose a better nest.', 'He was looking for a coin he had dropped.'], 'He grumbled, “One egg a day is too slow. I want all of the gold at once.”'),
      q('What did the goose do at the end?', 'She was frightened, ran away and never came back.', ['She laid ten eggs in one day.', 'She stayed and kept laying golden eggs.'], 'The frightened goose flapped her wings, ran out of the door and never came back.'),
      moralQ('Greedy people who cannot wait may end up with nothing.', ['Geese should not be kept on farms.', 'Gold is not worth very much.'], 'One golden egg a day was not enough for the farmer. By grabbing for more, he lost the goose and every egg to come.'),
    ],
    discussion: 'The farmer got one golden egg every day. Why was that not enough for him? What would you have done?',
  },
];

/** The ten fables in reading order, each with its number and its full text (`paragraphs` ends with the moral). */
export const FABLES = BANK.map((fable, i) => ({ ...fable, number: i + 1, paragraphs: [...fable.story, [fable.moral]] }));

// Everyday sayings that come from fables on this site.
export const SAYINGS = [
  { fable: 'tortoise-and-hare', saying: 'slow and steady wins the race', meaning: 'Keep working at a steady pace and you will get there.' },
  { fable: 'boy-who-cried-wolf', saying: 'to cry wolf', meaning: 'To call for help, or to warn people, when nothing is wrong.' },
  { fable: 'fox-and-grapes', saying: 'sour grapes', meaning: 'Pretending that something is no good because you cannot have it.' },
];

export const fableBySlug = slug => FABLES.find(fable => fable.slug === slug);
/** The fable after this one. After the last comes the first, so every page has a "next". */
export const nextFable = fable => FABLES[fable.number % FABLES.length];

/* ------------------------------------------------------------------- text */

/** Every sentence of a fable in reading order: [{ index, paragraph, text, moral }]. The last one is the moral. */
export function sentences(fable) {
  const list = [];
  fable.paragraphs.forEach((paragraph, p) => {
    for (const text of paragraph) list.push({ index: list.length, paragraph: p, text, moral: p === fable.paragraphs.length - 1 });
  });
  return list;
}

/** The whole fable as plain text, with a blank line between paragraphs. */
export const storyText = fable => fable.paragraphs.map(paragraph => paragraph.join(' ')).join('\n\n');

const WORD = /[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu;
/** The words of a piece of text with their positions: [{ text, start, end }]. */
export function wordRanges(text) {
  return [...String(text).matchAll(WORD)].map(m => ({ text: m[0], start: m.index, end: m.index + m[0].length }));
}

/**
 * Which word is being spoken, given the character position a speech `boundary` event reports.
 * Returns the index in `ranges` of the last word that starts at or before the position, or -1 for none.
 */
export function wordIndexAt(ranges, charIndex) {
  if (!ranges.length || !Number.isFinite(charIndex) || charIndex < 0) return -1;
  // A position past the end of the last word (the closing punctuation) is not a word.
  if (charIndex >= ranges[ranges.length - 1].end) return -1;
  // A position before the first word (an opening quotation mark) means the first word is next.
  let found = 0;
  for (let i = 1; i < ranges.length && ranges[i].start <= charIndex; i++) found = i;
  return found;
}

export const wordCount = fable => wordRanges(storyText(fable)).length;

/** Seconds to read the fable aloud at the speed the site assumes everywhere (an assumption, not a measurement). */
export const readAloudSeconds = fable => readingSeconds(wordCount(fable), ALOUD_WPM);
// The time in half minutes, never less than one minute.
const halfMinutes = fable => Math.max(2, Math.round(readAloudSeconds(fable) / 30));
/** "about 1 minute", "about 1½ minutes". */
export function minutesLabel(fable) {
  const halves = halfMinutes(fable);
  return `about ${Math.floor(halves / 2)}${halves % 2 ? '½' : ''} minute${halves === 2 ? '' : 's'}`;
}
/** The same time as an ISO 8601 duration for structured data: "PT1M30S". */
export function minutesIso(fable) {
  const halves = halfMinutes(fable);
  return `PT${Math.floor(halves / 2)}M${halves % 2 ? '30S' : ''}`;
}

/* -------------------------------------------------------------- questions */

/**
 * Where the right answer is shown among the three choices (0, 1 or 2). It depends only on the fable and the
 * question, so the page, the printed sheet and the answer key always agree. Within one fable the five
 * questions use A, B and C in turn, starting from a different letter and in a different order on each fable.
 */
export function rightPosition(fable, index) {
  const step = fable.number % 2 === 0 ? 2 : 1;
  return (fable.number + index * step + Math.floor(index / LETTERS.length)) % LETTERS.length;
}

/** The questions of a fable as they are shown: [{ number, kind, q, choices, answer, why }]. */
export function questions(fable) {
  return fable.questions.map((item, index) => {
    const answer = rightPosition(fable, index);
    const choices = [...item.wrong];
    choices.splice(answer, 0, item.right);
    return { number: index + 1, kind: item.kind, q: item.q, choices, answer, right: item.right, why: item.why };
  });
}

export const checkAnswer = (fable, index, choice) => questions(fable)[index]?.answer === choice;
/** The letter of the right answer to each question, in order: ['B', 'A', …]. */
export const answerLetters = fable => questions(fable).map(question => LETTERS[question.answer]);

/** What the page says after an answer. */
export function feedback(question, choice) {
  return choice === question.answer
    ? `Correct! ${question.why}`
    : `Not quite. The answer is ${LETTERS[question.answer]}. ${question.why}`;
}

/** results: one true or false per question answered. */
export function scoreQuiz(results) {
  return { correct: results.filter(Boolean).length, answered: results.length, total: QUIZ_LENGTH, done: results.length >= QUIZ_LENGTH };
}

export function quizMessage(score) {
  if (score.correct === score.total) return 'Every answer right. You read this fable very carefully.';
  if (score.correct >= score.total - 1) return 'Nearly all right. Look back at the one you missed and find the sentence that answers it.';
  if (score.correct >= 2) return 'A good start. Listen to the fable once more, then try the questions again.';
  return 'This one was tricky. Read or listen to the fable again, slowly, and then try the questions again.';
}

/* ------------------------------------------------------------------ pages */

export const fablePath = fable => `/tools/fables/${fable.slug}/`;

/**
 * A title cut into two lines of about the same length. On a phone the heading breaks there, at a fixed
 * place, so it cannot re-wrap (and push the page down) when the web font arrives.
 */
export function titleLines(title) {
  const words = title.split(' ');
  let best = 1;
  const uneven = at => Math.abs(words.slice(0, at).join(' ').length - words.slice(at).join(' ').length);
  for (let at = 2; at < words.length; at++) if (uneven(at) < uneven(best)) best = at;
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}

/** The page title: the long form where it fits a search result, a shorter one for the longest names. */
export function pageTitle(fable) {
  const full = `${fable.title}: Read-Along Fable with Questions`;
  return full.length <= 60 ? full : `${fable.title}: Read-Along Fable`;
}

export function pageDescription(fable) {
  return `Read along with ${fable.title}, an Aesop fable for grades 2–5: hear it read aloud with highlighted text, then answer five questions.`;
}
