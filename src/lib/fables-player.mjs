// The read-aloud player's logic, kept apart from the page so it can be tested in node with a stand-in for
// the browser's speech (tests/fables.test.mjs). It speaks with the Web Speech API (`speechSynthesis`):
// nothing is downloaded by this site and there are no audio files.
//
// How it stays robust across browsers:
//   - One sentence per utterance. Chrome cuts off long utterances, and a sentence is never long enough.
//   - The sentence shown as "being read" follows each utterance's `start` and `end` events, which every
//     browser fires. Word `boundary` events are used when they arrive and never relied on.
//   - Events from an utterance that has been cancelled are ignored (`current` is the only one listened to).
//   - After a cancel(), the next speak() waits a moment: some browsers drop an utterance spoken at once.
//   - Pause and resume are checked. Where pause() does nothing or ends the sentence (some Android browsers),
//     speech is stopped instead and the sentence is read again from its start on resume.
//   - If an utterance never starts, the player reports that speech is not working instead of waiting forever.
//   - The utterance being spoken is kept in a variable, so it cannot be garbage-collected before it ends.
import { wordRanges, wordIndexAt } from './fables.mjs';

export const RATES = [
  { id: 'slow', label: 'Slow', rate: 0.75 },
  { id: 'normal', label: 'Normal', rate: 1 },
  { id: 'fast', label: 'Fast', rate: 1.25 },
];
export const DEFAULT_RATE = 'normal';
export const rateById = id => RATES.find(rate => rate.id === id) ?? RATES.find(rate => rate.id === DEFAULT_RATE);

/** Milliseconds: wait after cancel() before speaking, check a pause, check a resume, give up on a start,
 *  and how long a sentence may take (per character at normal speed, plus a margin) before moving on. */
export const TIMING = { afterCancel: 80, pauseCheck: 300, resumeCheck: 800, startTimeout: 6000, startTimeoutNoVoices: 2500, stallPerChar: 200, stallExtra: 6000 };

// Novelty voices that ship with some systems (they sing, whisper or ring like bells). Fun, but no use for
// following a story, so they are left out of the list when ordinary voices exist.
const NOVELTY = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox)\b/i;
const isEnglish = voice => /^en(?:[-_]|$)/i.test(voice?.lang ?? '');
const isLocal = voice => voice.localService !== false;
const isUS = voice => /^en[-_]US$/i.test(voice.lang);
export const voiceKey = voice => voice?.voiceURI || voice?.name || '';

/**
 * The English voices to offer, best first: voices on the device before online ones, the system's default
 * first among those, then US English, then by name. Duplicates and novelty voices are dropped.
 */
