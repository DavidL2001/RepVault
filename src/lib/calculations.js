import { EPLEY_REPS_DIVISOR, PR_TYPES } from '../constants/calculations.js'
import { roundNumber } from './numbers.js'

// Volume, estimated 1RM, best set and personal records. Pure functions on the
// shapes from `model.js`; `sets` are WorkoutSet objects (`{ reps, kg, timestamp }`).

/**
 * Volume of one set: kg × reps.
 *
 * @param {import('./model.js').WorkoutSet} set
 * @returns {number}
 */
export function setVolume(set) {
  return roundNumber(set.kg * set.reps)
}

/**
 * Total volume of several sets.
 *
 * @param {import('./model.js').WorkoutSet[]} sets
 * @returns {number}
 */
export function totalVolume(sets) {
  return roundNumber(sets.reduce((sum, set) => sum + setVolume(set), 0))
}

/**
 * Total volume of a whole workout, across all exercises.
 *
 * @param {import('./model.js').WorkoutSession} workout
 * @returns {number}
 */
export function workoutVolume(workout) {
  return totalVolume(workout.entries.flatMap((entry) => entry.sets))
}

/**
 * Estimated one-rep max with the Epley formula: kg × (1 + reps / 30).
 * A single rep counts as the weight itself (Epley would add a bit on top).
 *
 * @param {number} kg
 * @param {number} reps
 * @returns {number} 0 when there are no reps.
 */
export function estimateOneRepMax(kg, reps) {
  if (reps <= 0) return 0
  if (reps === 1) return kg
  return roundNumber(kg * (1 + reps / EPLEY_REPS_DIVISOR))
}

/**
 * Estimated 1RM of a set.
 *
 * @param {import('./model.js').WorkoutSet} set
 * @returns {number}
 */
export function setOneRepMax(set) {
  return estimateOneRepMax(set.kg, set.reps)
}

/**
 * The best set: heaviest weight, and with a tie, the one with the most reps.
 *
 * @param {import('./model.js').WorkoutSet[]} sets
 * @returns {import('./model.js').WorkoutSet|null} `null` when there are no sets.
 */
export function bestSet(sets) {
  return sets.reduce(
    (best, set) =>
      !best || set.kg > best.kg || (set.kg === best.kg && set.reps > best.reps) ? set : best,
    null,
  )
}

/**
 * Personal bests across sets, for the Exercise Detail stats.
 *
 * @param {import('./model.js').WorkoutSet[]} sets
 * @returns {{
 *   heaviestKg: number|null,
 *   bestOneRepMax: number|null,
 *   mostRepsByWeight: { kg: number, reps: number }[],
 * }} `mostRepsByWeight` has the most reps done at each weight, heaviest first.
 *   The other values are `null` when there are no sets.
 */
export function personalBests(sets) {
  if (sets.length === 0) return { heaviestKg: null, bestOneRepMax: null, mostRepsByWeight: [] }

  const mostReps = new Map()
  for (const { kg, reps } of sets) {
    mostReps.set(kg, Math.max(mostReps.get(kg) ?? 0, reps))
  }

  return {
    heaviestKg: Math.max(...sets.map((set) => set.kg)),
    bestOneRepMax: Math.max(...sets.map(setOneRepMax)),
    mostRepsByWeight: [...mostReps].map(([kg, reps]) => ({ kg, reps })).sort((a, b) => b.kg - a.kg),
  }
}

/**
 * Which records a set breaks, compared with every set done before it.
 *
 * @param {import('./model.js').WorkoutSet} set
 * @param {import('./model.js').WorkoutSet[]} previousSets
 * @returns {string[]} `PR_TYPES` values; empty when there is nothing to beat yet.
 */
export function recordTypes(set, previousSets) {
  if (previousSets.length === 0) return []

  const types = []
  if (set.kg > Math.max(...previousSets.map((previous) => previous.kg))) {
    types.push(PR_TYPES.heaviest)
  }
  if (setOneRepMax(set) > Math.max(...previousSets.map(setOneRepMax))) {
    types.push(PR_TYPES.oneRepMax)
  }
  return types
}

/**
 * Records for each set of one exercise in one session. Each set is compared with
 * all earlier workouts plus the sets before it in this session. The first time
 * an exercise is ever done there is nothing to beat, so it has no records.
 *
 * @param {import('./model.js').WorkoutSet[]} sessionSets Sets of this session, in logged order.
 * @param {import('./model.js').WorkoutSet[]} historySets Sets of the exercise from earlier workouts.
 * @returns {string[][]} Record types per set, in the same order as `sessionSets`.
 */
export function sessionRecords(sessionSets, historySets) {
  if (historySets.length === 0) return sessionSets.map(() => [])

  return sessionSets.map((set, index) =>
    recordTypes(set, [...historySets, ...sessionSets.slice(0, index)]),
  )
}
