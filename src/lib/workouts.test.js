import { describe, expect, it } from 'vitest'
import { makeSet } from '../test/factories.js'
import {
  addEntry,
  countSets,
  createWorkout,
  finishWorkout,
  moveEntry,
  removeEntry,
  templateNeedsUpdate,
  workoutExerciseIds,
} from './workouts.js'

const now = new Date('2026-10-20T17:05:00.000Z')
const workoutWith = (...exerciseIds) =>
  createWorkout({ name: 'Leg day', templateId: 't1', exerciseIds }, { id: 'w1', now })

describe('createWorkout', () => {
  it('records the start time and lists the exercises without sets', () => {
    expect(workoutWith('e1', 'e2')).toEqual({
      id: 'w1',
      templateId: 't1',
      name: 'Leg day',
      startedAt: '2026-10-20T17:05:00.000Z',
      endedAt: null,
      entries: [
        { exerciseId: 'e1', sets: [] },
        { exerciseId: 'e2', sets: [] },
      ],
    })
  })

  it('can start empty, without a template', () => {
    expect(createWorkout({ name: 'Workout' }, { id: 'w1', now })).toMatchObject({
      templateId: null,
      entries: [],
    })
  })
})

describe('addEntry', () => {
  it('adds the exercise at the end', () => {
    expect(workoutExerciseIds(addEntry(workoutWith('e1'), 'e2'))).toEqual(['e1', 'e2'])
  })

  it('does not add an exercise twice', () => {
    const workout = workoutWith('e1')
    expect(addEntry(workout, 'e1')).toBe(workout)
  })
})

describe('removeEntry', () => {
  it('removes the exercise and its sets', () => {
    const workout = workoutWith('e1', 'e2')
    workout.entries[0].sets = [makeSet(40, 8)]
    expect(removeEntry(workout, 'e1').entries).toEqual([{ exerciseId: 'e2', sets: [] }])
  })
})

describe('moveEntry', () => {
  const workout = workoutWith('e1', 'e2', 'e3')

  it('moves an exercise up or down', () => {
    expect(workoutExerciseIds(moveEntry(workout, 'e2', -1))).toEqual(['e2', 'e1', 'e3'])
    expect(workoutExerciseIds(moveEntry(workout, 'e2', 1))).toEqual(['e1', 'e3', 'e2'])
  })

  it('does nothing past either end, or for an unknown exercise', () => {
    expect(moveEntry(workout, 'e1', -1)).toBe(workout)
    expect(moveEntry(workout, 'e3', 1)).toBe(workout)
    expect(moveEntry(workout, 'nope', 1)).toBe(workout)
  })

  it('keeps the sets with their exercise', () => {
    const withSets = workoutWith('e1', 'e2')
    withSets.entries[0].sets = [makeSet(40, 8)]
    expect(moveEntry(withSets, 'e1', 1).entries[1]).toEqual({
      exerciseId: 'e1',
      sets: [makeSet(40, 8)],
    })
  })
})

describe('countSets', () => {
  it('counts sets across exercises', () => {
    const workout = workoutWith('e1', 'e2', 'e3')
    workout.entries[0].sets = [makeSet(40, 8), makeSet(40, 8)]
    workout.entries[2].sets = [makeSet(10, 12)]
    expect(countSets(workout)).toBe(3)
    expect(countSets(workoutWith())).toBe(0)
  })
})

describe('finishWorkout', () => {
  it('sets the end time and leaves out exercises without sets', () => {
    const workout = workoutWith('e1', 'e2')
    workout.entries[1].sets = [makeSet(40, 8)]
    const end = new Date('2026-10-20T18:00:00.000Z')
    expect(finishWorkout(workout, end)).toMatchObject({
      endedAt: '2026-10-20T18:00:00.000Z',
      entries: [{ exerciseId: 'e2', sets: [makeSet(40, 8)] }],
    })
  })
})

describe('templateNeedsUpdate', () => {
  const template = { id: 't1', name: 'Leg day', exerciseIds: ['e1', 'e2'] }

  it('is false when the exercises match the template', () => {
    expect(templateNeedsUpdate(template, workoutWith('e1', 'e2'))).toBe(false)
  })

  it('is true when an exercise was added or removed', () => {
    expect(templateNeedsUpdate(template, workoutWith('e1', 'e2', 'e3'))).toBe(true)
    expect(templateNeedsUpdate(template, workoutWith('e1'))).toBe(true)
  })

  it('is true when the order changed', () => {
    expect(templateNeedsUpdate(template, workoutWith('e2', 'e1'))).toBe(true)
  })

  it('is false without a template', () => {
    expect(templateNeedsUpdate(null, workoutWith('e1'))).toBe(false)
  })
})
