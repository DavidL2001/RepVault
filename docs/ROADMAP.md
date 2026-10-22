# Gym Tracker — Build Roadmap

Work through the branches **in order**. Each branch is created from an up-to-date `main`, and merged back into `main` only when every box is checked and its "Done when" is true.

Branch flow for every step:

1. `git checkout main && git pull`
2. `git checkout -b <branch-name>`
3. Do the tasks, committing in small steps
4. Run `npm run lint`, `npm run test` and `npm run build`, with no errors
5. Check the boxes in this file, merge into `main`, push (deploys to GitHub Pages)

The full feature spec lives in `docs/SPEC.md`.

---

## 1. `setup/project-scaffold`

- [x] Create Vite + React (JavaScript) project
- [x] Install `sass`, `react-router-dom`, `chart.js`, `react-chartjs-2`
- [x] Install dev tools: `eslint`, `@eslint/js`, `globals`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `prettier`, `eslint-config-prettier`, `vitest`
- [x] Set `base: '/RepVault/'` in `vite.config.js`
- [x] Set up `HashRouter` with placeholder pages for every route
- [x] Create folder structure: `pages/`, `components/`, `hooks/`, `state/`, `lib/`, `styles/`, `constants/`
- [x] `index.html`: `lang="en"`, viewport meta with `viewport-fit=cover`, page title
- [x] `.gitignore` (node_modules, dist)
- [x] npm scripts: `dev`, `build`, `preview`, `lint`, `format`, `test`

**Done when:** `npm run dev` shows placeholder pages and you can navigate between all routes.

## 2. `setup/deploy-pipeline`

- [x] Add `.github/workflows/deploy.yml` (build on push to `main`, deploy `dist` with `actions/upload-pages-artifact` + `actions/deploy-pages`)
- [x] In repo settings: Pages → Source → "GitHub Actions"
- [x] README: short "Deploy" section

**Done when:** the placeholder app is live on `https://davidl2001.github.io/RepVault/` and refreshing a deep link works.

## 3. `setup/design-system`

- [x] `styles/_variables.scss`: spacing scale, radii, font sizes, font weights, z-index scale, breakpoints, transition durations
- [x] `styles/_colors.scss`: raw color palette (the only place hex values exist)
- [x] `styles/_themes.scss`: semantic CSS custom properties (`--color-bg`, `--color-surface`, `--color-text`, `--color-primary`, `--color-danger`, `--color-success`, `--color-focus`, …) for dark and light themes via `[data-theme]`
- [x] `styles/_mixins.scss`: breakpoint mixins, `tap-target`, `focus-ring`, `visually-hidden`, `truncate`, `safe-area-padding`
- [x] `styles/global.scss`: reset, base typography (system fonts, min 16px inputs), visible focus styles, `prefers-reduced-motion` handling, `100dvh` app shell
- [x] Check text and UI color contrast meets WCAG AA in both themes

**Done when:** a test page shows text, buttons and inputs correctly in both themes, using only tokens.

## 4. `feature/ui-components`

- [x] `AppShell` (layout, safe areas, max-width column, skip link)
- [x] `PageHeader` (title as `<h1>`, optional back button)
- [x] `BottomNav` (with `aria-current` on the active item)
- [x] `Button` and `IconButton` (variants: primary, secondary, danger, ghost; icon buttons require an accessible label)
- [x] `TextField` and `NumberField` (always with a visible `<label>`, error message linked via `aria-describedby`)
- [x] `Stepper` (− / + with labels like "Decrease weight")
- [x] `Card` and `ListItem`
- [x] `Modal` and `ConfirmDialog` (focus trap, Escape closes, focus returns to the trigger)
- [x] `Banner` (info / success / warning variants, never color-only)
- [x] `StickyActionBar`
- [x] `EmptyState`
- [x] `useDocumentTitle` + focus the page `<h1>` on route change
- [x] Simple component preview page (dev only) to view them all

**Done when:** every component works by keyboard only and at 320px width.

## 5. `feature/state-storage`

- [x] `constants/`: storage key, schema version, default progression values, backup reminder days
- [x] Data model shapes (Exercise, Template, Workout session, Entry, Set) documented with JSDoc
- [x] Context + `useReducer` with named action types
- [x] `lib/storage.js`: load / save with try/catch, `schemaVersion`, migration hook, corrupted-data fallback
- [x] Call `navigator.storage.persist()` on first load
- [x] Persist on every state change; in-progress workout survives reload
- [x] `lib/ids.js`, `lib/dates.js` (Intl formatting, 24h, week helpers)

