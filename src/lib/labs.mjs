// Every tool on the site, in menu order. `section` is the Layout section its pages pass, which puts them under
// Tools in the menu and in the breadcrumb trail. `kind` says what sort of tool it is, in the words people search
// with; the Tools hub shows it above each name. Used by the Tools hub, the home page and the footer.
export const tools = [];

const COUNT_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
/** How many tools there are, as a word ("two"), so every page that counts them stays in step with this list. */
export const toolCount = COUNT_WORDS[tools.length] ?? String(tools.length);
/** The same word with a capital, for the start of a sentence or a title ("Two"). */
export const ToolCount = toolCount[0].toUpperCase() + toolCount.slice(1);

export const toolBySection = section => tools.find(tool => tool.section === section);
