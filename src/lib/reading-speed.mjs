// The Reading Speed Test's passages and rules: pure data and functions, shared by the test, the page, the
// printable fluency record sheet, the answer key and the tests.
//
// Every passage was written for this site. The stories are original, or old fables retold in new words.
// Every statement in an informational passage is meant to be true, timeless and uncontroversial: school
// science and nature. If you add a passage, keep to those rules, and check its grade with the Reading Level
// Checker's model (tests/reading-speed.test.mjs does).
//
// In each question the FIRST option is the right answer. The test shows the options in a mixed order
// (see questionsFor), so the position gives nothing away.
import { analyze, tokenizeWords } from './readability.mjs';
import { seededRandom } from './fact-opinion.mjs';

/** `words` is the length a passage may have; `grade` is the band its readability grade must fall in. */
export const LEVELS = [
  { id: 1, name: 'Level 1', grades: 'Grades 2–3', ages: 'ages 7–9', words: [150, 200], grade: [1.5, 4.5], about: 'Short passages with short sentences.' },
  { id: 2, name: 'Level 2', grades: 'Grades 4–5', ages: 'ages 9–11', words: [200, 300], grade: [3.5, 6.5], about: 'Longer passages with more to remember.' },
  { id: 3, name: 'Level 3', grades: 'Grades 6–8', ages: 'ages 11–14', words: [300, 400], grade: [5.5, 9.5], about: 'Full-length passages with longer sentences.' },
];

export const MODES = [
  { id: 'silent', name: 'Silently', label: 'silent reading', about: 'Read in your head, the way you read a book to yourself.' },
  { id: 'aloud', name: 'Aloud', label: 'reading aloud', about: 'Read out loud in a clear voice, as if someone is listening.' },
];

export const KINDS = { story: 'Story', info: 'Information' };
export const QUESTIONS_PER_PASSAGE = 5;

const q = (question, options, why) => ({ q: question, options, why });

