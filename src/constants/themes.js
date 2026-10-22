/**
 * Theme names. Each one matches a `[data-theme]` block in `styles/_themes.scss`.
 */
export const THEMES = {
  dark: 'dark',
  light: 'light',
}

/** Theme used when nothing is saved (the spec asks for dark by default). */
export const DEFAULT_THEME = THEMES.dark

/** Names shown in the Settings theme toggle. */
export const THEME_LABELS = {
  [THEMES.dark]: 'Dark',
  [THEMES.light]: 'Light',
}

/** Token the browser bar (`<meta name="theme-color">`) takes its color from, so it blends into the page. */
export const THEME_COLOR_TOKEN = '--color-bg'
