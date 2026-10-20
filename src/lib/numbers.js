import { MAX_DECIMALS } from '../constants/numbers.js'

/** Digits, with an optional `.` or `,` decimal part, e.g. "42", "42.5", "42,5", ".5". */
const DECIMAL_PATTERN = /^-?(\d+([.,]\d*)?|[.,]\d+)$/

/**
 * Parses a number typed by the user. Accepts both `.` and `,` as decimal separator,
 * since many locales (e.g. Swedish) type "42,5".
 *
 * @param {string|number} text
 * @returns {number} The number, or `NaN` if the text isn't a valid number (including empty).
 */
export function parseDecimal(text) {
  const trimmed = String(text).trim()
  if (!DECIMAL_PATTERN.test(trimmed)) return NaN
  return Number(trimmed.replace(',', '.'))
}

/**
 * Rounds away floating point noise.
 *
 * @param {number} value
 * @returns {number}
 */
export function roundNumber(value) {
  return Number(value.toFixed(MAX_DECIMALS))
}

/**
 * Limits a number to a range. Leave `min` or `max` undefined for no limit on that side.
 *
 * @param {number} value
 * @param {number} [min]
 * @param {number} [max]
 * @returns {number}
 */
export function clamp(value, min = -Infinity, max = Infinity) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Adds `delta` to a typed value, rounded and kept within `min`–`max`.
 * An empty or invalid value starts from `min` (or 0).
 *
 * @param {string|number} value Current value, as typed.
 * @param {number} delta Amount to add; negative to decrease.
 * @param {{ min?: number, max?: number }} [limits]
 * @returns {number}
 */
export function stepNumber(value, delta, { min, max } = {}) {
  const parsed = parseDecimal(value)
  const start = Number.isNaN(parsed) ? (min ?? 0) : parsed
  return clamp(roundNumber(start + delta), min, max)
}
