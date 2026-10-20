import { describe, expect, it } from 'vitest'
import { PROGRESSION_MODES } from '../constants/defaults.js'
import { makeSet, makeWorkout } from '../test/factories.js'
import {
  createExercise,
  exerciseSummary,
  parseProgressionFields,
  validateExerciseForm,
  validateExerciseName,
} from './exercises.js'

const makeExercise = (id, name) => ({ id, name, createdAt: '', progression: null })
const exercises = [makeExercise('1', 'Lat pulldown'), makeExercise('2', 'Squat')]

describe('validateExerciseName', () => {
  it('requires a name', () => {
    expect(validateExerciseName('   ', exercises)).toBe('Enter a name.')
  })

  it('names the existing exercise in the duplicate error', () => {
    expect(validateExerciseName('squat', exercises)).toBe(
      'You already have an exercise called “Squat”.',
    )
  })

  it('accepts a new name', () => {
    expect(validateExerciseName('Leg extension', exercises)).toBeNull()
  })
})

describe('parseProgressionFields', () => {
  it('turns valid fields into a rule', () => {
    expect(parseProgressionFields({ targetReps: '8', mode: PROGRESSION_MODES.any })).toEqual({
      progression: { targetReps: 8, mode: PROGRESSION_MODES.any },
      errors: {},
    })
  })

  it('requires whole reps of at least 1', () => {
    for (const targetReps of ['0', '7.5', '', 'abc']) {
      const result = parseProgressionFields({ targetReps, mode: 'all' })
      expect(result.progression).toBeNull()
      expect(result.errors.targetReps).toBe('Enter whole reps, 1 or more.')
    }
  })
})

describe('createExercise', () => {
  it('builds an exercise with a clean name', () => {
    const now = new Date('2026-10-20T17:00:00.000Z')
    expect(
      createExercise({ name: ' Leg  extension ', progression: null }, { id: 'e1', now }),
    ).toEqual({
      id: 'e1',
      name: 'Leg extension',
      createdAt: '2026-10-20T17:00:00.000Z',
      progression: null,
    })
  })

  it('creates an id and date by default', () => {
    const exercise = createExercise({ name: 'Squat', progression: null })
    expect(exercise.id).toBeTruthy()
    expect(Date.parse(exercise.createdAt)).not.toBeNaN()
  })
})

describe('validateExerciseForm', () => {
  const values = {
    name: ' Leg extension ',
    hasRule: false,
    targetReps: '8',
    mode: PROGRESSION_MODES.all,
  }

  it('returns a clean name and no rule when the rule is off', () => {
    expect(validateExerciseForm(values, exercises)).toEqual({
      errors: {},
      fields: { name: 'Leg extension', progression: null },
    })
  })

  it('ignores invalid rule fields while the rule is off', () => {
    expect(validateExerciseForm({ ...values, targetReps: '' }, exercises).errors).toEqual({})
  })

  it('returns the rule when it is on', () => {
    expect(
      validateExerciseForm({ ...values, hasRule: true }, exercises).fields.progression,
    ).toEqual({ targetReps: 8, mode: PROGRESSION_MODES.all })
  })

  it('collects errors from every field', () => {
    const result = validateExerciseForm(
      { ...values, name: 'squat', hasRule: true, targetReps: '0' },
      exercises,
    )
    expect(Object.keys(result.errors)).toEqual(['name', 'targetReps'])
  })
})

describe('exerciseSummary', () => {
  const rule = { targetReps: 8, mode: PROGRESSION_MODES.all }
  const workouts = [
    makeWorkout({ id: 'old', startedAt: '2026-10-01T17:00:00.000Z', entries: { e1: [[50, 8]] } }),
    makeWorkout({
      id: 'new',
      startedAt: '2026-10-08T17:00:00.000Z',
      entries: {
        e1: [
          [40, 8],
          [42.5, 8],
          [42.5, 6],
        ],
      },
    }),
  ]

  it('shows the best set of the last session, not of all time', () => {
    expect(exerciseSummary({ id: 'e1', progression: null }, workouts)).toEqual({
      bestSet: makeSet(42.5, 8),
      dueForIncrease: false,
    })
  })

  it('is due for an increase when the rule was met last time', () => {
    const met = [
      makeWorkout({ id: 'w', startedAt: '2026-10-08T17:00:00.000Z', entries: { e1: [[40, 8]] } }),
    ]
    expect(exerciseSummary({ id: 'e1', progression: rule }, met).dueForIncrease).toBe(true)
    expect(exerciseSummary({ id: 'e1', progression: rule }, workouts).dueForIncrease).toBe(false)
  })

  it('has no best set for an exercise that was never done', () => {
    expect(exerciseSummary({ id: 'e2', progression: rule }, workouts)).toEqual({
      bestSet: null,
      dueForIncrease: false,
    })
  })
})
