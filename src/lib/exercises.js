import { bestSet } from './calculations.js'
import { lastSession } from './history.js'
import { createId } from './ids.js'
import { parseDecimal } from './numbers.js'
import { evaluateProgression } from './progression.js'

// Rules for the user's exercises: names, duplicates, progression fields, sorting and search.

/**
 * Trims a name and collapses repeated spaces: "  Lat   pulldown " → "Lat pulldown".
 *
 * @param {string} name
 * @returns {string}
 */
export function normalizeName(name) {
  return name.trim().replace(/\s+/g, ' ')
}

/**
 * Key for comparing names regardless of case and spacing.
 *
 * @param {string} name
 * @returns {string}
 */
function nameKey(name) {
  return normalizeName(name).toLocaleLowerCase()
}

/**
 * The existing exercise with the same name (ignoring case and spacing), if any.
 *
 * @param {import('./model.js').Exercise[]} exercises
 * @param {string} name
 * @param {string} [ignoreId] Exercise being renamed, so it doesn't clash with itself.
 * @returns {import('./model.js').Exercise|undefined}
 */
export function findDuplicateName(exercises, name, ignoreId) {
  const key = nameKey(name)
  return exercises.find((exercise) => exercise.id !== ignoreId && nameKey(exercise.name) === key)
}

/**
 * Error message for an exercise name, or `null` when it is fine.
 *
 * @param {string} name
 * @param {import('./model.js').Exercise[]} exercises
 * @param {string} [ignoreId] Exercise being renamed.
 * @returns {string|null}
 */
export function validateExerciseName(name, exercises, ignoreId) {
  if (!normalizeName(name)) return 'Enter a name.'
  const duplicate = findDuplicateName(exercises, name, ignoreId)
  if (duplicate) return `You already have an exercise called “${duplicate.name}”.`
  return null
}

/**
 * Turns the progression rule fields (as typed) into a rule, or errors per field.
 *
 * @param {{ targetReps: string, stepKg: string, mode: 'all'|'any' }} fields
 * @returns {{ progression: import('./model.js').Progression|null, errors: { targetReps?: string, stepKg?: string } }}
 *   `progression` is `null` when there are errors.
 */
export function parseProgressionFields({ targetReps, stepKg, mode }) {
  const reps = parseDecimal(targetReps)
  const step = parseDecimal(stepKg)
  const errors = {}

  if (!Number.isInteger(reps) || reps < 1) errors.targetReps = 'Enter whole reps, 1 or more.'
  if (Number.isNaN(step) || step <= 0) errors.stepKg = 'Enter a weight step above 0 kg.'

  if (Object.keys(errors).length > 0) return { progression: null, errors }
  return { progression: { targetReps: reps, stepKg: step, mode }, errors }
}

/**
 * A new exercise.
 *
 * @param {{ name: string, progression: import('./model.js').Progression|null }} fields
 * @param {{ id?: string, now?: Date }} [options] For tests.
 * @returns {import('./model.js').Exercise}
 */
export function createExercise({ name, progression }, { id = createId(), now = new Date() } = {}) {
  return { id, name: normalizeName(name), createdAt: now.toISOString(), progression }
}

/**
 * Exercises in alphabetical order for the locale (so "Ö" sorts last in Swedish),
 * ignoring case, with numbers in natural order ("Row 2" before "Row 10").
 *
 * @param {import('./model.js').Exercise[]} exercises
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {import('./model.js').Exercise[]} A new array.
 */
export function sortByName(exercises, locale) {
  const collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true })
  return [...exercises].sort((a, b) => collator.compare(a.name, b.name))
}

/**
 * Exercises whose name contains the search text, ignoring case and extra spaces.
 *
 * @param {import('./model.js').Exercise[]} exercises
 * @param {string} query
 * @returns {import('./model.js').Exercise[]} All exercises when the query is empty.
 */
export function searchByName(exercises, query) {
  const key = nameKey(query)
  if (!key) return exercises
  return exercises.filter((exercise) => nameKey(exercise.name).includes(key))
}

/**
 * Values of the exercise form, as typed.
 * @typedef {object} ExerciseFormValues
 * @property {string} name
 * @property {boolean} hasRule Whether a progression rule is added.
 * @property {string} targetReps
 * @property {string} stepKg
 * @property {'all'|'any'} mode
 */

/**
 * Checks the whole exercise form.
 *
 * @param {ExerciseFormValues} values
 * @param {import('./model.js').Exercise[]} exercises Existing exercises, for the duplicate check.
 * @param {string} [ignoreId] Exercise being edited.
 * @returns {{
 *   errors: { name?: string, targetReps?: string, stepKg?: string },
 *   fields: { name: string, progression: import('./model.js').Progression|null },
 * }} `fields` is only meaningful when `errors` is empty.
 */
export function validateExerciseForm(values, exercises, ignoreId) {
  const errors = {}
  const nameError = validateExerciseName(values.name, exercises, ignoreId)
  if (nameError) errors.name = nameError

  let progression = null
  if (values.hasRule) {
    const rule = parseProgressionFields(values)
    Object.assign(errors, rule.errors)
    progression = rule.progression
  }

  return { errors, fields: { name: normalizeName(values.name), progression } }
}

/**
 * What the exercise list shows per exercise: the best set from last time,
 * and whether it's time to go heavier.
 *
 * @param {import('./model.js').Exercise} exercise
 * @param {import('./model.js').WorkoutSession[]} workouts Finished workouts.
 * @returns {{ bestSet: import('./model.js').WorkoutSet|null, dueForIncrease: boolean }}
 */
export function exerciseSummary(exercise, workouts) {
  const sets = lastSession(workouts, exercise.id)?.sets ?? []
  return {
    bestSet: bestSet(sets),
    dueForIncrease: evaluateProgression(exercise.progression, sets)?.shouldIncrease ?? false,
  }
}
