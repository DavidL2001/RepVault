import { describe, expect, it } from 'vitest'
import { THEMES } from '../constants/themes.js'
import { createInitialData } from '../lib/model.js'
import { addExercise, resetData, updateSettings } from './actions.js'
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
