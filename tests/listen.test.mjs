// The Listen section's scripts were ported from the old audiobook site. These tests pin down the behavior that
// existing listeners depend on: the same local-storage keys and shapes, the same requests to the Internet
// Archive and Wikipedia, and the same /book/?id= links. The network is replaced by stubbed responses shaped
// like the real ones.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// A stand-in for the browser's local storage and window, set up before store.js is used.
const memory = new Map();
globalThis.localStorage = {
  getItem: key => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => { memory.set(key, String(value)); },
  removeItem: key => { memory.delete(key); },
};
const events = [];
globalThis.window = { dispatchEvent: event => events.push(event), addEventListener() {}, removeEventListener() {} };

const api = await import('../src/scripts/listen/api.js');
const store = await import('../src/scripts/listen/store.js');
const wikipedia = await import('../src/scripts/listen/wikipedia.js');
const ui = await import('../src/scripts/listen/ui.js');

const FAV_KEY = 'vintage_audiobooks.favorites.v1';
const PROGRESS_KEY = 'vintage_audiobooks.progress.v1';

function stubFetch(handler) {
  const calls = [];
  globalThis.fetch = async url => {
    calls.push(String(url));
    const { status = 200, body } = handler(String(url));
    return { ok: status >= 200 && status < 300, status, json: async () => body };
  };
  return calls;
}

test('favorites and progress use the old site’s local-storage keys and shapes', () => {
  memory.clear();
  assert.deepEqual(store.getFavorites(), []);
  store.addFavorite({ id: 'a', title: 'Book A', author: 'Author A', cover: 'cover-a', extra: 'dropped' });
  store.addFavorite({ id: 'b', title: 'Book B', author: 'Author B', cover: 'cover-b' });
  const saved = JSON.parse(memory.get(FAV_KEY));
  assert.deepEqual(saved.map(book => book.id), ['b', 'a'], 'newest first');
  assert.deepEqual(Object.keys(saved[1]), ['id', 'title', 'author', 'cover', 'addedAt']);
  assert.equal(store.isFavorite('a'), true);
  assert.equal(store.toggleFavorite({ id: 'a' }), false);
  assert.equal(store.isFavorite('a'), false);
  assert.equal(store.toggleFavorite({ id: 'a', title: 'Book A', author: 'Author A', cover: 'cover-a' }), true);
  store.removeFavorite('b');
  assert.deepEqual(store.getFavorites().map(book => book.id), ['a']);

  store.saveProgress({ id: 'a', title: 'Book A', author: 'Author A', cover: 'cover-a', chapterIndex: 2, chapterTitle: 'Three', chapterCount: 9, position: 61 });
  const progress = JSON.parse(memory.get(PROGRESS_KEY));
  assert.deepEqual(Object.keys(progress), ['a']);
  assert.deepEqual(Object.keys(progress.a), ['id', 'title', 'author', 'cover', 'chapterIndex', 'chapterTitle', 'chapterCount', 'position', 'updatedAt']);
  assert.equal(store.getProgress('a').position, 61);
  assert.equal(store.getProgress('missing'), null);
  store.saveProgress({ title: 'no id' });
  assert.equal(store.getAllProgress().length, 1);
  store.clearProgress('a');
  assert.deepEqual(store.getAllProgress(), []);
  assert.ok(events.every(event => event.type === 'vab:store-change'));
});

test('the Continue shelf reads the same key as the store', () => {
  const component = fs.readFileSync(new URL('../src/components/listen/ContinueShelf.astro', import.meta.url), 'utf8');
  const source = fs.readFileSync(new URL('../src/scripts/listen/store.js', import.meta.url), 'utf8');
  assert.ok(source.includes(`const PROGRESS_KEY = '${PROGRESS_KEY}';`) && source.includes(`const FAV_KEY = '${FAV_KEY}';`));
  assert.ok(component.includes(`localStorage.getItem('${PROGRESS_KEY}')`));
});

test('data saved by the old site is read as it is', () => {
  memory.clear();
  memory.set(FAV_KEY, JSON.stringify([{ id: 'art_of_war_librivox', title: 'The Art of War', author: 'Sun Tzu', cover: 'https://archive.org/services/img/art_of_war_librivox', addedAt: 1700000000000 }]));
  memory.set(PROGRESS_KEY, JSON.stringify({
    x: { id: 'x', title: 'X', author: 'A', cover: 'c', chapterIndex: 0, chapterTitle: 'One', chapterCount: 4, position: 10, updatedAt: 5 },
    y: { id: 'y', title: 'Y', author: 'B', cover: 'c', chapterIndex: 3, chapterTitle: 'Four', chapterCount: 4, position: 99, updatedAt: 9 },
  }));
  assert.equal(store.isFavorite('art_of_war_librivox'), true);
  assert.deepEqual(store.getAllProgress().map(p => p.id), ['y', 'x'], 'most recently played first');
  // Broken or missing data never throws.
  memory.set(FAV_KEY, 'not json');
  memory.set(PROGRESS_KEY, '[1,2');
  assert.deepEqual(store.getFavorites(), []);
  assert.deepEqual(store.getAllProgress(), []);
});

