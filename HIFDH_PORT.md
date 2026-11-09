# Hifdh page port: handoff (web → Expo app)

Branch: `hifdh-port-from-web` (this repo). Source: private repo `gitNoura/Majlis-al-Bararah`, branch `hifdh-port`.
Scope: the whole Hifdh page («الحفظ»): the Plan screen, Listen, Recite/Test and history (see Verification at the bottom; this line used to call Listen and Test out of scope).

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

## What remains (superseded by Verification below)
Stage 4: `npx expo lint`, `npx tsc --noEmit`, and fix what they report across 3a-3c (none of it has been type-checked: paste the errors). Optional later piece: the history screen.

## Verification
Scope correction: everything on the web Hifdh page is in scope (Plan screen, Listen, Test/Recite, history). Earlier notes that call Listen and Test "out of scope" are superseded by this section.

Checklist (tick each step, commit and push after each):
- [x] Step 0: this section added and pushed
- [x] Step 1: npm install, tsc, lint clean (no errors, no changes needed)
- [x] Step 2: web inventory table written
- [x] Step 3a: tab bar (Listen / My plans / Recite) → `components/hifdh/HifTabs.tsx`, shown under the Plan screen; replaces the «My plans» tile. Recite shows «coming soon» exactly as the web does (no web Test code exists). Listen tab calls `useHif().listen(null)` (stub until 3b).
- [x] Step 3b: Listen → `components/hifdh/ListenScreen.tsx` (a `'listen'` view in `memorize.tsx`), engine `src/lib/hifdh/listen.js`, `log.js`, `reciters.js`; see notes below
- [x] Step 3c: Test / Recite: nothing to port. The web has no Test code (`hifz.js`: `act === 'test'` only toasts «coming soon»; no recite/test file exists in `src/`), so the Recite tab (3a) shows the same toast via `HOME.coming()` and `src/app/test.tsx` stays `Coming`. Revisit when the web builds it.
- [x] Step 3d: history → `components/hifdh/HistoryScreen.tsx` (`HistoryTile` under the cards, `'history'` view in `memorize.tsx`, status sheet, extra-revision removal, «Older»)
- [x] Step 3e: `importOldMarks()` skipped on purpose: it migrates the web's old Hifdh map marks (`marksIn()` from `src/hifdh/marks.js`, once, flag `hifz2ImportedMarks`) into the ledger. The app has no old map and never stored those marks (no `hifdhMarks` / `marks.js` equivalent in `src/`; `src/lib/marks.ts` is highlights and notes), so there is nothing to import. If the app ever gets the old map, port it then.
- [x] Step 5 (follow-up): Listen looks like the web: the app's mushaf (`PageCurl`) behind it, top bar, ayah taps choose the range, lit ayah, page follows playback, player pill, settings sheet (see notes below)
- [x] Step 6 (fixes from the phone): (a) screens did not redraw after a mark until leaving the page; (b) Listen's player pill and settings sheet layout
- [x] Step 7a: Listen settings sheet: the page's top bar (surah name, index button) still showed through it
- [x] Step 7b: first-time clarity (the Welcome screen it first added was REMOVED in Step 8; only the card subtitles stay)
- [x] Step 8: undo Step 7b's Welcome screen (not wanted) and redesign the SAME Plan page: clearer and more modern (tinted cards with icons, clearer week card and ring, clearer Complete buttons, a one-line intro when there is no plan)
- [x] Step 9: the Plan page's bottom tabs (Listen / My plans / Recite) become a full-width bar like the Quran reading page's; the floating dock is removed
- [x] Step 10a: new icons for Revision (repeat) and History (calendar)
- [x] Step 10b: finishing today shows a congratulation card instead of tomorrow's task (the «Ahead» card is removed)
- [x] Step 10c: «What I've memorized»: a second tap unselects (whole Quran, surahs, juz, ahzab...); tracking by ahzab instead of ayat; Arabic search text runs right to left
- [x] Step 11a: finishing a portion changes the same card (no extra congratulation box, no extra pop-up box)
- [x] Step 11b: the Arabic wording of the Hifdh pages rewritten to read as Arabic, not as a translation
- [x] Step 11c: the Hifdh pages take the Home page's look (star background, large serif heading, warm tiles and shadows, glass bottom bar)
- [x] Step 12a: no green surfaces (week card, Today card tint) and one font: the sans for all card text, the serif only for the page's big heading
- [x] Step 12b: the memorized ring is removed from the top; a ring tracking PLAN progress sits on the History tile; «what I've memorized» stays reachable (My plans, Revision card)
- [x] Step 12c: pressing Complete turns the same card into a done state (gold, check, congratulation, undo; no Complete / play buttons); the heading goes back to «Today's plan»
- [x] Step 4: final `npx tsc --noEmit` and `npx expo lint`: no errors, no warnings
- [x] Step 13: units and pace. Chips Ayah, Page, Thumun, Hizb, Juz (ayah default); hizb and juz are real units (no conversion to thumun, `wholeVersion` and the load-time rewrite in `plan.js` removed); a version may carry `divide` (a smaller unit): `amount` is then per WEEK and each real week's block is cut into the planned days at that unit's edges (`firstShare` in `core.js`, extra to the first days); cards show the exact page span (`startsAt`); «finish by a date» takes the reader's unit and offers the next smaller one when a whole unit a day is too much; engine checks in `scripts/test-hifdh-plan.mjs`. Page check: the plan's page table equals the Warsh reader's for all 6,214 ayat; with Hafs, 1 ayah differs (5:11, plan p.109, Hafs p.108).

