# RepVault

A simple, mobile-first gym tracker. React + SCSS, built with Vite, hosted on GitHub Pages. All data stays in your browser's localStorage.

- Feature spec: [docs/SPEC.md](docs/SPEC.md)

## Run locally

```sh
npm install
npm run dev
```

## Scripts

| Command           | Description                                        |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Start the dev server                               |
| `npm run build`   | Build for production into `dist/`                  |
| `npm run preview` | Serve the build (tests the GitHub Pages base path) |
| `npm run lint`    | Lint with ESLint (including jsx-a11y)              |
| `npm run format`  | Format all files with Prettier                     |
| `npm run test`    | Run unit tests with Vitest                         |
| `npm run icons`   | Regenerate the app icons in `public/`              |

## Deploy

Every push to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml): it lints, tests and builds the app, then publishes `dist/` to GitHub Pages. It can also be started by hand from the Actions tab.

- Live: https://davidl2001.github.io/RepVault/
- One-time setup: repo **Settings → Pages → Source → "GitHub Actions"**.
- The Vite `base` is `/RepVault/` (the repo name). Routing uses `HashRouter`, so refreshing a deep link like `/RepVault/#/exercises` works without a 404 fallback.

## Install on a phone

RepVault is a PWA, so it can be installed and works offline.

- **iPhone (Safari):** Share → **Add to Home Screen**.
- **Android (Chrome):** menu → **Install app** (or **Add to Home screen**).

New versions install themselves: the app reloads once the update is ready. The icons are generated from the color palette with `npm run icons`.
