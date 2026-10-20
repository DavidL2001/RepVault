# Gym Tracker — Feature Spec

Build a simple, mobile-first gym tracking web app for my personal use, using React and SCSS. It will be hosted on GitHub Pages as a static site with no backend. All data is saved in localStorage. A friend may also use the same link; each person's data stays in their own browser.

## 1. Tech stack & constraints

- Vite + React (JavaScript, function components and hooks).
- Styling: SCSS using the `sass` package. Use SCSS modules (`Component.module.scss`) per component, plus global partials:
  - `styles/_variables.scss` (spacing, radii, font sizes, …)
  - `styles/_colors.scss` (raw color palette)
  - `styles/_mixins.scss` (breakpoint mixins, e.g. `@include from(tablet)`, tap-target mixin)
  - `styles/_themes.scss` (dark and light themes via CSS custom properties, switched with a `data-theme` attribute on `<html>`)
  - `styles/global.scss` (reset, base typography, safe areas)
- Routing: `react-router-dom` with `HashRouter` (required so page refreshes work on GitHub Pages without 404s).
- Charts: `chart.js` + `react-chartjs-2`.
- Runtime dependencies are limited to: `react`, `react-dom`, `react-router-dom`, `chart.js`, `react-chartjs-2` (and `vite-plugin-pwa` only if used, see Extras). No UI component libraries, no state libraries.
- Build and dev tooling: `vite`, `@vitejs/plugin-react`, `sass`, ESLint (`eslint`, `@eslint/js`, `globals`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `eslint-config-prettier`), `prettier` and `vitest`.
- State: one React Context + `useReducer` for the whole app, persisted to localStorage through a custom hook (`usePersistentState` or similar). Keep the business logic (PR calculation, progression checks, 1RM, volume) in plain functions in `src/lib/` so it is separate from the UI.
- Structure:
  ```
  src/
    main.jsx, App.jsx
    pages/       one folder per page with its .jsx and .module.scss
    components/  Button, Stepper, BottomNav, ProgressChart, Modal, Banner, ...
    hooks/       reusable custom hooks
    state/       context, reducer, storage
    lib/         calculations, dates, export/import
    constants/   storage key, schema version, defaults, route paths
    styles/
  ```
- `vite.config.js`: set `base: '/RepVault/'` so assets load correctly on GitHub Pages.
- Clean, minimal design. Dark theme by default with a light theme toggle.
- Keep the code readable and commented. Don't over-engineer: no accounts, no sync, no extra settings beyond what's described here.

## 2. Responsive design (very important)

I will use this almost only on my phone in the gym, often one-handed and with sweaty hands. Phone screens are the primary target; desktop just needs to look fine.

- Design mobile-first for widths 320px–430px, then scale up with SCSS breakpoint mixins. On tablet/desktop, center the content in a column of max ~600px.
- Viewport meta in `index.html`: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- No horizontal scrolling on any page at 320px width. Long exercise names must wrap or truncate with an ellipsis, never overflow.
- Tap targets at least 48px tall, with spacing between them so I don't hit the wrong one.
- Put primary actions (Log set, End workout, Start workout) within thumb reach: use a sticky bottom action bar on the Active Workout and Set Logger pages.
- Respect safe areas on notched phones (`env(safe-area-inset-*)`) so nothing hides under the notch or home indicator.
- Use a bottom navigation bar (Home, History, Exercises, Settings) on phones, hidden while a workout is active so it can't be tapped by accident.
- Inputs: font-size at least 16px (prevents iOS auto-zoom). Use `inputMode="decimal"` for kg and `inputMode="numeric"` for reps. Add big − / + stepper buttons next to the kg and reps inputs so I can adjust without typing.
- Charts must resize with the screen (`responsive: true`, `maintainAspectRatio: false` inside a container with a set height of ~220px on phones) and stay readable on a 320px screen.
- Use system fonts, fluid spacing (rem / clamp), and avoid fixed pixel widths.
- Use `100dvh` instead of `100vh` so mobile browser toolbars don't break layouts.
- Test every page at 320px, 375px, 390px and 430px widths, in both portrait and landscape, and fix any layout issues.

## 3. Data model & storage

**Important:** do NOT include any pre-made exercise lists or suggestions. Every exercise and template is created by me.

