// The Main Idea and Details Game's paragraph bank and rules: pure data and functions, shared by the game, the
// examples on the page, the printable worksheet, the answer key and the tests.
//
// Every paragraph was written for this site. Every statement in the bank is meant to be true, timeless and
// uncontroversial: school science, nature and geography. That goes for the wrong answers too. A wrong option
// is never false; it is a true statement that is not the main idea. If you add a paragraph, keep to that.
//
// How to read an entry:
//   p(id, level, category, topic, [sentences of the paragraph], stated, { options }, [extras])
//   topic     what the paragraph is about, in a word or a phrase (fits "The paragraph is only about …").
//   stated    the position of the sentence that states the main idea (0 is the first), or null when the
//             main idea is implied. Every other sentence is a detail that supports the main idea.
//   options   main: the main idea, the one right answer. detail: one detail from the paragraph (too narrow).
//             broad: a statement that covers far more than the paragraph. off: a statement about something
//             the paragraph does not discuss.
//   extras    two true sentences that do not belong in the paragraph, for the sorting step.
import { seededRandom } from './fact-opinion.mjs';

export const DEFINITIONS = {
  topic: 'The topic is what a paragraph is about. You can say it in a word or a short phrase.',
  mainIdea: 'The main idea is the most important thing the paragraph says about its topic. You can say it in one sentence.',
  detail: 'A supporting detail is a fact or an example that tells you more about the main idea.',
};

export const ROUND_LENGTH = 5;
/** One point for choosing the main idea, one for sorting every sentence correctly. */
export const POINTS_PER_PARAGRAPH = 2;
export const ROUND_POINTS = ROUND_LENGTH * POINTS_PER_PARAGRAPH;
/** How many supporting sentences from the paragraph are shown in the sorting step. */
export const SORT_SUPPORTS = 3;

export const LEVELS = [
  { id: 1, name: 'Level 1', grades: 'Grades 2–3', ages: 'ages 7–9', about: 'The main idea is stated in the first sentence of the paragraph.' },
  { id: 2, name: 'Level 2', grades: 'Grades 4–5', ages: 'ages 9–11', about: 'The main idea is stated in the middle or at the end of the paragraph.' },
  { id: 3, name: 'Level 3', grades: 'Grades 6–8', ages: 'ages 11–14', about: 'The main idea is implied. No sentence states it, so you put the details together.' },
];

export const CATEGORIES = ['Animals', 'Weather', 'Space', 'How things are made', 'Everyday science', 'Places'];

/** The four kinds of option, and the label each one gets once the question is answered. */
export const OPTION_KINDS = {
  main: { label: 'Main idea', short: 'The main idea' },
  detail: { label: 'A detail: too narrow', short: 'A detail (too narrow)' },
  broad: { label: 'Too broad', short: 'Too broad' },
  off: { label: 'Off topic', short: 'Off topic' },
};

const p = (id, level, category, topic, sentences, stated, options, extras) => ({ id, level, category, topic, sentences, stated, options, extras });

