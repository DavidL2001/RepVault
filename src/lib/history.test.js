import { describe, expect, it } from 'vitest'
import { makeSet, makeWorkout } from '../test/factories.js'
import {
  exerciseSessions,
  exerciseSets,
  lastSession,
  recentWorkouts,
  workoutsBefore,
  workoutsThisWeek,
} from './history.js'

// Listed out of order on purpose: the helpers must sort by date.
const workouts = [
  makeWorkout({ id: 'mid', startedAt: '2026-10-08T17:00:00.000Z', entries: { squat: [[100, 5]] } }),
  makeWorkout({
    id: 'new',
    startedAt: '2026-10-15T17:00:00.000Z',
    entries: { squat: [[105, 5]], curl: [[12.5, 10]] },
  }),
  makeWorkout({ id: 'old', startedAt: '2026-10-01T17:00:00.000Z', entries: { squat: [[95, 5]] } }),
  // The exercise was added but no sets were logged.
  makeWorkout({ id: 'empty', startedAt: '2026-10-18T17:00:00.000Z', entries: { squat: [] } }),
]

describe('exerciseSessions', () => {
  it('lists workouts with sets for the exercise, newest first', () => {
    expect(exerciseSessions(workouts, 'squat').map((session) => session.workoutId)).toEqual([
      'new',
      'mid',
      'old',
    ])
  })

  it('returns only the sets of that exercise', () => {
    expect(exerciseSessions(workouts, 'curl')).toEqual([
      { workoutId: 'new', startedAt: '2026-10-15T17:00:00.000Z', sets: [makeSet(12.5, 10)] },
    ])
  })

  it('combines sets when the exercise appears twice in one workout', () => {
    const workout = makeWorkout({ id: 'w', startedAt: '2026-10-20T17:00:00.000Z' })
    workout.entries = [
      { exerciseId: 'squat', sets: [makeSet(100, 5)] },
      { exerciseId: 'squat', sets: [makeSet(90, 8)] },
    ]
    expect(exerciseSessions([workout], 'squat')[0].sets).toEqual([makeSet(100, 5), makeSet(90, 8)])
  })

  it('is empty for an exercise that was never done', () => {
    expect(exerciseSessions(workouts, 'bench')).toEqual([])
  })
})

describe('lastSession', () => {
  it('returns the newest workout with sets, skipping ones without', () => {
    expect(lastSession(workouts, 'squat').workoutId).toBe('new')
  })

  it('is null for an exercise that was never done', () => {
    expect(lastSession(workouts, 'bench')).toBeNull()
  })
})

describe('exerciseSets', () => {
  it('returns every set, oldest workout first', () => {
    expect(exerciseSets(workouts, 'squat').map((set) => set.kg)).toEqual([95, 100, 105])
  })
})

describe('recentWorkouts', () => {
  it('returns the newest workouts first, up to the count', () => {
    expect(recentWorkouts(workouts, 2).map((workout) => workout.id)).toEqual(['empty', 'new'])
  })

  it('returns all when there are fewer, without changing the original list', () => {
    expect(recentWorkouts(workouts).map((workout) => workout.id)).toEqual([
      'empty',
      'new',
      'mid',
      'old',
    ])
    expect(workouts[0].id).toBe('mid')
  })
})

describe('workoutsBefore', () => {
  it('returns the workouts started earlier, leaving out the workout itself', () => {
    const mid = workouts.find((workout) => workout.id === 'mid')
    expect(workoutsBefore(mid, workouts).map((workout) => workout.id)).toEqual(['old'])
  })
})

describe('workoutsThisWeek', () => {
  it('counts workouts from Monday to Sunday of the current week', () => {
    // Monday 12 – Sunday 18 Oct 2026 (local time).
    const now = new Date(2026, 9, 18, 20)
    expect(workoutsThisWeek(workouts, now)).toBe(2)
  })

  it('is 0 when there are no workouts', () => {
    expect(workoutsThisWeek([], new Date())).toBe(0)
  })
})
