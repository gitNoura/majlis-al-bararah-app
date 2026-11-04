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
- [x] Stage 2: strings → `src/i18n/hifdh.js` (same `L(ar, en, fr)` style as `src/i18n/home.js`), `HIF.key()`, 115 keys
- [ ] Stage 3: UI → `src/app/memorize.tsx` + components in `src/components/hifdh/`
  - [x] 3a header and plan summary → `src/app/memorize.tsx`, `src/components/hifdh/{HifHeader,WeekCard,MemorizedRing,PlanSummary}.tsx`
  - [ ] 3b daily cards
  - [ ] 3c plan setup/edit flow (finish date, pace, days, pause/delete), plans list, memorized picker
- [ ] Stage 4: lint + `npx tsc --noEmit`

## Conventions in this app (from AGENTS.md and existing code)
- Storage: `readJSON/writeJSON` from `src/lib/storage.js` (localStorage shim), so web logic works unchanged.
- Language: `L(ar, en, fr)` / `isEnglish` from `src/i18n/i18n.js`; colours from `useTheme()`; text via `Txt`; back button pattern in `src/components/Coming.tsx`.
- Expo packages: install with `npx expo install`; check docs for SDK 58 before using any Expo API.

## Notes and decisions (Stage 2)
- `src/i18n/hifdh.js` holds every string of the web page (home, plan setup/edit, plans, history, memorized, stop sheet), not only the Plan screen, so later pieces need no new strings. Unused keys are fine.
- Not duplicated here because `src/lib/hifdh/labels.js` already has them: unit names and plurals, `STATUS`, `kindOf`, `perWord`, `weekLine`, `startsAt`, `rangeLabel` (also gives «Everything I know» / «The whole Quran»), weekday/date helpers.
- Left out on purpose: `lsWarshSoon` (Listen, out of scope), `comingSoon` (use `HOME.coming()`), and the `←`/`→` arrow glyph (use `BackIcon` and an icon instead).
- French strings keep plain spaces before `? ! : ;`, as in `home.js` (the web page did the same for `L()` strings).
- Parametrised keys take plain values: `dayOfN(k, n)`, `forDay(dayText)`, `nothingTodayNext(dayText)`, `stepOf(i, n)`, `amountQuestion(revise, weekly)`, `scopeQuestion(revise)`, `finishLine(revise)`.

## Notes and decisions (Stage 3a)
- Plan screen only: the web's bottom tabs (Listen / My plans / Recite) are not drawn. Listen and Test are other pages; «My plans» comes back in 3c as a door from the plan screen.
- `memorize.tsx` loads with `plan.ready()` (loading / failed states from `HIF.loading()` / `HIF.loadFailed()`), then shows `PlanSummary`: week card, memorized ring, «Today's plan» heading with the date.
- `HifHeader({ title, onBack })` is the shared head: without `onBack` it leaves the page, so 3c can pass its own step-back for the setup questions and sub-screens.
- `MemorizedRing({ onPress })` shows the chevron only when `onPress` is given; 3c wires it to the memorized picker via `PlanSummary({ onOpenMemorized })`.
- The language change remounts the whole app (`_layout.tsx` keys on `lang`), so no screen needs its own language listener. After a mark or plan change, 3b/3c should bump a `rev` state in `memorize.tsx` to redraw the summary.
- Left out: the web's `importOldMarks()` (migrates the old `hifdhMarks` into the ledger on open); the app has no earlier data. `marks.js` is not needed by 3a; it is for the freshness view / picking something known in 3c.
- `npx tsc --noEmit` could not run in the chat (no `node_modules`), so 3a is unchecked until Stage 4.

## What remains
3b daily cards (`TodayCard`/`RevisionCard`/`AheadCard` from `taskHTML`, `todayHTML`, `revisionHTML`, `aheadHTML`: Complete with long-press «where did you stop?», undo, status lines; confetti on Complete), then 3c, then Stage 4 (`npx expo lint`, `npx tsc --noEmit`). Ambiguity: "date stepper and settings" is read as the plan setup/edit flow (finish date, pace, days, pause/delete).
