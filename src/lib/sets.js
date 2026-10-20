import { parseDecimal } from './numbers.js'

// Rules for single sets: creating, validating and pre-filling them.

/**
 * A new set, logged now.
 *
 * @param {{ kg: number, reps: number }} fields
 * @param {Date} [now]
 * @returns {import('./model.js').WorkoutSet}
 */
export function createSet({ kg, reps }, now = new Date()) {
  return { kg, reps, timestamp: now.toISOString() }
}

/**
 * Turns the set fields (as typed) into numbers, or errors per field.
 * Weight may be 0 (bodyweight); reps must be a whole number of at least 1.
 *
 * @param {{ kg: string, reps: string }} fields
 * @returns {{ values: { kg: number, reps: number }|null, errors: { kg?: string, reps?: string } }}
 *   `values` is `null` when there are errors.
 */
export function parseSetFields(fields) {
  const kg = parseDecimal(fields.kg)
  const reps = parseDecimal(fields.reps)
  const errors = {}

  if (Number.isNaN(kg) || kg < 0) errors.kg = 'Enter a weight of 0 kg or more.'
  if (!Number.isInteger(reps) || reps < 1) errors.reps = 'Enter whole reps, 1 or more.'

  if (Object.keys(errors).length > 0) return { values: null, errors }
  return { values: { kg, reps }, errors }
}

/**
 * Values to pre-fill the set fields with:
 * 1. the last set logged today, so every next set starts from the one before
 * 2. with a progression rule: last time's heaviest weight and the target reps
 *    (when it says "Go heavier", the user picks the new weight from there with +)
 * 3. otherwise: the first set from last time
 *
 * @param {object} options
 * @param {import('./model.js').WorkoutSet[]} options.sessionSets Sets logged in this workout.
 * @param {import('./model.js').WorkoutSet[]} options.lastSessionSets Sets from last time.
 * @param {import('./progression.js').ProgressionResult|null} options.progression
 * @returns {{ kg: number|null, reps: number|null }} `null` when there is nothing to go on.
 */
export function initialSetValues({ sessionSets, lastSessionSets, progression }) {
  const lastToday = sessionSets.at(-1)
  if (lastToday) return { kg: lastToday.kg, reps: lastToday.reps }
  if (progression) return { kg: progression.lastKg, reps: progression.targetReps }
  const firstLastTime = lastSessionSets[0]
  if (firstLastTime) return { kg: firstLastTime.kg, reps: firstLastTime.reps }
  return { kg: null, reps: null }
}
