// Every tool on the site, in menu order. `section` is the Layout section its pages pass, which puts them under
// Tools in the menu and in the breadcrumb trail. `kind` says what sort of tool it is, in the words people search
// with; the Tools hub shows it above each name. Used by the Tools hub, the home page and the footer.
export const tools = [
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
];

const COUNT_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
/** How many tools there are, as a word ("two"), so every page that counts them stays in step with this list. */
export const toolCount = COUNT_WORDS[tools.length] ?? String(tools.length);
/** The same word with a capital, for the start of a sentence or a title ("Two"). */
export const ToolCount = toolCount[0].toUpperCase() + toolCount.slice(1);

export const toolBySection = section => tools.find(tool => tool.section === section);
