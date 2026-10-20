import { useEffect } from 'react'

/**
 * Applies a theme to the whole page by setting `data-theme` on `<html>`,
 * which switches every `var(--color-…)` token.
 *
 * @param {string} theme One of `THEMES` from `constants/themes.js`.
 */
export function useDocumentTheme(theme) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
}
