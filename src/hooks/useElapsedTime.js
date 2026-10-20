import { useEffect, useState } from 'react'
import { TIMER_TICK_MS } from '../constants/defaults.js'

/**
 * Milliseconds since a start time, updated every second.
 *
 * @param {string} startedAt ISO date.
 * @returns {number}
 */
export function useElapsedTime(startedAt) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), TIMER_TICK_MS)
    return () => clearInterval(interval)
  }, [])

  return Math.max(0, now - Date.parse(startedAt))
}
