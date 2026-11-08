// «Listen» (listen.js of the website), without the mushaf: the choice of ayat, how many times each is heard,
// the ways of listening, and the player that goes step by step through them. All the choices are kept on
// the phone ('listenPrefs'). The reciters and the audio files are in ./reciters.js; only reciters of the
// narration that is open can play (the audio has to match the mushaf). A session that was heard leaves one
// quiet record in the log (./log.js), which also counts for the map's «last worked».
//
// The way of listening:
//   each ayah in turn (the default)
//   linking each ayah with the one before it:      1 · 2 · 1+2 · 3 · 2+3 · 4 · 3+4 ...
//   linking each ayah with all those before it:    1 · 2 · 1+2 · 3 · 1+2+3 · 4 · 1+2+3+4 ...
// Each step is heard as many times as chosen, then the next step begins.
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

import { displayKeys, storedKeys } from '../ayahmap.js';
import { HAFS } from '../riwaya.js';
import { readJSON, writeJSON } from '../storage.js';
import { COUNTS, keyOf, ordOf } from './index.js';
import { addRecord } from './log.js';
import { HAFS_COUNTS, RECITERS, globalNumber } from './reciters.js';

export const SPEEDS = [0.25, 0.5, 1, 1.5, 2];
export const QUICK = [1, 2, 3, 4, 5]; // the usual numbers of times; the box next to them is for any other
export const METHODS = ['each', 'prev', 'all'];
export const MAX_TYPED = 99; // the most that can be typed in the «other number» box

export const times = (n) => Math.min(MAX_TYPED, Math.max(1, Math.round(Number(n)) || 1));

// ---------- Keys and positions (in the narration that is open) ----------

export const parse = (key) => key.split(':').map(Number);
export const counts = () => (HAFS ? HAFS_COUNTS : COUNTS);
export const pos = (key) => {
  const [su, a] = parse(key);
  return HAFS ? globalNumber(su, a) : ordOf(key) + 1;
};
export function keysFromTo(a, b) {
  const [sa, aa] = parse(a);
  const [sb, ab] = parse(b);
  const keys = [];
  for (let su = sa; su <= sb; su++) {
    for (let ay = su === sa ? aa : 1; ay <= (su === sb ? ab : counts()[su - 1]); ay++) keys.push(`${su}:${ay}`);
  }
  return keys;
}
export const ordered = (a, b) => (pos(a) <= pos(b) ? [a, b] : [b, a]);

// ---------- Where the Warsh audio and the Warsh text count differently ----------
// The QuranHub Warsh audio has ONE file for al-Mulk 9 and 10, while the mushaf text (and so the app) has two
// ayat there: 31 ayat in the surah against 30 files, 6,214 against 6,213 in the whole Quran. So in Warsh:
//   · 67:9 and 67:10 are one step: it plays the file of 67:9 and lights up both ayat;
//   · every ayah after 67:10 is one file earlier than its place in the app's numbering.
// Nothing changes in Hafs (its audio and text count the same).
const MERGED_FIRST = '67:9';
const MERGED_SECOND = '67:10';

// the ayat that are heard together with this one (itself included)
export const together = (key) => (!HAFS && (key === MERGED_FIRST || key === MERGED_SECOND) ? [MERGED_FIRST, MERGED_SECOND] : [key]);

// the chosen ayat as steps can play them: 67:10 is heard inside 67:9, so it is never a step of its own
export function playable(keys) {
  if (HAFS) return keys;
  const out = [];
  for (const k of keys) {
    const p = k === MERGED_SECOND ? MERGED_FIRST : k;
    if (out[out.length - 1] !== p) out.push(p);
  }
  return out;
}

// the number of the ayah's file in the whole Quran, in the audio's own counting
export function audioNumber(key) {
  const n = pos(key);
  if (HAFS) return n;
  const [su, a] = parse(key);
  return su > 67 || (su === 67 && a > 10) ? n - 1 : n; // 67:10 never gets here (see playable), 67:9 keeps its number
}

// The key of the ayah at a Hifdh position (Warsh), in the narration that is open
export const startKey = (g) => (g == null ? null : (displayKeys(keyOf(g))[0] ?? null));

// ---------- Reciters and prefs ----------

export const available = () => RECITERS.filter((r) => r.riwaya === (HAFS ? 'hafs' : 'warsh'));

export function loadPrefs() {
  const saved = readJSON('listenPrefs', {});
  return {
    reciter: saved.reciter ?? null,
    repeat: times(saved.repeat ?? saved.repeatAyah ?? 1),
    rounds: times(saved.rounds ?? saved.repeatRange ?? 1),
    loop: false, // the endless loop has no button any more (a saved one must not keep playing with no way to stop it)
    speed: SPEEDS.includes(saved.speed) ? saved.speed : 1,
    method: METHODS.includes(saved.method) ? saved.method : 'each',
  };
}
export const savePrefs = (prefs) => writeJSON('listenPrefs', prefs);
export const reciterOf = (prefs) => available().find((r) => r.id === prefs.reciter) ?? available()[0];
const urlOf = (prefs, key) => {
  const [su, a] = parse(key);
  return reciterOf(prefs).url(su, a, audioNumber(key)); // the file's place in the whole Quran, in the audio's counting
};

// ---------- The steps: what is heard, in which order ----------

export function stepsFor(keys, method) {
  if (method === 'each') return keys.map((k) => [k]);
  const out = [];
  keys.forEach((k, i) => {
    out.push([k]);
    if (i > 0) out.push(method === 'prev' ? [keys[i - 1], k] : keys.slice(0, i + 1));
  });
  return out;
}

