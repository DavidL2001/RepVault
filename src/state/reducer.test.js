import { describe, expect, it } from 'vitest'
import { THEMES } from '../constants/themes.js'
import { createInitialData } from '../lib/model.js'
import {
  addExercise,
  addTemplate,
  deleteTemplate,
  renameTemplate,
  resetData,
  startWorkout,
  updateSettings,
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
