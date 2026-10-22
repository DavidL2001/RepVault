import { PROGRESSION_MODES } from '../constants/defaults.js'
import { DEFAULT_THEME, THEMES } from '../constants/themes.js'
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
 * @property {string|null} backupReminderDismissedAt When the Home backup reminder was last
 *   dismissed; it stays hidden for `BACKUP_REMINDER_DAYS` after that.
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
      backupReminderDismissedAt: null,
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
 * It doesn't check every exercise and set; `hasValidRecords` does that for imports.
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

// ---- Record checks, for data from outside the app (an imported backup) ----

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== ''
const isDateString = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value))
const isOptionalDateString = (value) => value === null || isDateString(value)
const hasUniqueIds = (items) => new Set(items.map((item) => item.id)).size === items.length

/** @param {unknown} progression */
function isValidProgression(progression) {
  return (
    progression === null ||
    (isPlainObject(progression) &&
      Number.isInteger(progression.targetReps) &&
      progression.targetReps >= 1 &&
      Object.values(PROGRESSION_MODES).includes(progression.mode))
  )
}

/** @param {unknown} exercise */
function isValidExercise(exercise) {
  return (
    isPlainObject(exercise) &&
    isNonEmptyString(exercise.id) &&
    isNonEmptyString(exercise.name) &&
    isDateString(exercise.createdAt) &&
    isValidProgression(exercise.progression)
  )
}

/** @param {unknown} template */
function isValidTemplate(template) {
  return (
    isPlainObject(template) &&
    isNonEmptyString(template.id) &&
    isNonEmptyString(template.name) &&
    Array.isArray(template.exerciseIds) &&
    template.exerciseIds.every(isNonEmptyString)
  )
}

/** Same rules as the set form: weight 0 kg or more, whole reps of at least 1. */
function isValidSet(set) {
  return (
    isPlainObject(set) &&
    Number.isFinite(set.kg) &&
    set.kg >= 0 &&
    Number.isInteger(set.reps) &&
    set.reps >= 1 &&
    isDateString(set.timestamp)
  )
}

/** @param {unknown} entry */
function isValidEntry(entry) {
  return (
    isPlainObject(entry) &&
    isNonEmptyString(entry.exerciseId) &&
    Array.isArray(entry.sets) &&
    entry.sets.every(isValidSet)
  )
}

/** @param {unknown} workout */
function isValidWorkout(workout) {
  return (
    isPlainObject(workout) &&
    isNonEmptyString(workout.id) &&
    (workout.templateId === null || isNonEmptyString(workout.templateId)) &&
    isNonEmptyString(workout.name) &&
    isDateString(workout.startedAt) &&
    isOptionalDateString(workout.endedAt) &&
    Array.isArray(workout.entries) &&
    workout.entries.every(isValidEntry)
  )
}

/** @param {unknown} settings */
function isValidSettings(settings) {
  return (
    isPlainObject(settings) &&
    Object.values(THEMES).includes(settings.theme) &&
    isOptionalDateString(settings.lastExportAt) &&
    isOptionalDateString(settings.backupReminderDismissedAt)
  )
}

/**
 * Checks every record inside the data, not just the top level: data from a file
 * could have been edited or come from somewhere else, and one broken set would
 * otherwise break pages later. Finished workouts must have ended, the workout in
 * progress must not have, and ids must be unique per list.
 *
 * @param {unknown} data
 * @returns {data is AppData}
 */
export function hasValidRecords(data) {
  return (
    isValidData(data) &&
    data.exercises.every(isValidExercise) &&
    hasUniqueIds(data.exercises) &&
    data.templates.every(isValidTemplate) &&
    hasUniqueIds(data.templates) &&
    data.workouts.every((workout) => isValidWorkout(workout) && workout.endedAt !== null) &&
    hasUniqueIds(data.workouts) &&
    (data.activeWorkout === null ||
      (isValidWorkout(data.activeWorkout) && data.activeWorkout.endedAt === null)) &&
    isValidSettings(data.settings)
  )
}
