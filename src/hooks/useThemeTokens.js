import { useMemo, useSyncExternalStore } from 'react'

/** Calls `onChange` whenever `<html data-theme>` changes. */
function subscribeToTheme(onChange) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

const getTheme = () => document.documentElement.dataset.theme ?? ''

/**
 * Current values of CSS custom properties (theme tokens), for things CSS can't style,
 * like a chart canvas. Updates when the theme switches.
 *
 * @template {Record<string, string>} T
 * @param {T} tokens Names to custom property names, e.g. `{ line: '--color-primary' }`.
 *   Pass a constant (same object every render).
 * @returns {{ [K in keyof T]: string } & { fontFamily: string }} Values, plus the page font.
 */
export function useThemeTokens(tokens) {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme)

  return useMemo(() => {
    const styles = getComputedStyle(document.documentElement)
    const values = Object.fromEntries(
      Object.entries(tokens).map(([key, property]) => [
        key,
        styles.getPropertyValue(property).trim(),
      ]),
    )
    return { ...values, fontFamily: getComputedStyle(document.body).fontFamily }
    // `theme` isn't read here, but its change means the token values changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens, theme])
}