export const PARAGRAPHS = [
  /* ------------------------------------------------ Level 1, grades 2–3: stated in the first sentence */
  p('a01', 1, 'Animals', 'camels', [
    'A camel’s body is made for life in the desert.',
    'Its wide feet do not sink into the soft sand.',
    'Its long eyelashes keep blowing sand out of its eyes.',
    'It can close its nose to keep sand out.',
    'The fat in its hump gives it energy when there is little food.',
    'A camel can also go for many days without a drink.',
  ], 0, {
    main: 'A camel’s body is made for life in the desert.',
    detail: 'A camel’s long eyelashes keep sand out of its eyes.',
    broad: 'Animals live in many places.',
    off: 'Most frogs lay their eggs in water.',
  }, ['Its baby is called a calf.', 'Penguins are birds that cannot fly.']),

  p('a02', 1, 'Animals', 'polar bears', [
    'A polar bear has many ways to stay warm in the cold.',
    'Thick fur covers its body.',
    'Under its skin there is a thick layer of fat.',
    'Its ears are small, so they do not lose much heat.',
    'It even has fur on the bottom of its paws.',
    'In a storm, it can dig a hole in the snow and curl up inside.',
  ], 0, {
    main: 'A polar bear has many ways to stay warm.',
    detail: 'A polar bear has small ears.',
    broad: 'Many kinds of animals live in the cold places of the world.',
    off: 'Most owls hunt at night and rest in the day.',
  }, ['It is a strong swimmer.', 'Bananas grow in warm places.']),

  p('a03', 1, 'Weather', 'rain', [
    'Plants, animals and people all need rain.',
    'Plants need rain to grow.',
    'Rain fills the ponds and streams where deer and birds drink.',
    'It fills the rivers and lakes where fish live.',
    'People need rain too.',
    'It fills the wells and lakes that give us water to drink.',
    'When no rain falls for a long time, the land dries out.',
    'Crops in the fields stop growing when there is no rain.',
  ], 0, {
    main: 'Plants, animals and people all need rain.',
    detail: 'Rain fills rivers and lakes.',
    broad: 'There are many kinds of weather.',
    off: 'The Sun sets in the west.',
  }, ['Raindrops fall from clouds.', 'A spider has eight legs.']),

  p('a04', 1, 'Space', 'the Moon', [
    'The Moon is a very different place from the Earth.',
    'It has no air to breathe.',
    'It has no rivers, lakes or seas.',
    'There is no wind and no rain.',
    'No plants or animals live there.',
    'Its ground is covered with gray dust and rocks.',
    'The sky above the Moon is black, even in the daytime.',
  ], 0, {
    main: 'The Moon is very different from the Earth.',
    detail: 'The Moon is covered with gray dust and rocks.',
    broad: 'There are many things in space, such as stars, planets and moons.',
    off: 'The Sun is a star, like the ones we see at night.',
  }, ['It goes around the Earth about once a month.', 'Whales live in the sea.']),

  p('a05', 1, 'How things are made', 'how bread is made', [
    'Bread is made in a few steps.',
    'First, a baker mixes flour, water, yeast and a little salt to make dough.',
    'Next, the baker presses and folds the dough again and again.',
    'Then the dough is left in a warm place until it puffs up.',
    'Last, it is baked in a hot oven until the crust is brown.',
  ], 0, {
    main: 'Bread is made in a few steps.',
    detail: 'Bread dough is left in a warm place to puff up.',
    broad: 'People make many kinds of food.',
    off: 'Cheese and butter are both made from milk.',
  }, ['Many people eat bread with butter.', 'Most paper is made from wood.']),

  p('a06', 1, 'Everyday science', 'magnets', [
    'A magnet pulls on some things but not on others.',
    'It pulls on things made of iron, such as nails.',
    'It pulls on steel paper clips too.',
    'It does not pull on wood or paper.',
    'It does not pull on plastic or glass.',
    'It does not even pull on every metal: a magnet will not pick up kitchen foil.',
  ], 0, {
    main: 'A magnet pulls on some things but not on others.',
    detail: 'A magnet pulls on iron nails.',
    broad: 'Science helps us learn about the world.',
    off: 'Ice melts when it gets warm.',
  }, ['It can be shaped like a bar or a horseshoe.', 'Wood comes from trees.']),

  p('a07', 1, 'Places', 'deserts', [
    'A desert is a very dry place.',
    'Very little rain falls there.',
    'In some deserts, many months can pass with no rain at all.',
    'The ground is dry sand, stones or bare rock.',
    'Most streams in a desert are dry for much of the year.',
    'The plants that grow there, such as cactuses, must store water to stay alive.',
  ], 0, {
    main: 'A desert is a very dry place.',
    detail: 'Desert plants such as cactuses store water.',
    broad: 'The Earth has many kinds of land.',
    off: 'Fish breathe under water with their gills.',
  }, ['It can be cold there at night.', 'Ducks have webbed feet.']),

  p('a08', 1, 'Animals', 'frogs', [
    'A frog changes a lot as it grows up.',
    'It starts life as a tiny egg in the water.',
    'A tadpole hatches from the egg.',
    'The tadpole has a tail and breathes under water, like a fish.',
    'Slowly it grows back legs and then front legs.',
    'Its tail gets shorter and shorter.',
    'At last it is a frog that can hop onto the land.',
  ], 0, {
    main: 'A frog changes a lot as it grows up.',
    detail: 'A tadpole has a tail.',
    broad: 'Baby animals grow up to be adults.',
    off: 'Many birds build nests for their eggs.',
  }, ['Frogs eat insects.', 'Apples grow on trees.']),

  p('a09', 1, 'Weather', 'the wind', [
    'You cannot see the wind, but you can see what it does.',
    'It makes flags flap.',
    'It bends the branches of trees.',
    'It blows leaves along the street.',
    'It makes ripples and waves on a lake.',
    'It pushes sailboats across the water.',
    'It turns the blades of a windmill.',
    'It lifts kites high into the sky.',
  ], 0, {
    main: 'You cannot see the wind, but you can see what it does.',
    detail: 'The wind lifts kites into the sky.',
    broad: 'Weather changes from day to day.',
    off: 'Rain falls from clouds.',
  }, ['Some kites are shaped like diamonds.', 'Snow is frozen water.']),

  p('a10', 1, 'Space', 'the Sun', [
    'Living things on Earth need the Sun.',
    'It gives us light, so we can see in the daytime.',
    'It keeps the land and the sea warm.',
    'Plants use sunlight to make their food.',
    'Many animals eat plants, so they need the Sun too.',
    'Without the Sun, the Earth would be dark and much too cold for us.',
  ], 0, {
    main: 'Living things on Earth need the Sun.',
    detail: 'Plants use sunlight to make their own food.',
    broad: 'There are many stars in space.',
    off: 'Mars is called the Red Planet.',
  }, ['It is much bigger than the Earth.', 'A week has seven days.']),

  p('a11', 1, 'How things are made', 'how crayons are made', [
    'Wax crayons are made in a few steps.',
    'First, wax is heated in a big pot until it melts.',
    'Next, colored powder is stirred into the hot wax.',
    'Then the wax is poured into molds shaped like crayons.',
    'The wax cools and gets hard, and the crayons are pushed out of the molds.',
    'Last, a paper label is wrapped around each crayon.',
  ], 0, {
    main: 'Wax crayons are made in a few steps.',
    detail: 'Hot wax is poured into molds.',
    broad: 'Many of the things we use are made in factories.',
    off: 'Glass is made from sand that has been melted.',
  }, ['Crayons come in many colors.', 'Milk comes from cows.']),

  p('a12', 1, 'Places', 'high mountains', [
    'The top of a high mountain is a hard place to live.',
    'It is very cold there.',
    'Strong winds blow.',
    'The air is thin, so it is hard to breathe.',
    'Snow and ice can cover the ground all year.',
    'Few plants can grow on the bare rock, so there is little for animals to eat.',
  ], 0, {
    main: 'The top of a high mountain is a hard place to live.',
    detail: 'The air is thin at the top of a high mountain.',
    broad: 'The world has many different kinds of places.',
    off: 'Many rivers carry water to the sea.',
  }, ['Some mountains are volcanoes.', 'Cows eat grass.']),

  /* ---------------------------------------- Level 2, grades 4–5: stated in the middle or at the end */
  p('b01', 2, 'Animals', 'owls', [
    'An owl’s large eyes take in a lot of light, so it can see when it is nearly dark.',
    'Its ears are so sharp that it can hear a mouse moving under leaves.',
    'The soft edges of its feathers let it fly almost without a sound.',
    'Its strong feet end in sharp, curved claws.',
    'Everything about an owl makes it a skilled night hunter.',
  ], 4, {
    main: 'An owl’s body makes it a skilled night hunter.',
    detail: 'An owl’s feathers let it fly almost without a sound.',
    broad: 'Birds come in many shapes and sizes.',
    off: 'Bats are mammals that can fly, and most of them are active at night.',
  }, ['Owls lay white eggs.', 'Ostriches cannot fly.']),

  p('b02', 2, 'Weather', 'clouds', [
    'Thin, wispy clouds high in the sky usually mean fair weather for now.',
    'Flat gray clouds that cover the whole sky often bring steady rain.',
    'If you learn the shapes of clouds, you can often tell what weather is coming.',
    'Puffy white clouds with flat bases belong to a fine day.',
    'When puffy clouds grow tall and dark, a storm may be on the way.',
  ], 2, {
    main: 'Cloud shapes can tell you what weather is coming.',
    detail: 'Flat gray clouds often bring steady rain.',
    broad: 'The weather is not the same in every part of the world.',
    off: 'Wind is air that moves from one place to another.',
  }, ['Clouds are made of tiny drops of water or ice.', 'A year has twelve months.']),

  p('b03', 2, 'Space', 'the planets', [
    'Mercury, the planet closest to the Sun, is a small ball of rock with almost no air.',
    'Venus is wrapped in thick clouds and is hotter than an oven.',
    'Mars is a cold, dusty desert.',
    'Jupiter is a giant made mostly of gas, with no solid ground to stand on.',
    'The planets in our solar system are very different from one another.',
  ], 4, {
    main: 'The planets in our solar system are very different from one another.',
    detail: 'Mars is a cold, dusty desert.',
    broad: 'Space holds many things, such as stars, moons and planets.',
    off: 'The Moon has no light of its own.',
  }, ['All eight planets travel around the Sun.', 'Bread is baked in an oven.']),

  p('b04', 2, 'How things are made', 'how glass is made', [
    'Glass begins as ordinary sand.',
    'The sand is mixed with a few other materials and heated in a very hot furnace.',
    'In the furnace, the mixture melts into a thick, glowing liquid.',
    'While the liquid is still hot and soft, it is blown, pressed or rolled into shape.',
    'As the glass cools, it hardens.',
    'So a clear, smooth window or bottle is really sand that has been melted and shaped.',
  ], 5, {
    main: 'Glass is sand that has been melted and shaped.',
    detail: 'Hot glass can be blown into shape.',
    broad: 'Many everyday things are made from materials found in the ground.',
    off: 'Bricks are made from clay that is baked until it is hard.',
  }, ['Glass can be recycled and used again.', 'Wool comes from sheep.']),

  p('b05', 2, 'Everyday science', 'lightning and thunder', [
    'During a storm, you see a flash of lightning and then hear the thunder a few seconds later.',
    'Yet the flash and the thunder start at the same moment.',
    'The delay happens because light travels much faster than sound.',
    'The light from the flash reaches your eyes almost at once.',
    'The sound of the thunder moves through the air far more slowly, so it arrives later.',
    'The farther away the storm is, the longer you wait for the thunder.',
  ], 2, {
    main: 'Light travels faster than sound, so we see lightning before we hear thunder.',
    detail: 'The light from a flash of lightning reaches your eyes almost as soon as it happens.',
    broad: 'Science can explain many things that happen in nature.',
    off: 'A rainbow can appear when the Sun shines through raindrops.',
  }, ['Lightning is a giant electric spark.', 'Cats have whiskers.']),

  p('b06', 2, 'Places', 'rainforests', [
    'At the very top of a rainforest, a few giant trees poke out above all the others.',
    'Below them, the leafy tops of the trees join together like a green roof.',
    'Most of the forest’s animals live in this leafy roof.',
    'Under the leafy roof, smaller trees and young plants grow in the shade.',
    'The forest floor is dark and damp, because very little sunlight reaches it.',
    'A rainforest is built in layers, and each layer is a different kind of home.',
  ], 5, {
    main: 'A rainforest has layers, and each layer is a different kind of home.',
    detail: 'The floor of a rainforest is dark and damp.',
    broad: 'Forests grow in many parts of the world.',
    off: 'Deserts get very little rain.',
  }, ['Rainforests grow where a great deal of rain falls.', 'Flour is made from wheat.']),

  p('b07', 2, 'Animals', 'worker bees', [
    'The youngest worker bees clean the cells of the honeycomb and feed the young.',
    'Slightly older workers build new comb from wax.',
    'Some workers guard the entrance to the hive.',
    'A worker bee does many different jobs in her short life, and the jobs change as she grows older.',
    'The oldest workers fly out each day to collect nectar and pollen from flowers.',
  ], 3, {
    main: 'A worker bee’s jobs change as she grows older.',
    detail: 'Some worker bees guard the entrance to the hive.',
    broad: 'Insects are found almost everywhere on land.',
    off: 'Spiders have eight legs, so they are not insects.',
  }, ['The queen bee lays the eggs.', 'Whales breathe air.']),

  p('b08', 2, 'Weather', 'rainbows', [
    'Sunlight looks white, but it is really a mixture of colors.',
    'When a ray of sunlight enters a raindrop, it bends.',
    'The colors bend by slightly different amounts, so they spread apart.',
    'The light bounces off the back of the drop and bends again as it leaves.',
    'In this way, millions of raindrops split sunlight into the colors of a rainbow.',
  ], 4, {
    main: 'Raindrops split sunlight into colors to make a rainbow.',
    detail: 'Sunlight is a mixture of colors.',
    broad: 'Light behaves in different ways when it meets different things.',
    off: 'Thunder is the sound that lightning makes.',
  }, ['People have told stories about rainbows for thousands of years.', 'Ice floats on water.']),

  p('b09', 2, 'Space', 'day and night', [
    'The Earth is always spinning like a top, and it takes one day to turn all the way around.',
    'Day and night happen because of this spin.',
    'At any moment, the half of the Earth that faces the Sun has daylight.',
    'The half that is turned away from the Sun is dark.',
    'As the Earth keeps turning, each place moves out of the light, into the dark and back again.',
  ], 1, {
    main: 'Day and night happen because the Earth spins.',
    detail: 'The Earth takes one day to turn all the way around.',
    broad: 'The Earth, the Moon and the planets are always moving.',
    off: 'The Moon has mountains and craters.',
  }, ['The Earth also travels around the Sun once a year.', 'Many flowers open in spring.']),

  p('b10', 2, 'How things are made', 'how pencils are made', [
    'A pencil starts as a thin, flat piece of wood with narrow grooves cut into it.',
    'A stick of graphite mixed with clay, the part we call the lead, is laid in each groove.',
    'A second piece of wood is glued on top.',
    'Then machines cut the wood into separate pencils and paint them.',
    'So every pencil is really a wooden sandwich with graphite in the middle.',
  ], 4, {
    main: 'A pencil is a wooden sandwich with graphite in the middle.',
    detail: 'The “lead” in a pencil is graphite mixed with clay.',
    broad: 'Many things we use at school are made in factories.',
    off: 'Crayons are made of wax that has been melted, colored and cooled.',
  }, ['Many pencils have an eraser on the end.', 'Bees make honey.']),

  p('b11', 2, 'Everyday science', 'ice, water and water vapor', [
    'Leave an ice cube on a plate and it melts into a puddle.',
    'Heat water in a pan and it boils away into the air as a gas called water vapor.',
    'Water can be a solid, a liquid or a gas, and heating or cooling changes it from one form to another.',
    'Cool the water vapor and it turns back into drops of liquid water.',
    'Put liquid water in a freezer and it becomes solid ice.',
  ], 2, {
    main: 'Water can be a solid, a liquid or a gas, and heating or cooling changes its form.',
    detail: 'An ice cube left on a plate melts into a puddle.',
    broad: 'Everything around us is made of matter.',
    off: 'Magnets pull on iron.',
  }, ['Most of the Earth’s surface is covered by water.', 'Sound travels through air.']),

  p('b12', 2, 'Places', 'rivers', [
    'A river often begins high in the hills as a small, fast stream.',
    'As it flows downhill, other streams join it, and it grows wider and deeper.',
    'On flatter land it slows down and winds from side to side in wide curves.',
    'When it reaches the sea at last, it drops the mud and sand it has been carrying.',
    'A river changes a great deal on its way from the hills to the sea.',
  ], 4, {
    main: 'A river changes a great deal on its way from the hills to the sea.',
    detail: 'A river slows down on flatter land.',
    broad: 'Water is found in many places on Earth.',
    off: 'A volcano can pour out melted rock that comes from deep under the ground.',
  }, ['Many towns and cities were built beside rivers.', 'Eagles have sharp eyesight.']),

  /* ------------------------------------------------- Level 3, grades 6–8: implied, never stated */
  p('c01', 3, 'Animals', 'animals that are hard to see', [
    'A snowshoe hare’s coat turns white in winter, when snow covers the ground, and brown again in summer.',
    'A stick insect is so long, thin and still that it is easily mistaken for a twig.',
    'Flatfish that lie on the seabed can change the pattern of their skin to match the sand or gravel beneath them.',
    'A tiger’s stripes break up its outline among tall grass and shadows.',
  ], null, {
    main: 'Many animals have colors, shapes or patterns that make them hard to see.',
    detail: 'A stick insect looks like a twig.',
    broad: 'Animals have many ways of staying alive.',
    off: 'Some animals sleep through the winter.',
  }, ['Snowshoe hares eat plants.', 'Cheetahs can run very fast.']),

  p('c02', 3, 'Weather', 'water that comes out of the air', [
    'On a cold morning, the grass may be covered with drops of dew, although no rain has fallen.',
    'A glass of ice water becomes wet on the outside, even though nothing has been spilled.',
    'A bathroom mirror mists over while someone takes a hot shower.',
    'A cold window drips on the inside when a pot is boiling in the kitchen.',
  ], null, {
    main: 'Water that is in the air can turn into drops on cool surfaces.',
    detail: 'Dew can cover the grass when no rain has fallen.',
    broad: 'Water is found all over the Earth.',
    off: 'Hot air rises above cooler air, which is why smoke drifts upward.',
  }, ['Mirrors are made of glass with a shiny coating on the back.', 'Rivers flow downhill.']),

  p('c03', 3, 'Space', 'the rocky planets near the Sun', [
    'Mercury has almost no air, and its sunlit side is hot enough to melt lead.',
    'Venus is hotter still, and its thick air would crush a visitor.',
    'Mars is dry and bitterly cold, with air far too thin to breathe.',
    'Earth, however, has liquid water, air that we can breathe and temperatures that suit living things.',
  ], null, {
    main: 'Earth suits living things far better than the other rocky planets near the Sun.',
    detail: 'Venus is even hotter than Mercury.',
    broad: 'The solar system contains many different objects.',
    off: 'The pull of the Moon causes tides in the oceans.',
  }, ['Mars has two small moons.', 'A year on Earth lasts about 365 days.']),

  p('c04', 3, 'How things are made', 'how a wool sweater is made', [
    'Before a wool sweater reaches a store, a farmer must shear the fleece from a sheep.',
    'The fleece is washed to remove dirt and grease, then combed so that the fibers all lie in the same direction.',
    'The fibers are twisted into yarn, and the yarn is dyed.',
    'Only then can the yarn be knitted into the shape of a sweater.',
  ], null, {
    main: 'Turning a sheep’s fleece into a sweater takes many steps.',
    detail: 'Fleece is washed to remove dirt and grease.',
    broad: 'Clothes can be made from many different materials, such as wool, cotton and silk.',
    off: 'Cotton comes from the fluffy white fibers of the cotton plant.',
  }, ['Wool keeps people warm in cold weather.', 'Sheep usually live in flocks.']),

  p('c05', 3, 'Everyday science', 'rubbing between surfaces', [
    'Rub your hands together quickly and they grow warm.',
    'The rough soles of your shoes grip the ground, so that your feet do not slide when you walk.',
    'A ball rolling across level grass slows down and stops.',
    'A bicycle’s brake pads press against the wheel to bring the bike to a halt.',
    'On an icy path, where surfaces slide past each other easily, it is hard to walk at all.',
  ], null, {
    main: 'Rubbing between surfaces, called friction, affects many everyday actions.',
    detail: 'Rubbing your hands together makes them warm.',
    broad: 'Forces act on everything around us.',
    off: 'Gravity pulls objects toward the Earth, which is why a dropped ball falls.',
  }, ['Bicycles were invented in the 1800s.', 'Many shoes fasten with laces.']),

  p('c06', 3, 'Places', 'coral reefs', [
    'Coral reefs cover only a tiny part of the sea floor, yet thousands of kinds of fish feed and hide among them.',
    'Crabs, shrimps and sea stars shelter in the cracks of the reef.',
    'Sea turtles come to the reef to feed, and sharks patrol its edges.',
    'Even the reef itself is the work of living things: it is built, little by little, by tiny animals called coral polyps.',
  ], null, {
    main: 'A coral reef is crowded with many kinds of living things.',
    detail: 'Crabs, shrimps and sea stars shelter in the cracks of a coral reef.',
    broad: 'The oceans contain many living things.',
    off: 'Rivers carry fresh water to the sea.',
  }, ['Most coral reefs grow in warm, shallow seas.', 'Seawater is salty.']),

  p('c07', 3, 'Animals', 'long journeys that animals make', [
    'Each autumn, Arctic terns fly from the far north of the Earth to the far south.',
    'Many monarch butterflies fly from Canada to Mexico for the winter.',
    'Humpback whales swim from cold seas, where they feed, to warm seas, where their calves are born.',
    'Herds of wildebeest walk across the plains of Africa, following the rains that bring fresh grass.',
    'Each of these trips is hundreds or even thousands of kilometers long.',
  ], null, {
    main: 'Many kinds of animals travel long distances as the seasons change.',
    detail: 'Humpback whales give birth in warm seas.',
    broad: 'Animals behave in many different ways.',
    off: 'Many bears sleep through much of the winter.',
  }, ['Monarch butterflies are orange and black.', 'Wildebeest are a kind of antelope.']),

  p('c08', 3, 'Weather', 'tools for measuring the weather', [
    'A thermometer shows how warm or cold the air is.',
    'A barometer measures the pressure of the air, which often falls before a storm.',
    'A rain gauge collects rainfall so that it can be measured, and the spinning cups of an anemometer show the speed of the wind.',
    'High above the Earth, satellites photograph the clouds as they move.',
  ], null, {
    main: 'Many different tools are used to measure and watch the weather.',
    detail: 'A barometer measures the pressure of the air.',
    broad: 'Scientists of every kind use special tools to study the natural world.',
    off: 'A telescope makes distant objects look larger.',
  }, ['Weather can change quickly in the mountains.', 'Sharks are fish.']),

  p('c09', 3, 'Space', 'stars', [
    'Some stars are red, some are yellow like the Sun, and the hottest shine blue-white.',
    'Some are far smaller than the Sun, while giant stars are hundreds of times wider.',
    'Many stars shine alone, as the Sun does, but others circle each other in pairs.',
    'A few are near enough for their light to reach us in a few years, while the light of others travels for thousands of years.',
  ], null, {
    main: 'Stars are not all alike: they differ in many ways.',
    detail: 'The hottest stars shine blue-white.',
    broad: 'The night sky is full of interesting objects.',
    off: 'The Earth takes one year to travel all the way around the Sun.',
  }, ['Sailors once used the stars to find their way at sea.', 'Venus is a planet, not a star.']),

  p('c10', 3, 'How things are made', 'how a book is made', [
    'An author may spend months or even years writing a story.',
    'An editor then reads the story closely and suggests ways to improve it.',
    'An illustrator may draw the cover or the pictures, and a designer chooses the lettering and arranges each page.',
    'Finally, printers print the pages and bind them inside a cover.',
  ], null, {
    main: 'It takes many people with different jobs to make a book.',
    detail: 'An editor suggests ways to improve a story.',
    broad: 'People do many different kinds of work.',
    off: 'A library lends books to its readers.',
  }, ['Some books have hard covers and some have soft ones.', 'Oranges grow on trees.']),

  p('c11', 3, 'Everyday science', 'how sounds are made', [
    'Pluck a guitar string and you can watch it shiver as it produces a note.',
    'Touch your throat while you hum, and you will feel a gentle buzzing beneath your fingers.',
    'A drum skin trembles each time it is struck, and grains of rice sprinkled on it will jump.',
    'When a ringing bell is gripped so that it cannot shake, the note stops at once.',
  ], null, {
    main: 'Sounds are made when something vibrates.',
    detail: 'A guitar string shivers when it is plucked.',
    broad: 'We learn about the world through our senses.',
    off: 'Light travels much faster than sound does.',
  }, ['A guitar usually has six strings.', 'Some bells are made of bronze.']),

  p('c12', 3, 'Places', 'cities beside water', [
    'London grew up on the banks of the River Thames, and Paris on the Seine.',
    'Cairo stands beside the Nile.',
    'New York spread around a great natural harbor at the mouth of the Hudson River.',
    'Long before trucks and trains existed, the people of such places could fetch drinking water, catch fish and send their goods away by boat.',
  ], null, {
    main: 'Many large cities grew up beside rivers or harbors because the water was so useful.',
    detail: 'Cairo stands beside the Nile.',
    broad: 'People live in many different kinds of places.',
    off: 'Mountains are colder at the top than at the bottom.',
  }, ['The Nile flows north into the Mediterranean Sea.', 'Many cities have tall buildings.']),
];