// The file that follows the one playing now (null at the very end)
function upcoming(s, prefs) {
  const step = s.steps[s.si];
  if (s.ki + 1 < step.length) return step[s.ki + 1];
  if (s.pass + 1 < prefs.repeat) return step[0];
  if (s.si + 1 < s.steps.length) return s.steps[s.si + 1][0];
  if (prefs.loop || s.round + 1 < prefs.rounds) return s.steps[0][0];
  return null;
}

// The part that was heard, in Warsh positions (the map's own): one record, once.
function logSession(s, prefs) {
  if (!s || s.logged || !s.heard.size) return;
  const heard = [...new Set([...s.heard].flatMap(together))].sort((x, y) => pos(x) - pos(y));
  const stored = (k) => storedKeys(k)[0] ?? null;
  const first = heard.map(stored).find(Boolean);
  const last = [...heard].reverse().map(stored).find(Boolean);
  if (!first || !last) return;
  s.logged = true;
  const [a, b] = [ordOf(first), ordOf(last)].sort((x, y) => x - y);
  addRecord('listen', a, b, { reciter: reciterOf(prefs).id, repeat: prefs.repeat, rounds: prefs.rounds, speed: prefs.speed, method: prefs.method });
}

// ---------- The player ----------
// Two players that take turns: while one plays an ayah, the other already has the next file loaded, so the
// next ayah starts at once. `onChange` is called whenever anything the screen shows has changed.

const deck = () => ({ player: createAudioPlayer(null), url: null });

export class Listener {
  constructor() {
    this.onChange = () => {};
    this.prefs = loadPrefs();
    this.s = null; // { steps, si, ki, pass, round, heard, finished, error, logged, selId }
    this.decks = null; // [0] plays now, [1] holds what comes next (made by start())
    this.armed = false; // the end of the file playing now has not been dealt with yet
  }

  // Makes the two players (the screen calls it when it opens, and release() when it leaves)
  start(onChange) {
    this.onChange = onChange;
    this.decks = [deck(), deck()];
    this.decks.forEach((d) => {
      d.sub = d.player.addListener('playbackStatusUpdate', (st) => {
        if (d !== this.decks[0]) return;
        if (st.didJustFinish) this.advance();
        else this.onChange();
      });
    });
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }

  get playing() {
    return !!this.decks && !!this.s && !this.s.finished && !this.s.error && this.decks[0].player.playing;
  }

  setPref(name, value) {
    this.prefs[name] = value;
    savePrefs(this.prefs);
    if (this.decks && this.s && name === 'speed' && !this.s.finished) this.decks[0].player.setPlaybackRate(value);
    this.onChange();
  }

  playCurrent() {
    const s = this.s;
    const key = s.steps[s.si][s.ki];
    s.error = false;
    s.finished = false;
    try {
      const url = urlOf(this.prefs, key);
      this.decks[0].player.pause();
      if (this.decks[1].url === url) this.decks.reverse(); // the file is ready: just start the other player
      else {
        this.decks[0].player.replace({ uri: url });
        this.decks[0].url = url;
      }
      const d = this.decks[0];
      d.player.setPlaybackRate(this.prefs.speed);
      d.player.seekTo(0).catch(() => {});
      this.armed = true;
      d.player.play();
      this.preloadNext();
    } catch {
      s.error = true;
    }
    this.onChange();
  }

  preloadNext() {
    const next = upcoming(this.s, this.prefs);
    const spare = this.decks[1];
    if (!next) return void (spare.url = null);
    const url = urlOf(this.prefs, next);
    if (spare.url !== url) {
      spare.player.replace({ uri: url });
      spare.url = url;
    }
  }

  // The file playing is over: the next one, or the end
  advance() {
    const s = this.s;
    if (!s || !this.armed) return;
    this.armed = false;
    s.heard.add(s.steps[s.si][s.ki]);
    if (s.ki + 1 < s.steps[s.si].length) {
      s.ki++;
      return this.playCurrent();
    }
    s.ki = 0;
    s.pass++;
    if (s.pass < this.prefs.repeat) return this.playCurrent();
    s.pass = 0;
    if (s.si + 1 < s.steps.length) {
      s.si++;
      return this.playCurrent();
    }
    s.round++;
    if (this.prefs.loop || s.round < this.prefs.rounds) {
      s.si = 0;
      return this.playCurrent();
    }
    s.finished = true;
    logSession(s, this.prefs);
    this.onChange();
  }

  // Starts what is chosen, from its first step. A session before it is logged first.
  begin(keys, selId) {
    if (!this.decks || !keys.length) return;
    this.halt();
    this.s = { steps: stepsFor(playable(keys), this.prefs.method), si: 0, ki: 0, pass: 0, round: 0, heard: new Set(), finished: false, error: false, logged: false, selId };
    this.playCurrent();
  }

  halt() {
    this.armed = false;
    for (const d of this.decks ?? []) {
      d.player.pause();
      d.url = null;
    }
    logSession(this.s, this.prefs);
    this.s = null;
    this.onChange();
  }

  togglePlay(keys, selId) {
    if (!this.decks || !keys.length) return;
    const s = this.s;
    if (!s || s.selId !== selId || s.finished) return this.begin(keys, selId);
    if (s.error) return this.playCurrent();
    const p = this.decks[0].player;
    if (p.playing) p.pause();
    else p.play();
    this.onChange();
  }

  jump(delta) {
    const s = this.s;
    if (!s) return;
    const si = s.si + delta;
    if (si < 0 || si >= s.steps.length) return;
    s.si = si;
    s.ki = 0;
    s.pass = 0;
    this.playCurrent();
  }

  // Leaving: what was heard is logged, and the players are let go
  release() {
    this.halt();
    for (const d of this.decks ?? []) {
      d.sub?.remove();
      d.player.remove();
    }
    this.decks = null;
  }
}