### Web inventory (source `Majlis-al-Bararah`, branch `hifdh-port`)
Web files: `src/hifz/{hifz.js (1072 lines), hifz-core.js, hifz-plan.js, confetti.js}`, `src/hifdh/{index.js, listen.js (784), log.js, marks.js, reciters.js}`, `#hifz` and `#listen` sections of `index.html`. There is no separate Test/Recite file: in `hifz.js` the Recite tab does `if (act === 'test') return toast(t('comingSoon'))`.

| Feature (web) | Status | Where in the app |
|---|---|---|
| Plan screen: week card, memorized ring, today's heading | done | `src/app/memorize.tsx`, `components/hifdh/{PlanSummary,WeekCard,MemorizedRing}.tsx` |
| Today / Ahead / Revision cards, Complete, stop sheet, confetti | done | `components/hifdh/{TodayCard,AheadCard,RevisionCard,TaskRow,StopSheet,Confetti,Toast}.tsx` |
| Memorized picker and «What I've memorized» | done | `MemorizedPicker.tsx`, `MemorizedScreen.tsx` |
| Plan setup / edit, pause, delete | done | `PlanSetup.tsx`, `DateStepper.tsx` |
| My plans (list, modify, pause, delete, add) | done | `PlansList.tsx` (reached by a tile under the cards) |
| Tab bar Listen / My plans / Recite (`tabsHTML`, bottom dock on the Plan screen) | done (3a) | `components/hifdh/HifTabs.tsx` in `memorize.tsx` |
| Listen (`listen.js`: pick ayat, repeat, rounds, methods each/prev/all, reciters, player, session log) | done (3b) | `ListenScreen.tsx`, `src/lib/hifdh/{listen,log,reciters}.js` |
| Listen button on a task row (`listen(row)`) | done (3b) | `HifProvider.listen` → `memorize.tsx` `openListen` |
| Session log (`log.js`, key `hifdhLog`) | done (3b) | `src/lib/hifdh/log.js` |
| Test / Recite | web is itself a «coming soon» toast; nothing to port | kept as the same toast on the Recite tab; `src/app/test.tsx` stays `Coming` |
| History screen («Past days», `historyHTML`, older days) | done (3d) | `HistoryScreen.tsx`, tile in `memorize.tsx` |
| History status sheet (`openStatus`: done / stopped at an ayah / not done / clear) | done (3d) | `StatusSheet` in `HistoryScreen.tsx` (partial opens `StopSheet`) |
| Extra-revision sessions in history (tap removes, «Session removed») | done (3d) | `HistoryScreen.tsx` |
| Strings for history, tabs, listen | tabs and history keys exist in `src/i18n/hifdh.js`; Listen strings missing | add to `hifdh.js` as needed |
| `importOldMarks()` | skipped (3e): no old marks exist in the app | none |