export const PASSAGES = [
  /* ---------------------------------------------------------------- Level 1, grades 2–3 */
  {
    id: 'mitten', level: 1, kind: 'story', title: 'The Lost Mitten',
    text: `Nora had new red mittens. Her grandma made them for her. One snowy day, Nora went out to play. She made a snowman with her brother Ben. She gave it a carrot for a nose and two sticks for arms.

When it was time to go in, Nora looked at her hands. One mitten was gone! She looked by the door. She looked under the sled. She looked behind the big tree. There was no mitten.

“Do not be sad,” said Ben. “We will look again in the morning.”

That night, more snow fell. In the morning, the yard was white and smooth. Nora could not see her mitten anywhere. Then Ben began to laugh. He pointed at the snowman.

There was the red mitten! It was on the end of one stick arm. Nora had put it there while she fixed the carrot nose. Then she forgot it.

Nora laughed too. She put the mitten back on her hand. “Thank you for keeping it safe,” she told the snowman.`,
    questions: [
      q('Who made Nora’s mittens?', ['Her grandma', 'Her brother Ben', 'Her mother', 'Nora herself'], 'The second sentence says, “Her grandma made them for her.”'),
      q('What did the snowman have for a nose?', ['A carrot', 'A small stone', 'A short stick', 'A big button'], 'The first paragraph says Nora gave it a carrot for a nose.'),
      q('Where was the lost mitten in the end?', ['On one of the snowman’s stick arms', 'Under the sled by the door', 'Behind the big tree in the yard', 'In the pocket of Ben’s coat'], 'Near the end: “It was on the end of one stick arm.”'),
      q('How did the mitten get there?', ['Nora put it there and forgot it', 'Ben hid it there for a joke', 'The wind blew it up onto the stick', 'Grandma hung it there to dry'], 'The story says Nora put it there while she fixed the carrot nose, and then forgot it.'),
      q('How did Nora feel at the end of the story?', ['Happy', 'Angry', 'Scared', 'Sleepy'], 'In the last paragraph Nora laughed and thanked the snowman.'),
    ],
  },
  {
    id: 'lion', level: 1, kind: 'story', title: 'The Lion and the Mouse',
    text: `A big lion was asleep in the shade of a tree. A little mouse ran over his paw by mistake and woke him up. The lion was angry. He caught the mouse under his heavy paw.

“Please let me go,” said the mouse. “One day I will help you.”

The lion laughed. “How can a tiny mouse help a lion?” he asked. But he was not hungry, so he lifted his paw, and the mouse ran away.

Some days later, the lion walked into a hunter’s trap. It was a net made of thick rope. He pulled and he rolled, but he could not get out of it. He roared so loudly that the trees shook.

The mouse heard the terrible roar and came running as fast as she could. She found the lion tangled in the net. “Now it is my turn to help,” she said. She began to chew the rope with her sharp little teeth. She chewed and chewed. At last the rope broke, and the lion was free.

“Thank you, little friend,” said the lion. “I was wrong to laugh at you.”

Even a small friend can be a great help.`,
    questions: [
      q('What was the lion doing at the start of the story?', ['Sleeping in the shade', 'Hunting in the long grass', 'Drinking at the river', 'Roaring at a mouse'], 'The first sentence says the lion was asleep in the shade of a tree.'),
      q('Why did the lion let the mouse go?', ['He was not hungry', 'He was afraid of mice', 'The mouse bit his paw', 'Another lion told him to'], 'The third paragraph says he was not hungry, so he lifted his paw.'),
      q('What was the trap made of?', ['Thick rope', 'Strong wood', 'Heavy iron', 'Long, sharp thorns'], 'The fourth paragraph says the trap was a net made of thick rope.'),
      q('How did the mouse set the lion free?', ['She chewed through the rope', 'She untied all the knots', 'She called the other lions', 'She pulled the net off him'], 'The fifth paragraph says she chewed the rope until it broke.'),
      q('What does the story teach?', ['A small friend can be a great help', 'Lions should not sleep in the day', 'A mouse is stronger than a lion', 'It is wrong to laugh at a joke'], 'The last line gives the lesson, and the story shows it: the tiny mouse saved the lion.'),
    ],
  },
  {
    id: 'bean', level: 1, kind: 'info', title: 'How a Bean Seed Grows',
    text: `A bean seed looks small and dry. But there is a tiny plant inside it. The seed also holds food to help the plant start to grow.

First, the seed needs water. When the soil is wet, the seed soaks up water and swells. Its skin splits open.

Next, a root grows out of the seed. The root pushes down into the soil. It holds the plant in place and takes in water.

Then a shoot grows up. It pushes through the soil toward the light. Soon the first leaves open.

Now the plant can make its own food. Its green leaves use sunlight, air and water to make it. The plant grows taller and puts out more leaves.

After some weeks, flowers open on the plant. When the flowers fall off, bean pods grow in their place. Inside each pod are new seeds.

If you plant one of those seeds, the story starts again.`,
    questions: [
      q('What is inside a bean seed?', ['A tiny plant and some food', 'A small stone and soil', 'Only a few drops of water', 'A little flower'], 'The first paragraph says there is a tiny plant inside, and food to help it start to grow.'),
      q('What does the seed need first?', ['Water', 'Strong wind', 'A bee', 'Bright light'], 'The second paragraph begins, “First, the seed needs water.”'),
      q('Which part grows out of the seed first?', ['The root', 'The first leaf', 'A flower', 'A bean pod'], 'The third paragraph says, “Next, a root grows out of the seed.” The shoot and leaves come after it.'),
      q('What do the green leaves do?', ['They make food for the plant', 'They hold the plant in the soil', 'They make new seeds', 'They keep the plant dry'], 'The fifth paragraph says the leaves use sunlight, air and water to make food.'),
      q('Where do the new seeds grow?', ['Inside the bean pods', 'On the roots', 'Under the leaves', 'In the soil next to the plant'], 'The sixth paragraph says, “Inside each pod are new seeds.”'),
    ],
  },
  {
    id: 'ants', level: 1, kind: 'info', title: 'Busy Ants',
    text: `Ants are small insects. Like all insects, an ant has six legs. It also has two feelers on its head, and it uses them to touch and to smell.

Ants do not live alone. They live in a big group called a colony. Many ants make their nest under the ground. The nest has lots of rooms joined by tunnels.

Each ant has a job. The queen lays the eggs. The worker ants do all the other jobs. Some look after the eggs and the young ants. Some dig new tunnels, and some go out to find food.

When a worker finds food, she carries some of it home. On the way, she leaves a smell on the ground. Other ants follow the smell to the food. Soon there is a long line of ants going to and fro.

Ants are strong for their size. An ant can lift a thing that is much heavier than she is. And when a job is too big for one ant, the others come to help.`,
    questions: [
      q('How many legs does an ant have?', ['Six', 'Four', 'Eight', 'Ten'], 'The first paragraph says, “Like all insects, an ant has six legs.”'),
      q('What is a big group of ants called?', ['A colony', 'A herd', 'A flock', 'A village'], 'The second paragraph says ants live in a big group called a colony.'),
      q('What is the queen’s job?', ['She lays the eggs', 'She digs the tunnels', 'She finds the food', 'She carries food home'], 'The third paragraph says, “The queen lays the eggs.”'),
      q('How do other ants find the food?', ['They follow a smell on the ground', 'They hear the worker call', 'The queen shows them the way', 'They look for it from a hill'], 'The fourth paragraph says the worker leaves a smell, and other ants follow it to the food.'),
      q('What do ants use their feelers for?', ['To touch and to smell', 'To dig new tunnels', 'To carry food back to the nest', 'To lay eggs'], 'The first paragraph says an ant uses its feelers to touch and to smell.'),
    ],
  },

  /* ---------------------------------------------------------------- Level 2, grades 4–5 */
  {
    id: 'wind', level: 2, kind: 'story', title: 'The Wind and the Sun',
    text: `The Wind and the Sun were having an argument. Each one said that he was the stronger.

“I can pull up trees and blow the roofs off barns,” said the Wind. “Nothing is stronger than I am.”

“Strength is not only about pushing hard,” the Sun replied calmly.

Just then, a traveler came walking along the road below them. He was wearing a thick wool cloak.

“Let us have a contest,” said the Sun. “Whoever can make that traveler take off his cloak is the stronger. You may go first.”

The Sun slipped behind a cloud to watch, and the Wind began to blow. At first the traveler’s cloak flapped around his legs. The Wind blew harder. Leaves flew through the air, and dust whirled up from the road. But the harder the Wind blew, the more tightly the traveler pulled his cloak around him. At last the Wind was out of breath, and he gave up.

“Now it is my turn,” said the Sun. He came out from behind the cloud and shone gently on the road. The air grew warm. The traveler loosened his cloak. The Sun shone a little more brightly. The traveler wiped his forehead. Soon he was so hot that he took off the cloak, sat down in the shade of a tree and had a drink of water.

The Wind had to agree that the Sun had won.

Gentle ways often work better than force.`,
    questions: [
      q('What were the Wind and the Sun arguing about?', ['Which of them was stronger', 'Which of them was older', 'Which of them should rule the sky', 'Which of them was faster'], 'The first paragraph says each one said that he was the stronger.'),
      q('What was the contest?', ['To make the traveler take off his cloak', 'To blow the traveler off the road', 'To knock down a tree', 'To make the traveler run'], 'The Sun says, “Whoever can make that traveler take off his cloak is the stronger.”'),
      q('What did the traveler do when the Wind blew harder?', ['He pulled his cloak more tightly around him', 'He took off his cloak at once', 'He hid behind a tree', 'He ran along the road'], 'The sixth paragraph says the harder the Wind blew, the more tightly he pulled his cloak around him.'),
      q('Why did the traveler take off his cloak in the end?', ['He was too hot', 'The Wind tore it off', 'It was wet', 'He wanted to sit on it'], 'The seventh paragraph says the Sun warmed the air, and soon the traveler was so hot that he took the cloak off.'),
      q('What is the lesson of the story?', ['Gentle ways often work better than force', 'The one who goes first has the best chance of winning', 'Never travel on a windy day', 'It is wrong to have a contest'], 'The last line gives the lesson, and the story shows it: the gentle Sun did what the rough Wind could not.'),
    ],
  },
  {
    id: 'bridge', level: 2, kind: 'story', title: 'The Paper Bridge',
    text: `Maya and Leo had one week to build a bridge for the science fair. The rules were simple. The bridge had to be made of paper and tape, and it had to cross a gap of thirty centimeters between two desks. The bridge that held the most coins would win.

Their first bridge was a flat sheet of paper. It sagged in the middle before they had added a single coin.

“Paper is just too weak,” Leo groaned.

Maya was not so sure. She rolled a sheet of paper into a tight tube and stood it on end. Then she pressed down on it with her hand. The tube did not bend.

“Look,” she said. “It is the same paper. The shape is what makes it strong.”

For the next three days they tested shapes. They rolled tubes. They folded sheets into long zigzags, like a fan. They taped tubes together into triangles. Leo wrote down how many coins each design held before it fell. The flat sheet held none. The zigzag sheet held forty. A bridge made from triangles of tubes held more than two hundred.

On the day of the fair, their triangle bridge held two hundred and sixty coins. Another team’s bridge held a few more, so Maya and Leo came second.

Leo did not mind at all. He was already drawing a new design in his notebook. “Next year,” he said, “we will use smaller triangles.”

Maya grinned. “And more tape.”`,
    questions: [
      q('What did the bridge have to be made of?', ['Paper and tape', 'Wood and glue', 'Paper and string', 'Card and coins'], 'The first paragraph says the bridge had to be made of paper and tape.'),
      q('What happened to the first bridge?', ['It sagged before any coins were added', 'It held forty coins and then fell down', 'It tore in half when they picked it up', 'It won the contest'], 'The second paragraph says it sagged in the middle before they had added a single coin.'),
      q('What did Maya show with the paper tube?', ['That its shape can make paper strong', 'That they needed to buy thicker paper for the bridge', 'That tape makes paper weak', 'That paper cannot hold any weight'], 'Maya says, “It is the same paper. The shape is what makes it strong.”'),
      q('Which design held the most coins in their tests?', ['The bridge made from triangles of tubes', 'The flat sheet of paper', 'The sheet folded into zigzags', 'A single tube standing on end'], 'The sixth paragraph says the flat sheet held none, the zigzag held forty and the triangle bridge held more than two hundred.'),
      q('How did Leo feel about coming second?', ['He did not mind at all', 'He was angry with the other team', 'He wanted to give up building', 'He blamed Maya for the tape'], 'Near the end: “Leo did not mind at all. He was already drawing a new design.”'),
    ],
  },
  {
    id: 'water', level: 2, kind: 'info', title: 'The Water Cycle',
    text: `The water on Earth is always on the move. It travels from the sea to the sky, falls on the land and flows back to the sea again. This endless journey is called the water cycle.

The journey begins when the Sun warms the water in oceans, lakes and rivers. Some of the water turns into a gas called water vapor and rises into the air. This change from a liquid to a gas is called evaporation. You cannot see water vapor, but it is in the air all around you.

High above the ground, the air is colder. There the water vapor cools and turns back into tiny drops of liquid water. This change is called condensation. Millions of these tiny drops together make a cloud.

Inside a cloud, the tiny drops bump into one another and join up. When the drops grow too heavy to stay in the air, they fall as rain. In cold weather, the water may fall as snow, sleet or hail instead. Water that falls from the clouds in any of these forms is called precipitation.

Some of the water that falls soaks into the ground. Some of it runs downhill into streams and rivers, and the rivers carry it back to the sea. Then the Sun warms the water again, and the cycle starts once more.

The same water goes around again and again. The rain that falls today has fallen many times before.`,
    questions: [
      q('What makes water evaporate from oceans, lakes and rivers?', ['The warmth of the Sun', 'The pull of the Moon', 'Cold air high above the ground', 'Rain falling from the clouds'], 'The second paragraph says the journey begins when the Sun warms the water.'),
      q('What is condensation?', ['Water vapor cooling and turning back into tiny drops', 'Liquid water turning into a gas', 'Water soaking into the ground', 'Rivers flowing back to the sea'], 'The third paragraph says the water vapor cools and turns back into tiny drops of liquid water, and names this condensation.'),
      q('What is a cloud made of?', ['Millions of tiny drops of water', 'Smoke and dust blown up from the ground', 'Warm air and nothing else', 'Salt from the sea'], 'The third paragraph says, “Millions of these tiny drops together make a cloud.”'),
      q('Which of these is a form of precipitation?', ['Snow', 'A cloud', 'A river', 'Water vapor'], 'The fourth paragraph says water that falls as rain, snow, sleet or hail is called precipitation.'),
      q('What happens to the rain that runs downhill into streams and rivers?', ['The rivers carry it back to the sea', 'It is gone for good', 'It turns straight into clouds', 'It stays in the rivers and never moves again'], 'The fifth paragraph says the rivers carry it back to the sea.'),
    ],
  },
  {
    id: 'moon', level: 2, kind: 'info', title: 'Why the Moon Seems to Change Shape',
    text: `Look at the Moon on different nights and it seems to change shape. One night it is a thin curve. A week or two later it is a bright, round disk. Yet the Moon itself never changes shape. It is always a ball of rock.

The Moon does not make any light of its own. It shines because sunlight falls on it and bounces off. The Sun always lights up one half of the Moon, the half that faces the Sun. The other half is dark.

The Moon travels around the Earth, and one trip takes about a month. As it moves, we look at it from a different angle each night. Sometimes we can see most of its sunlit half. Sometimes we can see only a thin slice of it. The different shapes that we see are called the phases of the Moon.

When the Moon is between the Earth and the Sun, its sunlit half faces away from us, and we see almost nothing. This phase is called the new moon. Over the next two weeks, we see a little more of the sunlit half each night. First there is a thin crescent, then a half circle, and at last the whole round face. That is the full moon.

After the full moon, the bright part grows smaller night by night until the Moon is new again. Then the pattern starts over.`,
    questions: [
      q('Why does the Moon shine?', ['Sunlight bounces off it', 'It makes its own light, like a lamp', 'It is very hot', 'The stars light it up'], 'The second paragraph says the Moon shines because sunlight falls on it and bounces off.'),
      q('About how long does the Moon take to travel around the Earth?', ['About a month', 'About a day', 'About two weeks', 'About a year'], 'The third paragraph says one trip takes about a month.'),
      q('What are the phases of the Moon?', ['The different shapes of the Moon that we see', 'The rocks on the Moon', 'The dark half of the Moon', 'The trips the Moon makes around the Earth'], 'The third paragraph says the different shapes that we see are called the phases of the Moon.'),
      q('Where is the Moon at new moon?', ['Between the Earth and the Sun', 'Behind a cloud', 'On the far side of the Sun', 'Farther from the Earth than usual'], 'The fourth paragraph says that when the Moon is between the Earth and the Sun, we see almost nothing, and that this is the new moon.'),
      q('How much of the Moon does the Sun light up?', ['Always one half', 'All of it', 'More each night', 'None of it at new moon'], 'The second paragraph says the Sun always lights up one half of the Moon. Only our view of that half changes.'),
    ],
  },

  /* ---------------------------------------------------------------- Level 3, grades 6–8 */
  {
    id: 'miller', level: 3, kind: 'story', title: 'The Miller, His Son and the Donkey',
    text: `Early one morning, a miller and his young son set out for the market in the next town, where they hoped to sell their donkey. So that the animal would arrive fresh and fetch a good price, they let it walk in front of them and carried nothing but their lunch.

They had not gone far when they passed a group of farm workers resting beside the road. “Look at those two,” one of them said with a laugh. “They own a perfectly good donkey, and yet they are both walking!” The miller thought this was a sensible remark, so he lifted his son onto the donkey’s back and walked along beside them.

A little farther on, they met three old men who were deep in conversation. “There, that proves my point,” said one, wagging his finger. “Young people today have no respect. That strong boy rides in comfort while his poor father has to walk.” Embarrassed, the boy climbed down, and the miller took his place.

Before long they overtook two women carrying baskets of eggs. “What a selfish man,” one of them remarked loudly to the other. “He sits up there at his ease while that small child struggles to keep up.” The miller, who by now was thoroughly confused, pulled his son up to sit behind him.

As they approached the town, a shepherd stopped and stared at them. “Is that donkey your own?” he asked. “Nobody would think so from the way you have loaded the poor creature. The two of you are better able to carry him than he is to carry you.”

Anxious to do the right thing at last, the miller and his son got down, tied the donkey’s legs to a long pole and hoisted the pole onto their shoulders. They staggered onto the bridge that led into the town, and the townspeople came running to laugh at the extraordinary sight. Frightened by the noise, the donkey kicked himself free of the ropes, splashed through the shallow river and galloped all the way home.

The miller trudged home after him with nothing to show for his day. “I tried to please everybody,” he told his son, “and I ended up pleasing nobody, not even the donkey.”`,
    questions: [
      q('Why were the miller and his son going to the market?', ['To sell their donkey', 'To buy a second donkey', 'To sell flour from their mill', 'To buy eggs'], 'The first sentence says they hoped to sell their donkey at the market.'),
      q('Why did they let the donkey walk without a rider at first?', ['So that it would arrive fresh and fetch a good price', 'Because it was too young to ride', 'Because the son was afraid of it', 'Because it was carrying their lunch'], 'The first paragraph says they let it walk so that it would arrive fresh and fetch a good price.'),
      q('What did the old men complain about?', ['The boy rode while his father walked', 'The father rode while the boy walked', 'Both of them were walking', 'Both of them were riding'], 'In the third paragraph an old man says the strong boy rides in comfort while his poor father has to walk.'),
      q('What happened on the bridge?', ['The donkey kicked free and ran home', 'The pole broke and the miller fell in the river', 'The townspeople bought the donkey', 'The shepherd led the donkey away'], 'The sixth paragraph says the donkey kicked himself free, splashed through the river and galloped home.'),
      q('What does the miller learn?', ['If you try to please everyone, you may please no one', 'A donkey should never be carried over a bridge on a pole', 'Old people always give the best advice', 'Walking is better than riding'], 'The miller says it himself in the last paragraph: he tried to please everybody and ended up pleasing nobody.'),
    ],
  },
  {
    id: 'ford', level: 3, kind: 'story', title: 'The Missing Bridge',
    text: `The map was older than Grandpa, and he was proud of it. It had belonged to his own father, who had explored these hills as a boy, and it showed every stream, footpath and stone wall in faded brown ink.

“According to this,” said Grandpa, tapping the paper, “we follow the path down to the river, cross by the wooden bridge and climb to the lookout on the far side. We will be eating our sandwiches at the top by noon.”

Ines and her brother Tomas followed him down through the pine trees. The path was easy to follow, and before long they could hear the river. But when they came out onto the bank, they stopped and stared. Two mossy stone posts stood at the water’s edge, and two more stood on the opposite bank. Between them there was nothing at all except fast brown water.

“The bridge must have been washed away years ago,” said Tomas.

Grandpa turned the map over, as if the bridge might be hiding on the back. “Well,” he said at last, “the map is right about everything except today.”

Ines studied the map more carefully. Upstream, where the line of the river grew thinner, the mapmaker had drawn a row of tiny dots and written a single word beside them: ford. “What is a ford?” she asked.

“A shallow place where people can wade across a river,” said Grandpa. “If it is still there.”

They walked upstream for twenty minutes, pushing through ferns that reached to their waists. Gradually the river spread out and grew quieter, until it was chattering over a bed of flat stones. The water was so shallow that they could see every pebble. They took off their boots, rolled up their trousers and waded across, gasping at the cold.

It was nearly two o’clock when they reached the lookout, and the sandwiches were rather squashed. Nobody complained. Far below them, the river curled through the valley like a piece of dropped string.

Grandpa took out a pencil and drew a neat line through the bridge on the map. Then he handed the pencil to Ines. “You found the way,” he said. “You had better write in the date.”`,
    questions: [
      q('Who owned the map before Grandpa?', ['His father', 'His grandfather', 'Ines', 'A mapmaker in the town'], 'The first paragraph says the map had belonged to his own father.'),
      q('What did they find where the bridge should have been?', ['Only stone posts on each bank', 'A new metal bridge', 'A fallen tree across the water', 'A boat tied to a post'], 'The third paragraph says there were stone posts on both banks and nothing between them except water.'),
      q('What is a ford?', ['A shallow place where people can wade across a river', 'A narrow wooden bridge', 'A deep pool in a river', 'A path through a forest'], 'Grandpa explains it: “A shallow place where people can wade across a river.”'),
      q('How did Ines find another way across?', ['She saw dots and the word “ford” on the map', 'She saw a sign beside the river', 'She asked a passing hiker', 'She remembered a crossing from an earlier walk with Grandpa'], 'The sixth paragraph says Ines studied the map and found a row of dots with the word “ford” beside them.'),
      q('What did Grandpa mean when he said the map was “right about everything except today”?', ['The map showed the land as it used to be', 'The map had been drawn by someone careless', 'They had been holding the map upside down', 'They had set out on the wrong day of the week'], 'The map still showed a bridge that had been washed away years ago. Everything else on it was correct.'),
    ],
  },
  {
    id: 'salt', level: 3, kind: 'info', title: 'Why Is the Sea Salty?',
    text: `Anyone who has swallowed a mouthful of seawater knows that it is salty. River water, on the other hand, tastes fresh. This is puzzling, because rivers pour into the sea every hour of every day. Where does all the salt come from?

The surprising answer is that most of it comes from the land. As rain falls through the air, it absorbs a little carbon dioxide gas, which turns the rainwater into a very weak acid. When this water trickles over rocks, it slowly dissolves tiny amounts of the minerals in them, including salts. Streams and rivers then carry the dissolved minerals downhill. River water contains so little salt that we cannot taste it, but rivers have been delivering it to the oceans for a very long time.

What happens next explains the difference between rivers and seas. The Sun warms the surface of the ocean, and water evaporates into the air. Only the water leaves, however. The salt stays behind. The water vapor forms clouds, falls again as rain and washes a little more salt down to the sea. Over many millions of years, this process has left the oceans with a great deal of dissolved salt.

The land is not the only source. In places on the deep ocean floor, hot water rises through cracks in the rock, carrying dissolved minerals with it. Volcanoes under the sea add minerals too.

Today, about three and a half percent of the weight of seawater is dissolved salt. That may not sound like much, but it means that a liter of seawater holds about 35 grams of salt. Most of it is the same substance as the salt on a dinner table, which chemists call sodium chloride.

The oceans are not growing steadily saltier, though. While rivers bring new salt in, some of the salt already in the water settles and becomes part of the rocks forming on the sea floor. Scientists think that the two processes roughly balance, so the saltiness of the sea has stayed about the same for a very long time.`,
    questions: [
      q('Where does most of the salt in the sea come from?', ['From rocks on the land', 'From fish and sea plants', 'From rain clouds', 'From the sand on beaches'], 'The second paragraph says most of it comes from the land, where rainwater dissolves minerals out of rocks.'),
      q('Why can rainwater dissolve minerals in rocks?', ['It absorbs carbon dioxide and becomes a very weak acid', 'It is much hotter than the water in rivers', 'It falls with great force', 'It already contains a lot of salt'], 'The second paragraph says rain absorbs carbon dioxide, which turns it into a very weak acid.'),
      q('What happens to the salt when seawater evaporates?', ['It stays behind in the sea', 'It rises with the water vapor', 'It turns into clouds', 'It flows back up the rivers'], 'The third paragraph says, “Only the water leaves, however. The salt stays behind.”'),
      q('About how much salt is in a liter of seawater?', ['About 35 grams', 'About 3 grams', 'About 350 grams', 'About half a liter'], 'The fifth paragraph says a liter of seawater holds about 35 grams of salt.'),
      q('Why is the sea not getting steadily saltier?', ['Some salt settles into rocks on the sea floor', 'Rivers have stopped carrying salt to the sea', 'Rain washes the salt back out of the sea again', 'Fish and sea plants use up the extra salt'], 'The last paragraph says some salt settles into the rocks forming on the sea floor, which roughly balances the salt that rivers bring in.'),
    ],
  },
  {
    id: 'echo', level: 3, kind: 'info', title: 'Seeing with Sound',
    text: `On a summer evening, an insect-eating bat can catch hundreds of insects in the dark without bumping into a single branch. It manages this not with sharp eyesight but with sound. The method is called echolocation, which means finding things by their echoes.

As it flies, the bat sends out a rapid series of calls through its mouth or nose. Most of these calls are too high-pitched for human ears to detect, which is why a sky full of hunting bats seems silent to us. Each call spreads out through the air until it strikes an object, such as a tree, a wall or a moth. Part of the sound then bounces back toward the bat as an echo.

The bat’s large ears collect the returning echoes, and its brain turns them into detailed information. An echo that returns quickly has come from something close, while one that takes longer has traveled from something farther away. From the echoes, a bat can also judge how large an object is, what shape it has and in which direction it is moving. As the bat closes in on an insect, it calls faster and faster, so that it receives a constant stream of fresh information about its target.

Bats are not the only animals with this ability. Dolphins and some other toothed whales echolocate under water, where sound travels much faster and farther than it does in air. A dolphin produces rapid clicks and receives the echoes through its lower jaw, which passes the vibrations on to its ears. In this way it can find fish in water that is too dark or too muddy to see through.

People have borrowed the same principle. Ships use sonar, which sends pulses of sound down into the water and times the returning echoes, to measure the depth of the sea and to locate objects beneath the surface. The bat and the dolphin, however, were using the technique long before any engineer thought of it.`,
    questions: [
      q('What does echolocation mean?', ['Finding things by their echoes', 'Seeing in very dim light', 'Calling to other bats', 'Flying without making a sound'], 'The first paragraph says echolocation means finding things by their echoes.'),
      q('Why does a sky full of hunting bats seem silent to people?', ['Most of their calls are too high-pitched for us to hear', 'Bats call only when they land', 'The bats fly too high above the ground for their calls to reach us', 'Bats hunt without making any sound'], 'The second paragraph says most of the calls are too high-pitched for human ears to detect.'),
      q('How can a bat tell that an object is close?', ['The echo returns quickly', 'The echo takes longer to return', 'There is no echo at all', 'The bat can see the object’s shadow'], 'The third paragraph says an echo that returns quickly has come from something close.'),
      q('How does a dolphin receive the echoes of its clicks?', ['Through its lower jaw', 'Through the tip of its tail', 'Through its blowhole', 'Through its upper teeth'], 'The fourth paragraph says a dolphin receives the echoes through its lower jaw, which passes the vibrations on to its ears.'),
      q('What does a ship’s sonar do?', ['It sends sound into the water and times the echoes', 'It lights up the sea floor', 'It listens for the calls of dolphins', 'It measures how warm the water is'], 'The last paragraph says sonar sends pulses of sound into the water and times the returning echoes.'),
    ],
  },
];

