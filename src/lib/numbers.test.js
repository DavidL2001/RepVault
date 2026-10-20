import { describe, expect, it } from 'vitest'
import { clamp, parseDecimal, roundNumber, stepNumber } from './numbers.js'

describe('parseDecimal', () => {
  it('parses whole numbers', () => {
    expect(parseDecimal('42')).toBe(42)
  })

  it('accepts a dot or a comma as decimal separator', () => {
    expect(parseDecimal('42.5')).toBe(42.5)
    expect(parseDecimal('42,5')).toBe(42.5)
  })

  it('accepts a leading or trailing separator', () => {
    expect(parseDecimal(',5')).toBe(0.5)
    expect(parseDecimal('42,')).toBe(42)
  })

  it('ignores surrounding whitespace', () => {
    expect(parseDecimal('  40 ')).toBe(40)
  })

  it('accepts numbers', () => {
    expect(parseDecimal(12.5)).toBe(12.5)
  })

  it('returns NaN for empty or invalid text', () => {
    expect(parseDecimal('')).toBeNaN()
    expect(parseDecimal('   ')).toBeNaN()
    expect(parseDecimal('abc')).toBeNaN()
    expect(parseDecimal('4,2,5')).toBeNaN()
    expect(parseDecimal('1e3')).toBeNaN()
    expect(parseDecimal(',')).toBeNaN()
  })
})

describe('roundNumber', () => {
  it('removes floating point noise', () => {
    expect(roundNumber(0.1 + 0.2)).toBe(0.3)
  })
})

describe('clamp', () => {
  it('keeps values inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(11, 0, 10)).toBe(10)
  })

  it('has no limit when min or max is left out', () => {
    expect(clamp(-100)).toBe(-100)
    expect(clamp(100, 0)).toBe(100)
  })
})

describe('stepNumber', () => {
  it('adds the step', () => {
    expect(stepNumber('40', 2.5)).toBe(42.5)
    expect(stepNumber('42,5', -2.5)).toBe(40)
  })

  it('rounds away floating point noise', () => {
    expect(stepNumber('0.1', 0.2)).toBe(0.3)
  })

  it('stays within min and max', () => {
    expect(stepNumber('1', -2.5, { min: 0 })).toBe(0)
    expect(stepNumber('99', 5, { max: 100 })).toBe(100)
  })

  it('starts from min, or 0, when the value is empty or invalid', () => {
    expect(stepNumber('', 2.5)).toBe(2.5)
    expect(stepNumber('abc', 1, { min: 1 })).toBe(2)
  })
})
