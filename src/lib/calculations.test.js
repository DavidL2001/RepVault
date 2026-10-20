import { describe, expect, it } from 'vitest'
import { PR_TYPES } from '../constants/calculations.js'
import { makeSet, makeWorkout } from '../test/factories.js'
import {
  bestSet,
  estimateOneRepMax,
  personalBests,
  recordTypes,
  sessionRecords,
  setOneRepMax,
  setVolume,
  totalVolume,
  workoutVolume,
} from './calculations.js'

describe('volume', () => {
  it('is kg × reps for a set', () => {
    expect(setVolume(makeSet(40, 8))).toBe(320)
  })

  it('adds up sets without floating point noise', () => {
    expect(totalVolume([makeSet(42.5, 8), makeSet(42.5, 7), makeSet(0.1, 3)])).toBe(637.8)
    expect(totalVolume([])).toBe(0)
  })

  it('adds up every exercise in a workout', () => {
    const workout = makeWorkout({
      id: 'w1',
      startedAt: '2026-10-20T17:00:00.000Z',
      entries: {
        squat: [
          [100, 5],
          [100, 5],
        ],
        curl: [[12.5, 10]],
      },
    })
    expect(workoutVolume(workout)).toBe(1125)
  })
})

describe('estimateOneRepMax', () => {
  it('uses the Epley formula', () => {
    expect(estimateOneRepMax(100, 5)).toBe(116.667)
    expect(estimateOneRepMax(40, 10)).toBe(53.333)
  })

  it('counts a single rep as the weight itself', () => {
    expect(estimateOneRepMax(100, 1)).toBe(100)
  })

  it('is 0 without reps', () => {
    expect(estimateOneRepMax(100, 0)).toBe(0)
  })

  it('works on a set', () => {
    expect(setOneRepMax(makeSet(60, 3))).toBe(66)
  })
})

describe('bestSet', () => {
  it('picks the heaviest weight', () => {
    expect(bestSet([makeSet(40, 10), makeSet(42.5, 5), makeSet(35, 12)])).toEqual(makeSet(42.5, 5))
  })

  it('picks the most reps when weights tie', () => {
    expect(bestSet([makeSet(42.5, 5), makeSet(42.5, 6), makeSet(42.5, 4)])).toEqual(
      makeSet(42.5, 6),
    )
  })

  it('is null without sets', () => {
    expect(bestSet([])).toBeNull()
  })
})

describe('personalBests', () => {
  it('finds the heaviest weight, best 1RM and most reps per weight', () => {
    const sets = [makeSet(40, 10), makeSet(42.5, 8), makeSet(45, 3), makeSet(40, 12)]
    expect(personalBests(sets)).toEqual({
      heaviestKg: 45,
      bestOneRepMax: 56,
      mostRepsByWeight: [
        { kg: 45, reps: 3 },
        { kg: 42.5, reps: 8 },
        { kg: 40, reps: 12 },
      ],
    })
  })

  it('is empty without sets', () => {
    expect(personalBests([])).toEqual({
      heaviestKg: null,
      bestOneRepMax: null,
      mostRepsByWeight: [],
    })
  })
})

describe('recordTypes', () => {
  const previous = [makeSet(40, 8), makeSet(40, 6)]

  it('finds a heavier weight', () => {
    expect(recordTypes(makeSet(42.5, 1), previous)).toEqual([PR_TYPES.heaviest])
  })

  it('finds a better estimated 1RM at the same weight', () => {
    expect(recordTypes(makeSet(40, 10), previous)).toEqual([PR_TYPES.oneRepMax])
  })

  it('can break both records', () => {
    expect(recordTypes(makeSet(42.5, 8), previous)).toEqual([PR_TYPES.heaviest, PR_TYPES.oneRepMax])
  })

  it('needs to beat the record, not equal it', () => {
    expect(recordTypes(makeSet(40, 8), previous)).toEqual([])
  })

  it('has nothing to beat without previous sets', () => {
    expect(recordTypes(makeSet(100, 10), [])).toEqual([])
  })
})

describe('sessionRecords', () => {
  it('compares each set with history and the earlier sets of the session', () => {
    const history = [makeSet(40, 8)]
    const session = [makeSet(42.5, 6), makeSet(42.5, 8), makeSet(42.5, 7)]
    expect(sessionRecords(session, history)).toEqual([
      [PR_TYPES.heaviest, PR_TYPES.oneRepMax],
      [PR_TYPES.oneRepMax],
      [],
    ])
  })

  it('has no records the first time an exercise is done', () => {
    const session = [makeSet(40, 8), makeSet(45, 8)]
    expect(sessionRecords(session, [])).toEqual([[], []])
  })
})
