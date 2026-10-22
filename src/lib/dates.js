import { WEEK_STARTS_ON } from '../constants/defaults.js'
import { DAYS_PER_WEEK, MS_PER_DAY } from '../constants/time.js'

// Date helpers. Formatting uses the browser locale (pass `locale` only in tests)
// and always 24h time. Inputs can be Date objects or ISO strings.

/**
 * @param {Date|string|number} value
 * @returns {Date}
 */
function toDate(value) {
  return value instanceof Date ? value : new Date(value)
}

/**
 * Date with weekday, e.g. "Sun, 11 Oct 2026" in en-GB or "sön 11 okt. 2026" in sv-SE.
 *
 * @param {Date|string} value
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {string}
 */
export function formatDate(value, locale) {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(toDate(value))
}

/**
 * Short date without weekday or year, for chart axes: "11 Oct", or "11 okt." in Swedish.
 *
 * @param {Date|string} value
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {string}
 */
export function formatShortDate(value, locale) {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(toDate(value))
}

/**
 * Time in 24h format, e.g. "18:05".
 *
 * @param {Date|string} value
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {string}
 */
export function formatTime(value, locale) {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(toDate(value))
}

/**
 * Local calendar day as "YYYY-MM-DD", for grouping by day and for file names.
 * Uses local time, not UTC, so a late-evening workout stays on the right day.
 *
 * @param {Date|string} value
 * @returns {string}
 */
export function toDateKey(value) {
  const date = toDate(value)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/**
 * Midnight (local time) at the start of the day.
 *
 * @param {Date|string} value
 * @returns {Date}
 */
export function startOfDay(value) {
  const date = new Date(toDate(value))
  date.setHours(0, 0, 0, 0)
  return date
}

/**
 * Midnight at the start of the week containing the date (Monday by default).
 *
 * @param {Date|string} value
 * @param {number} [weekStartsOn] 0 = Sunday … 6 = Saturday.
 * @returns {Date}
 */
export function startOfWeek(value, weekStartsOn = WEEK_STARTS_ON) {
  const date = startOfDay(value)
  const daysSinceStart = (date.getDay() - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK
  date.setDate(date.getDate() - daysSinceStart)
  return date
}

/**
 * Whether two dates fall in the same week.
 *
 * @param {Date|string} a
 * @param {Date|string} b
 * @param {number} [weekStartsOn]
 * @returns {boolean}
 */
export function isSameWeek(a, b, weekStartsOn = WEEK_STARTS_ON) {
  return startOfWeek(a, weekStartsOn).getTime() === startOfWeek(b, weekStartsOn).getTime()
}

/**
 * Whole calendar days from `from` to `to` (e.g. "last backup 3 days ago").
 * Counts midnights crossed, so yesterday 23:00 → today 08:00 is 1 day.
 *
 * @param {Date|string} from
 * @param {Date|string} to
 * @returns {number} Negative when `to` is before `from`.
 */
export function daysBetween(from, to) {
  // Rounding absorbs the hour lost or gained when daylight saving time changes.
  return Math.round((startOfDay(to) - startOfDay(from)) / MS_PER_DAY)
}

/**
 * The same time of day, a number of calendar days later (or earlier when negative).
 * Works across daylight saving changes, unlike adding 24 hours.
 *
 * @param {Date|string} value
 * @param {number} days
 * @returns {Date}
 */
export function addDays(value, days) {
  const date = new Date(toDate(value))
  date.setDate(date.getDate() + days)
  return date
}

/**
 * Month and year as a heading, e.g. "October 2026", or "Oktober 2026" in Swedish
 * (capitalized, since some locales write month names in lowercase).
 *
 * @param {Date|string} value
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {string}
 */
export function formatMonth(value, locale) {
  const text = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    toDate(value),
  )
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1)
}

/**
 * The weekday's initial for a calendar row label, e.g. "M", or "M" for "måndag".
 *
 * @param {Date|string} value
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {string}
 */
export function formatWeekdayInitial(value, locale) {
  return new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(toDate(value))
}

/**
 * Day of the month and short weekday, for a date badge: `{ day: '20', weekday: 'Tue' }`.
 *
 * @param {Date|string} value
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {{ day: string, weekday: string }}
 */
export function dateBadgeParts(value, locale) {
  const date = toDate(value)
  return {
    day: new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(date),
    weekday: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date),
  }
}
