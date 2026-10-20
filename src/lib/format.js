import { MAX_DECIMALS } from '../constants/numbers.js'

// Turning values into display text in the browser locale (pass `locale` only in tests).

/**
 * A weight for display in the browser locale: "42.5 kg", or "42,5 kg" in Swedish.
 *
 * @param {number} kg
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {string}
 */
export function formatKg(kg, locale) {
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'kilogram',
    maximumFractionDigits: MAX_DECIMALS,
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
