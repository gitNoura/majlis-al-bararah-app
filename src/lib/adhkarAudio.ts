// The adhkar's recordings (read by Hamad al-Dreihem), one a dhikr: from the open Adhkar-json collection
// on GitHub (github.com/rn0x/Adhkar-json, its «audio» folder - the same recordings the website's
// Adhkar plays), through jsDelivr, which serves GitHub's files quickly. A dhikr's `audio` names its file.
//
// One player for the whole app: playing another dhikr stops the one before. The speed (normal, 1.5×,
// 2×) is kept for the next ones too, as on the website.
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useSyncExternalStore } from 'react';

const BASE = 'https://cdn.jsdelivr.net/gh/rn0x/Adhkar-json@main/audio/';
export const SPEEDS = [1, 1.5, 2];

type State = { playing: string | null; loading: boolean; rate: number };
let state: State = { playing: null, loading: false, rate: 1 };
const listeners = new Set<() => void>();
const set = (next: Partial<State>) => {
  state = { ...state, ...next };
  listeners.forEach((fn) => fn());
};

export function useAdhkarAudio(): State {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    () => state,
  );
}

let player: AudioPlayer | null = null;
let modeSet = false;

export function stopAudio() {
  player?.pause();
  player?.remove();
  player = null;
  set({ playing: null, loading: false });
}

// plays a dhikr's recording, or stops it when it is the one playing
export function toggleAudio(audio: string) {
  if (state.playing === audio) return stopAudio();
  stopAudio();
  if (!modeSet) {
    modeSet = true;
    // heard even with the phone on silent, as a recitation
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }
  const p = createAudioPlayer({ uri: `${BASE}${encodeURIComponent(audio)}.mp3` });
  player = p;
  set({ playing: audio, loading: true });
  p.addListener('playbackStatusUpdate', (status) => {
    if (player !== p) return;
    if (status.isLoaded && state.loading) set({ loading: false });
    if (status.didJustFinish) stopAudio();
  });
  p.setPlaybackRate(state.rate);
  p.play();
}

// the next speed: normal → 1.5× → 2× → normal
export function cycleSpeed() {
  const rate = SPEEDS[(SPEEDS.indexOf(state.rate) + 1) % SPEEDS.length];
  player?.setPlaybackRate(rate);
  set({ rate });
}