/**
 * The passage on the printable fluency record sheet: a fable retold for this site. It is not one of the
 * test passages, so reading it on paper does not spoil a timed test.
 */
export const RECORD_PASSAGE = {
  id: 'crow', level: 2, kind: 'story', title: 'The Crow and the Pitcher',
  text: `It was a hot, dry summer, and a crow had been flying all day without finding any water. At last she saw a tall pitcher standing in a garden. She flew down to it at once.

There was a little water at the bottom of the pitcher. The crow pushed her beak inside, but the neck of the pitcher was narrow, and she could not reach the water. She tried to tip the pitcher over, but it was too heavy.

The crow did not give up. She looked around the garden and saw some small stones on the path. She picked one up in her beak and dropped it into the pitcher. Then she dropped in another, and another.

With every stone, the water rose a little higher. After a long time, it reached the top of the pitcher. The thirsty crow took a long, cool drink.

A little thinking can solve a big problem.`,
};

/** The first sentence of the record sheet's passage, cut into the groups of words a fluent reader says together. */
export const PHRASE_EXAMPLE = ['It was a hot, dry summer,', 'and a crow had been flying all day', 'without finding any water.'];

export const passageById = id => PASSAGES.find(passage => passage.id === id);
export const passagesFor = level => PASSAGES.filter(passage => passage.level === level);
export const levelById = id => LEVELS.find(level => level.id === Number(id));
export const modeById = id => MODES.find(mode => mode.id === id);