export const paragraphById = id => PARAGRAPHS.find(item => item.id === id);
export const paragraphsFor = level => PARAGRAPHS.filter(item => item.level === level);
export const levelById = id => LEVELS.find(level => level.id === Number(id));

/** The paragraph as one piece of text. */
export const paragraphText = item => item.sentences.join(' ');
/** The sentence that states the main idea, or null when the main idea is implied. */
export const statedSentence = item => (item.stated === null ? null : item.sentences[item.stated]);
/** Every sentence of the paragraph that is a supporting detail (all of them except the stated main idea). */
export const supportingSentences = item => item.sentences.filter((_, i) => i !== item.stated);
/** Where the main idea is: 'first', 'middle', 'last' or 'implied'. */
export function whereStated(item) {
  if (item.stated === null) return 'implied';
  if (item.stated === 0) return 'first';
  return item.stated === item.sentences.length - 1 ? 'last' : 'middle';
}

/* --------------------------------------------------------- explanations */

/** Where the main idea is found, and how to tell: shown after the first step is answered. */
export function explainMain(item) {
  const where = whereStated(item);
  if (where === 'first') return 'The first sentence states the main idea. Every sentence after it is a detail that tells you more about it.';
  if (where === 'last') return `The last sentence states the main idea: “${statedSentence(item)}” The sentences before it are the details that lead up to it.`;
  if (where === 'middle') return `A sentence in the middle states the main idea: “${statedSentence(item)}” The sentences around it are the details.`;
  return `No sentence states the main idea. Each sentence is a detail, and together they all show one thing: ${item.options.main}`;
}

