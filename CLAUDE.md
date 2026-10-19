# CLAUDE.md

Personal gym tracking app. React + SCSS, built with Vite, hosted on GitHub Pages, data stored in localStorage. Used mainly on phones, in the gym, one-handed.

- Full feature spec: `docs/SPEC.md`
- Build plan, branch by branch: `docs/ROADMAP.md`

## Commands

- `npm run dev` – local dev server
- `npm run build` – production build
- `npm run preview` – serve the build (tests the GitHub Pages base path)
- `npm run lint` – ESLint, including jsx-a11y
- `npm run format` – format all files with Prettier
- `npm run test` – Vitest unit tests

## Workflow

- Follow `docs/ROADMAP.md` in order. One branch per roadmap step, created from an up-to-date `main`.
- Stay inside the scope of the current branch. If you notice something for a later step, note it instead of building it.
- Commit in small, logical steps with clear messages (e.g. `feat: add Stepper component`, `fix: …`, `refactor: …`).
- Before finishing a branch: `npm run lint`, `npm run test` and `npm run build` must pass with no errors or warnings. Then check off the boxes in `docs/ROADMAP.md`.
- When something in the spec is unclear, ask instead of guessing.

## Be extra structured

Reuse first. Before writing new code, check whether a component, hook, helper, mixin or token already exists for it. If something is written a second time, extract it.

**Components**
- Build small, reusable components in `src/components/` (Button, IconButton, TextField, NumberField, Stepper, Card, Modal, ConfirmDialog, Banner, PageHeader, StickyActionBar, EmptyState, …) and compose pages from them.
- Pages in `src/pages/` should mostly arrange components and call hooks. Keep logic out of them.
- One component per file, with its own `.module.scss` next to it.
- Use variants through props (`variant="primary"`), never by copying a component.
- Document props with JSDoc at the top of each component.

**Logic and helpers**
- All calculations and business rules (volume, 1RM, PRs, progression, date handling, export/import, storage) live as pure functions in `src/lib/`, with unit tests.
- Reusable stateful logic goes in custom hooks in `src/hooks/`.
- State changes go through the reducer with named action types. Never write to localStorage from components.
- No magic numbers or strings: put them in `src/constants/` (storage key, schema version, default values, reminder days, route paths).

**Styling**
- Raw colors exist only in `styles/_colors.scss`. Everything else uses semantic theme variables from `styles/_themes.scss` (`var(--color-surface)`, `var(--color-primary)`, …). Never write a hex, rgb or named color anywhere else, including chart configs.
- Spacing, font sizes, radii, shadows, z-index, breakpoints and durations come from `styles/_variables.scss`. No hardcoded pixel values for these in components.
- Repeated style patterns become mixins in `styles/_mixins.scss` (breakpoints, tap target, focus ring, visually hidden, truncate, safe areas).
- Mobile-first: base styles target phones, larger screens are added with breakpoint mixins.

**Naming**
- Components and pages: PascalCase. Hooks: `useSomething`. Helpers and constants files: camelCase. SCSS partials: `_kebab-case.scss`.
- Names describe purpose, not looks (`--color-danger`, not `--red`).

## Accessibility is a requirement, not a polish step

Target WCAG 2.1 AA. Every feature must be accessible when it is built, not fixed afterwards.

- Use semantic HTML first: `<button>` for actions, `<a>`/`Link` for navigation, `<nav>`, `<main>`, `<header>`, lists for lists, one `<h1>` per page and a logical heading order.
- Every input has a visible `<label>`. Errors are linked with `aria-describedby` and announced.
- Icon-only buttons always have an accessible name (`aria-label`).
- Everything works by keyboard alone, in a logical tab order, with a clearly visible focus style in both themes.
- Modals: focus moves into the dialog, is trapped there, Escape closes it, and focus returns to the trigger.
- On route change, update `document.title` and move focus to the page `<h1>`.
- Use `aria-live="polite"` for important feedback (set logged, PR reached, import finished). Don't announce the running timer every second.
- Never use color alone to convey meaning: PRs, progression arrows and errors also get text or an icon with a label.
- Text contrast is at least 4.5:1, UI elements and focus indicators at least 3:1, in both dark and light themes.
- Charts always have a text alternative (a summary sentence, plus an optional data table).
- Respect `prefers-reduced-motion`.
- Touch targets are at least 48px with enough spacing between them.
- Keep `eslint-plugin-jsx-a11y` warnings at zero.

## Responsive rules

- Phones (320–430px) are the main target. Nothing may scroll horizontally at 320px.
- Primary actions sit in a sticky bottom bar within thumb reach.
- Respect safe areas (`env(safe-area-inset-*)`) and use `100dvh`.
- Inputs use at least 16px font size and the correct `inputMode`.

## Project rules

- No pre-made exercise lists or suggestions. All exercises and templates are created by the user.
- Units are kg only. Dates use the browser locale with 24h time.
- All persisted data lives under one localStorage key with a `schemaVersion`. Changes to the data shape need a migration.
- Use `HashRouter` and keep the Vite `base` set to the repo name so GitHub Pages works.
- Keep dependencies to the ones in the spec. Ask before adding a new one.