/** A passage's paragraphs, in order. */
export const paragraphs = passage => passage.text.split('\n\n');

const analyses = new Map();
/** The Reading Level Checker's analysis of a passage: its counts and its grade. */
export function analysis(passage) {
  if (!analyses.has(passage.text)) analyses.set(passage.text, analyze(passage.text));
  return analyses.get(passage.text);
}
/** How many words a passage has, counted the way the Reading Level Checker counts them. */
export const wordCount = passage => analysis(passage).counts.words;
/** The passage's readability grade: the middle value of five grade formulas. */
export const readingGrade = passage => analysis(passage).grade;

/* ------------------------------------------------------------ questions */

function hash(text) {
  let h = 2166136261;
  for (const c of text) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return h >>> 0;
}

/**
 * A passage's questions as the test shows them: [{ q, options, answer, why }], where `answer` is the
 * position of the right option. The order of the options is mixed, the same way every time.
 */
export function questionsFor(passage) {
  return passage.questions.map((question, i) => {
    const random = seededRandom(hash(`${passage.id}:${i}`));
    const order = question.options.map((_, at) => at);
    for (let j = order.length - 1; j > 0; j--) {
      const k = Math.floor(random() * (j + 1));
      [order[j], order[k]] = [order[k], order[j]];
    }
    return { q: question.q, options: order.map(at => question.options[at]), answer: order.indexOf(0), why: question.why };
  });
}

