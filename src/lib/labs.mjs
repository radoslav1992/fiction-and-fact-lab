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
    name: 'Plot Diagram Builder',
    section: 'Plot Diagram',
    topic: 'Story structure',
    kind: 'Story mountain and plot diagram maker',
    blurb: 'Build the plot diagram of any story on a story mountain, from exposition to resolution, then print it or share it by link. Or practice by sorting the events of six well-known tales onto the mountain.',
  },
  {
    slug: 'fiction-or-nonfiction',
    live: false,
    name: 'Fiction or Nonfiction Game',
    section: 'Fiction or Nonfiction',
    topic: 'Genres',
    kind: 'Fiction vs nonfiction sorting game',
    blurb: 'TODO',
  },
  {
    slug: 'main-idea',
    name: 'Main Idea and Details Game',
    section: 'Main Idea',
    topic: 'Comprehension',
    kind: 'Main idea and supporting details practice',
    blurb: 'Read a short paragraph, choose its main idea, then sort the sentences that support it from the ones that do not belong. Three levels for grades 2–8, from a main idea stated in the first sentence to one that is only implied.',
  },
  {
    slug: 'context-clues',
    name: 'Context Clues Game',
    section: 'Context Clues',
    topic: 'Vocabulary',
    kind: 'Context clues vocabulary practice',
    blurb: 'Work out what a hard word means from the words around it. Three levels for grades 2–8 cover definition, synonym, antonym, example and inference clues, with the clue marked after every answer.',
  },
  {
    slug: 'cause-and-effect',
    name: 'Cause and Effect Game',
    section: 'Cause and Effect',
    topic: 'Comprehension',
    kind: 'Cause and effect sentence practice',
    blurb: 'Tap the cause or the effect in a sentence, spot the signal word, match causes to effects and follow a chain of events through a paragraph. Three levels for grades 2–8, with an explanation after every answer.',
  },
  {
    slug: 'figurative-language',
    live: false,
    name: 'Figurative Language Game',
    section: 'Figurative Language',
    topic: 'Figurative language',
    kind: 'Simile, metaphor and figurative language practice',
    blurb: 'TODO',
  },
  {
    slug: 'parts-of-speech',
    name: 'Parts of Speech Game',
    section: 'Parts of Speech',
    topic: 'Grammar',
    kind: 'Parts of speech grammar game',
    blurb: 'Tap the nouns and verbs in a sentence, name the highlighted word, or color every word by its part of speech. Three levels for grades 2–8, with the reason for every word after you check.',
  },
  {
    slug: 'word-builder',
    name: 'Prefix and Suffix Word Builder',
    section: 'Word Builder',
    topic: 'Word parts',
    kind: 'Prefix, root and suffix word builder',
    blurb: 'Add a prefix or a suffix to a base word and see the word it makes, how its spelling changes and what each part means. Three levels for grades 2–8, from un- and -ful to Latin and Greek roots, with a ten-question challenge.',
  },
  {
    slug: 'reading-speed',
    name: 'Reading Speed Test',
    section: 'Reading Speed',
    topic: 'Fluency',
    kind: 'Words per minute reading test with comprehension questions',
    blurb: 'Time yourself on a short passage to see your words per minute, then answer five questions to check that you understood it. Three levels for grades 2–8, silent or aloud, with your own earlier results to compare against.',
  },
  {
    slug: 'fables',
    name: 'Fables Read-Along',
    section: 'Fables',
    topic: 'Fables and morals',
    kind: 'Aesop’s fables read aloud with highlighted text',
    blurb: 'Ten of Aesop’s fables, retold for grades 2–5. The browser reads each one aloud and highlights the sentence it is reading, then five questions check the story and its moral.',
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
