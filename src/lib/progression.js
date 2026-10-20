import { PROGRESSION_MODES } from '../constants/defaults.js'
import { lastSession } from './history.js'
import { formatKg, roundNumber } from './numbers.js'

/**
 * Outcome of checking a progression rule against the last session.
 * @typedef {object} ProgressionResult
 * @property {boolean} shouldIncrease Whether the rule was met, so it's time to go heavier.
 * @property {number} lastKg Heaviest weight used last session.
 * @property {number} nextKg Suggested weight: `lastKg + stepKg` when increasing, else `lastKg`.
 * @property {number} targetReps
 */

/**
 * Checks a progression rule against the sets of the last session.
 * Only sets at the heaviest weight count: with mode `all` every one of them must
 * hit the target reps, with mode `any` one is enough.
 *
 * @param {import('./model.js').Progression|null} rule
 * @param {import('./model.js').WorkoutSet[]} sets Sets of the exercise from its last session.
 * @returns {ProgressionResult|null} `null` without a rule or without sets to check.
 */
export function evaluateProgression(rule, sets) {
  if (!rule || sets.length === 0) return null

  const lastKg = Math.max(...sets.map((set) => set.kg))
  const topSets = sets.filter((set) => set.kg === lastKg)
  const hitTarget = (set) => set.reps >= rule.targetReps
  const shouldIncrease =
    rule.mode === PROGRESSION_MODES.any ? topSets.some(hitTarget) : topSets.every(hitTarget)

  return {
    shouldIncrease,
    lastKg,
    nextKg: shouldIncrease ? roundNumber(lastKg + rule.stepKg) : lastKg,
    targetReps: rule.targetReps,
  }
}

/**
 * Progression for an exercise, based on its last finished workout.
 * Used for the ⬆ marker, the Set Logger banner and the pre-filled weight.
 *
 * @param {import('./model.js').Exercise} exercise
 * @param {import('./model.js').WorkoutSession[]} workouts Finished workouts.
 * @returns {ProgressionResult|null}
 */
export function exerciseProgression(exercise, workouts) {
  return evaluateProgression(exercise.progression, lastSession(workouts, exercise.id)?.sets ?? [])
}

/**
 * Banner text for a progression result:
 * "Go heavier: 45 kg (you hit 8+ reps at 40 kg last time)" or "Stay at 40 kg — aim for 8+ reps".
 *
 * @param {ProgressionResult} result
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {string}
 */
export function progressionMessage({ shouldIncrease, lastKg, nextKg, targetReps }, locale) {
  const target = `${targetReps}+ reps`
  return shouldIncrease
    ? `Go heavier: ${formatKg(nextKg, locale)} (you hit ${target} at ${formatKg(lastKg, locale)} last time)`
    : `Stay at ${formatKg(lastKg, locale)} — aim for ${target}`
}