/** Marks a list of chosen option positions (see questionsFor): { correct, total, right: [true, false, …] }. */
export function scoreAnswers(passage, chosen) {
  const right = questionsFor(passage).map((question, i) => chosen[i] === question.answer);
  return { correct: right.filter(Boolean).length, total: right.length, right };
}

/* ---------------------------------------------------------------- timing */

/** A reading shorter than this was not a reading. */
export const MIN_SECONDS = 5;
/** Above this speed a reader is skimming, not reading every word, so the test does not count the result. */
export const MAX_WPM = 700;
/** Below this speed the timer was almost certainly left running. */
export const MIN_WPM = 10;

/** Words per minute for `words` words read in `ms` milliseconds, as a whole number. */
export function wordsPerMinute(words, ms) {
  return ms > 0 ? Math.round(words / (ms / 60000)) : 0;
}

/**
 * A stopwatch that can be paused, built on any clock that only moves forward (performance.now in the
 * browser). `now` returns milliseconds. The time while paused is not counted.
 */
export function createStopwatch(now) {
  let startedAt = null, total = 0, pauses = 0, running = false;
  return {
    start() { total = 0; pauses = 0; startedAt = now(); running = true; },
    pause() { if (running) { total += now() - startedAt; running = false; pauses++; } },
    resume() { if (!running && startedAt !== null) { startedAt = now(); running = true; } },
    /** Stops the watch and returns { ms, pauses }. */
    stop() {
      if (running) { total += now() - startedAt; running = false; }
      startedAt = null;
      return { ms: Math.max(0, total), pauses };
    },
    get running() { return running; },
  };
}