test('book cards link to /book/?id=, the old site’s player address', () => {
  assert.equal(ui.bookUrl('adventures_holmes'), '/book/?id=adventures_holmes');
  assert.equal(ui.bookUrl('a b&c'), '/book/?id=a%20b%26c');
  const html = ui.bookCardHTML({ id: 'x_1', title: 'Tom & "Jerry" <b>', author: "O'Neil", cover: 'https://archive.org/services/img/x_1', year: '1999', runtime: '1:02:03' });
  assert.match(html, /href="\/book\/\?id=x_1"/);
  assert.match(html, /Tom &amp; &quot;Jerry&quot; &lt;b&gt;/);
  assert.match(html, /O&#39;Neil/);
  assert.match(html, /1999 · 1:02:03/);
  assert.ok(!/<b>/.test(html), 'titles from the Archive are escaped');
  const card = ui.progressCardHTML({ id: 'x_1', title: 'T', author: 'A', cover: 'c', chapterIndex: 1, chapterCount: 4, position: 75 });
  assert.match(card, /href="\/book\/\?id=x_1"/);
  assert.match(card, /Ch\. 2 of 4 · 1:15/);
  assert.match(card, /width:38%/);
  assert.equal(ui.esc(null), '');
});

test('formatting helpers', () => {
  assert.deepEqual([0, 5, 65, 3599, 3600, 3725.9, -4].map(api.formatTime), ['0:00', '0:05', '1:05', '59:59', '1:00:00', '1:02:05', '0:00']);
  assert.deepEqual([null, undefined, NaN, Infinity].map(api.formatTime), ['', '', '', '']);
  assert.equal(api.authorName(undefined), 'Unknown author');
  assert.equal(api.authorName(['A', '', 'B']), 'A, B');
  assert.equal(api.authorName([]), 'Unknown author');
  assert.equal(api.cleanDescription('<p>A  <i>fine</i> story.</p> (Summary by A Reader)'), 'A fine story.');
  assert.equal(api.cleanDescription(['One.', 'Two.']), 'One. Two.');
  assert.equal(api.cleanDescription(null), '');
  assert.equal(api.coverUrl('a b'), 'https://archive.org/services/img/a%20b');
  assert.equal(api.audioUrl('id', 'file 01.mp3'), 'https://archive.org/download/id/file%2001.mp3');
  assert.equal(api.detailUrl('id'), 'https://archive.org/details/id');
});

test('searchBooks asks the Internet Archive for the LibriVox collection and tidies the answer', async () => {
  const calls = stubFetch(() => ({ body: { response: { numFound: 2, docs: [
    { identifier: 'one', title: 'One', creator: ['A', 'B'], description: '<p>Hi</p>', downloads: 7, avg_rating: '4.5', year: '2010', runtime: '1:00:00', subject: 'x' },
    { identifier: 'two' },
  ] } } }));
  const result = await api.searchBooks({ query: ' sherlock "holmes" ', page: 2, rows: 24, sort: 'avg_rating desc' });
  const url = new URL(calls[0]);
  assert.equal(url.origin + url.pathname, 'https://archive.org/advancedsearch.php');
  assert.equal(url.searchParams.get('q'), 'collection:(librivoxaudio) AND mediatype:(audio) AND (title:(sherlock  holmes ) OR creator:(sherlock  holmes ) OR subject:(sherlock  holmes ))');
  assert.deepEqual(url.searchParams.getAll('fl[]'), ['identifier', 'title', 'creator', 'description', 'downloads', 'avg_rating', 'year', 'runtime', 'subject']);
  assert.deepEqual(url.searchParams.getAll('sort[]'), ['avg_rating desc']);
  assert.deepEqual([url.searchParams.get('rows'), url.searchParams.get('page'), url.searchParams.get('output')], ['24', '2', 'json']);
  assert.deepEqual(result.books[0], { id: 'one', title: 'One', author: 'A, B', description: 'Hi', downloads: 7, rating: 4.5, year: '2010', runtime: '1:00:00', subjects: ['x'], cover: 'https://archive.org/services/img/one' });
  assert.deepEqual(result.books[1], { id: 'two', title: 'two', author: 'Unknown author', description: '', downloads: 0, rating: null, year: null, runtime: null, subjects: [], cover: 'https://archive.org/services/img/two' });
  assert.deepEqual([result.total, result.page, result.rows], [2, 2, 24]);
  const plain = stubFetch(() => ({ body: {} }));
  assert.deepEqual(await api.searchBooks(), { books: [], total: 0, page: 1, rows: 24 });
  assert.equal(new URL(plain[0]).searchParams.get('q'), 'collection:(librivoxaudio) AND mediatype:(audio)');
  stubFetch(() => ({ status: 503, body: {} }));
  await assert.rejects(api.searchBooks(), /Search failed \(503\)/);
});

test('getBook keeps one streamable file per chapter, in track order', async () => {
  const files = [];
  for (const [track, title, length] of [['2', 'Second', '20.5'], ['1', 'First', '1:05'], ['3', 'Third', '1:00:01']]) {
    files.push({ name: `b_0${track}.mp3`, source: 'original', title, track, length });
    files.push({ name: `b_0${track}_64kb.mp3`, source: 'derivative', title, track, length });
    files.push({ name: `b_0${track}.ogg`, source: 'derivative', title, track, length });
    files.push({ name: `b_0${track}.png`, source: 'derivative' });
  }
  files.push({ name: 'b_meta.xml', source: 'metadata' }, { name: 'ghost.mp3', source: 'metadata' });
  const calls = stubFetch(() => ({ body: { metadata: { identifier: 'b', title: ['The Book', 'x'], creator: 'Twain, Mark', description: '<b>Good</b>', language: 'eng', year: '2008', url_text_source: 'https://www.gutenberg.org/ebooks/1' }, files } }));
  const book = await api.getBook('b');
  assert.equal(calls[0], 'https://archive.org/metadata/b');
  assert.deepEqual(book.chapters.map(c => [c.index, c.title, c.file, c.track, c.length]), [[0, 'First', 'b_01_64kb.mp3', 1, 65], [1, 'Second', 'b_02_64kb.mp3', 2, 20.5], [2, 'Third', 'b_03_64kb.mp3', 3, 3601]]);
  assert.equal(book.chapters[0].url, 'https://archive.org/download/b/b_01_64kb.mp3');
  assert.equal(book.title, 'The Book');
  assert.equal(book.author, 'Twain, Mark');
  assert.equal(book.description, 'Good');
  assert.equal(book.textSource, 'https://www.gutenberg.org/ebooks/1');
  assert.equal(book.totalSeconds, 3686.5);
  assert.equal(book.runtime, '1:01:26', 'with no runtime in the record, the chapter lengths are added up');
  assert.equal(book.detail, 'https://archive.org/details/b');
  // Files with no track number are grouped by name and keep their file order.
  stubFetch(() => ({ body: { metadata: { identifier: 'c' }, files: [{ name: 'part_two_64kb.mp3' }, { name: 'part_two.mp3' }, { name: 'part_one.mp3' }] } }));
  const untracked = await api.getBook('c');
  assert.deepEqual(untracked.chapters.map(c => [c.file, c.title]), [['part_two_64kb.mp3', 'Part Two 64kb'], ['part_one.mp3', 'Part One']]);
  assert.equal(untracked.title, 'c');
  // The Archive answers {} for an item it does not have.
  stubFetch(() => ({ body: {} }));
  await assert.rejects(api.getBook('nope'), /Book not found/);
  stubFetch(() => ({ status: 500, body: {} }));
  await assert.rejects(api.getBook('nope'), /Could not load book \(500\)/);
});

test('author names are put in natural order before Wikipedia is asked', async () => {
  assert.equal(wikipedia.normalizeAuthor('Austen, Jane'), 'Jane Austen');
  assert.equal(wikipedia.normalizeAuthor('Twain, Mark (1835-1910)'), 'Mark Twain');
  assert.equal(wikipedia.normalizeAuthor('Doyle, Arthur Conan; Someone Else'), 'Arthur Conan Doyle');
  assert.equal(wikipedia.normalizeAuthor('Unknown author'), '');
  assert.equal(wikipedia.normalizeAuthor(''), '');
  const calls = stubFetch(url => (url.includes('/search/title')
    ? { body: { pages: [{ title: 'Jane Austen' }] } }
    : { body: { type: 'standard', title: 'Jane Austen', description: 'English novelist', extract: 'An extract.', thumbnail: { source: 'https://upload.wikimedia.org/a.jpg' }, content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Jane_Austen' } } } }));
  const bio = await wikipedia.fetchAuthorBio('Austen, Jane');
  assert.deepEqual(bio, { title: 'Jane Austen', extract: 'An extract.', description: 'English novelist', url: 'https://en.wikipedia.org/wiki/Jane_Austen', thumbnail: 'https://upload.wikimedia.org/a.jpg' });
  assert.equal(calls[0], 'https://en.wikipedia.org/w/rest.php/v1/search/title?q=Jane+Austen&limit=1');
  assert.equal(calls[1], 'https://en.wikipedia.org/api/rest_v1/page/summary/Jane%20Austen');
  await wikipedia.fetchAuthorBio('Austen, Jane');
  assert.equal(calls.length, 2, 'the answer is remembered for the session');
  // Nothing useful: no page, a disambiguation page, or the network failing. The panel just stays hidden.
  stubFetch(() => ({ body: { pages: [] } }));
  assert.equal(await wikipedia.fetchAuthorBio('Nobody, At All'), null);
  stubFetch(url => (url.includes('/search/title') ? { body: { pages: [{ title: 'Smith' }] } } : { body: { type: 'disambiguation', extract: 'Smith may refer to' } }));
  assert.equal(await wikipedia.fetchAuthorBio('Smith'), null);
  stubFetch(() => ({ status: 500, body: {} }));
  const warn = console.warn;
  console.warn = () => {};
  assert.equal(await wikipedia.fetchAuthorBio('Offline, Author'), null);
  console.warn = warn;
  assert.equal(await wikipedia.fetchAuthorBio('Unknown author'), null);
});
