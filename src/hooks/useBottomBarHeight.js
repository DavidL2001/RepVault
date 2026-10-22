import { useEffect } from 'react'
import { BOTTOM_BAR_HEIGHT_PROPERTY } from '../constants/layout.js'

/**
 * Publishes the height of a bar stuck to the bottom of the screen as a CSS property on
 * `<html>` (see `BOTTOM_BAR_HEIGHT_PROPERTY`), kept up to date while its size changes
 * (rotation, text size). Only one bottom bar is shown at a time.
 *
 * @param {import('react').RefObject<HTMLElement>} ref The bar.
 */
export function useBottomBarHeight(ref) {
  useEffect(() => {
    const bar = ref.current
    const root = document.documentElement
    if (!bar) return

    const observer = new ResizeObserver(() => {
      root.style.setProperty(BOTTOM_BAR_HEIGHT_PROPERTY, `${bar.offsetHeight}px`)
    })
    observer.observe(bar)
    return () => {
      observer.disconnect()
      root.style.removeProperty(BOTTOM_BAR_HEIGHT_PROPERTY)
    }
  }, [ref])
}