/** Does a timing count? { counts: true } or { counts: false, reason: 'too-fast' | 'too-slow', message }. */
export function judgeTiming(words, ms) {
  const wpm = wordsPerMinute(words, ms);
  if (ms < MIN_SECONDS * 1000 || wpm > MAX_WPM) {
    return { counts: false, reason: 'too-fast', message: `That was ${formatTime(ms)} for ${words} words. Nobody can read every word that fast, so this result does not count. Press Start again when you are ready to read the whole passage.` };
  }
  if (wpm < MIN_WPM) {
    return { counts: false, reason: 'too-slow', message: `The timer ran for ${formatTime(ms)}. It looks as if it was left running, so this result does not count. If you were reading the whole time, that is fine: try a passage from an easier level.` };
  }
  return { counts: true };
}

/** "8 seconds", "1 minute 5 seconds", "2 minutes": whole seconds, for showing a reading time. */
export function formatTime(ms) {
  const seconds = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(seconds / 60), s = seconds % 60;
  const parts = [];
  if (m) parts.push(`${m} minute${m === 1 ? '' : 's'}`);
  if (s || !m) parts.push(`${s} second${s === 1 ? '' : 's'}`);
  return parts.join(' ');
}

/* ---------------------------------------------------------------- results */

/**
 * The speed above which a low score gets the advice "slow down". It is not a norm or a target: it only
 * separates "you may be rushing" from "this passage may be too hard right now".
 */
