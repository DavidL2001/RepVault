import { createInitialData } from '../lib/model.js'
import { ACTION_TYPES } from './actions.js'

/**
 * The app reducer: returns the next state for an action, without changing the old one.
 *
 * @param {import('../lib/model.js').AppData} state
 * @param {{ type: string }} action Created with the helpers in `actions.js`.
 * @returns {import('../lib/model.js').AppData}
 */
export function appReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.settingsUpdated:
      return { ...state, settings: { ...state.settings, ...action.changes } }

    case ACTION_TYPES.dataReset:
      return createInitialData()

    default:
      // Fail loudly: a typo in an action type would otherwise silently do nothing.
      throw new Error(`Unknown action type: ${action.type}`)
  }
}
