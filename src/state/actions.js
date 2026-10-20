import { createExercise } from '../lib/exercises.js'

// Every state change goes through one of these named actions.
// Dispatch them with the action creators below: `dispatch(updateSettings({ theme }))`.
// Later roadmap steps add their own actions here (exercises, templates, workouts, …).

export const ACTION_TYPES = {
  exerciseAdded: 'exercises/added',
  settingsUpdated: 'settings/updated',
  dataReset: 'data/reset',
}

/**
 * Adds a new exercise (with a new id and creation date).
 *
 * @param {{ name: string, progression: import('../lib/model.js').Progression|null }} fields
 */
export function addExercise(fields) {
  return { type: ACTION_TYPES.exerciseAdded, exercise: createExercise(fields) }
}

/**
 * Changes one or more settings, keeping the others.
 *
 * @param {Partial<import('../lib/model.js').Settings>} changes
 */
export function updateSettings(changes) {
  return { type: ACTION_TYPES.settingsUpdated, changes }
}

/** Deletes all data and starts fresh, as on a first visit. */
export function resetData() {
  return { type: ACTION_TYPES.dataReset }
}
