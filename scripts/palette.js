import { readFileSync } from 'node:fs'

// Build-time access to the raw palette, so the manifest uses the same colors as the app
// without repeating hex values outside `_colors.scss`.

const COLORS_FILE = new URL('../src/styles/_colors.scss', import.meta.url)

/**
 * Reads the hex colors from `_colors.scss`, e.g. `{ 'gray-950': '#0a0a0a', … }`.
 *
 * @returns {Record<string, string>}
 */
export function readPalette() {
  const scss = readFileSync(COLORS_FILE, 'utf8')
  const entries = [...scss.matchAll(/^\$([\w-]+):\s*(#[0-9a-f]{6});/gim)]
  return Object.fromEntries(entries.map(([, name, hex]) => [name, hex.toLowerCase()]))
}

/**
 * Colors outside the app's CSS, for the web app manifest. `background` matches `--color-bg`
 * of the default (dark) theme, so the splash screen and status bar blend into the app.
 */
export function brandColors() {
  const palette = readPalette()
  return { background: palette['gray-950'] }
}
