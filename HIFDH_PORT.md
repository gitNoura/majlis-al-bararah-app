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
  - [x] 3b daily cards
    - [x] 3b-1 Today card + shared pieces → `src/components/hifdh/{HifProvider,TaskRow,TodayCard,Section,StopSheet,Toast,Confetti}.tsx`, `src/app/memorize.tsx`
    - [x] 3b-2 RevisionCard, AheadCard → `src/components/hifdh/{RevisionCard,AheadCard}.tsx`, wired in `src/app/memorize.tsx`
  - [x] 3c plan setup/edit flow (finish date, pace, days, pause/delete), plans list, memorized picker (split in three)
    - [x] 3c-1 memorized picker + «What I've memorized» screen → `src/components/hifdh/{MemorizedPicker,MemorizedScreen}.tsx`, `src/app/memorize.tsx` (`view` state, ring opens it)
    - [x] 3c-2 plan setup (questions) and edit page → `src/components/hifdh/{PlanSetup,DateStepper}.tsx`, `src/app/memorize.tsx` (`'pace'` view, `onStartPlan`)
    - [x] 3c-3 plans list («My plans»: modify / pause / delete / add) → `src/components/hifdh/PlansList.tsx`, tile under the cards, `'plans'` view in `src/app/memorize.tsx`
- [ ] Stage 4: lint + `npx tsc --noEmit` (first run fixed: Confetti ref-in-render, picker/Today/Revision/TaskRow types; re-run to confirm)

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

## Notes and decisions (Stage 3b-1)
- `HifProvider` (wraps the loaded screen in `memorize.tsx`) owns `rev` (bumped by `refresh()` after every mark; `Content` subscribes via `useHif()`, so the summary and the cards redraw), the toast, the confetti and the «where did you stop?» sheet. Cards get `{ rev, refresh, toast, burst, openStop, startPlan, listen }` from `useHif()`.
- `TaskRow` is the shared `taskHTML` (props `row, locked, ahead, first`): Complete (tap = done / take back, long press 550 ms = stop sheet), undo link for «not done», status lines, weekly «This week is complete». 3b-2's Revision and Ahead cards reuse it (`locked` for revision with nothing memorized, `ahead` for the «For <day>» line).
- `Section` / `Hint` / `PrimaryButton` / `SecondaryButton` (in `Section.tsx`) are the card shell and buttons for all daily cards.
- Confetti: `Confetti.tsx` redraws `confetti.js` with `Animated` (native driver, precomputed paths, no new package); skipped when the device asks for reduced motion. All-day-done fires the big burst from screen centre plus the «MashaAllah» toast; otherwise a small burst from the button.
- Ambiguities, closest to the web: the Listen button shows `HOME.coming()` (Listen is another page); «Set up my plan» (`startPlan`) also shows `HOME.coming()` until 3c passes `onStartPlan` to `HifProvider`. The web put Today and Ahead in one green band; here each is its own card. The `nottoday` action has no button on the web (history sheet only), so it comes with 3c's history/status sheet, if at all.
- Not run: `tsc` (see 3a). `row` objects are typed `any` (`Row` in `StopSheet.tsx`) as the logic modules are plain JS.

## Notes and decisions (Stage 3b-2)
- Order on the screen: summary, Today, Ahead, Revision (the web had Ahead inside the green Today band, Revision in the yellow one; here each is its own card).
- `AheadCard` keeps the web's `aheadOpen` as local state (`open`); it shows the «start tomorrow's plan» offer until opened or until something ahead is done, and draws nothing unless today's rows are all done and `aheadRows()` is not empty.
- `RevisionCard`: no revision plan gives the hint plus «Start a revision plan» (disabled until `memorizedCount() > 0`); with a plan, rows are `locked` until then and the lock note shows. «Start» goes through `startPlan('revise')` (still «coming soon» until 3c).

## Notes and decisions (Stage 3c-1)
- `MemorizedPicker({ bits, onSet(from, to, on), quick? })` is controlled: `bits` is one 0/1 per ayah, `onSet` puts the span [from, to) in or out. `MemorizedScreen` feeds it the ledger (`plan.setLedger` + `refresh()`); 3c-2 feeds it the plan's range bits for «Specific surahs» and the first-time «memorized» question (use `quick` there too, as the web's `memorizedBody`).
- `memorize.tsx` now has a `view` state (`'home' | 'memorized'`; 3c-2/3 add `'pace'`, `'plans'`). `HifHeader`'s back and the Android back button step out to home. Opening it calls `plan.markMemorizedAsked()` as the web did.
- Surah list: search by number, Arabic or Latin name; a surah opens into «from ayah / to» with Add / Remove. Juz list: 30 rows, a strip of the 16 thumun, two hizb with a whole-hizb button. All rows draw at once (114 surahs, 30 juz), no virtualised list inside the ScrollView.
- Left out: the web's «Redraw keeping the scroll position» (the app doesn't scroll-jump on re-render).

