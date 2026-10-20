import { describe, expect, it } from 'vitest'
import { THEMES } from '../constants/themes.js'
import { createInitialData } from '../lib/model.js'
import { resetData, updateSettings } from './actions.js'
import { appReducer } from './reducer.js'

describe('appReducer', () => {
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
