// Sample texts for the Reading Level Checker. All but one were written for this site, at clearly different
// levels. The exception is the Gettysburg Address (Abraham Lincoln, 1863, in the public domain), given in the
// wording of the "Bliss copy", the last version Lincoln wrote out and the one usually printed.
// The levels shown on the page are worked out by the model, not typed here.

export const SAMPLES = [
  {
    id: 'kite',
    label: 'The Red Kite',
    kind: 'A short story',
    text: `Sam had a red kite with a long yellow tail. He carried it to the park with his dad on a windy morning. Sam ran as fast as he could, and the kite lifted into the air. It flew high above the trees. Then the string snapped! The kite sailed away and landed in the branches of a tall tree. Sam felt terrible. His dad found a long stick and gave the branch a gentle shake. Down came the kite. This time Sam held the string tightly. He let the kite fly again, and it danced in the sunny sky. A little dog barked at it from the grass. Sam and his dad laughed together. It was a wonderful day at the park.`,
  },
  {
    id: 'honey',
    label: 'How Bees Make Honey',
    kind: 'A science explanation',
    text: `Honey starts as nectar, a sweet liquid that flowers make. A worker bee visits many flowers on one trip. She drinks the nectar and stores it in a special stomach. Back at the hive, she passes the nectar to other bees. They chew it for a while, and this slowly changes the sugars inside it. Next, the bees spread the nectar into the small wax cells of the honeycomb. It is still too watery to keep for long, so the bees fan it with their wings until most of the water has dried up. At last the nectar becomes thick, sticky honey. The bees seal each full cell with a wax lid. The honey will feed the whole hive through the winter, when few flowers bloom.`,
  },
  {
    id: 'seasons',
    label: 'Why We Have Seasons',
    kind: 'A science article',
    text: `Many people believe that summer arrives when Earth moves closer to the Sun, but distance is not the reason for the seasons. The real cause is the tilt of Earth’s axis, the imaginary line that runs between the North and South Poles. This axis leans about 23.5 degrees, and it points in the same direction throughout the year. As Earth travels around the Sun, the northern half of the planet leans toward the Sun for part of the orbit and away from it for another part. When the northern hemisphere is tilted toward the Sun, sunlight strikes it more directly and the days grow longer, so temperatures rise and summer begins. At the same time, the southern hemisphere receives less direct sunlight and experiences winter. Six months later the situation is reversed.`,
  },
  {
    id: 'formulas',
    label: 'What Formulas Cannot Measure',
    kind: 'An academic paragraph',
    text: `Readability formulas estimate difficulty from surface characteristics, principally average sentence length and average word length, because these quantities are inexpensive to calculate and correlate reasonably well with comprehension. Nevertheless, a correlation is not an explanation. A passage constructed from short, familiar words can still communicate an unfamiliar or abstract argument, whereas a technical description may remain accessible to readers who already possess the relevant background knowledge. Formulas are similarly indifferent to organization, illustration, typography and motivation, all of which influence understanding considerably. Consequently, experienced educators interpret a calculated grade level as preliminary evidence rather than a definitive classification, and they supplement it with professional judgment about the particular readers for whom the material is intended.`,
  },
  {
    id: 'gettysburg',
    label: 'The Gettysburg Address',
    kind: 'A speech by Abraham Lincoln, 1863',
    text: `Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal.

Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this.

But, in a larger sense, we can not dedicate—we can not consecrate—we can not hallow—this ground. The brave men, living and dead, who struggled here, have consecrated it, far above our poor power to add or detract. The world will little note, nor long remember what we say here, but it can never forget what they did here. It is for us the living, rather, to be dedicated here to the unfinished work which they who fought here have thus far so nobly advanced. It is rather for us to be here dedicated to the great task remaining before us—that from these honored dead we take increased devotion to that cause for which they gave the last full measure of devotion—that we here highly resolve that these dead shall not have died in vain—that this nation, under God, shall have a new birth of freedom—and that government of the people, by the people, for the people, shall not perish from the earth.`,
  },
];

/** The sample the page shows before anything is typed. */
export const DEFAULT_SAMPLE = 'honey';

// The passage on the printable worksheet, and a model rewrite for a younger reader (answer key).
// Both were written for this site. The checker offers the passage as a sample so nobody has to retype it.
export const WORKSHEET_PASSAGE = {
  id: 'leaves',
  label: 'Why Leaves Change Color',
  kind: 'The worksheet passage',
  text: `During spring and summer, the leaves of many trees contain a large amount of chlorophyll. This green substance captures energy from sunlight and allows the tree to produce its own food. As autumn approaches, the days become shorter and cooler, so the tree stops producing chlorophyll and the green color slowly disappears. Yellow and orange substances that were hidden inside the leaves all summer finally become visible. In some trees, sugar that remains trapped in the leaves produces bright red and purple colors as well. Eventually the tree seals off each leaf at its stem, and the leaves fall to the ground.`,
};

export const WORKSHEET_REWRITE = `In spring and summer, the leaves of many trees are full of a green substance called chlorophyll. It catches light from the Sun. The tree uses that energy to make its own food. In the fall, the days get shorter and cooler. The tree stops making chlorophyll, and the green color fades. Now we can see yellow and orange. These colors were in the leaves all summer, but the green hid them. Some trees also turn red or purple. Sugar that is stuck in the leaves makes those colors. At last the tree seals off each leaf at its stem. Then the leaves fall to the ground.`;

export const sampleById = id => [...SAMPLES, WORKSHEET_PASSAGE].find(sample => sample.id === id);
