// Every tool on the site, in menu order. `section` is the Layout section its pages pass, which puts them under
// Tools in the menu and in the breadcrumb trail. `kind` says what sort of tool it is, in the words people search
// with; the Tools hub shows it above each name. Used by the Tools hub, the home page and the footer.
// `live: false` marks a tool that is registered here but not built yet: it is left out of `tools`, so no page
// links to it. Set `live: true` (or delete the line) when its pages exist.
const ALL = [
  {
    slug: 'reading-level',
    name: 'Reading Level Checker',
    section: 'Reading Level',
    topic: 'Readability',
    kind: 'Readability and grade level checker',
    blurb: 'Paste or type a text to see its US grade level, age range and Flesch Reading Ease score, with the long sentences and long words marked so you can see what to change.',
  },
  {
    slug: 'fact-or-opinion',
    name: 'Fact or Opinion Game',
    section: 'Fact or Opinion',
    topic: 'Critical reading',
    kind: 'Fact vs opinion sorting game',
    blurb: 'Read a statement and decide: fact or opinion? Three levels for grades 2–8, with the clue words explained after every answer and a results screen that shows what to practice.',
  },
  {
    slug: 'plot-diagram',
    live: false,
    name: 'Plot Diagram Builder',
    section: 'Plot Diagram',
    topic: 'Story structure',
    kind: 'Story mountain and plot diagram maker',
    blurb: 'TODO',
  },
  {
    slug: 'fiction-or-nonfiction',
    name: 'Fiction or Nonfiction Game',
    section: 'Fiction or Nonfiction',
    topic: 'Genres',
    kind: 'Fiction vs nonfiction and genre sorting game',
    blurb: 'Read a passage or a book description and decide: fiction or nonfiction? Three levels for grades 2–8, from clear cases to naming 13 genres, with the clues explained after every answer.',
  },
  {
    slug: 'main-idea',
    live: false,
    name: 'Main Idea and Details Game',
    section: 'Main Idea',
    topic: 'Comprehension',
    kind: 'Main idea and supporting details practice',
    blurb: 'TODO',
  },
  {
    slug: 'context-clues',
    live: false,
    name: 'Context Clues Game',
    section: 'Context Clues',
    topic: 'Vocabulary',
    kind: 'Context clues vocabulary practice',
    blurb: 'TODO',
  },
  {
    slug: 'cause-and-effect',
    live: false,
    name: 'Cause and Effect Game',
    section: 'Cause and Effect',
    topic: 'Comprehension',
    kind: 'Cause and effect sentence practice',
    blurb: 'TODO',
  },
  {
    slug: 'figurative-language',
    name: 'Figurative Language Game',
    section: 'Figurative Language',
    topic: 'Figurative language',
    kind: 'Simile, metaphor and figurative language practice',
    blurb: 'Name the figurative language in a sentence: simile, metaphor, personification, hyperbole, idiom, alliteration or onomatopoeia. Three levels for grades 3–8, with the signal words shown after every answer.',
  },
  {
    slug: 'parts-of-speech',
    live: false,
    name: 'Parts of Speech Game',
    section: 'Parts of Speech',
    topic: 'Grammar',
    kind: 'Parts of speech tagging game',
    blurb: 'TODO',
  },
  {
    slug: 'word-builder',
    live: false,
    name: 'Prefix and Suffix Word Builder',
    section: 'Word Builder',
    topic: 'Word parts',
    kind: 'Prefix, root and suffix word builder',
    blurb: 'TODO',
  },
  {
    slug: 'reading-speed',
    live: false,
    name: 'Reading Speed Test',
    section: 'Reading Speed',
    topic: 'Fluency',
    kind: 'Words per minute reading test',
    blurb: 'TODO',
  },
  {
    slug: 'fables',
    live: false,
    name: 'Fables Read-Along',
    section: 'Fables',
    topic: 'Fables',
    kind: 'Aesop’s fables read aloud with highlighted text',
    blurb: 'TODO',
  },
];

/** The tools that are built and linked. */
export const tools = ALL.filter(tool => tool.live !== false);

const COUNT_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
/** How many tools there are, as a word ("two"), so every page that counts them stays in step with this list. */
export const toolCount = COUNT_WORDS[tools.length] ?? String(tools.length);
/** The same word with a capital, for the start of a sentence or a title ("Two"). */
export const ToolCount = toolCount[0].toUpperCase() + toolCount.slice(1);

export const toolBySection = section => tools.find(tool => tool.section === section);