/** Why a wrong option is not the main idea. */
export function whyNot(item, kind) {
  if (kind === 'detail') return 'Too narrow. This is one detail. It supports the main idea, but it does not cover the rest of the paragraph.';
  if (kind === 'broad') return `Too broad. The paragraph is only about ${item.topic}, and this says much more than that.`;
  if (kind === 'off') return 'Off topic. The paragraph does not say anything about this.';
  return explainMain(item);
}

/** Why a sentence in the sorting step belongs or does not. */
export function explainSentence(item, belongs) {
  return belongs
    ? 'Supports the main idea. It is a detail from the paragraph.'
    : 'Does not belong. It is true, but it tells you nothing about the main idea.';
}

/* --------------------------------------------------------------- rounds */

function shuffled(list, random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Five paragraphs for a level, the same every time for the same seed:
 * [{ item, options: [{ kind, text }], sort: [{ text, belongs }] }].
 * `options` are the four main idea choices in a mixed order. `sort` is three supporting sentences from the
 * paragraph, in the order they have there, with one or two sentences that do not belong slipped in among
 * them: four or five sentences in all.
 */
export function buildRound(level, seed) {
  const random = seededRandom(seed);
  return shuffled(paragraphsFor(level), random).slice(0, ROUND_LENGTH).map(item => {
    const options = shuffled(Object.keys(OPTION_KINDS), random).map(kind => ({ kind, text: item.options[kind] }));
    const supports = supportingSentences(item);
    const chosen = new Set(shuffled(supports, random).slice(0, SORT_SUPPORTS));
    const sort = supports.filter(text => chosen.has(text)).map(text => ({ text, belongs: true }));
    for (const text of shuffled(item.extras, random).slice(0, 1 + Math.floor(random() * 2))) {
      sort.splice(Math.floor(random() * (sort.length + 1)), 0, { text, belongs: false });
    }
    return { item, options, sort };
  });
}

/** Step 1: is the option at this position the main idea? */
export function checkMain(question, index) {
  return question.options[index]?.kind === 'main';
}

/**
 * Step 2: `answers` holds true (supports the main idea) or false (does not belong) for each sentence.
 * Returns { right: [true, false, …], correct, total, all }.
 */
export function checkSort(question, answers) {
  const right = question.sort.map((sentence, i) => answers[i] === sentence.belongs);
  const correct = right.filter(Boolean).length;
  return { right, correct, total: right.length, all: correct === right.length };
}

/**
 * Score for a finished round, from [{ main: true/false, sort: true/false }]: one point for each main idea
 * chosen and one for each paragraph whose sentences were all sorted correctly.
 */
export function scoreRound(results) {
  const main = results.filter(result => result.main).length;
  const sort = results.filter(result => result.sort).length;
  const total = results.length * POINTS_PER_PARAGRAPH;
  return { main, sort, points: main + sort, total, paragraphs: results.length, perfect: results.length > 0 && main + sort === total };
}

/** A short, kind message for the results screen. */
export function resultMessage({ points, total, main, sort }) {
  if (points === total) return 'A perfect round. You found every main idea and sorted every detail.';
  if (points >= total * 0.8) return 'Great work. Look over the ones you missed, then try for a perfect round.';
  if (main < sort) return 'Your sorting is ahead of your main ideas. Before you choose, ask: does this cover the whole paragraph, or only one part of it?';
  if (points >= total * 0.5) return 'Good start. Read the explanations for the ones you missed and play again.';
  return 'Keep going. Ask two questions each time: what is the paragraph about, and what does it say about that?';
}

/* ---------------------------------------------------------- the worksheet */

/**
 * A paragraph with one sentence that does not belong slipped into it, for the worksheet:
 * [{ text, role }], where role is 'main', 'detail' or 'extra'. `after` is how many of the paragraph's
 * own sentences come before the extra one.
 */
export function withIntruder(item, extra, after) {
  const sentences = item.sentences.map((text, i) => ({ text, role: i === item.stated ? 'main' : 'detail' }));
  sentences.splice(after, 0, { text: item.extras[extra], role: 'extra' });
  return sentences;
}
