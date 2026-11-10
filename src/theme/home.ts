// The Home screen's palette: the app's own page and card colours (src/theme/tokens.ts), plus the prayer card's own
// deep forest green and cream (its chosen-prayer pill is #173f32 with cream words), so the hero, the plan boxes and the
// prayer card belong together under every sky (night, dawn, midday, afternoon, sunset). The key names `forest`,
// `lime` and `limeInk` are kept from the first draft: `lime` is now the cream of the button and ring on the hero.
import { useTheme } from './theme';

export type HomePalette = {
  screen: string; // the page (the app's own)
  card: string; // a paper card
  cardLine: string; // its hairline
  well: string; // a track or an empty capsule on a card
  ink: string; // titles and numbers
  meta: string; // second lines
  forest: string; // the hero card
  forestInk: string; // words on the hero
  forestSoft: string; // quiet words on the hero
  forestLine: string; // the hero's inset frame
  lime: string; // the cream button and ring on the hero
  gold: string; // the light yellow accent on the hero (chip words, frame, rule, the hadith's source, the ring)
  goldSoft: string; // its faint tint (the chip, the hadith's panel)
  ring: string; // the khatma ring, the plan bars and the lit petals: the cream gold of the prayer card's chosen time
  goldLine: string; // its hairline (the inset frame, the rule)
  limeInk: string; // words on that button
  deepTop: string; // the cards under the prayer card: a deep sage green that sits under every sky (top of its gradient)
  deepBottom: string; // and its bottom
  surfaceTop: string; // the Home cards: a clean near-white (a cool, neutral one, not a warm paper)...
  surfaceBottom: string; // ...a shade deeper at the bottom
  surfaceRim: string; // their hairline
  surfaceShadow: string;
  skyWash: number; // how strongly the sky of the moment tints the top corner of a card, 0..1
  trackSoft: string; // an empty bar or ring on them
  greenSoft: string; // a faint tint of the green (a pill)
  tile: string; // the done pills and the chips on the plan boxes: a soft tint of the green
  tileInk: string; // words on it
  mint: string; // the paler green a completed Hifdh card turns (its wash on the paper, as one solid colour)
  mintLine: string; // that card's border
  leaf: string; // fills on a paper card
  amber: string; // the warm gold that breaks the green on the Hifdh page: headings, the week card's today ring and idle days
  sand: string; // a soft warm surface (the week card)
  sandLine: string; // its border
  ghost: string; // an empty tick or track on a paper card
  shadow: string;
};

const light: HomePalette = {
  screen: '#f6f8f5',
  card: '#ffffff',
  cardLine: 'rgba(20, 50, 38, 0.08)',
  well: '#eef2ee',
  ink: '#14261e',
  meta: '#5d6d64',
  forest: '#173f32',
  forestInk: '#fffdf5',
  forestSoft: 'rgba(255, 253, 245, 0.72)',
  forestLine: 'rgba(255, 253, 245, 0.22)',
  lime: '#fffdf5',
  limeInk: '#233a2e',
  gold: '#f4e6a6',
  goldSoft: 'rgba(244, 230, 166, 0.14)',
  goldLine: 'rgba(244, 230, 166, 0.34)',
  ring: '#f3e2b0',
  deepTop: '#47684f',
  deepBottom: '#2f4a3a',
  surfaceTop: '#ffffff',
  surfaceBottom: '#f3f5f3',
  surfaceRim: 'rgba(20, 50, 38, 0.08)',
  surfaceShadow: 'rgba(31, 60, 48, 0.12)',
  skyWash: 0.2,
  trackSoft: 'rgba(31, 60, 48, 0.1)',
  greenSoft: 'rgba(71, 104, 79, 0.1)',
  tile: '#dce9df',
  tileInk: '#173f32',
  mint: '#eff4f2',
  mintLine: 'rgba(31, 90, 69, 0.22)',
  leaf: '#1f5a45',
  amber: '#9a6a14',
  sand: '#f8f1df',
  sandLine: 'rgba(154, 106, 20, 0.28)',
  ghost: 'rgba(20, 50, 38, 0.14)',
  shadow: 'rgba(20, 50, 38, 0.08)',
};

const dark: HomePalette = {
  screen: '#141816',
  card: '#1c211e',
  cardLine: 'rgba(255, 255, 255, 0.07)',
  well: '#232925',
  ink: '#f1f5f2',
  meta: '#9db0a5',
  forest: '#1d4a3a',
  forestInk: '#fffdf5',
  forestSoft: 'rgba(255, 253, 245, 0.72)',
  forestLine: 'rgba(255, 253, 245, 0.16)',
  lime: '#fffdf5',
  limeInk: '#233a2e',
  gold: '#f1e29b',
  goldSoft: 'rgba(241, 226, 155, 0.13)',
  goldLine: 'rgba(241, 226, 155, 0.32)',
  ring: '#f3e2b0',
  deepTop: '#436149',
  deepBottom: '#2c4536',
  surfaceTop: '#232825',
  surfaceBottom: '#1b1f1c',
  surfaceRim: 'rgba(255, 255, 255, 0.08)',
  surfaceShadow: 'rgba(0, 0, 0, 0.4)',
  skyWash: 0.26,
  trackSoft: 'rgba(255, 255, 255, 0.12)',
  greenSoft: 'rgba(120, 165, 135, 0.16)',
  tile: '#27382f',
  tileInk: '#d8eadf',
  mint: '#28362f',
  mintLine: 'rgba(111, 181, 151, 0.4)',
  leaf: '#6fb597',
  amber: '#e4c46d',
  sand: '#2a2519',
  sandLine: 'rgba(228, 196, 109, 0.3)',
  ghost: 'rgba(255, 255, 255, 0.14)',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export function useHome(): HomePalette {
  return useTheme().isDark ? dark : light;
}
