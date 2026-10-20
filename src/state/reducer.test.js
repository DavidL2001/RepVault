import { describe, expect, it } from 'vitest'
import { THEMES } from '../constants/themes.js'
import { createInitialData } from '../lib/model.js'
import { makeSet } from '../test/factories.js'
import {
  addExercise,
  addTemplate,
  addWorkoutExercise,
  deleteTemplate,
  discardWorkout,
  editSet,
  endWorkout,
  logSet,
  moveWorkoutExercise,
  removeSet,
  removeWorkoutExercise,
  renameTemplate,
  resetData,
  startWorkout,
  updateSettings,
  updateTemplateExercises,
} from './actions.js'
import { appReducer } from './reducer.js'

describe('appReducer', () => {
  it('adds an exercise at the end', () => {
    const state = createInitialData()
    const action = addExercise({ name: 'Squat', progression: null })
    const next = appReducer(state, action)

    expect(next.exercises).toEqual([action.exercise])
    expect(action.exercise).toMatchObject({ name: 'Squat', progression: null })
    expect(state.exercises).toEqual([]) // old state is unchanged
  })

  it('updates settings and keeps the others', () => {
    const state = createInitialData()
    const next = appReducer(state, updateSettings({ theme: THEMES.light }))

    expect(next.settings).toEqual({ ...state.settings, theme: THEMES.light })
    expect(state.settings.theme).not.toBe(THEMES.light) // old state is unchanged
  })

  it('resets to initial data', () => {
    const state = {
      ...createInitialData(),
      exercises: [{ id: 'e1', name: 'Test', createdAt: '', progression: null }],
    }
    expect(appReducer(state, resetData())).toEqual(createInitialData())
  })

  it('throws on an unknown action type', () => {
    expect(() => appReducer(createInitialData(), { type: 'nope' })).toThrow(
      'Unknown action type: nope',
    )
  })
})

describe('appReducer: templates', () => {
  it('adds, renames and deletes a template', () => {
    const add = addTemplate(' Leg  day ')
    let state = appReducer(createInitialData(), add)
    expect(state.templates).toEqual([{ id: add.template.id, name: 'Leg day', exerciseIds: [] }])

    state = appReducer(state, renameTemplate(add.template.id, 'Legs '))
    expect(state.templates[0].name).toBe('Legs')

    state = appReducer(state, deleteTemplate(add.template.id))
    expect(state.templates).toEqual([])
  })

  it('leaves other templates alone', () => {
    const keep = addTemplate('Push')
    const remove = addTemplate('Pull')
    let state = appReducer(appReducer(createInitialData(), keep), remove)
    state = appReducer(state, renameTemplate(remove.template.id, 'Back'))
    state = appReducer(state, deleteTemplate(remove.template.id))
    expect(state.templates).toEqual([keep.template])
  })
})

describe('appReducer: starting a workout', () => {
  it('sets the workout in progress', () => {
    const action = startWorkout({ name: 'Leg day', templateId: 't1', exerciseIds: ['e1'] })
    const state = appReducer(createInitialData(), action)
    expect(state.activeWorkout).toBe(action.workout)
    expect(state.activeWorkout).toMatchObject({ name: 'Leg day', endedAt: null })
  })

  it('never replaces a workout in progress', () => {
    const first = appReducer(createInitialData(), startWorkout({ name: 'First' }))
    const second = appReducer(first, startWorkout({ name: 'Second' }))
    expect(second).toBe(first)
  })
})

describe('appReducer: editing the workout in progress', () => {
  const started = () =>
    appReducer(createInitialData(), startWorkout({ name: 'Leg day', exerciseIds: ['e1'] }))
  const ids = (state) => state.activeWorkout.entries.map((entry) => entry.exerciseId)

  it('adds, moves and removes exercises', () => {
    let state = appReducer(started(), addWorkoutExercise('e2'))
    expect(ids(state)).toEqual(['e1', 'e2'])
    state = appReducer(state, moveWorkoutExercise('e2', -1))
    expect(ids(state)).toEqual(['e2', 'e1'])
    state = appReducer(state, removeWorkoutExercise('e2'))
    expect(ids(state)).toEqual(['e1'])
  })

  it('ignores workout edits when no workout is in progress', () => {
    const state = createInitialData()
    expect(appReducer(state, addWorkoutExercise('e1'))).toBe(state)
    expect(appReducer(state, endWorkout())).toBe(state)
  })

  it('ends a workout: saves it to the history without empty exercises', () => {
    let state = appReducer(started(), addWorkoutExercise('e2'))
    state.activeWorkout.entries[1].sets = [makeSet(40, 8)]
    state = appReducer(state, endWorkout())

    expect(state.activeWorkout).toBeNull()
    expect(state.workouts).toHaveLength(1)
    expect(state.workouts[0].endedAt).not.toBeNull()
    expect(state.workouts[0].entries.map((entry) => entry.exerciseId)).toEqual(['e2'])
  })

  it('does not save a workout without sets', () => {
    const state = appReducer(started(), endWorkout())
    expect(state.activeWorkout).toBeNull()
    expect(state.workouts).toEqual([])
  })

  it('discards a workout without saving it', () => {
    const withSet = started()
    withSet.activeWorkout.entries[0].sets = [makeSet(40, 8)]
    const state = appReducer(withSet, discardWorkout())
    expect(state.activeWorkout).toBeNull()
    expect(state.workouts).toEqual([])
  })

  it("updates a template's exercises", () => {
    const add = addTemplate('Leg day')
    let state = appReducer(createInitialData(), add)
    state = appReducer(state, updateTemplateExercises(add.template.id, ['e2', 'e1']))
    expect(state.templates[0].exerciseIds).toEqual(['e2', 'e1'])
  })
})

describe('appReducer: sets', () => {
  it('logs, edits and deletes sets in the workout in progress', () => {
    let state = appReducer(createInitialData(), startWorkout({ name: 'W', exerciseIds: ['e1'] }))
    state = appReducer(state, logSet('e1', { kg: 40, reps: 8 }))
    state = appReducer(state, logSet('e1', { kg: 42.5, reps: 6 }))
    const sets = () => state.activeWorkout.entries[0].sets

    expect(sets().map(({ kg, reps }) => [kg, reps])).toEqual([
      [40, 8],
      [42.5, 6],
    ])
    expect(Date.parse(sets()[0].timestamp)).not.toBeNaN()

    state = appReducer(state, editSet('e1', 1, { kg: 42.5, reps: 7 }))
    expect(sets()[1]).toMatchObject({ kg: 42.5, reps: 7 })

    state = appReducer(state, removeSet('e1', 0))
    expect(sets().map(({ kg }) => kg)).toEqual([42.5])
  })

  it('ignores sets when no workout is in progress', () => {
    const state = createInitialData()
    expect(appReducer(state, logSet('e1', { kg: 40, reps: 8 }))).toBe(state)
  })
})
