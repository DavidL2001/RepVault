# RepVault

A simple, mobile-first gym tracker for logging sets one-handed on a phone. React + SCSS, built with Vite, hosted on GitHub Pages. No account and no backend: all data stays in your browser's localStorage.

**Live:** https://davidl2001.github.io/RepVault/

## Features

- **Your own exercises and templates.** Nothing is preset: create exercises as you go and save workouts you repeat (e.g. "Leg day") as templates.
- **Fast set logging.** Big − / + steppers for kg and reps, pre-filled from last time, with a "Last time" line and a sticky "Log set" button within thumb reach.
- **Progression rules.** Give an exercise a target (e.g. 8+ reps on all sets at the heaviest weight) and RepVault tells you when to go heavier. You pick the new weight.
- **Personal records.** Heaviest-weight and estimated-1RM (Epley) PRs are detected as you log them, with a badge that never relies on color alone.
- **Workout summary.** Duration, sets, total volume, new PRs and what to step up next time.
- **Progress charts.** Per exercise: heaviest weight, estimated 1RM or volume over time, each with a text summary and a data table.
- **History.** Workouts grouped by month, a training-days calendar, and editing or deleting past workouts.
- **Dark and light theme**, dark by default.
- **Installable and offline** as a PWA.
- **Accessible.** Built to WCAG 2.1 AA: works by keyboard and screen reader, never relies on color alone, 48px touch targets, respects reduced motion.

## Your data

Everything is saved in this browser only. Clearing browser data, or switching phones or browsers, loses it. Export a backup regularly under **Settings → Backup**: you get a JSON file you can import again later, on any device. The app reminds you when your last backup is more than 14 days old.

Someone else using the same link has their own data in their own browser.

## Install on a phone

RepVault is a PWA, so it can be installed and works offline.

- **iPhone (Safari):** Share → **Add to Home Screen**.
- **Android (Chrome):** menu → **Install app** (or **Add to Home screen**).

New versions install themselves: the app reloads once the update is ready. Your data, and a workout in progress, survive the update.

## Development

```sh
npm install
npm run dev
```

| Command           | Description                                        |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Start the dev server                               |
| `npm run build`   | Build for production into `dist/`                  |
| `npm run preview` | Serve the build (tests the GitHub Pages base path) |
| `npm run lint`    | Lint with ESLint (including jsx-a11y)              |
| `npm run format`  | Format all files with Prettier                     |
| `npm run test`    | Run unit tests with Vitest                         |
| `npm run icons`   | Regenerate the app icons in `public/`              |

The app icons are made from the logo in `scripts/icon-source.png`: replace it and run `npm run icons`.

### Stack

- React with one Context + `useReducer` for all state, persisted under a single localStorage key with a `schemaVersion` and migrations
- `react-router-dom` with `HashRouter`, so deep links survive a refresh on GitHub Pages
- SCSS modules with design tokens (colors, themes, spacing, mixins) in `src/styles/`
- `chart.js` + `react-chartjs-2` for progress charts, loaded only when a chart is shown
- `vite-plugin-pwa` for install and offline support
- Vitest for unit tests, ESLint (with `jsx-a11y`) and Prettier

### Project structure

```
src/
  pages/       one folder per page (.jsx + .module.scss)
  components/  reusable UI: Button, Stepper, Modal, ProgressChart, …
  hooks/       reusable stateful logic
  state/       context, reducer, action types
  lib/         pure functions: calculations, progression, history, dates, storage, backup (unit tested)
  constants/   storage key, schema version, defaults, route paths
  styles/      colors, themes, variables, mixins, global styles
```

### Docs

- Feature spec, including the manual test scenario: [docs/SPEC.md](docs/SPEC.md)

## Deploy

Every push to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml): it lints, tests and builds the app, then publishes `dist/` to GitHub Pages. It can also be started by hand from the Actions tab.

- One-time setup: repo **Settings → Pages → Source → "GitHub Actions"**.
- The Vite `base` is `/RepVault/` (the repo name). Routing uses `HashRouter`, so refreshing a deep link like `/RepVault/#/exercises` works without a 404 fallback.