export const QUICK_WPM = { silent: 200, aloud: 150 };

/**
 * What a result means, in plain words: { kind, title, summary, advice, text }, where text is the summary
 * followed by the advice. kind is 'understood' (4 or 5 of 5), 'mostly' (3 of 5), 'slow-down' (fewer, read
 * quickly) or 'too-hard' (fewer, not read quickly). Understanding always comes before speed.
 */
export function interpret({ wpm, correct, total, mode = 'silent' }) {
  const share = total > 0 ? correct / total : 0;
  const score = `${correct} of ${total} questions right`;
  const result = (kind, title, summary, advice) => ({ kind, title, summary, advice, text: `${summary} ${advice}` });
  if (share >= 0.8) {
    return mode === 'aloud'
      ? result('understood', 'You read it and you understood it.', `You read aloud at ${wpm} words a minute and got ${score}.`, 'Next, work on how it sounds: read in groups of words, and let your voice rise and fall the way it does when you talk.')
      : result('understood', 'You read it and you understood it.', `You read at ${wpm} words a minute and got ${score}, so this speed works for you on a passage like this one.`, 'Try another passage at this level and see if you can keep both numbers up.');
  }
  if (share >= 0.6) {
    return result('mostly', 'You understood most of it.', `You got ${score} at ${wpm} words a minute.`, 'Look again at the questions you missed. On your next passage, slow down a little at the parts that are packed with details.');
  }
  if (wpm >= QUICK_WPM[mode]) {
    return result('slow-down', 'Slow down a little.', `You read quickly, at ${wpm} words a minute, but got ${score}.`, 'Reading fast only helps when you understand what you read. Take the next passage more slowly and see how many more answers you get.');
  }
  return result('too-hard', 'Understanding comes first.', `You got ${score}. Speed is not the problem here.`, 'Read the passage again and check the answers, or try a passage from an easier level. When the words come easily, the speed follows.');
}

