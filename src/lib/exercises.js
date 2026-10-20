import { bestSet } from './calculations.js'
import { lastSession } from './history.js'
import { createId } from './ids.js'
import { parseDecimal } from './numbers.js'
import { normalizeName, validateName } from './names.js'
import { evaluateProgression } from './progression.js'

// Rules for the user's exercises: names, progression fields and list summaries.

/**
 * Error message for an exercise name, or `null` when it is fine.
 *
 * @param {string} name
 * @param {import('./model.js').Exercise[]} exercises
 * @param {string} [ignoreId] Exercise being renamed.
 * @returns {string|null}
 */
export function validateExerciseName(name, exercises, ignoreId) {
  return validateName(name, exercises, 'an exercise', ignoreId)
}

/**
 * Turns the progression rule fields (as typed) into a rule, or errors per field.
 *
 * @param {{ targetReps: string, mode: 'all'|'any' }} fields
 * @returns {{ progression: import('./model.js').Progression|null, errors: { targetReps?: string } }}
 *   `progression` is `null` when there are errors.
 */
export function parseProgressionFields({ targetReps, mode }) {
  const reps = parseDecimal(targetReps)
  if (!Number.isInteger(reps) || reps < 1) {
    return { progression: null, errors: { targetReps: 'Enter whole reps, 1 or more.' } }
  }
  return { progression: { targetReps: reps, mode }, errors: {} }
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
 * Values of the exercise form, as typed.
 * @typedef {object} ExerciseFormValues
 * @property {string} name
 * @property {boolean} hasRule Whether a progression rule is added.
 * @property {string} targetReps
 * @property {'all'|'any'} mode
 */

/**
 * Checks the whole exercise form.
 *
 * @param {ExerciseFormValues} values
 * @param {import('./model.js').Exercise[]} exercises Existing exercises, for the duplicate check.
 * @param {string} [ignoreId] Exercise being edited.
 * @returns {{
 *   errors: { name?: string, targetReps?: string },
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
