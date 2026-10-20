import { createExercise } from '../lib/exercises.js'
import { normalizeName } from '../lib/names.js'
import { createTemplate } from '../lib/templates.js'
import { createWorkout } from '../lib/workouts.js'

// Every state change goes through one of these named actions.
// Dispatch them with the action creators below: `dispatch(updateSettings({ theme }))`.
// Later roadmap steps add their own actions here.

export const ACTION_TYPES = {
  exerciseAdded: 'exercises/added',
  templateAdded: 'templates/added',
  templateRenamed: 'templates/renamed',
  templateDeleted: 'templates/deleted',
  workoutStarted: 'workouts/started',
  workoutExerciseAdded: 'workouts/exerciseAdded',
  workoutExerciseRemoved: 'workouts/exerciseRemoved',
  workoutExerciseMoved: 'workouts/exerciseMoved',
  workoutEnded: 'workouts/ended',
  workoutDiscarded: 'workouts/discarded',
  templateExercisesUpdated: 'templates/exercisesUpdated',
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
 * Adds a new, empty template. The action holds the new template, so it can be started right away.
 *
 * @param {string} name
 */
export function addTemplate(name) {
  return { type: ACTION_TYPES.templateAdded, template: createTemplate(name) }
}

/**
 * @param {string} id
 * @param {string} name
 */
export function renameTemplate(id, name) {
  return { type: ACTION_TYPES.templateRenamed, id, name: normalizeName(name) }
}

/**
 * Deletes a template. Workouts started from it stay in the history.
 *
 * @param {string} id
 */
export function deleteTemplate(id) {
  return { type: ACTION_TYPES.templateDeleted, id }
}

/**
 * Starts a workout now. Ignored while another workout is in progress.
 *
 * @param {{ name: string, templateId?: string|null, exerciseIds?: string[] }} fields
 */
export function startWorkout(fields) {
  return { type: ACTION_TYPES.workoutStarted, workout: createWorkout(fields) }
}

/**
 * Adds an exercise to the end of the workout in progress.
 *
 * @param {string} exerciseId
 */
export function addWorkoutExercise(exerciseId) {
  return { type: ACTION_TYPES.workoutExerciseAdded, exerciseId }
}

/**
 * Removes an exercise and its sets from the workout in progress.
 *
 * @param {string} exerciseId
 */
export function removeWorkoutExercise(exerciseId) {
  return { type: ACTION_TYPES.workoutExerciseRemoved, exerciseId }
}

/**
 * Moves an exercise up (-1) or down (1) in the workout in progress.
 *
 * @param {string} exerciseId
 * @param {-1|1} offset
 */
export function moveWorkoutExercise(exerciseId, offset) {
  return { type: ACTION_TYPES.workoutExerciseMoved, exerciseId, offset }
}

/** Ends the workout in progress now and saves it to the history. */
export function endWorkout() {
  return { type: ACTION_TYPES.workoutEnded, endedAt: new Date() }
}

/** Throws away the workout in progress without saving it. */
export function discardWorkout() {
  return { type: ACTION_TYPES.workoutDiscarded }
}

/**
 * Replaces a template's exercise list, e.g. with the exercises of the workout just done.
 *
 * @param {string} id
 * @param {string[]} exerciseIds
 */
export function updateTemplateExercises(id, exerciseIds) {
  return { type: ACTION_TYPES.templateExercisesUpdated, id, exerciseIds }
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