### Notes (Step 3b: Listen)
- New package: `expo-audio ~58.0.11` (the SDK 58 version from `node_modules/expo/bundledNativeModules.json`). `npx expo install` and docs.expo.dev were unreachable from the sandbox, so it was added with `npm install expo-audio@~58.0.11` and the API was read from the package's own typings. The app's Quran screens use no audio, so nothing existed to reuse. Needs a development build (native module), not Expo Go.
- Engine `Listener` (`src/lib/hifdh/listen.js`) is the website's logic: steps (`each` / `prev` / `all`), repeat, rounds, loop, speed, the two players taking turns so the next ayah is preloaded, one quiet `listen` record in the log (`hifdhLog`) with `addRecord`. Prefs are kept under the same key, `listenPrefs`. The players are made by `start()` and let go by `release()` (the screen's effect), so a screen unmount stops the sound.
- (Superseded by Step 5 below) Differences from the web, closest-possible: there is no mushaf behind Listen (the web taps ayat on the page). The ayat are chosen with the web's settings-sheet controls (From / To: surah list + ayah − / +), «Whole page» (uses `ayatOn(pageOf(...))` from `lib/boxes`) and «Whole surah». The web's `ls-jump` fahras (jump to a surah/page in the book) is dropped, as there is no book. The «locked» rule (taps ignored while a choice exists) is not needed with a form.
- Opening from a portion presets the choice to that portion's first ayah (the web only scrolled the book to it and chose nothing). The Listen tab opens at today's first memorize portion, as the web.
- Warsh has no reciter (`reciters.js`): both the tab and the row button say `HIF.lsWarshSoon()` and do not open the screen, as the web does.
- The log does not show up anywhere yet; step 3d (history) is where the web showed it only via «last worked», which the app has no map for. Background playback with the screen off is not configured (needs `UIBackgroundModes`/a foreground service); playback uses `playsInSilentMode`.