/** The most results kept in this browser. */
export const HISTORY_LIMIT = 20;
/** How many of them the "your last results" list shows. */
export const HISTORY_SHOWN = 6;

/** Adds a result to the saved list, newest first, and trims the list. */
export function addResult(history, result) {
  return [result, ...history].slice(0, HISTORY_LIMIT);
}

/** Only well-formed saved results, in case the saved list was edited or comes from an older version. */
export function cleanHistory(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(r => r && passageById(r.passage) && modeById(r.mode) && Number.isFinite(r.wpm) && r.wpm > 0
    && Number.isInteger(r.correct) && Number.isInteger(r.total) && r.total > 0 && r.correct >= 0 && r.correct <= r.total).slice(0, HISTORY_LIMIT);
}

/**
 * How a result compares with the reader's own earlier results at the same level and in the same mode:
 * null when there are none, otherwise { count, average, difference, text }.
 */
export function compareWithEarlier(result, earlier) {
  const level = passageById(result.passage).level;
  const same = earlier.filter(r => r.mode === result.mode && passageById(r.passage)?.level === level);
  if (!same.length) return null;
  const average = Math.round(same.reduce((sum, r) => sum + r.wpm, 0) / same.length);
  const difference = result.wpm - average;
  const tests = same.length === 1 ? 'your last test' : `your last ${same.length} tests`;
  const where = `on Level ${level} passages (${modeById(result.mode).label})`;
  const how = Math.abs(difference) <= 5 ? 'about the same as' : `${Math.abs(difference)} words a minute ${difference > 0 ? 'faster' : 'slower'} than`;
  return { count: same.length, average, difference, text: `That is ${how} the average of ${tests} ${where}, which was ${average} words a minute.` };
}

/** One line for the "your last results" list. */
export function historyLine(result) {
  const passage = passageById(result.passage);
  return `${passage.title} (Level ${passage.level}, ${modeById(result.mode).label}): ${result.wpm} words a minute, ${result.correct} of ${result.total} right${result.paused ? ', timer paused' : ''}`;
}

/* ------------------------------------------------------- the record sheet */

/** The longest line, in characters, of a passage printed with word counts in the margin. */
export const LINE_WIDTH = 78;

/**
 * A passage cut into printed lines with a running word count: [{ text, words, count, first }], where
 * `count` is the number of words from the start of the passage to the end of that line, and `first`
 * marks the first line of a paragraph. Words are counted the way the Reading Level Checker counts them.
 */
export function countedLines(passage, width = LINE_WIDTH) {
  const lines = [];
  let count = 0;
  for (const paragraph of paragraphs(passage)) {
    let line = '', first = true;
    const push = () => {
      const words = tokenizeWords(line).length;
      count += words;
      lines.push({ text: line, words, count, first });
      first = false;
      line = '';
    };
    for (const piece of paragraph.split(' ')) {
      if (line && line.length + 1 + piece.length > width) push();
      line = line ? `${line} ${piece}` : piece;
    }
    if (line) push();
  }
  return lines;
}