- **Exercise:** something I create myself, e.g. "Lat pulldown".
  `{ id, name, createdAt, progression }`
  `progression` is either `null` or `{ targetReps, mode: "all" | "any" }` (see Progression rules).
  Exercises are reusable across workouts; all progress is tracked per exercise.
- **Workout template:** a named routine I create once, e.g. "Leg day". It remembers which exercises it contains and in what order.
  `{ id, name, exerciseIds[] }`
- **Workout session:** one actual gym visit.
  `{ id, templateId (optional), name, startedAt, endedAt, entries[] }`
  Each entry: `{ exerciseId, sets[] }`. Each set: `{ reps, kg, timestamp }`.

Storage:

- Store everything under one localStorage key (e.g. `"gymtracker:v1"`) as JSON with a `schemaVersion` field so the format can be migrated later.
- Save on every state change. Wrap all localStorage access in try/catch, and handle corrupted data gracefully by offering to export the raw data before resetting.
- On first load, call `navigator.storage.persist()` to ask the browser not to evict the data.
- Track the date of the last export.
- If a workout is in progress and I reload or close the page, it must resume exactly where I left off.

Format dates with the browser locale (`Intl.DateTimeFormat`) and use 24h time. Units are kg only.

## 4. Progression rules (per exercise)

- When creating an exercise (and later from its detail page), I can optionally set a progression rule:
  - Target reps, e.g. 8 ("if I hit 8+ reps...").
  - Applies to: "all sets" (default) or "any set" at the heaviest weight used that session.
- The rule only says _when_ to go heavier, never _how much_: the app doesn't suggest a weight, I pick it myself.
- After a workout ends, check each exercise that has a rule. If the condition was met, mark it for a weight increase next session.
- Next time I open that exercise in the Set Logger:
  - Show a clear banner, e.g. "⬆ Go heavier (you hit 8+ reps at 40 kg last time)".
  - Pre-fill the kg input with last time's heaviest weight and the reps with the target reps; I go heavier from there (e.g. with the + button).
