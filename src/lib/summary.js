import { PR_TYPES } from '../constants/calculations.js'
import { sessionRecords, setOneRepMax, workoutVolume } from './calculations.js'
import { exerciseSets, workoutsBefore } from './history.js'
import { evaluateProgression } from './progression.js'
import { countSets } from './workouts.js'

/**
 * A personal record set in a workout, per exercise.
 * @typedef {object} WorkoutRecord
 * @property {import('./model.js').Exercise} exercise
 * @property {string[]} types `PR_TYPES` that were broken.
 * @property {number|null} heaviestKg New heaviest weight, if that record was broken.
 * @property {number|null} bestOneRepMax New best estimated 1RM, if that record was broken.
 */

/**
 * Everything the Workout Summary shows for one finished workout.
 * Records compare against the workouts *before* this one, so an old summary
 * still shows the records it set at the time.
 *
 * @param {import('./model.js').WorkoutSession} workout A finished workout.
 * @param {import('./model.js').WorkoutSession[]} workouts All finished workouts.
 * @param {import('./model.js').Exercise[]} exercises
 * @returns {{
 *   durationMs: number,
 *   exerciseCount: number,
 *   setCount: number,
 *   volume: number,
 *   records: WorkoutRecord[],
 *   nextTime: import('./model.js').Exercise[],
 * }} `records` and `nextTime` follow the workout's exercise order.
 */
export function workoutSummary(workout, workouts, exercises) {
  const earlier = workoutsBefore(workout, workouts)
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]))
  const records = []
  const nextTime = []

  for (const { exerciseId, sets } of workout.entries) {
    const exercise = byId.get(exerciseId)
    if (!exercise || sets.length === 0) continue

    const types = new Set(sessionRecords(sets, exerciseSets(earlier, exerciseId)).flat())
    if (types.size > 0) {
      records.push({
        exercise,
        types: [...types],
        heaviestKg: types.has(PR_TYPES.heaviest) ? Math.max(...sets.map((set) => set.kg)) : null,
        bestOneRepMax: types.has(PR_TYPES.oneRepMax) ? Math.max(...sets.map(setOneRepMax)) : null,
      })
    }

    if (evaluateProgression(exercise.progression, sets)?.shouldIncrease) nextTime.push(exercise)
  }

  return {
    durationMs: Math.max(0, Date.parse(workout.endedAt) - Date.parse(workout.startedAt)),
    exerciseCount: workout.entries.filter((entry) => entry.sets.length > 0).length,
    setCount: countSets(workout),
    volume: workoutVolume(workout),
    records,
    nextTime,
  }
}