**Done when:** state changes survive a page reload.

## 6. `feature/calculations`

- [x] `lib/calculations.js`: set volume, session volume, Epley 1RM, best set, PR detection
- [x] `lib/progression.js`: evaluate rule (`all` / `any` sets at heaviest weight), "go heavier" / "stay" message (no suggested weight, the user picks it)
- [x] `lib/history.js`: last session for an exercise, sessions per exercise, workouts this week
- [x] Unit tests with Vitest for all of the above

**Done when:** `npm run test` passes.

## 7. `feature/exercises`

- [x] Create exercise form (name + optional collapsible progression rule)
- [x] Case-insensitive duplicate name check with an accessible error message
- [x] Exercises page: alphabetical list, search, latest best set, ⬆ marker (with text alternative)
- [x] Empty state when no exercises exist (no preset exercises anywhere)

**Done when:** I can create, search and list my own exercises.

## 8. `feature/start-workout`

- [x] Start Workout page: template cards, "Empty workout", "+ New template"
- [x] Rename / delete templates
- [x] Starting a session records date + start time and navigates to Active Workout

**Done when:** I can create "Leg day" and start a session from it.

## 9. `feature/active-workout`

- [x] Header with name, date, running timer (timer not announced every second to screen readers)
- [x] Exercise list with set summary and ⬆ indicator
- [x] Add-exercise picker (search + create new)
- [x] Reorder (up/down buttons) and remove
- [x] Sticky "End workout" with confirm
- [x] Prompt to update template if exercises changed
- [x] Bottom nav hidden; resume after reload

**Done when:** a full session can be started, edited and ended.

## 10. `feature/set-logger`

- [x] kg / reps fields with steppers, `inputMode` set correctly
- [x] Pre-fill from progression suggestion or last session
- [x] "Last time" line
- [x] Progression banner ("Go heavier" / "Stay at")
- [x] Sticky "Log set"; logged set announced via `aria-live`
- [x] Edit / delete sets
- [x] PR badge (icon + text, not color only)

**Done when:** logging sets works smoothly one-handed on a phone.

## 11. `feature/workout-summary`

- [x] Duration, exercises, sets, total volume
- [x] New PRs
- [x] "Next time" step-ups
- [x] "Done" returns to Home

## 12. `feature/progress-charts`

- [x] Reusable `ProgressChart` component (responsive, ~220px tall on phones, theme-aware colors from tokens)
- [x] Metric toggle: heaviest weight / estimated 1RM / volume (accessible toggle group)
- [x] Text alternative for the chart (summary sentence + optional data table)
- [x] Exercise Detail page: chart, PR stats, progression rule edit, session history, rename / delete
- [x] Small chart in the Set Logger

**Done when:** progress is visible and also understandable without seeing the chart.

## 13. `feature/history`

- [x] History page grouped by month with date markers
- [x] Training heatmap / calendar strip (fits 320px, has accessible labels)
- [x] Workout Details page: view, edit sets, delete workout

## 14. `feature/home`

- [x] "Start workout" / "Resume workout"
- [x] Workouts this week
- [x] Recent workouts (last 5)
- [x] Backup reminder after 14 days (dismissible)

## 15. `feature/settings-backup`

- [x] Theme toggle (saved)
- [x] Export JSON + "Last backup: X days ago"
- [x] Import with validation + confirm
- [x] Delete all data (double confirm)
- [x] Note about data living in this browser only

## 16. `feature/pwa`

- [x] `vite-plugin-pwa` with auto-update, correct base path
- [x] Manifest: name, icons, theme color, standalone
- [ ] Verify "Add to Home Screen" on iPhone and Android

## 17. `chore/a11y-responsive-audit`

- [x] Keyboard-only walkthrough of every page
- [ ] Screen reader check (VoiceOver on iPhone)
- [x] Contrast check in both themes
- [x] Lighthouse accessibility score 95+ on every page
- [x] Every page at 320 / 375 / 390 / 430px, portrait + landscape: no horizontal scroll, no overlap
- [x] Remove dead code, unused styles and any hardcoded values that slipped in

## 18. `release/v1.0`

- [ ] Run the full test scenario from `docs/SPEC.md` on `npm run preview`
- [ ] Run it again on the live GitHub Pages URL on a phone
- [ ] Final README
- [ ] Tag `v1.0.0`
