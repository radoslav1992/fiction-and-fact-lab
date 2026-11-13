# Fiction & Fact Library

**Free reading tools for classrooms.**

A reading lab for students in grades 2–8 (ages about 7–14) and their teachers, at
[fictionandfactlibrary.com](https://fictionandfactlibrary.com). From the makers of
[Interactive Periodic Table](https://interactiveperiodictable.net/), and a sibling of the science, math, coding
and spreadsheet labs listed in `src/lib/learning-apps.mjs`.

The site shows **no ads** of any kind. There is no ad component, no ad network and no ad-related setting to
switch on; `tests/config.test.mjs` and `scripts/check-build.mjs` fail if ad markup appears.

## What is on the site

- **Reading Level Checker** (`/tools/reading-level/`). Paste or type a text and see, live: a US grade level
  (the median of five grade formulas), the age range, the Flesch Reading Ease score with Flesch's label, the
  counts behind them, and a table of six formulas (Flesch–Kincaid Grade Level, Flesch Reading Ease, Gunning
  Fog, SMOG, Coleman–Liau, Automated Readability Index). The text is shown back with long sentences and long
  words marked. The default sample is analyzed and rendered on the server; the text never leaves the browser.
- **Fact or Opinion Game** (`/tools/fact-or-opinion/`). Rounds of ten statements with a score, a streak, an
  explanation after every answer and a results screen. Level 1 (grades 2–3) and level 2 (grades 4–5) ask
  "fact or opinion?"; level 3 (grades 6–8) uses sentences that mix a fact with an opinion, and the student
  taps the opinion part or a clue word. A round can be shared by link (`?level=2&round=424242`).
- **Listen** (`/listen/`, `/book/?id=…`, `/favorites/`). The public-domain audiobook player that the domain
  used to be: a catalogue of LibriVox recordings fetched in the browser from the Internet Archive, a player
  and a saved shelf. See [Listen](#listen-the-audiobook-player).
- Each tool has a printable one-page worksheet at `/tools/<slug>/activity/` and a teacher answer key at
  `/teachers/answers/<slug>/` (noindex, out of the sitemap, linked only from `/teachers/`).
- `/tools/` lists the tools, `/teachers/` has the activities, lesson notes and standards, plus `/about/`,
  `/privacy/` and a 404 page.

Static site: Astro 5, `@astrojs/sitemap`, vanilla TypeScript islands, no framework runtime and no other
runtime dependencies.

## Local development

Requires Node 22 (see `.nvmrc`).

```sh
npm ci
npm run dev        # http://localhost:4321
npm test           # model, bank, worksheet, Listen and config tests (node --test)
npm run build      # writes dist/
npm run check      # checks dist/: one title, description, canonical and H1 per page, lengths, valid JSON-LD,
                   # local links, noindex pages out of the sitemap, no ads
npm run preview    # serves dist/
npm run llms       # rewrites public/llms.txt from the built pages (run after npm run build)
npm run og-image   # re-renders public/og-image.png (1200×630) with Playwright
```

`public/llms.txt` is generated from each built page's title and description. After changing a title or a
description, or adding a page: `npm run build && npm run llms`, then build again so `dist/` carries the new
file. `tests/llms.test.mjs` fails if a tool or worksheet is missing from it.

`npm run og-image` uses an installed Playwright and Chromium (`npx playwright install chromium`); point
`PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` at another install if needed.

## Project layout

| Path | What it is |
| --- | --- |
| `src/lib/site.mjs` | Site name, URL, tagline, contact address and the Google Analytics ID |
| `src/lib/labs.mjs` | Every tool in menu order (name, section, kind, blurb), read by the Tools hub, the home page and the footer, plus `toolCount` |
| `src/lib/activities.mjs`, `src/lib/activities/` | One classroom activity per tool. The worksheet and the answer key are rendered from the same object by `src/components/ActivitySections.astro` |
| `src/lib/readability.mjs` | The Reading Level Checker's model: sentences, words, syllables, six formulas, the consensus grade, labels and times |
| `src/lib/readability-view.mjs` | What the checker shows for an analysis (formatted values, notices, the marked text), shared by the server and the browser |
| `src/lib/reading-samples.mjs` | The sample texts, the worksheet passage and its model rewrite |
| `src/components/reading/` | The checker's markup (`ReadingLevelChecker.astro`), browser code (`checker.ts`) and styles |
| `src/lib/fact-opinion.mjs` | The game's statement bank (98 statements) and rules: definitions, clue words, seeded round building, answer checking, scoring |
| `src/lib/fact-opinion-view.mjs` | How a statement is shown once its answer is known, shared by the server and the browser |
| `src/components/factopinion/` | The game's markup (`FactOpinionGame.astro`), browser code (`game.ts`) and styles |
| `src/scripts/listen/` | The audiobook scripts, ported from the old site: `api.js` (Internet Archive), `wikipedia.js`, `store.js` (local storage), `ui.js` (cards), `player.js` (the player) |
| `src/pages/listen/index.astro`, `src/pages/book.astro`, `src/pages/favorites.astro`, `src/styles/listen.css` | The Listen pages and their styles |
| `src/components/listen/ContinueShelf.astro` | The "Continue listening" shelf, opened before the first paint when this browser has saved progress |
| `src/layouts/Layout.astro` | Head, navigation, breadcrumbs (BreadcrumbList JSON-LD), footer, consent and the Google tag |
| `src/components/` | Shared pieces: `Faq` (with FAQPage JSON-LD), `ClassroomShare`, `ConsentDefaults`, `ConsentBanner`, `LearningApps`, `NextLabs`, `LinkSnippet`, `LibraryCard` |
| `src/lib/library-card.mjs` | The library-card picture used on the home page and in the Open Graph image |
| `src/lib/learning-apps.mjs` | Sister apps shown in the footer and on the home page (this site is `reading`) |
| `src/styles/global.css` | The look: paper, indigo ink, highlighter yellow, and the fact (teal) and opinion (pink) colors |
| `scripts/` | `check-build.mjs`, `llms.mjs`, `og-image.mjs` |
| `tests/` | `readability`, `fact-opinion`, `activities`, `listen`, `config`, `llms` |

## The models, honestly

### Reading Level Checker (`src/lib/readability.mjs`)

The formulas use their standard published constants:

| Formula | Calculation |
| --- | --- |
| Flesch Reading Ease | 206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words) |
| Flesch–Kincaid Grade Level | 0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59 |
| Gunning Fog | 0.4 × [(words ÷ sentences) + 100 × (long words ÷ words)] |
| SMOG | 1.043 × √(long words × 30 ÷ sentences) + 3.1291 |
| Coleman–Liau | 0.0588 × (letters per 100 words) − 0.296 × (sentences per 100 words) − 15.8 |
| Automated Readability Index | 4.71 × (letters ÷ words) + 0.5 × (words ÷ sentences) − 21.43 |

Simplifications, all stated on the page as well:

- **The grade shown is a consensus:** the median of the five grade formulas, so one odd result cannot drag it
  away. Below 1 it reads "Below grade 1"; above 12, "College" and then "College graduate". Ages are the grade
  plus 5 to the grade plus 6.
- **Syllables are a heuristic.** They are counted by spelling rules (vowel groups; silent *e*, *-es* and
  *-ed*; *-le*; *y* as vowel or consonant; vowel pairs that split, as in *gi-ant*) with a list of about 120
  exceptions. The tests check about 250 words with known counts. Expect some words to be off by one.
- **Sentences are found by punctuation.** A sentence ends at `.`, `!` or `?` followed by a space, or at a
  blank line; a single line break does not end one. Titles (Mr., Dr.), "e.g." and initials (J. K., U.S.) never
  end a sentence, "etc." and "p.m." end one only before a capital letter, and an ellipsis or a closing quote
  followed by a small letter carries on.
- **Words.** A hyphenated word is one word. A number in digits is one word whose syllables are counted the
  way it is read aloud (whole numbers and decimals; 1100–1999 as a year), and it is never a long word.
- **Long word** means three or more syllables. Gunning's own rules also skip proper nouns and some endings;
  this checker does not. **Long sentence** means more than 20 words.
- **SMOG** was designed for 30 or more sentences, and results under about 100 words are rough: the page
  shows a notice for each.
- **Reading times** assume 200 words a minute silently and 130 aloud. They are assumptions, not measurements.
- **English only.** Text mostly in another alphabet gets a notice.
- The formulas measure sentence and word length, not ideas or vocabulary. The site never reports or names
  proprietary reading measures.

All sample texts were written for this site, except the Gettysburg Address (Bliss copy, public domain).
A test checks its word count (272 by the usual count, 271 here because "battle-field" is one word).

### Fact or Opinion Game (`src/lib/fact-opinion.mjs`)

- Definitions used everywhere: *a fact is a statement that can be checked and shown to be true; an opinion is
  what someone thinks, feels or believes, and people can disagree about it.*
- The bank has 98 statements: level 1 has 16 facts and 16 opinions, level 2 has 17 and 17, level 3 has 32
  mixed sentences. **All the "fact" statements are in `STATEMENTS` in `src/lib/fact-opinion.mjs`** (33 plain
  facts, plus the fact half of each of the 32 mixed sentences).
- Rules for facts: true, checkable, timeless and uncontroversial (school science, nature, geography, math,
  everyday life). No records that change, no politics, religion, health advice, brands or living people. A
  test blocks the commonest slips, but it cannot check truth: read a new fact carefully before adding it.
- A round is built from a number (`buildRound(level, seed)`), so the same link gives the same ten statements.
  Levels 1 and 2 give four to six facts and the rest opinions; level 3 gives five "tap the opinion part" and
  five "tap a clue word" questions.
- The game teaches clear cases. The page explains what it leaves out: predictions, false statements,
  "everyone knows", and judgments backed by evidence.
- The best score for each level is kept in local storage (`factOpinionBest`) and nowhere else.

### Worksheets and answer keys

Every number on the reading-level worksheet and key comes from `analyze()`, and
`tests/activities.test.mjs` fails if an answer prints a number that is not checked against the model. The
fact-or-opinion worksheet and key are generated from the statement bank. Each prints on one page, on Letter
and on A4.

## Listen: the audiobook player

Ported from the previous site (a client-side LibriVox player), restyled, with behavior kept:

- `/book/?id=<Internet Archive identifier>` and `/favorites/` are the same addresses as before. Both are
  `noindex` and out of the sitemap, because they have no content of their own. `/listen/` is the catalogue
  (the old home page) and is indexed. Old search links such as `/?q=holmes` are sent on to `/listen/?q=holmes`
  by a two-line script on the home page.
- The local-storage keys are unchanged (`vintage_audiobooks.favorites.v1`, `vintage_audiobooks.progress.v1`),
  so favorites and listening progress saved by the old site still appear.
- `api.js`, `wikipedia.js` and `store.js` are byte-for-byte the old files. `ui.js` differs only in class names,
  the fallback cover and the link format. The player logic moved from the page into `player.js` with two
  deliberate changes: the play button shows an icon with a spoken label, and Space is left to a focused
  button or link (before, Space always toggled play, so other controls could not be pressed with it).
- The subject buttons were changed to suit a school audience (no horror or philosophy buttons). The catalogue
  itself is the whole LibriVox collection, unfiltered, and the page says so.
- Known and kept from the old site: descriptions from the Archive are stripped of tags but HTML entities such
  as `&amp;` are not decoded.
- The old consent key (`ffl_consent`) is not read; the family's `cookieConsent` is used, so visitors in
  Europe are asked once more.

archive.org and wikipedia.org could not be reached from the machine this was built on. The Listen flow was
tested in Chromium against stubbed responses shaped like the real ones, and `tests/listen.test.mjs` pins the
request URLs and the parsing, but **nothing has been run against the live services**. Open `/listen/` and
play a chapter after the first deploy.

## Fonts

Headings are set in Literata and text in Atkinson Hyperlegible, both from Google Fonts with
`display=swap`. To keep text from re-wrapping when the web fonts arrive, `global.css` defines local fallback
fonts with `size-adjust`: Arial for Atkinson Hyperlegible, and Georgia (or Times New Roman where there is no
Georgia) for Literata. The values are the web font's width divided by the local font's, measured in Chromium
with Playwright on this site's own text: against Liberation Sans and Liberation Serif (the same widths as
Arial and Times New Roman) and Gelasio (the same widths as Georgia). Per-paragraph differences of a percent
or two remain, so an occasional line can still re-wrap. Widths in `ch` units are avoided, because a `ch`
changes with the font. If a font or a weight changes, measure again.

## Deploy (Cloudflare Workers static assets)

1. In the Cloudflare dashboard: **Workers & Pages → Create → Import a repository**, and pick this repository.
2. Build command: `npm run build`. Deploy command: `npx wrangler deploy`. `wrangler.jsonc` serves `./dist`
   with trailing-slash URLs (`force-trailing-slash`) and `404.html` for missing pages.
3. Add the custom domain **fictionandfactlibrary.com** to the Worker (Settings → Domains & Routes), replacing
   the old `vintage-audiobooks` Worker.
4. On the zone: turn on **SSL/TLS → Edge Certificates → Always Use HTTPS**.
5. After launch, submit `https://fictionandfactlibrary.com/sitemap-index.xml` in Google Search Console and
   Bing Webmaster Tools.

`public/_headers` sets security headers and long caching for `/_astro/*`. It sends
`Strict-Transport-Security: max-age=31536000; includeSubDomains` on every response, so browsers that have
visited once always use HTTPS. A static site cannot redirect by scheme itself: `http://` URLs are redirected
only while **Always Use HTTPS** (step 4) is on in the Cloudflare dashboard, so check that it is. Do not add
host- or scheme-based rules to a `_redirects` file; Workers static assets rejects them.

Old links without a trailing slash (`/book?id=…`, `/favorites`, `/about`) rely on `force-trailing-slash` to
redirect to the slash form and keep the query string. That happens on Cloudflare, not in `astro preview`, so
check `/book?id=<any id>` once after the first deploy.

## Google Analytics 4

The measurement ID lives in `src/lib/site.mjs` (`G-5YF12LL7N3`, the ID the old site used). While it is empty,
no Google tag is rendered, and the cookie banner and the footer's **Cookie settings** button are left out.
Google Consent Mode defaults (`ConsentDefaults.astro`) always run: the advertising parts are denied for
everyone because the site has no ads, and analytics storage is denied by default in the EEA, UK and
Switzerland and granted elsewhere. Visitors in those regions see the banner (Accept / Reject, remembered for
180 days).

Events sent with `track()` (`src/lib/analytics.ts`, a no-op without a Google tag). No event carries text that
a student typed or pasted.

| Event | When | Parameters |
| --- | --- | --- |
| `reading_level_check` | Three seconds after the text in the checker last changed | `source` (`sample` or `typed`), `words`, `grade` (rounded) |
| `reading_sample` | A sample button is pressed, or a `?sample=` link is opened | `sample` |
| `fact_opinion_start` | A round starts | `level` |
| `fact_opinion_round_complete` | The results screen is shown | `level`, `score` (0–10), `streak` |
| `worksheet_print` | Print button on a worksheet or answer key | `page` |
| `share_classroom` | A Share to Google Classroom link is clicked | `page` |

Page views on the Listen pages include the page address, and so the search words (`?q=`) or the book's
identifier (`?id=`), as on the old site. The privacy page says this.

## For the owner

- `contactEmail` in `src/lib/site.mjs` is `info@fictionandfactlibrary.com`, following the sibling sites.
  Check that the mailbox exists.
- Add this site to the `learning-apps.mjs` list of each sibling site (id `reading`, subject "Reading").
- The standards on the worksheets are Common Core ELA codes (W.4.4, W.4.5, RH.6-8.8, W.4.1), paraphrased.