- If the condition was not met, show "Stay at 40 kg — aim for 8+ reps" instead.
- Exercises without a rule behave normally (pre-fill last time's values, no banner).

## 5. Pages

### Page 1 — Home (`#/`)

- A big, prominent "Start workout" button at the top.
- If a workout is in progress, replace it with "Resume workout" (showing the workout name and elapsed time).
- Weekly count: "3 workouts this week".
- Backup reminder: if it has been more than 14 days since the last export, show a small dismissible reminder linking to Settings.
- Recent workouts list (last 5): date marker (e.g. "Sun 11 Oct 2026"), workout name, number of exercises, total volume. Tap one to open Workout Details.
- Bottom navigation bar visible.

### Page 2 — Start Workout (`#/start`)

- List of my saved workout templates as large tappable cards (name + exercise count + last date used).
- "Empty workout" option.
- "+ New template": enter a name (e.g. "Leg day"), then the workout starts.
- Starting a session records the date and start time.
- Templates can be renamed or deleted from here (via an edit icon).

### Page 3 — Active Workout (`#/workout`)

- Header: workout name, today's date, a running workout timer.
- List of exercises in this session. If started from a template, its exercises are pre-listed.
- Each exercise row shows sets logged so far (e.g. "3 sets · best 40 kg × 8") and a small ⬆ icon if it's due for a weight increase.
- "+ Add exercise" opens a picker:
  - Shows MY created exercises with a search field.
  - "+ Create new exercise": name field, plus an optional collapsible "Progression rule" section (target reps, all/any sets).
  - Prevent duplicate names (case-insensitive).
- Exercises can be reordered (up/down buttons, simpler than drag on phones) and removed from the session.
- Sticky bottom bar: "End workout" (with confirmation).
- When ending a workout that came from a template, if I added or removed exercises, ask whether to update the template.
- Bottom navigation hidden on this page.

### Page 4 — Set Logger (`#/workout/log/:exerciseId`)

- Exercise name at the top, back button to the Active Workout.
- Progression banner (see section 4) if a rule exists.
- "Last time: 3×10 @ 40 kg (date)" so I know what to beat.
- kg and reps inputs with large − / + steppers, pre-filled with the last-used values (see section 4).
- Sticky "Log set" button at the bottom.
- List of sets logged this session; each can be edited or deleted.
- PR badge: highlight a set when it beats my previous best for this exercise (heaviest weight, or best estimated 1RM).
- A small progress chart for this exercise below the sets.

### Page 5 — Workout Summary (`#/summary/:workoutId`, shown after ending a workout)

- Date, duration, exercises done, total sets, total volume (kg × reps).
- New personal records achieved.
- "Next time": which exercises earned a step up, e.g. "Lat pulldown: go heavier" (no suggested weight).
- "Done" button returns to Home.

### Page 6 — Exercises (`#/exercises`)

- List of all my exercises (alphabetical, with search) showing the latest best set and a ⬆ marker if due for an increase.
- Tap one to open Exercise Detail.

### Page 7 — Exercise Detail (`#/exercise/:id`)

- Line chart over time (x axis = workout date) with a toggle between:
  - Heaviest weight (kg)
  - Estimated 1RM (Epley: kg × (1 + reps/30))
  - Total volume per session
- PR stats: heaviest weight, best estimated 1RM, most reps at a given weight.
- Progression rule: view, add, edit or remove it.
- History list of every session with this exercise and its sets.
- Rename or delete the exercise (warn that its history will be removed).

### Page 8 — History (`#/history`)

- All workouts grouped by month, newest first, each with a clear date marker (e.g. "Sun 11 Oct 2026").
- A simple calendar or heatmap strip at the top showing which days I trained. It must fit phone width without horizontal scrolling.
- Tap a workout to open Workout Details.

### Page 9 — Workout Details (`#/history/:id`)

- Date, start/end time, duration, total volume.
- Every exercise with its sets.
- Edit sets (fix typos), or delete the whole workout with confirmation.

### Page 10 — Settings (`#/settings`)

- Theme toggle (dark/light), saved in localStorage.
- Export all data as a JSON file download (backup). Show "Last backup: X days ago".
- Import from a JSON file, with validation and a confirm before overwriting.
- "Delete all data" with a double confirmation.
- A short note explaining that data lives only in this browser on this device, so regular exports are recommended.

## 6. Small extras

- PWA so I can "Add to Home Screen" with a proper name and icon (a simple generated icon is fine), opening in standalone mode with a matching theme color. Use `vite-plugin-pwa` if it keeps things simple, with auto-update so new versions aren't stuck behind a stale cache. Make sure the manifest and service worker respect the GitHub Pages base path.

## 7. Deployment (GitHub Pages)

- Add a GitHub Actions workflow (`.github/workflows/deploy.yml`) that on every push to `main`: installs dependencies, runs `npm run build`, and deploys the `dist` folder using the official `actions/upload-pages-artifact` and `actions/deploy-pages` actions.
- In the README, explain: Settings → Pages → Source: "GitHub Actions", and to set the `base` in `vite.config.js` to match the repo name.
- Add a `.gitignore` (node_modules, dist).

## 8. Deliverables & testing

- The working app, runnable with `npm install` and `npm run dev`.
- `README.md` with: what the app does, how to run it locally, how to build (`npm run build`, `npm run preview`), and step-by-step GitHub Pages deployment.
- Run `npm run build` and fix any errors or warnings before finishing.
- When done, walk through this test scenario (using `npm run preview` so the base path is tested too) and fix anything that breaks:
  1. Start workout → new template "Leg day" → create exercise "Leg extension" → log 3 sets → create "Squat" → log 3 sets → End workout → summary appears.
  2. Reload the page: the workout shows in History with today's date.
  3. Start "Leg day" again: both exercises are pre-listed, last-time values show, chart shows 2 points after logging.
  4. Reload mid-workout: the session resumes.
  5. Create "Lat pulldown" with rule 8+ reps. Log 3×8 @ 40 kg, end workout. Start a new workout: the logger shows the "Go heavier" banner with 40 kg pre-filled (no suggested weight), and the summary listed it under "Next time".
  6. Export, delete all data, import: everything is restored.
  7. Refresh on a deep link (e.g. `#/exercise/<id>`): the page loads correctly, no 404.
  8. Check every page at 320px, 375px and 430px widths: no horizontal scrolling, no overlapping elements, all buttons reachable and easy to tap.
