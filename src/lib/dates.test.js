import { describe, expect, it } from 'vitest'
import {
  daysBetween,
  formatDate,
  formatTime,
  isSameWeek,
  startOfDay,
  startOfWeek,
  toDateKey,
} from './dates.js'

// Dates are built from local parts (month is 0-based), so tests pass in any timezone.
const SUNDAY_11_OCT = new Date(2026, 9, 11, 18, 5)

describe('formatDate', () => {
  // Punctuation and order differ between locales and ICU versions, so check the parts.
  it('shows weekday, day, month and year', () => {
    const formatted = formatDate(SUNDAY_11_OCT, 'en-GB')
    for (const part of ['Sun', '11', 'Oct', '2026']) expect(formatted).toContain(part)
  })

  it('accepts ISO strings', () => {
    expect(formatDate(SUNDAY_11_OCT.toISOString(), 'en-GB')).toBe(
      formatDate(SUNDAY_11_OCT, 'en-GB'),
    )
  })
})

describe('formatTime', () => {
  it('uses 24h time', () => {
    expect(formatTime(SUNDAY_11_OCT, 'en-GB')).toBe('18:05')
  })

  it('uses 24h time even in 12h locales', () => {
    expect(formatTime(SUNDAY_11_OCT, 'en-US')).toBe('18:05')
  })

  it('shows midnight as 00', () => {
    expect(formatTime(new Date(2026, 9, 11, 0, 30), 'en-US')).toBe('00:30')
  })
})

describe('toDateKey', () => {
  it('returns the local day as YYYY-MM-DD', () => {
    expect(toDateKey(SUNDAY_11_OCT)).toBe('2026-10-11')
    expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})

describe('startOfDay', () => {
  it('returns local midnight without changing the input', () => {
    const input = new Date(SUNDAY_11_OCT)
    expect(startOfDay(input)).toEqual(new Date(2026, 9, 11))
    expect(input).toEqual(SUNDAY_11_OCT)
  })
})

describe('startOfWeek', () => {
  it('starts weeks on Monday by default', () => {
    expect(startOfWeek(SUNDAY_11_OCT)).toEqual(new Date(2026, 9, 5))
    expect(startOfWeek(new Date(2026, 9, 5, 9))).toEqual(new Date(2026, 9, 5))
  })

  it('can start weeks on another day', () => {
    expect(startOfWeek(SUNDAY_11_OCT, 0)).toEqual(new Date(2026, 9, 11))
  })
})

describe('isSameWeek', () => {
  it('is true from Monday to Sunday of the same week', () => {
    expect(isSameWeek(new Date(2026, 9, 5), SUNDAY_11_OCT)).toBe(true)
  })

  it('is false across the week boundary', () => {
    expect(isSameWeek(SUNDAY_11_OCT, new Date(2026, 9, 12))).toBe(false)
  })
})

describe('daysBetween', () => {
  it('counts calendar days, not 24h periods', () => {
    expect(daysBetween(new Date(2026, 9, 10, 23), new Date(2026, 9, 11, 8))).toBe(1)
    expect(daysBetween(SUNDAY_11_OCT, SUNDAY_11_OCT)).toBe(0)
  })

  it('counts across a daylight saving change', () => {
    expect(daysBetween(new Date(2026, 2, 28), new Date(2026, 2, 30))).toBe(2)
  })

  it('is negative when the second date is earlier', () => {
    expect(daysBetween(new Date(2026, 9, 14), SUNDAY_11_OCT)).toBe(-3)
  })
})
