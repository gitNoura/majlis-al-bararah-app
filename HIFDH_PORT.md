# Hifdh page port: handoff (web → Expo app)

Branch: `hifdh-port-from-web` (this repo). Source: private repo `gitNoura/Majlis-al-Bararah`, branch `hifdh-port`.
Scope: the Hifdh page only («الحفظ» = the Plan screen, `src/hifz/`). Listen (`listen.js`) and Test are separate pages, out of scope.

## Files a new chat needs from the private repo (send these)
Required for the UI stage:
- `src/hifz/hifz.js`  (the page itself, ~62 KB)
- `src/hifdh/marks.js`  (`marksIn`, used by the page)
- `src/styles/screens/hifz.css`  (~99 KB, visual reference only; it is converted to StyleSheet, so a chat can skim it)
- `index.html` lines 155-170  (the `#hifz` section markup)
- the `t('…')` entries that `hifz.js` uses from `src/core/i18n.js`
Optional: `src/hifz/confetti.js` (celebration effect, ~2 KB).
Already ported (no need to resend): `src/hifz/hifz-core.js`, `src/hifz/hifz-plan.js`, `src/hifdh/index.js`.

## Status (tick as you go)
- [x] Stage 1: logic modules copied with imports fixed → `src/lib/hifdh/{core,plan,index}.js`
- [ ] Stage 2: strings → `src/i18n/hifdh.js` (same `L(ar, en, fr)` style as `src/i18n/home.js`)
- [ ] Stage 3: UI → `src/app/memorize.tsx` + components in `src/components/hifdh/`
- [ ] Stage 4: lint + `npx tsc --noEmit`

## Conventions in this app (from AGENTS.md and existing code)
- Storage: `readJSON/writeJSON` from `src/lib/storage.js` (localStorage shim), so web logic works unchanged.
- Language: `L(ar, en, fr)` / `isEnglish` from `src/i18n/i18n.js`; colours from `useTheme()`; text via `Txt`; back button pattern in `src/components/Coming.tsx`.
- Expo packages: install with `npx expo install`; check docs for SDK 58 before using any Expo API.
