// The read-along player in the browser. The logic lives in fables-player.mjs (tested in node with a stand-in
// for speech); this file connects it to the page: the buttons, the highlight, the voice list and the keyboard.
// Speech comes from the browser's own speechSynthesis. No audio is downloaded and nothing is sent anywhere.
import { wordRanges } from '../../lib/fables.mjs';
import { RATES, DEFAULT_RATE, rateById, englishVoices, chooseVoice, voiceKey, voiceLabel, createPlayer } from '../../lib/fables-player.mjs';
import { track } from '../../lib/analytics';

const SPEED_KEY = 'fablesSpeed', VOICE_KEY = 'fablesVoice';
const NO_SPEECH = 'Reading aloud is not available in this browser. You can still read the fable yourself and answer the questions.';
const NO_VOICE = 'No voice for reading aloud was found on this device. You can still read the fable yourself and answer the questions.';
const NO_START = 'Reading aloud did not start. The sound may be blocked, or this device may have no voice for it. Press Play to try again, or read the fable yourself.';
/** The space above the notice (its margin-top in fables.css), in pixels. */
const NOTICE_GAP = 14;
const NO_ENGLISH = 'No English voice was found on this device, so the fable may be read with an accent from another language.';
const READY = 'Press Play to hear the fable. You can also tap any sentence to start there.';

const root = document.querySelector<HTMLElement>('[data-reader]');