export function englishVoices(voices) {
  const seen = new Set();
  const english = [...(voices ?? [])].filter(voice => {
    const key = voiceKey(voice);
    if (!isEnglish(voice) || !key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const plain = english.filter(voice => !NOVELTY.test(voice.name ?? ''));
  const rank = voice => (isLocal(voice) ? 0 : 4) + (voice.default ? 0 : 2) + (isUS(voice) ? 0 : 1);
  return (plain.length ? plain : english)
    .map((voice, i) => ({ voice, i }))
    .sort((a, b) => rank(a.voice) - rank(b.voice) || String(a.voice.name).localeCompare(String(b.voice.name)) || a.i - b.i)
    .map(item => item.voice);
}

/** The voice to use: the remembered one if this device still has it, otherwise the best English voice, or none. */
export function chooseVoice(voices, savedKey) {
  const list = englishVoices(voices);
  return list.find(voice => voiceKey(voice) === savedKey) ?? list[0] ?? null;
}

/** What the voice picker shows: the name, the language code where it is not US English, and "online". */
export function voiceLabel(voice) {
  const name = String(voice.name || 'Voice');
  const region = isUS(voice) || /\(|,| - /.test(name) ? '' : ` (${String(voice.lang).replace('_', '-')})`;
  return `${name}${region}${isLocal(voice) ? '' : ', online'}`;
}

/**
 * createPlayer({ synth, Utterance, sentences, onChange, … }) → the player.
 *
 * synth is `window.speechSynthesis` (or a stand-in), Utterance is `SpeechSynthesisUtterance`, and
 * sentences is a list of strings. onChange(state, reason) is called after every change with
 * state = { status, index, speaking, word, finished, error }:
 *   status    'idle' | 'playing' | 'paused'
 *   index     the sentence being read or waiting to be read (-1 when stopped)
 *   speaking  true between the current utterance's `start` and `end` events
 *   word      { index, start, end } inside the sentence while a word boundary is known, else null
 *   finished  true after the last sentence has been read to the end
 *   error     'unavailable' when speech would not start, else null
 */
export function createPlayer({
  synth,
  Utterance,
  sentences,
  onChange = () => {},
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = id => clearTimeout(id),
  now = () => Date.now(),
  nativePause = true,
  timing = TIMING,
}) {
  const words = sentences.map(text => wordRanges(text));
  let status = 'idle', index = -1, speaking = false, word = null, finished = false, error = null;
  let rate = 1, voice = null, hasVoices = true;
  let current = null;       // the utterance being spoken; events from any other utterance are ignored
  let restart = false;      // paused by stopping speech: resume must read the sentence again from its start
  let ticket = 0;           // bumped by every change of plan, so a timer set for an old plan does nothing
  let cancelledAt = -Infinity;
  const timers = new Set();

  const state = () => ({ status, index, speaking, word, finished, error });
  const emit = reason => onChange(state(), reason);
  function later(fn, ms) {
    const mine = ticket;
    const id = setTimer(() => { timers.delete(id); if (mine === ticket) fn(); }, ms);
    timers.add(id);
  }
  function clearTimers() {
    ticket++;
    for (const id of timers) clearTimer(id);
    timers.clear();
  }
  const busy = () => Boolean(current || synth.speaking || synth.pending || synth.paused);
  /** Silence the browser now and forget the utterance, so that its late `end` or `error` is ignored. */
  function silence() {
    if (busy()) cancelledAt = now();
    current = null;
    speaking = false;
    word = null;
    try {
      synth.cancel();
      // A cancelled queue can stay "paused" in some browsers, and then nothing new would ever start.
      synth.resume();
    } catch { /* a browser without working speech: nothing to stop */ }
  }

  function finish() {
    clearTimers();
    current = null;
    speaking = false;
    word = null;
    status = 'idle';
    index = -1;
    finished = true;
    emit('end');
  }

  // Long after a sentence should have ended, move on even if the browser never said so.
  const stallTime = i => sentences[i].length * timing.stallPerChar / rate + timing.stallExtra;
  function watchForStall(utterance, i) {
    later(() => {
      if (current !== utterance || status !== 'playing') return;
      if (i + 1 < sentences.length) read(i + 1);
      else { silence(); finish(); }
    }, stallTime(i));
  }
  function started(utterance, i) {
    clearTimers();
    speaking = true;
    error = null;
    watchForStall(utterance, i);
  }

  function utter(i) {
    const utterance = new Utterance(sentences[i]);
    utterance.lang = voice?.lang || 'en-US';
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.onstart = () => {
      if (current !== utterance || status !== 'playing' || speaking) return;
      started(utterance, i);
      emit('start');
    };
    utterance.onboundary = event => {
      if (current !== utterance || status !== 'playing') return;
      if (event?.name && event.name !== 'word') return;
      const first = !speaking;
      if (first) started(utterance, i);
      const at = wordIndexAt(words[i], event?.charIndex);
      const next = at < 0 ? null : { index: at, start: words[i][at].start, end: words[i][at].end };
      if (!first && next?.index === word?.index) return;
      word = next;
      emit(first ? 'start' : 'word');
    };
    utterance.onend = () => {
      if (current !== utterance) return;
      current = null;
      speaking = false;
      word = null;
      // Some browsers end the utterance when asked to pause it. Stay paused and read it again on resume.
      if (status === 'paused') { restart = true; clearTimers(); return emit('pause'); }
      if (status !== 'playing') return;
      if (i + 1 < sentences.length) read(i + 1, false);
      else finish();
    };
    utterance.onerror = event => {
      if (current !== utterance) return;
      // Cancelling speech reports an error in some browsers. That is not a failure.
      if (event?.error === 'interrupted' || event?.error === 'canceled') return;
      fail();
    };
    current = utterance;
    try { synth.speak(utterance); } catch { return fail(); }
    // No `start` after a generous wait means this browser cannot speak (no voice, or speech is blocked).
    if (!speaking) later(() => { if (current === utterance && !speaking && status === 'playing') fail(); }, hasVoices ? timing.startTimeout : timing.startTimeoutNoVoices);
  }

  function fail() {
    clearTimers();
    silence();
    status = 'idle';
    index = -1;
    restart = false;
    finished = false;
    error = 'unavailable';
    emit('error');
  }

  /** Read sentence i. `interrupt` is false only when the sentence before it has just ended by itself. */
  function read(i, interrupt = true) {
    clearTimers();
    // Speaking straight after a cancel() is dropped by some browsers, so wait a moment in that case.
    const wait = interrupt && (busy() || now() - cancelledAt < timing.afterCancel);
    if (interrupt && busy()) silence();
    status = 'playing';
    index = i;
    speaking = false;
    word = null;
    restart = false;
    finished = false;
    error = null;
    emit('sentence');
    if (wait) later(() => utter(i), timing.afterCancel);
    else utter(i);
  }

  /** Stop the sound but keep the place, so that resume reads the current sentence again. */
  function hold() {
    clearTimers();
    silence();
    status = 'paused';
    restart = true;
  }

  const clamp = i => Math.min(sentences.length - 1, Math.max(0, i));

  const player = {
    get state() { return state(); },
    /** Start from sentence i (default: the first), whatever is happening now. */
    play(i = 0) { read(clamp(i)); },
    pause() {
      if (status !== 'playing') return;
      if (!nativePause || !speaking) { hold(); return emit('pause'); }
      clearTimers();
      status = 'paused';
      try { synth.pause(); } catch { hold(); return emit('pause'); }
      emit('pause');
      // Where pause() silently does nothing, the voice would carry on while the page says "Paused".
      later(() => { if (status === 'paused' && !restart && !synth.paused) { hold(); emit('pause'); } }, timing.pauseCheck);
    },
    resume() {
      if (status !== 'paused') return;
      if (restart || !current) return read(clamp(index));
      const utterance = current;
      clearTimers();
      status = 'playing';
      try { synth.resume(); } catch { return read(clamp(index)); }
      emit('resume');
      watchForStall(utterance, index);
      // If the voice did not come back, read the sentence again from its start.
      later(() => { if (status === 'playing' && current === utterance && (synth.paused || !synth.speaking)) read(clamp(index)); }, timing.resumeCheck);
    },
    toggle() {
      if (status === 'playing') player.pause();
      else if (status === 'paused') player.resume();
      else player.play(0);
    },
    stop() {
      const was = status;
      clearTimers();
      silence();
      status = 'idle';
      index = -1;
      restart = false;
      finished = false;
      if (was !== 'idle') emit('stop');
    },
    /** Move one sentence forward or back. While paused, the place moves and the player stays paused. */
    step(by) {
      if (status === 'idle') return;
      const target = clamp(index + by);
      if (status === 'playing') return read(target);
      hold();
      index = target;
      emit('sentence');
    },
    next() { player.step(1); },
    previous() { player.step(-1); },
    /** A new speed or voice applies at once: the current sentence is read again with it. */
    setRate(value) {
      if (value === rate) return;
      rate = value;
      refresh();
    },
    /** `voicesKnown` is false while the browser lists no voices at all: then a start is given up on sooner. */
    setVoice(value, voicesKnown = true) {
      hasVoices = voicesKnown;
      // Browsers hand out new objects for the same voice each time the list is read: compare by name.
      const same = voiceKey(value) === voiceKey(voice);
      voice = value;
      if (!same) refresh();
    },
    /** The page was hidden: stop the sound, keep the place. */
    suspend() {
      if (status === 'idle') return;
      hold();
      emit('pause');
    },
  };
  function refresh() {
    if (status === 'playing') read(clamp(index));
    else if (status === 'paused' && !restart) { hold(); emit('pause'); }
  }
  return player;
}
