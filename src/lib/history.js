import { isSameWeek } from './dates.js'

// Looking things up in the list of finished workouts (`AppData.workouts`).
// The workout in progress lives in `activeWorkout`, so it is never part of the history.

/**
 * One exercise's sets in one finished workout.
 * @typedef {object} ExerciseSession
 * @property {string} workoutId
 * @property {string} startedAt
 * @property {import('./model.js').WorkoutSet[]} sets
 */

/**
 * @param {{ startedAt: string }} a
 * @param {{ startedAt: string }} b
 */
function newestFirst(a, b) {
  return Date.parse(b.startedAt) - Date.parse(a.startedAt)
}

/**
 * Every workout in which the exercise has at least one set, newest first.
 * If a workout lists the exercise more than once, its sets are combined.
 *
 * @param {import('./model.js').WorkoutSession[]} workouts
 * @param {string} exerciseId
 * @returns {ExerciseSession[]}
 */
export function exerciseSessions(workouts, exerciseId) {
  return workouts
    .map((workout) => ({
      workoutId: workout.id,
      startedAt: workout.startedAt,
      sets: workout.entries
        .filter((entry) => entry.exerciseId === exerciseId)
        .flatMap((entry) => entry.sets),
    }))
    .filter((session) => session.sets.length > 0)
    .sort(newestFirst)
}

/**
 * The most recent workout with sets for the exercise ("last time").
 *
 * @param {import('./model.js').WorkoutSession[]} workouts
 * @param {string} exerciseId
 * @returns {ExerciseSession|null}
 */
export function lastSession(workouts, exerciseId) {
  return exerciseSessions(workouts, exerciseId)[0] ?? null
}

/**
 * All sets ever done for the exercise, oldest workout first.
 *
 * @param {import('./model.js').WorkoutSession[]} workouts
 * @param {string} exerciseId
 * @returns {import('./model.js').WorkoutSet[]}
 */
export function exerciseSets(workouts, exerciseId) {
  return exerciseSessions(workouts, exerciseId)
    .reverse()
    .flatMap((session) => session.sets)
}

/**
 * Number of workouts started in the same week as `now` (weeks start on Monday).
 *
 * @param {import('./model.js').WorkoutSession[]} workouts
 * @param {Date} [now]
 * @returns {number}
 */
export function workoutsThisWeek(workouts, now = new Date()) {
  return workouts.filter((workout) => isSameWeek(workout.startedAt, now)).length
}