if (root) {
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const transport = $('[data-transport]'), settings = $('[data-settings]'), notice = $('[data-notice]');
  const playButton = $<HTMLButtonElement>('[data-play]'), playLabel = $('[data-play-label]');
  const prevButton = $<HTMLButtonElement>('[data-prev]'), nextButton = $<HTMLButtonElement>('[data-next]'), stopButton = $<HTMLButtonElement>('[data-stop]');
  const status = $('[data-status]'), live = $('[data-live]'), story = $('[data-story]');
  const voiceSelect = $<HTMLSelectElement>('[data-voice]');
  const rateButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-rate]')];
  const spans = [...root.querySelectorAll<HTMLElement>('[data-s]')];
  const texts = spans.map(span => span.textContent ?? '');
  const slug = root.dataset.fable ?? '';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const read = (key: string) => { try { return localStorage.getItem(key) ?? ''; } catch { return ''; } };
  const save = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* private mode: the choice is just not remembered */ } };

  const synth: SpeechSynthesis | undefined = window.speechSynthesis;
  const Utterance = window.SpeechSynthesisUtterance;

  function unavailable(message: string) {
    // Keep the space the controls took, so the story does not jump when they are replaced by the message.
    if (!root!.classList.contains('is-unavailable')) notice.style.minHeight = `${transport.offsetHeight + settings.offsetHeight - NOTICE_GAP}px`;
    root!.classList.add('is-unavailable');
    root!.classList.remove('is-ready');
    root!.dataset.speech = 'unavailable';
    notice.textContent = message;
    notice.hidden = false;
  }

  if (!synth || typeof Utterance !== 'function') {
    unavailable(NO_SPEECH);
  } else {
    let speed = rateById(read(SPEED_KEY) || DEFAULT_RATE);
    let ready = false, played = false, lastStatus = 'idle';
    let follow = true, userScrolled = false, lastAutoScroll = 0;
    let wordSpans: HTMLElement[] = [], wrapped = -1, markedWord: HTMLElement | null = null;

    /* ------------------------------------------------------------ the highlight */

    // The words of a sentence get their own <span>s only when the browser first reports a word boundary in it.
    function wrapWords(i: number) {
      if (wrapped === i) return;
      unwrapWords();
      const span = spans[i], text = texts[i];
      const pieces = document.createDocumentFragment();
      let at = 0;
      wordSpans = wordRanges(text).map(range => {
        if (range.start > at) pieces.append(text.slice(at, range.start));
        const word = document.createElement('span');
        word.className = 'fb-w';
        word.textContent = text.slice(range.start, range.end);
        pieces.append(word);
        at = range.end;
        return word;
      });
      if (at < text.length) pieces.append(text.slice(at));
      span.replaceChildren(pieces);
      wrapped = i;
    }
    function unwrapWords() {
      if (wrapped < 0) return;
      spans[wrapped].textContent = texts[wrapped];
      wrapped = -1;
      wordSpans = [];
      markedWord = null;
    }

    // Keep the sentence being read on screen without jerking the page about: scroll only when the sentence
    // is not comfortably in view, and put it high enough that the next few sentences need no scrolling.
    // If the reader scrolls it off the screen by hand, stop following until they use the player again.
    function keepInView(span: HTMLElement) {
      if (!follow) return;
      const rect = span.getBoundingClientRect();
      if (userScrolled) {
        userScrolled = false;
        if (rect.bottom < 0 || rect.top > window.innerHeight) { follow = false; return; }
      }
      // The controls stick to the top of the screen, so the sentence must sit below their height.
      const top = transport.offsetHeight + 10;
      const bottom = window.innerHeight - 28;
      if (rect.top >= top && rect.bottom <= bottom) return;
      const target = window.scrollY + rect.top - Math.max(top, window.innerHeight * 0.28);
      lastAutoScroll = Date.now();
      window.scrollTo({ top: Math.max(0, target), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }
    window.addEventListener('scroll', () => { if (Date.now() - lastAutoScroll > 1000) userScrolled = true; }, { passive: true });
    /** The reader used the player: follow the reading again. */
    function attend() {
      follow = true;
      userScrolled = false;
    }

    /* ---------------------------------------------------------------- the player */

    const player = createPlayer({
      synth,
      Utterance,
      sentences: texts,
      // pause() and resume() are not dependable on Android browsers: there, pausing stops the sentence and
      // Play reads it again from its start.
      nativePause: !/Android/i.test(navigator.userAgent),
      onChange(state, reason) {
        const { status: now, index, speaking, word, finished, error } = state;
        spans.forEach((span, i) => {
          span.classList.toggle('is-current', i === index);
          span.classList.toggle('is-speaking', i === index && speaking);
        });
        if (word && index >= 0) {
          wrapWords(index);
          const next = wordSpans[word.index] ?? null;
          if (next !== markedWord) {
            markedWord?.classList.remove('is-word');
            next?.classList.add('is-word');
            markedWord = next;
          }
        } else if (markedWord) {
          markedWord.classList.remove('is-word');
          markedWord = null;
        }
        if (index !== wrapped && !word) unwrapWords();

        const playing = now === 'playing';
        root!.dataset.status = now;
        root!.dataset.sentence = String(index);
        playButton.classList.toggle('is-playing', playing);
        playLabel.textContent = playing ? 'Pause' : 'Play';
        for (const button of [prevButton, nextButton, stopButton]) button.disabled = now === 'idle';
        const place = `sentence ${index + 1} of ${texts.length}`;
        status.textContent = error ? READY : playing ? `Reading ${place}` : now === 'paused' ? `Paused at ${place}. Press Play to go on.` : finished ? 'The end. Now try the questions below.' : READY;

        if (error) {
          notice.textContent = NO_START;
          notice.hidden = false;
          live.textContent = NO_START;
        } else if (speaking) {
          notice.hidden = true;
        }
        // Tell screen-reader users about changes of state only, never each sentence: that would talk over the voice.
        if (!error && now !== lastStatus) live.textContent = playing ? (lastStatus === 'paused' ? 'Reading again.' : 'Reading aloud.') : now === 'paused' ? 'Paused.' : finished ? 'The fable has ended.' : 'Stopped.';
        lastStatus = now;

        if (playing && index >= 0 && (reason === 'sentence' || reason === 'start')) keepInView(spans[index]);
        if (reason === 'end') track('fable_listen_complete', { fable: slug, speed: speed.id });
      },
    });
    player.setRate(speed.rate);

    function countPlay() {
      if (played) return;
      played = true;
      track('fable_play', { fable: slug, speed: speed.id });
    }
    const toggle = () => { if (ready) { attend(); player.toggle(); countPlay(); } };

    /* ------------------------------------------------------------- voices, speed */

    function showSpeed() {
      for (const button of rateButtons) button.setAttribute('aria-pressed', String(button.dataset.rate === speed.id));
    }
    showSpeed();

    let voices: SpeechSynthesisVoice[] = [];
    function loadVoices() {
      let all: SpeechSynthesisVoice[] = [];
      try { all = synth!.getVoices(); } catch { /* treated as no voices */ }
      if (!all.length) return false;
      voices = englishVoices(all);
      const chosen = chooseVoice(all, read(VOICE_KEY));
      // The list is always on the page (so nothing moves when the voices arrive) and can be used once there
      // is more than one English voice to choose from.
      if (voices.length) voiceSelect.replaceChildren(...voices.map(voice => new Option(voiceLabel(voice), voiceKey(voice), false, voice === chosen)));
      voiceSelect.disabled = voices.length < 2;
      player.setVoice(chosen, true);
      if (!ready) {
        ready = true;
        root!.classList.remove('is-unavailable');
        root!.classList.add('is-ready');
        root!.dataset.speech = 'ready';
        notice.style.minHeight = '';
        playButton.disabled = false;
        status.textContent = READY;
      }
      if (player.state.status === 'idle') {
        notice.textContent = voices.length ? '' : NO_ENGLISH;
        notice.hidden = voices.length > 0;
      }
      return true;
    }

    // A page that was reloaded while speaking can leave the browser's queue stuck. Start clean.
    try { synth.cancel(); } catch { /* nothing to clear */ }
    // Voices often arrive after the page has loaded, and not every browser announces it.
    if (!loadVoices()) {
      for (const wait of [250, 1000, 2000]) setTimeout(() => { if (!ready) loadVoices(); }, wait);
      setTimeout(() => { if (!ready && !loadVoices()) unavailable(NO_VOICE); }, 3000);
    }
    if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', loadVoices);
    else (synth as SpeechSynthesis).onvoiceschanged = loadVoices;

    /* -------------------------------------------------------------------- events */

    root.addEventListener('click', event => {
      const target = event.target as Element;
      if (target.closest('[data-play]')) return toggle();
      if (target.closest('[data-stop]')) return player.stop();
      if (target.closest('[data-prev]')) { attend(); return player.previous(); }
      if (target.closest('[data-next]')) { attend(); return player.next(); }
      const rateButton = target.closest<HTMLElement>('[data-rate]');
      if (rateButton) {
        speed = rateById(rateButton.dataset.rate);
        save(SPEED_KEY, speed.id);
        showSpeed();
        return player.setRate(speed.rate);
      }
      // Tap a sentence to start reading from it (but not while selecting text to copy).
      const sentence = target.closest<HTMLElement>('[data-s]');
      if (sentence && ready && !String(window.getSelection() ?? '')) {
        attend();
        player.play(Number(sentence.dataset.s));
        countPlay();
      }
    });
    voiceSelect.addEventListener('change', () => {
      const voice = voices.find(item => voiceKey(item) === voiceSelect.value) ?? null;
      save(VOICE_KEY, voiceSelect.value);
      player.setVoice(voice, true);
    });

    // Keyboard: P plays and pauses, S stops, and the left and right arrows move one sentence. The keys work
    // while the focus is in the player or the story (after a press of Play, or a click on a sentence), so a
    // single letter typed elsewhere on the page never starts the voice.
    document.addEventListener('keydown', event => {
      const target = event.target as HTMLElement;
      if (!root!.contains(target)) return;
      if (!ready || event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable) return;
      const key = event.key.toLowerCase();
      if (key === 'p') toggle();
      else if (key === 's') player.stop();
      else if (key === 'arrowleft' || key === 'arrowright') {
        if (player.state.status === 'idle') return;
        event.preventDefault();
        attend();
        if (key === 'arrowleft') player.previous(); else player.next();
      }
    });

    // Speech must not carry on when the page is hidden or left.
    document.addEventListener('visibilitychange', () => { if (document.hidden) player.suspend(); });
    window.addEventListener('pagehide', () => player.stop());
  }
}
