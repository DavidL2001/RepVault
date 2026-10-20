import { DEFAULT_THEME } from '../constants/themes.js'
import { SCHEMA_VERSION } from '../constants/storage.js'

// Shapes of the app data. All dates are ISO 8601 strings (`new Date().toISOString()`),
// so exported backups stay readable. Weights are always in kg.

/**
 * Rule for when to go heavier next session. It only says *when*; the user picks how much.
 * @typedef {object} Progression
 * @property {number} targetReps Reps to hit, e.g. 8 ("8+ reps").
 * @property {'all'|'any'} mode `all` sets or `any` set at the heaviest weight must hit the target.
 */

/**
 * An exercise the user created, e.g. "Lat pulldown". All progress is tracked per exercise.
 * @typedef {object} Exercise
 * @property {string} id
 * @property {string} name
 * @property {string} createdAt
 * @property {Progression|null} progression
 */

/**
 * A named routine, e.g. "Leg day": which exercises, in what order.
 * @typedef {object} Template
 * @property {string} id
 * @property {string} name
 * @property {string[]} exerciseIds
 */

/**
 * One logged set.
 * @typedef {object} WorkoutSet
 * @property {number} reps
 * @property {number} kg
 * @property {string} timestamp When it was logged.
 */

/**
 * One exercise within a workout session.
 * @typedef {object} Entry
 * @property {string} exerciseId
 * @property {WorkoutSet[]} sets
 */

/**
 * One gym visit.
 * @typedef {object} WorkoutSession
 * @property {string} id
 * @property {string|null} templateId Template it was started from, if any.
 * @property {string} name
 * @property {string} startedAt
 * @property {string|null} endedAt `null` while the workout is in progress.
 * @property {Entry[]} entries
 */

/**
 * @typedef {object} Settings
 * @property {'dark'|'light'} theme
 * @property {string|null} lastExportAt When the data was last exported as a backup.
 */

/**
 * Everything the app saves, stored as JSON under one localStorage key.
 * @typedef {object} AppData
 * @property {number} schemaVersion Shape version, for migrations.
 * @property {Exercise[]} exercises
 * @property {Template[]} templates
 * @property {WorkoutSession[]} workouts Finished workouts.
 * @property {WorkoutSession|null} activeWorkout The workout in progress, so it survives a reload.
 * @property {Settings} settings
 */

/**
 * Data for a first visit: nothing created yet (no preset exercises, ever).
 * @returns {AppData}
 */
export function createInitialData() {
  return {
    schemaVersion: SCHEMA_VERSION,
    exercises: [],
    templates: [],
    workouts: [],
    activeWorkout: null,
    settings: {
      theme: DEFAULT_THEME,
      lastExportAt: null,
    },
  }
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
export function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Checks that data has the top-level AppData shape of the current schema version.
 * It doesn't check every exercise and set; import validation (step 15) can build on this.
 *
 * @param {unknown} data
 * @returns {data is AppData}
 */
export function isValidData(data) {
  return (
    isPlainObject(data) &&
    data.schemaVersion === SCHEMA_VERSION &&
    Array.isArray(data.exercises) &&
    Array.isArray(data.templates) &&
    Array.isArray(data.workouts) &&
    (data.activeWorkout === null || isPlainObject(data.activeWorkout)) &&
    isPlainObject(data.settings)
  )
}
