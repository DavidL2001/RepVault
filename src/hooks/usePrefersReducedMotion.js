import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange) {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

const getSnapshot = () => window.matchMedia(QUERY).matches

/**
 * Whether the user asked for less motion. For animations CSS can't switch off,
 * like Chart.js transitions. Updates when the setting changes.
 *
 * @returns {boolean}
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
