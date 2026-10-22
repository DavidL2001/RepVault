import { MAX_DECIMALS } from '../constants/numbers.js'
import { bestSet } from './calculations.js'

const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const MINUTES_PER_HOUR = 60

// Turning values into display text in the browser locale (pass `locale` only in tests).

/**
 * A weight for display in the browser locale: "42.5 kg", or "42,5 kg" in Swedish.
 *
 * @param {number} kg
 * @param {string} [locale] Defaults to the browser locale.
 * @param {number} [decimals] Most decimals to show, e.g. `ONE_REP_MAX_DECIMALS` for estimates.
 * @returns {string}
 */
export function formatKg(kg, locale, decimals = MAX_DECIMALS) {
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'kilogram',
    maximumFractionDigits: decimals,
  }).format(kg)
}

/**
 * A set as "40 kg × 8".
 *
 * @param {{ kg: number, reps: number }} set
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {string}
 */
export function formatSet({ kg, reps }, locale) {
  return `${formatKg(kg, locale)} × ${reps}`
}

/**
 * A count with the right word form: "1 exercise", "3 exercises".
 *
 * @param {number} count
 * @param {string} singular
 * @param {string} [plural] Defaults to `singular` + "s".
 * @returns {string}
 */
export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

/**
 * Elapsed time for the workout timer: "4:05", or "1:04:05" from one hour.
 *
 * @param {number} ms
 * @returns {string}
 */
export function formatElapsed(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / MS_PER_SECOND))
  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR)
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
  const seconds = String(totalSeconds % SECONDS_PER_MINUTE).padStart(2, '0')
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`
    : `${minutes}:${seconds}`
}

/**
 * Sets logged for an exercise in a workout: "3 sets · best 40 kg × 8", or "No sets yet".
 *
 * @param {import('./model.js').WorkoutSet[]} sets
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {string}
 */
export function formatSetSummary(sets, locale) {
  if (sets.length === 0) return 'No sets yet'
  return `${pluralize(sets.length, 'set')} · best ${formatSet(bestSet(sets), locale)}`
}

/**
 * A number as text for an input field, with the locale's decimal separator
 * ("42,5" in Swedish) and no thousands separator. `parseDecimal` reads it back.
 *
 * @param {number} value
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {string}
 */
export function formatNumberInput(value, locale) {
  return new Intl.NumberFormat(locale, {
    useGrouping: false,
    maximumFractionDigits: MAX_DECIMALS,
  }).format(value)
}

/**
 * Sets in short form, grouping sets in a row with the same weight and reps:
 * "3×10 @ 40 kg", or "2×10 @ 40 kg, 1×6 @ 42.5 kg".
 *
 * @param {import('./model.js').WorkoutSet[]} sets
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {string}
 */
export function formatSetsShort(sets, locale) {
  const groups = []
  for (const { kg, reps } of sets) {
    const last = groups.at(-1)
    if (last && last.kg === kg && last.reps === reps) last.count++
    else groups.push({ kg, reps, count: 1 })
  }
  return groups
    .map(({ kg, reps, count }) => `${count}×${reps} @ ${formatKg(kg, locale)}`)
    .join(', ')
}

/**
 * Workout length for the summary: "45 min", "1 h 5 min", or "Under 1 min".
 *
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
  const totalMinutes = Math.round(ms / (MS_PER_SECOND * SECONDS_PER_MINUTE))
  if (totalMinutes < 1) return 'Under 1 min'
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR)
  const minutes = totalMinutes % MINUTES_PER_HOUR
  if (hours === 0) return `${minutes} min`
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`
}

/**
 * How long ago something was, in calendar days: "today", "yesterday", "3 days ago".
 *
 * @param {number} days Whole days, from `daysBetween`.
 * @returns {string}
 */
export function formatDaysAgo(days) {
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${pluralize(days, 'day')} ago`
}