## Notes and decisions (Stage 3c-2)
- `PlanSetup({ type, id, onExit })` is both flows: `id` null = the questions (type → «what have you memorized» the first time → scope → amount or finish date → days (only for date mode) → summary «Your plan is ready»); `id` set = the one-page edit (covers, pace, days, «new pace from», finish line, pause, delete, Save). It draws its own head and bottom button, and steps back through the questions (head back and Android back) before `onExit`.
- `memorize.tsx`: new `'pace'` view; `startPlan(type)` goes to `HifProvider onStartPlan`, so «Set up my plan» and «Start a revision plan» now open the setup (the `HOME.coming()` fallback is no longer reached). To edit a plan from 3c-3, set `setup = { type: null, id }` and `view = 'pace'`.
- The web's `<input type="date">` is replaced by `DateStepper` (±1 / 7 / 30 / 365 days, never before `min`): no date-picker package added. Closest to the web: finish date minimum is tomorrow, «new pace from» minimum is the plan's start.
- Amount is a text field (`amtText`) so «0.5» can be typed; ayah rounds to a whole number when chosen. In date mode the unit is picked for the reader (biggest of hizb / thumun / page giving at least 1 a day), as `syncDateUnit`; `calc()` computes it without changing the state.
- Delete asks with `Alert.alert` (the web used `confirm`). Pause / delete from the edit page return to where the edit was opened.
- The forecast (`finish`) is only computed when the amount is above 0 (the web computed it anyway; it came out null).
- Not covered here: the keyboard avoidance on Android relies on the system resize (`KeyboardAvoidingView` only pads on iOS).

## Notes and decisions (Stage 3c-3)
- `PlansList({ onEdit, onAdd })` is plansHTML: a card per plan (kind, range, pace, «Paused»), Modify / Pause-Resume / Delete (with `Alert` confirm), «+ Add plan» (opens the setup with no type, so it asks «What would you like to do?»). `PlansTile` is the door, last item under the daily cards (the web had it as a bottom tab).
- `memorize.tsx`: `'plans'` view; `open({ type, id })` remembers `from`, so saving, pausing or deleting in the setup/edit returns to My plans when it came from there, else to the plan screen. Android back steps out of Memorized and My plans.
- Left out on purpose: the history screen («Past days», `historyHTML`, the status sheet `openStatus`, extra-revision sessions). It was not in the 3c list; the `HIF` strings for it exist (`history`, `pastDays`, `noHistory`, `older`, `sessionRemoved`, `markNotDone`...) if you want it as a later piece. `PlanSummary` has no History tile either.

## Notes (Stage 4, first run)
- Lint: `Burst` in `Confetti.tsx` keeps its `Animated.Value` in `useState` (the `react-hooks/refs` rule rejects `useRef(...).current`). Left alone: the `no-unused-expressions` warning in `src/lib/hifdh/core.js:214` (copied from the web, not a Hifdh UI file).
- tsc: rows from the plan logic are typed `Row` (= any) in the cards; `TaskRow`'s Pressable ref is `any` (RN 0.88 does not export the instance type); the surah list takes its type from `SURAHS` (`name` may be a number).

## What remains
Stage 4: `npx expo lint`, `npx tsc --noEmit`, and fix what they report across 3a-3c (none of it has been type-checked: paste the errors). Optional later piece: the history screen.

## Verification
Scope correction: everything on the web Hifdh page is in scope (Plan screen, Listen, Test/Recite, history). Earlier notes that call Listen and Test "out of scope" are superseded by this section.

Checklist (tick each step, commit and push after each):
- [x] Step 0: this section added and pushed
- [ ] Step 1: npm install, tsc, lint clean
- [ ] Step 2: web inventory table written
- [ ] Step 3a: tab bar (Listen / My plans / Recite)
- [ ] Step 3b: Listen
- [ ] Step 3c: Test / Recite
- [ ] Step 3d: history screen
- [ ] Step 3e: importOldMarks (port or note why skipped)
- [ ] Step 4: final tsc and lint clean
