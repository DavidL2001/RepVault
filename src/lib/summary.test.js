import { describe, expect, it } from 'vitest'
import { PR_TYPES } from '../constants/calculations.js'
import { PROGRESSION_MODES } from '../constants/defaults.js'
import { makeWorkout } from '../test/factories.js'
import { workoutSummary } from './summary.js'

const exercises = [
  {
    id: 'lat',
    name: 'Lat pulldown',
    createdAt: '',
    progression: { targetReps: 8, mode: PROGRESSION_MODES.all },
  },
  { id: 'curl', name: 'Curl', createdAt: '', progression: null },
  {
    id: 'row',
    name: 'Row',
    createdAt: '',
    progression: { targetReps: 10, mode: PROGRESSION_MODES.all },
  },
]

/** A finished workout from `startedAt` to `endedAt`. */
const finished = (options, endedAt) => ({ ...makeWorkout(options), endedAt })

const earlier = finished(
  {
    id: 'earlier',
    startedAt: '2026-10-13T17:00:00.000Z',
    entries: { lat: [[40, 8]], curl: [[12.5, 12]], row: [[50, 10]] },
  },
  '2026-10-13T18:00:00.000Z',
)
const today = finished(
  {
    id: 'today',
    startedAt: '2026-10-20T17:00:00.000Z',
    entries: {
      lat: [
        [42.5, 8],
        [42.5, 8],
      ],
      curl: [[12.5, 10]],
      row: [
        [50, 10],
        [50, 9],
      ],
    },
  },
  '2026-10-20T18:05:00.000Z',
)
const later = finished(
  { id: 'later', startedAt: '2026-10-27T17:00:00.000Z', entries: { curl: [[30, 12]] } },
  '2026-10-27T18:00:00.000Z',
)

describe('workoutSummary', () => {
  const summary = workoutSummary(today, [earlier, today, later], exercises)

  it('counts duration, exercises, sets and volume', () => {
    expect(summary).toMatchObject({
      durationMs: 65 * 60_000,
      exerciseCount: 3,
      setCount: 5,
      volume: 42.5 * 8 * 2 + 12.5 * 10 + 50 * 10 + 50 * 9,
    })
  })

  it('lists records broken against earlier workouts only', () => {
    // Lat beat 40 kg; curl and row didn't; the later 30 kg curl doesn't count.
    expect(summary.records).toEqual([
      {
        exercise: exercises[0],
        types: [PR_TYPES.heaviest, PR_TYPES.oneRepMax],
        heaviestKg: 42.5,
        bestOneRepMax: 53.833,
      },
    ])
  })

  it('lists exercises that earned a step up', () => {
    // Lat hit 8+ on every set at 42.5 kg; row missed 10 on its second set at 50 kg.
    expect(summary.nextTime).toEqual([exercises[0]])
  })

  it('has no records the first time exercises are done', () => {
    expect(workoutSummary(earlier, [earlier], exercises).records).toEqual([])
  })

  it('reports only the record types that were broken', () => {
    const repsPr = finished(
      { id: 'reps', startedAt: '2026-10-21T17:00:00.000Z', entries: { curl: [[12.5, 14]] } },
      '2026-10-21T17:30:00.000Z',
    )
    expect(workoutSummary(repsPr, [earlier, repsPr], exercises).records[0]).toMatchObject({
      types: [PR_TYPES.oneRepMax],
      heaviestKg: null,
      bestOneRepMax: 18.333,
    })
  })

  it('skips exercises that no longer exist', () => {
    const summaryWithoutLat = workoutSummary(today, [earlier, today], exercises.slice(1))
    expect(summaryWithoutLat.records).toEqual([])
    expect(summaryWithoutLat.nextTime).toEqual([])
  })
})
