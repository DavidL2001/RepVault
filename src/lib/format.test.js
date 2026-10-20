import { describe, expect, it } from 'vitest'
import { formatKg, formatSet, pluralize } from './format.js'

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
