import { useEffect } from 'react'
import { THEME_COLOR_TOKEN } from '../constants/themes.js'

/**
 * Applies a theme to the whole page by setting `data-theme` on `<html>`,
 * which switches every `var(--color-…)` token. Also colors the browser bar
 * (and the status bar of the installed app) to match the page background.
 *
 * @param {string} theme One of `THEMES` from `constants/themes.js`.
 */
export function useDocumentTheme(theme) {
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme

    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.append(meta)
    }
    meta.content = getComputedStyle(root).getPropertyValue(THEME_COLOR_TOKEN).trim()
  }, [theme])
}