### Notes (Step 3d: history)
- `HistoryTile` («History / Past days», the web's `progressHTML`) sits under the Revision card; it opens the `'history'` view (back and Android back return to the plan). `HistoryScreen` is `historyHTML`: a card per day, a button per portion (kind, name, status), extra-revision sessions («Extra revision», tap removes them and shows «Session removed.»), 40 days at a time then «Older».
- `StatusSheet` is `openStatus`: Done / Stopped at an ayah… / Mark as not done (+ hint) / Clear the mark; weekly rows only get Done and Clear, as on the web. «Stopped at an ayah…» closes the sheet and opens the existing `StopSheet` through `HifProvider.openStop`, which marks it. No new strings were needed (the history keys were already in `hifdh.js`).
- Logged Listen sessions (`hifdhLog`) are not listed in History: the web does not list them there either (they only count toward the map's «last worked», which the app has no map for).

### Still missing / to check on a device
- Nothing from the checklist is unfinished. Open items, none blocking:
  - Recite/Test: the web has no page either; build both when the web does.
  - Listen: no mushaf behind it (range form instead); no background playback with the screen off; Warsh has no reciter yet (same as web). Needs a development build (`expo-audio` is a native module). The audio and the screens were type-checked and linted but not run on a device or emulator from this sandbox.
  - The lint warning in `src/lib/hifdh/core.js:214` mentioned in Stage 4 no longer shows.

### Notes (Step 5: Listen on the mushaf)
- `ListenScreen.tsx` was rebuilt to match the web's Listen page. It uses the Quran screen's own pieces: `PageCurl` (page turns, pinch zoom), `QuranIndex` (the surah / hizb / juz panel, opened by the menu button or a tap on the surah name), `Glass` / `GlassBackdrop`, `ScreenBackground`, and `QuranTheme` (the Quran's own day / night). Nothing in the Quran screen was changed.
- Top bar: back and the index at the line's start, the surah and «Page N» in the middle. Player pill (glass, 64 px): summary (what is chosen / heard; a tap opens settings), clear ✕, repeat-all, settings gear, previous, play / pause, next; previous / next show only while a session exists, as on the web.
- Choosing: tap an ayah to choose it, tap another to take everything between; then taps say «The ayat are set…» (`lsLocked`) until ✕ clears the choice, as on the web. The settings sheet has From / To, whole page / surah, repeat, rounds, speed, reciter, method and «Play audio».
- Tints use `PageCurl`'s `marks` (the web's CSS colours): chosen green 0.2, the other ayat of the step heard green 0.14, the one heard now gold 0.42. The page turns by itself to the page of the ayah being heard.
- Reading place: Listen starts on the page of the portion's first ayah (or the saved page) and does not write `lastPage`, so leaving leaves the reader where it was.
- Closest-to-web choices: no ayah context menu or notes here (the web hides them too); the web's `ls-jump` panel is the app's existing `QuranIndex`; two-page spreads do not exist in the app, so «whole page» is the one page shown.
- tsc and lint are clean; not run on a device from this sandbox.

### Notes (Step 6a: screens not redrawing)
- Cause: the app has `reactCompiler: true` (app.json). The cards read the plan from a module (`plan.todayRows()`, `plan.get()`...) with no props or state, so the compiler cached their output and `rev` (bumped by `refresh()`) never made them redraw; leaving and re-entering mounted them fresh. Fix: `'use no memo'` at the top of every Hifdh component that reads that state (the cards, `TaskRow`, `WeekCard`, `MemorizedRing`, `PlanSummary`, `PlansList`, `PlanSetup`, `MemorizedScreen`, `MemorizedPicker`, `HistoryScreen`, `ListenScreen`) and of `src/app/memorize.tsx`. Rule for new Hifdh components: if it reads `plan.*` or the Listen engine, add the directive.

### Notes (Step 6b: Listen layout)
- `Glass` centres its children in a column, so the pill's buttons stacked up; the controls now sit in their own row (`pillRow`) inside it.
- The settings sheet is at most as tall as the room under the status bar and the page behind it is dimmed (40 %), so the surah name no longer shows through its top edge.
- «Play audio» now works from the From / To the sheet shows even if no ayah was tapped first (it was disabled, which looked broken), and the number boxes use the app's font.
- The blue round gear at the top-left of the screenshots is Expo Go's own developer-tools button, not part of the app.

### Notes (Step 7a: sheet peek-through)
- The top bar and the surah name of Listen have `zIndex: 5`, which put them over the settings overlay (a later sibling with no zIndex). The overlay now has `zIndex: 30` / `elevation: 30`, so the sheet and its dimmed backdrop cover the whole page.

### Notes (Step 7b: first-time clarity) - Welcome screen removed in Step 8, see below
- New `components/hifdh/Welcome.tsx`, shown on the Plan screen instead of the week card / ring / cards while there is no plan (`plan.get().plans` is empty; it disappears by itself once a plan exists, and comes back if the last plan is deleted). It has: a green hero («Memorize the Quran, a little each day» + one sentence + «Set up my plan»), «How it works» in three numbered steps (mark what you know → choose your pace → follow your daily plan; numbered because it is a real sequence), and «Also here»: Listen and «What I've memorized», which need no plan.
- «Set up my plan» opens the setup with no type, so the first question is «What would you like to do?» (memorize or revise), as «+ Add plan» does. The web has no such screen; this is an addition, not a port.
- `Section` takes an optional `subtitle`; the Today card says «What to memorize today» and the Revision card «What to revise so it stays with you». The bottom tabs, History tile and every other card are unchanged. All new strings are in `src/i18n/hifdh.js` in the L(ar, en, fr) style.
- Not run on a device from this sandbox (tsc and lint are clean).

### Notes (Step 8: the same Plan page, clearer and more modern)
- Removed `Welcome.tsx` and its strings; `memorize.tsx` shows the Plan page as before (summary, Today, Ahead, Revision, History tile, bottom tabs) for everyone. No new page or screen was added.
- Look: «Your week» is now the page's one bold element, a forest-green card (gold ticks for days done, a white ring for today, white text); the other cards have larger corners (24) and a soft shadow. `Section` takes `icon` and `tone`: Today and Ahead are tinted green (as the web's green band), Revision gold (the web's yellow band), each with a round icon (book / play / clock) and its one-line subtitle («What to memorize today», «What to revise so it stays with you»). The memorized ring is bigger (72). The History tile has a clock icon.
- Clearer: the listen button on a portion is a play icon on a soft round (it was a book icon); under the portions of today a quiet line says «Press and hold to choose where you stopped» while something is still to do (the hold gesture was hidden before); with no plan yet a one-line intro sits above the week card (`planIntro`: «Set a plan and this page shows each day what to memorize and what to revise.»).
- Behaviour and data are unchanged; only styles, icons and two small hints. Not run on a device from this sandbox (tsc and lint are clean).

### Notes (Step 9: the bottom bar)
- `HifTabs` is now the Quran reading page's bar (`BAR_H` 62 + the bottom inset, `c.panel`, a hairline `c.line` above, icon over name in `c.tabInk`, a press dims it) instead of the floating rounded dock; it follows the language's direction like the Quran bar (the web's dock was always left to right). The plan page's scroll leaves room for it (`TABS_HEIGHT` = 62).
- Left as it was: Listen's own player pill (it is the web's Listen bar, not these tabs).

### Notes (Step 10: icons, congratulation, memorized picker)
- 10a: `RepeatIcon` and `CalendarIcon` added to `src/components/icons.tsx` (same `Line` style as the others). The Revision card uses the repeat icon, the History tile the calendar; `ClockIcon` stays for settings.
- 10b: `AheadCard.tsx` is removed and `CongratsCard.tsx` takes its place under the Today card. It shows only when today has portions and every one is done (`isDone`); it says «MashaAllah, today is done» with the existing `allDone` line and a short blessing, and never lists tomorrow's portions. New strings `congratsTitle` / `congratsBody` (ar/en/fr); `aheadTitle`, `aheadHint`, `startTomorrow` were removed. Left as they were (now unused, harmless): `aheadRows()` in `labels.js`, the `ahead` prop and the `aheadDone` toast in `TaskRow`.
- 10c: in `MemorizedPicker`, the «Whole Quran» button is now a toggle (a second tap while everything is in takes everything out); surahs, juz, hizb and thumun already toggled. Progress is told in ahzab: the summary reads «N/60 hizb» (a part-known hizb counts by its share, one decimal) and each juz row reads «n/2» ahzab instead of «n/16» thumun; surah rows stay in ayat since a surah is cut by ayat. The surah search field runs right to left for typed Arabic, and when it is empty in the Arabic interface.
- Not run: `npx tsc --noEmit` and `npx expo lint` (no `node_modules` in this sandbox and package installs are off). Only a syntax-level check of the changed files was done. Run both before the next step.

### Notes (Step 11a: the same card on complete)
- Replaced the separate congratulation card (`CongratsCard`, deleted) and the «MashaAllah…» pop-up message: when every portion of today is done, the page's own «Today's plan» heading turns into «ما شاء الله، أتممتَ وِردك» with its line under it (`PlanSummary`). The confetti stays; the Complete button still turns into «Done ✓» in its own row. Nothing new is added to the page and no message pops up.

### Notes (Step 11b: Arabic wording)
- Reworded in `src/i18n/hifdh.js` only the Arabic lines that read as translated (English and French untouched, keys unchanged): «تم الحفظ» / «تم حفظ خطتك» became «سُجّل…» / «سُجّلت خطتك» (on this page «حفظ» means memorizing, so «saved» was confusing), «حفظ التعديلات» became «تأكيد التعديلات», «مسح التسجيل» «إزالة العلامة», and the stiff or word-for-word lines (no plan yet, nothing today, hold hint, not done / stopped toasts, delete confirmation, no history, finish date / amount, days, nothing to revise, listen locked) were rewritten as natural Arabic. The rest was already natural and was left as it was.
- Not changed on purpose: `nothingToReviseSub` («كل ما اخترتَه محفوظ لديك بالفعل…»). Its meaning looks inverted in all three languages (an empty revision means nothing picked is memorized yet); it came from the web and should be checked there before it is changed here.

### Notes (Step 11c: the Home look)
- The palette was already the home page's; what differed was the surfaces. New `HifTheme` (in `src/theme/theme.tsx`, next to `QuranTheme`) wraps the whole Hifdh page and swaps three colours for the home page's: `card` (#f5efe5 tile, a soft white tint at night, instead of white), `meta` (#8f7f5d, the warmer brown) and `soft` (a green tint for round icons and tracks). Every Hifdh card, row and button picks them up without edits; Listen keeps the Quran palette (`QuranTheme` inside it).
- `HifHeader` is the home page's manner: back, then the name in large serif type at the start of the line (34 on the plan page, with the date under it as Home does under its greeting; 28 on the inner screens), instead of a small centred title.
- Shadows are the home page's warm brown (`0px 10px 26px rgba(68, 55, 43, 0.10)`); «Your week» is a green gradient hero (like Home's big sky card). The star background was already behind the page.
- The bottom bar stays the Quran reading page's (as asked in Step 9); the home page's own bar is a glass panel with rounded top corners, which can replace it if wanted.

### Notes (Step 12a: no green, one font)
- Surfaces are the home page's beige tile everywhere; the green gradient on «Your week» and the green tint of the Today card are gone («Your week» is a plain tile, the days kept are gold). Round icon chips are a soft gold; `HifTheme.soft` is a brown tint (was green). The only tinted card is a finished one (`Section tone="done"`, gold, step 12c). The dark green stays only where Home uses it: text and the main buttons.
- One font: every `serif` on the Hifdh pages was removed (cards, headings, sheets, setup, Listen's sheet); the page heading is the sans at weight 800.

### Notes (Step 12c: a finished card)
- Pressing Complete on the last portion of a card turns that same card into `DoneCard` (`components/hifdh/DoneCard.tsx`): tinted gold, its icon a gold check, «ما شاء الله، أتممتَ وِردك» (revision: «…أتممتَ مراجعتك») with the portion's name under it, a line («بارك الله فيك…», or «وقفتَ في منتصفه…» when you stopped partway) and a small «Undo» that puts the portions back. The Complete and Listen buttons are gone while it is done; the confetti stays. The memorization and revision cards each finish on their own. A weekly plan has no Undo there (its week adds up).
- The page heading is «Today's plan» again (Step 11a's in-place heading change is undone); `CongratsCard` stays deleted.


### Step 12b notes
- The memorized ring is gone from the top. A gold ring with a percentage now sits on the History tile (`ProgressRing`, `plan.planProgress()`): weekly plan = this week's units done / quota; memorizing plan = days done / all its days; revision plan = the current round; averaged over plans running today (shows – with no plan).
- «What I've memorized» stays reachable: first tile of My plans, and the button of the Revision card while nothing is memorized (`openMemorized` in HifProvider).
- Not run on a device.

- [x] Step 13: the Plan page is more colourful (soft tinted cards with their own hue, coloured titles/icon chips, in the spirit of the user's reference but with the app's own palette)

### Notes (Step 13: colour, look of the page; fourth pass)
- The page uses the settings page's card (hairline border, 20 px corners, serif title) and the app's palette; `HifTheme` only turns `goldStrong` forest green. Colour is a small system in `Section.tsx`: four muted hues of one softness (`Accent`: green = Hifdh, blue = Murajaa, violet = the week, rose = Progress), each with a `base` (wash, fills) and a deep `ink` (titles, icons); `useTints(accent)` gives a card its wash (10 %), border (30 %) and icon-chip (18 %) so every card is built alike, and a card uses only its own hue (the ring and the History card are rose, the week's kept days violet). The page behind them stays neutral; buttons stay forest green.
- Removed: the date after the page title (`HifHeader` has `big` for the plan page's large title), the intro sentence for a new user (`planIntro` string left unused), and the visible «hold to say where you stopped» hint under the Hifdh card (`holdHint` is still the Complete button's accessibility hint; the long press itself is unchanged).
- «Today's plan» and its date are the same size, bold, in the quiet `c.meta` colour; the «Progress» heading and its link use the same look.
- Cards: titles «الحفظ» / «المراجعة», no line under them, clear no-plan states; finished card keeps the title with the congratulation under it. «Progress» = ring card + History card side by side.
- Not run: `npx tsc --noEmit` / `npx expo lint` (no `node_modules`, installs off); syntax-only check done.

### Notes (Step 13: fifth pass, final look)
- Cards are the settings page's: white `c.card`, hairline border, 20 px corners, serif title, no wash and no hued borders or titles. Colour is only a small accent in the card's hue (`Accent` / `useTints` in `Section.tsx`): the icon chip (green = Hifdh, blue = Murajaa), the Progress ring (rose) and the kept days of the week (violet).
- A card's head holds only its icon and its title («الحفظ» / «المراجعة»); `Section` has no subtitle any more.
- Finished card (`DoneCard`), organised below the title: the portions done (bold), a hairline rule, the congratulation (bold) with the blessing under it, and «Undo» at the end. A faint hue wash and a solid chip with a white check mark it as done.
- Not run: `npx tsc --noEmit` / `npx expo lint` (no `node_modules`, installs off); syntax-only check done.

### Notes (Step 13: sixth pass, light and neutral with one green)
- Look: modern, light, one colour. `HifTheme` gives a near-white screen (`#fbfcfa`), white cards with a hairline border, grey-green second lines (`meta` `#6b7a70`) and no gold or beige anywhere on the page (`gold` / `goldStrong` map to greens, so Undo, picker borders and links are green). Dark mode has its own sage-on-charcoal values.
- One font: every title on the page uses the UI font (no `serif`). The accent system is a single forest green (`useGreen` in `Section.tsx`: chip, border and wash tints); the blue, violet and rose hues are gone, so Hifdh and Murajaa cards are identical (green icon chip; the finished card gets a faint green wash and a solid chip with a white check).
- The week card keeps the earlier green version: a sage card (`#eff3ee`), kept days in forest green, the other days a grey-green tint.
- Progress: ring card (green ring) and History card, both neutral.
- Not run: `npx tsc --noEmit` / `npx expo lint` (no `node_modules`, installs off); syntax-only check done.

### Notes (Step 13: seventh pass, finished card and icons)
- Finished card (`DoneCard`): the head keeps the card's own icon and title (the icon no longer turns into a check); the middle rule is gone. Below: the congratulation (bold) with the blessing under it, then a row with a «Memorized» / «Revised» check pill (with the portions) at the start and «Undo» at the end. A done card is washed soft green (10 %) with a green border.
- Icons: the Hifdh card keeps the original `BookOpenIcon` (the bookmark book `HifdhIcon` was tried and dropped); `PlansIcon` (a checklist) for «My plans» in the bottom bar, in `icons.tsx`.
- Not run: `npx tsc --noEmit` / `npx expo lint` (no `node_modules`, installs off); syntax-only check done.

- [x] Step 14: questionnaire redesign (smaller type and spacing; amount as a − / + card, typed or stepped in halves; weekdays as seven pills with a Select all chip; split page «about N pages a day» with ≈ values, divide-by chips, no «keep whole» for thumun / hizb / juz, which are always divided; ayah and page follow their own unit). Cards show the hizb on one line and the thumun under it (`portionLines`); halves work in the engine (`evenSplit`, fractional `firstGroups`).
- [x] Step 15: only hizb and juz are divided (by page, thumun or ayah); thumun, like ayah and page, is counted in its own unit and never cut into pages or ayat.
- [x] Step 16: the edit-plan page is a stack of titled boxes (What it covers, Pace with a «By amount / By finish date» switch, Days as a four-per-row grid with the per-day split inside the same box, the finish date, New pace from), then Pause and Delete, with Save at the bottom. On the Today cards (and every `Section`) the title now sits above the box and the box is outlined thinly in green (`h.leaf`); a finished card keeps its mint wash with the same outline.
- [x] Step 16b: the manual «What I've memorized» entry is gone (the question in the plan setup, the screen, its tile in My plans, `openMemorized`, `plan.setLedger`, `memorizedAsked`, `nothingMemorized`, the picker's `quick` block). Revision and memorization plans choose their range with the surah / juz picker. The ledger itself stays: finished sessions still add to it, and the progress ring, the Home card and «everything I've memorized» for a revision plan read it. Old saved `memAsked` / `memNone` settings are simply ignored. Supersedes the 12b note that it «stays reachable».
