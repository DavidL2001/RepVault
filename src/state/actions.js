import { createExercise } from '../lib/exercises.js'
import { normalizeName } from '../lib/names.js'
import { createSet } from '../lib/sets.js'
import { createTemplate } from '../lib/templates.js'
import { createWorkout } from '../lib/workouts.js'

// Every state change goes through one of these named actions.
// Dispatch them with the action creators below: `dispatch(updateSettings({ theme }))`.
// Later roadmap steps add their own actions here.

export const ACTION_TYPES = {
  exerciseAdded: 'exercises/added',
  exerciseRenamed: 'exercises/renamed',
  exerciseProgressionUpdated: 'exercises/progressionUpdated',
  exerciseDeleted: 'exercises/deleted',
  templateAdded: 'templates/added',
  templateRenamed: 'templates/renamed',
  templateDeleted: 'templates/deleted',
  workoutStarted: 'workouts/started',
  workoutExerciseAdded: 'workouts/exerciseAdded',
  workoutExerciseRemoved: 'workouts/exerciseRemoved',
  workoutExerciseMoved: 'workouts/exerciseMoved',
  workoutEnded: 'workouts/ended',
  workoutDiscarded: 'workouts/discarded',
  setLogged: 'sets/logged',
  setUpdated: 'sets/updated',
  setDeleted: 'sets/deleted',
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
 * @param {string} id
 * @param {string} name
 */
export function renameExercise(id, name) {
  return { type: ACTION_TYPES.exerciseRenamed, id, name: normalizeName(name) }
}

/**
 * Adds, changes or (with `null`) removes an exercise's progression rule.
 *
 * @param {string} id
 * @param {import('../lib/model.js').Progression|null} progression
 */
export function updateExerciseProgression(id, progression) {
  return { type: ACTION_TYPES.exerciseProgressionUpdated, id, progression }
}

/**
 * Deletes an exercise and its whole history (see `removeExerciseEverywhere`).
 *
 * @param {string} id
 */
export function deleteExercise(id) {
  return { type: ACTION_TYPES.exerciseDeleted, id }
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

/**
 * Logs a set (logged now) for an exercise in the workout in progress.
 *
 * @param {string} exerciseId
 * @param {{ kg: number, reps: number }} fields
 */
export function logSet(exerciseId, fields) {
  return { type: ACTION_TYPES.setLogged, exerciseId, set: createSet(fields) }
}

/**
 * Changes the weight and reps of a set in the workout in progress.
 *
 * @param {string} exerciseId
 * @param {number} index Position of the set, from 0.
 * @param {{ kg: number, reps: number }} changes
 */
export function editSet(exerciseId, index, changes) {
  return { type: ACTION_TYPES.setUpdated, exerciseId, index, changes }
}

/**
 * Deletes a set from the workout in progress.
 *
 * @param {string} exerciseId
 * @param {number} index Position of the set, from 0.
 */
export function removeSet(exerciseId, index) {
  return { type: ACTION_TYPES.setDeleted, exerciseId, index }
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
