/**
 * The audiobook player: chapters, transport controls, seeking, playback speed, saved progress, Media Session
 * and keyboard shortcuts. Moved here unchanged from the old site's book page, apart from two things:
 * the play button now shows an icon with a spoken label, and Space is left alone while a button or link has
 * the focus, so every control can still be pressed from the keyboard.
 */
import { formatTime } from './api.js';
import { getProgress, saveProgress } from './store.js';

const icon = (path) => `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="currentColor">${path}</svg>`;
const PLAY_ICON = icon('<path d="M7 4.5v15l13-7.5z"/>');
const PAUSE_ICON = icon('<path d="M6 4.5h4.5v15H6zM13.5 4.5H18v15h-4.5z"/>');

export function setupPlayer(book, root) {
  const audio = root.querySelector('[data-audio]');
  const playBtn = root.querySelector('[data-play]');
  const seek = root.querySelector('[data-seek]');
  const curEl = root.querySelector('[data-current]');
  const durEl = root.querySelector('[data-duration]');
  const nowChapter = root.querySelector('[data-now-chapter]');
  const rateBtn = root.querySelector('[data-rate]');
  const chapterBtns = Array.from(root.querySelectorAll('[data-chapter-index]'));

  const RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];
  let rateIdx = 1;
  let current = 0;       // active chapter index
  let seeking = false;
  let saveTimer = 0;

  function showPlaying(playing) {
    playBtn.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  // Archive.org streams (especially VBR MP3s) frequently report Infinity or
  // NaN for audio.duration until fully buffered, which used to freeze the
  // whole readout (0:00 / 0:00) and the seek bar even while audio played.
  // Fall back to the length the Archive metadata gives us per chapter.
  function effectiveDuration() {
    if (Number.isFinite(audio.duration) && audio.duration > 0) return audio.duration;
    const len = book.chapters[current] && book.chapters[current].length;
    return len && len > 0 ? len : 0;
  }

  function highlight() {
    chapterBtns.forEach((btn, i) => {
      const active = i === current;
      btn.classList.toggle('is-current', active);
      if (active) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
      btn.querySelector('[data-eq]').hidden = !active;
    });
    nowChapter.textContent = book.chapters[current].title;
  }

  function loadChapter(index, { autoplay = false, position = 0 } = {}) {
    current = Math.max(0, Math.min(index, book.chapters.length - 1));
    audio.src = book.chapters[current].url;
    audio.playbackRate = RATES[rateIdx];
    highlight();
    // Show the chapter's metadata length immediately and reset the readout,
    // so the duration is right even before (or without) audio.duration.
    durEl.textContent = formatTime(book.chapters[current].length) || '0:00';
    curEl.textContent = '0:00';
    seek.value = '0';
    if (position) {
      audio.currentTime = position; // may be re-applied on loadedmetadata below
      pendingSeek = position;
    } else {
      pendingSeek = 0;
    }
    if (autoplay) audio.play().catch(() => {});
    updateMediaSession();
  }

  let pendingSeek = 0;
  audio.addEventListener('loadedmetadata', () => {
    if (pendingSeek > 0) {
      const d = effectiveDuration();
      audio.currentTime = d ? Math.min(pendingSeek, d - 1) : pendingSeek;
      pendingSeek = 0;
    }
    durEl.textContent = formatTime(effectiveDuration());
  });
  // The real duration may only arrive once enough audio has buffered.
  audio.addEventListener('durationchange', () => {
    durEl.textContent = formatTime(effectiveDuration());
  });

  audio.addEventListener('timeupdate', () => {
    if (!seeking) {
      const d = effectiveDuration();
      seek.value = String(d ? Math.min(1000, (audio.currentTime / d) * 1000) : 0);
      curEl.textContent = formatTime(audio.currentTime);
    }
    // throttle progress writes to ~once every 5s
    const now = Date.now();
    if (now - saveTimer > 5000) {
      saveTimer = now;
      persist();
    }
  });

  audio.addEventListener('play', () => { showPlaying(true); updateMediaSession(); });
  audio.addEventListener('pause', () => { showPlaying(false); persist(); });
  audio.addEventListener('ended', () => {
    if (current < book.chapters.length - 1) loadChapter(current + 1, { autoplay: true });
    else persist();
  });
  audio.addEventListener('error', () => {
    if (!audio.src) return; // ignore the empty-src error before first load
    console.error('Audio failed to load:', book.chapters[current] && book.chapters[current].url);
    nowChapter.textContent = book.chapters[current].title + '  ·  unavailable — try another chapter';
  });

  // transport
  playBtn.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  });
  root.querySelector('[data-prev]').addEventListener('click', () => loadChapter(current - 1, { autoplay: !audio.paused }));
  root.querySelector('[data-next]').addEventListener('click', () => loadChapter(current + 1, { autoplay: !audio.paused }));
  root.querySelector('[data-back]').addEventListener('click', () => { audio.currentTime = Math.max(0, audio.currentTime - 15); });
  root.querySelector('[data-fwd]').addEventListener('click', () => { audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + 30); });

  rateBtn.addEventListener('click', () => {
    rateIdx = (rateIdx + 1) % RATES.length;
    audio.playbackRate = RATES[rateIdx];
    rateBtn.textContent = `${RATES[rateIdx]}×`;
  });

  // seek bar
  seek.addEventListener('input', () => {
    seeking = true;
    const d = effectiveDuration();
    if (d) curEl.textContent = formatTime((Number(seek.value) / 1000) * d);
  });
  seek.addEventListener('change', () => {
    const d = effectiveDuration();
    if (d) audio.currentTime = (Number(seek.value) / 1000) * d;
    seeking = false;
  });

  chapterBtns.forEach((btn, i) =>
    btn.addEventListener('click', () => loadChapter(i, { autoplay: true }))
  );

  // persistence
  function persist() {
    saveProgress({
      id: book.id,
      title: book.title,
      author: book.author,
      cover: book.cover,
      chapterIndex: current,
      chapterTitle: book.chapters[current].title,
      chapterCount: book.chapters.length,
      position: Math.floor(audio.currentTime || 0),
    });
  }
  window.addEventListener('beforeunload', persist);
  document.addEventListener('visibilitychange', () => { if (document.hidden) persist(); });

  // Media Session (lock-screen / hardware keys)
  function updateMediaSession() {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: book.chapters[current].title,
      artist: book.author,
      album: book.title,
      artwork: [{ src: book.cover, sizes: '512x512', type: 'image/jpeg' }],
    });
    navigator.mediaSession.setActionHandler('play', () => audio.play());
    navigator.mediaSession.setActionHandler('pause', () => audio.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => loadChapter(current - 1, { autoplay: true }));
    navigator.mediaSession.setActionHandler('nexttrack', () => loadChapter(current + 1, { autoplay: true }));
    navigator.mediaSession.setActionHandler('seekbackward', () => { audio.currentTime = Math.max(0, audio.currentTime - 15); });
    navigator.mediaSession.setActionHandler('seekforward', () => { audio.currentTime = audio.currentTime + 30; });
  }

  // keyboard shortcuts (ignore when typing in a field, or when a button or link has the focus)
  document.addEventListener('keydown', (e) => {
    if (/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(e.target.tagName)) return;
    if (e.code === 'Space') { e.preventDefault(); playBtn.click(); }
    else if (e.code === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 15); }
    else if (e.code === 'ArrowRight') { audio.currentTime = audio.currentTime + 30; }
  });

  // ---- resume where the listener left off ----
  showPlaying(false);
  const saved = getProgress(book.id);
  if (saved && Number.isInteger(saved.chapterIndex)) {
    loadChapter(saved.chapterIndex, { position: saved.position || 0 });
  } else {
    loadChapter(0);
  }
}
