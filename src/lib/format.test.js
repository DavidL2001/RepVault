import { describe, expect, it } from 'vitest'
import { makeSet } from '../test/factories.js'
import {
  formatDaysAgo,
  formatDuration,
  formatElapsed,
  formatKg,
  formatNumberInput,
  formatSet,
  formatSetsShort,
  formatSetSummary,
  pluralize,
} from './format.js'

describe('formatKg', () => {
  it('uses the locale decimal separator', () => {
    expect(formatKg(42.5, 'en-GB')).toBe('42.5 kg')
    expect(formatKg(42.5, 'sv-SE')).toBe('42,5 kg')
  })

  it('shows whole numbers without decimals', () => {
    expect(formatKg(40, 'en-GB')).toBe('40 kg')
  })
})

describe('formatSet', () => {
  it('shows weight × reps', () => {
    expect(formatSet({ kg: 42.5, reps: 8 }, 'sv-SE')).toBe('42,5 kg × 8')
  })
})

describe('pluralize', () => {
  it('uses the singular for 1 and the plural otherwise', () => {
    expect(pluralize(1, 'exercise')).toBe('1 exercise')
    expect(pluralize(0, 'exercise')).toBe('0 exercises')
    expect(pluralize(3, 'exercise')).toBe('3 exercises')
  })

  it('accepts an irregular plural', () => {
    expect(pluralize(2, 'match', 'matches')).toBe('2 matches')
  })
})

describe('formatElapsed', () => {
  it('shows minutes and seconds under an hour', () => {
    expect(formatElapsed(0)).toBe('0:00')
    expect(formatElapsed(245_000)).toBe('4:05')
  })

  it('adds hours from one hour', () => {
    expect(formatElapsed(3_845_000)).toBe('1:04:05')
  })

  it('rounds down to whole seconds and never goes negative', () => {
    expect(formatElapsed(1999)).toBe('0:01')
    expect(formatElapsed(-5000)).toBe('0:00')
  })
})

describe('formatSetSummary', () => {
  it('shows the count and best set', () => {
    expect(formatSetSummary([makeSet(40, 8), makeSet(42.5, 6), makeSet(40, 10)], 'en-GB')).toBe(
      '3 sets · best 42.5 kg × 6',
    )
    expect(formatSetSummary([makeSet(40, 8)], 'en-GB')).toBe('1 set · best 40 kg × 8')
  })

  it('says when nothing is logged yet', () => {
    expect(formatSetSummary([])).toBe('No sets yet')
  })
})

describe('formatNumberInput', () => {
  it('uses the locale decimal separator without grouping', () => {
    expect(formatNumberInput(42.5, 'sv-SE')).toBe('42,5')
    expect(formatNumberInput(42.5, 'en-GB')).toBe('42.5')
    expect(formatNumberInput(1250, 'en-GB')).toBe('1250')
  })
})

describe('formatSetsShort', () => {
  it('groups identical sets in a row', () => {
    expect(formatSetsShort([makeSet(40, 10), makeSet(40, 10), makeSet(40, 10)], 'en-GB')).toBe(
      '3×10 @ 40 kg',
    )
  })

  it('lists different sets in order', () => {
    expect(formatSetsShort([makeSet(40, 10), makeSet(40, 10), makeSet(42.5, 6)], 'sv-SE')).toBe(
      '2×10 @ 40 kg, 1×6 @ 42,5 kg',
    )
  })
})

describe('formatKg decimals', () => {
  it('can show fewer decimals', () => {
    expect(formatKg(116.667, 'en-GB', 1)).toBe('116.7 kg')
  })
})

describe('formatDuration', () => {
  it('shows minutes under an hour', () => {
    expect(formatDuration(45 * 60_000)).toBe('45 min')
  })

  it('shows hours and minutes', () => {
    expect(formatDuration(65 * 60_000)).toBe('1 h 5 min')
    expect(formatDuration(120 * 60_000)).toBe('2 h')
  })

  it('rounds to the nearest minute', () => {
    expect(formatDuration(44 * 60_000 + 31_000)).toBe('45 min')
  })

  it('says when it was under a minute', () => {
    expect(formatDuration(20_000)).toBe('Under 1 min')
  })
})

describe('formatDaysAgo', () => {
  it('says today, yesterday, or how many days ago', () => {
    expect(formatDaysAgo(0)).toBe('today')
    expect(formatDaysAgo(1)).toBe('yesterday')
    expect(formatDaysAgo(3)).toBe('3 days ago')
  })
})
