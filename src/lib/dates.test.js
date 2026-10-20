import { describe, expect, it } from 'vitest'
import {
  addDays,
  dateBadgeParts,
  daysBetween,
  formatDate,
  formatMonth,
  formatWeekdayInitial,
  formatShortDate,
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

describe('addDays', () => {
  it('moves by calendar days, keeping the time, across daylight saving changes', () => {
    const before = new Date(2026, 2, 28, 18, 0) // the night before summer time in Europe
    const after = addDays(before, 2)
    expect([after.getDate(), after.getHours()]).toEqual([30, 18])
    expect(addDays(before, -28).getMonth()).toBe(1)
  })
})

describe('formatMonth', () => {
  it('shows month and year, capitalized', () => {
    expect(formatMonth(SUNDAY_11_OCT, 'en-GB')).toBe('October 2026')
    expect(formatMonth(SUNDAY_11_OCT, 'sv-SE')).toBe('Oktober 2026')
  })
})

describe('formatWeekdayInitial', () => {
  it('shows a one-letter weekday', () => {
    expect(formatWeekdayInitial(SUNDAY_11_OCT, 'en-GB')).toBe('S')
  })
})

describe('dateBadgeParts', () => {
  it('splits day number and short weekday', () => {
    expect(dateBadgeParts(SUNDAY_11_OCT, 'en-GB')).toEqual({ day: '11', weekday: 'Sun' })
  })
})

describe('formatShortDate', () => {
  it('shows day and month only', () => {
    const formatted = formatShortDate(SUNDAY_11_OCT, 'en-GB')
    expect(formatted).toContain('11')
    expect(formatted).toContain('Oct')
    expect(formatted).not.toContain('2026')
    expect(formatted).not.toContain('Sun')
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
