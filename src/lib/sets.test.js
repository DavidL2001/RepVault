import { describe, expect, it } from 'vitest'
import { makeSet } from '../test/factories.js'
import { createSet, initialSetValues, parseSetFields } from './sets.js'

describe('createSet', () => {
  it('records when the set was logged', () => {
    expect(createSet({ kg: 40, reps: 8 }, new Date('2026-10-20T17:05:00.000Z'))).toEqual({
      kg: 40,
      reps: 8,
      timestamp: '2026-10-20T17:05:00.000Z',
    })
  })
})

describe('parseSetFields', () => {
  it('accepts a dot or comma in the weight', () => {
    expect(parseSetFields({ kg: '42,5', reps: '8' })).toEqual({
      values: { kg: 42.5, reps: 8 },
      errors: {},
    })
  })

  it('allows 0 kg for bodyweight exercises', () => {
    expect(parseSetFields({ kg: '0', reps: '12' }).values).toEqual({ kg: 0, reps: 12 })
  })

  it('rejects a missing or negative weight', () => {
    for (const kg of ['', '-5', 'abc']) {
      expect(parseSetFields({ kg, reps: '8' }).errors.kg).toBe('Enter a weight of 0 kg or more.')
    }
  })

  it('rejects reps that are not whole numbers of at least 1', () => {
    for (const reps of ['', '0', '7.5']) {
      expect(parseSetFields({ kg: '40', reps }).errors.reps).toBe('Enter whole reps, 1 or more.')
    }
  })
})

describe('initialSetValues', () => {
  const lastSessionSets = [makeSet(40, 10), makeSet(40, 9), makeSet(42.5, 6)]
  const progression = { shouldIncrease: true, lastKg: 42.5, targetReps: 8 }

  it('uses the last set logged today first', () => {
    expect(
      initialSetValues({ sessionSets: [makeSet(45, 7)], lastSessionSets, progression }),
    ).toEqual({ kg: 45, reps: 7 })
  })

  it('uses the heaviest weight from last time and the target reps with a rule', () => {
    expect(initialSetValues({ sessionSets: [], lastSessionSets, progression })).toEqual({
      kg: 42.5,
      reps: 8,
    })
  })

  it('uses the first set from last time without a rule', () => {
    expect(initialSetValues({ sessionSets: [], lastSessionSets, progression: null })).toEqual({
      kg: 40,
      reps: 10,
    })
  })

  it('is empty the first time an exercise is done', () => {
    expect(initialSetValues({ sessionSets: [], lastSessionSets: [], progression: null })).toEqual({
      kg: null,
      reps: null,
    })
  })
})
