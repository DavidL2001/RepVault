import { describe, expect, it } from 'vitest'
import { PROGRESSION_MODES } from '../constants/defaults.js'
import { makeSet, makeWorkout } from '../test/factories.js'
import { evaluateProgression, exerciseProgression, progressionMessage } from './progression.js'

const allRule = { targetReps: 8, mode: PROGRESSION_MODES.all }
const anyRule = { ...allRule, mode: PROGRESSION_MODES.any }

describe('evaluateProgression', () => {
  it('goes heavier when every set at the heaviest weight hit the target', () => {
    const sets = [makeSet(40, 8), makeSet(40, 8), makeSet(40, 9)]
    expect(evaluateProgression(allRule, sets)).toEqual({
      shouldIncrease: true,
      lastKg: 40,
      targetReps: 8,
    })
  })

  it('does not suggest a weight: the user picks it', () => {
    const result = evaluateProgression(allRule, [makeSet(95, 11)])
    expect(result).toEqual({ shouldIncrease: true, lastKg: 95, targetReps: 8 })
  })

  it('stays when one set at the heaviest weight missed the target (all sets)', () => {
    const sets = [makeSet(40, 8), makeSet(40, 7)]
    expect(evaluateProgression(allRule, sets).shouldIncrease).toBe(false)
  })

  it('goes heavier when one set at the heaviest weight hit the target (any set)', () => {
    const sets = [makeSet(40, 8), makeSet(40, 6)]
    expect(evaluateProgression(anyRule, sets).shouldIncrease).toBe(true)
  })

  it('only looks at sets at the heaviest weight', () => {
    // Warm-ups and back-off sets at lighter weights don't count, even with fewer reps.
    const sets = [makeSet(20, 5), makeSet(40, 8), makeSet(40, 8), makeSet(30, 4)]
    expect(evaluateProgression(allRule, sets)).toMatchObject({ shouldIncrease: true, lastKg: 40 })
  })

  it('stays when no set at the heaviest weight hit the target (any set)', () => {
    const sets = [makeSet(35, 10), makeSet(40, 6)]
    expect(evaluateProgression(anyRule, sets).shouldIncrease).toBe(false)
  })

  it('is null without a rule or without sets', () => {
    expect(evaluateProgression(null, [makeSet(40, 8)])).toBeNull()
    expect(evaluateProgression(allRule, [])).toBeNull()
  })
})

describe('exerciseProgression', () => {
  const workouts = [
    makeWorkout({ id: 'old', startedAt: '2026-10-01T17:00:00.000Z', entries: { lat: [[35, 8]] } }),
    makeWorkout({
      id: 'new',
      startedAt: '2026-10-08T17:00:00.000Z',
      entries: {
        lat: [
          [40, 8],
          [40, 8],
          [40, 8],
        ],
      },
    }),
  ]

  it('checks the rule against the last session', () => {
    const exercise = { id: 'lat', name: 'Lat pulldown', createdAt: '', progression: allRule }
    expect(exerciseProgression(exercise, workouts)).toEqual({
      shouldIncrease: true,
      lastKg: 40,
      targetReps: 8,
    })
  })

  it('is null for exercises without a rule or without history', () => {
    expect(exerciseProgression({ id: 'lat', progression: null }, workouts)).toBeNull()
    expect(exerciseProgression({ id: 'new', progression: allRule }, workouts)).toBeNull()
  })
})

describe('progressionMessage', () => {
  it('says to go heavier without naming a weight to use', () => {
    const result = { shouldIncrease: true, lastKg: 95, targetReps: 8 }
    expect(progressionMessage(result, 'en-GB')).toBe(
      'Go heavier (you hit 8+ reps at 95 kg last time)',
    )
  })

  it('says to stay', () => {
    const result = { shouldIncrease: false, lastKg: 40, targetReps: 8 }
    expect(progressionMessage(result, 'en-GB')).toBe('Stay at 40 kg — aim for 8+ reps')
  })

  it('formats weights in the locale', () => {
    const result = { shouldIncrease: false, lastKg: 42.5, targetReps: 8 }
    expect(progressionMessage(result, 'sv-SE')).toBe('Stay at 42,5 kg — aim for 8+ reps')
  })
})
