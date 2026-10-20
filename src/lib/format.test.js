import { describe, expect, it } from 'vitest'
import { makeSet } from '../test/factories.js'
import { formatElapsed, formatKg, formatSet, formatSetSummary, pluralize } from './format.js'

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
