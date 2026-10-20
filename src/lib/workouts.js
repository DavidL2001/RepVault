import { createId } from './ids.js'

// Rules for workout sessions. All functions return new objects; nothing is changed in place.

/**
 * A new workout session, started now. Its exercises start without sets.
 *
 * @param {{ name: string, templateId?: string|null, exerciseIds?: string[] }} fields
 * @param {{ id?: string, now?: Date }} [options] For tests.
 * @returns {import('./model.js').WorkoutSession}
 */
export function createWorkout(
  { name, templateId = null, exerciseIds = [] },
  { id = createId(), now = new Date() } = {},
) {
  return {
    id,
    templateId,
    name,
    startedAt: now.toISOString(),
    endedAt: null,
    entries: exerciseIds.map((exerciseId) => ({ exerciseId, sets: [] })),
  }
}

/**
 * The workout's exercise ids, in order.
 *
 * @param {import('./model.js').WorkoutSession} workout
 * @returns {string[]}
 */
export function workoutExerciseIds(workout) {
  return workout.entries.map((entry) => entry.exerciseId)
}

/**
 * Adds an exercise at the end. An exercise that is already in the workout isn't added twice.
 *
 * @param {import('./model.js').WorkoutSession} workout
 * @param {string} exerciseId
 * @returns {import('./model.js').WorkoutSession}
 */
export function addEntry(workout, exerciseId) {
  if (workout.entries.some((entry) => entry.exerciseId === exerciseId)) return workout
  return { ...workout, entries: [...workout.entries, { exerciseId, sets: [] }] }
}

/**
 * Removes an exercise and its sets from the workout.
 *
 * @param {import('./model.js').WorkoutSession} workout
 * @param {string} exerciseId
 * @returns {import('./model.js').WorkoutSession}
 */
export function removeEntry(workout, exerciseId) {
  return { ...workout, entries: workout.entries.filter((entry) => entry.exerciseId !== exerciseId) }
}

/**
 * Moves an exercise up (`-1`) or down (`1`) in the list.
 *
 * @param {import('./model.js').WorkoutSession} workout
 * @param {string} exerciseId
 * @param {-1|1} offset
 * @returns {import('./model.js').WorkoutSession} Unchanged when the move would leave the list.
 */
export function moveEntry(workout, exerciseId, offset) {
  const from = workout.entries.findIndex((entry) => entry.exerciseId === exerciseId)
  const to = from + offset
  if (from === -1 || to < 0 || to >= workout.entries.length) return workout

  const entries = [...workout.entries]
  ;[entries[from], entries[to]] = [entries[to], entries[from]]
  return { ...workout, entries }
}

/**
 * Number of sets logged in the workout.
 *
 * @param {import('./model.js').WorkoutSession} workout
 * @returns {number}
 */
export function countSets(workout) {
  return workout.entries.reduce((sum, entry) => sum + entry.sets.length, 0)
}

/**
 * The workout as saved when it ends: with its end time, and only the exercises
 * that got at least one set.
 *
 * @param {import('./model.js').WorkoutSession} workout
 * @param {Date} [now]
 * @returns {import('./model.js').WorkoutSession}
 */
export function finishWorkout(workout, now = new Date()) {
  return {
    ...workout,
    endedAt: now.toISOString(),
    entries: workout.entries.filter((entry) => entry.sets.length > 0),
  }
}

/**
 * Whether the workout's exercise list differs from its template's
 * (an exercise added or removed, or a new order).
 *
 * @param {import('./model.js').Template|null} template
 * @param {import('./model.js').WorkoutSession} workout
 * @returns {boolean} `false` without a template.
 */
export function templateNeedsUpdate(template, workout) {
  if (!template) return false
  const ids = workoutExerciseIds(workout)
  return (
    ids.length !== template.exerciseIds.length ||
    ids.some((id, index) => id !== template.exerciseIds[index])
  )
}

/**
 * Changes the sets of one exercise in the workout.
 *
 * @param {import('./model.js').WorkoutSession} workout
 * @param {string} exerciseId
 * @param {(sets: import('./model.js').WorkoutSet[]) => import('./model.js').WorkoutSet[]} change
 * @returns {import('./model.js').WorkoutSession}
 */
function updateSets(workout, exerciseId, change) {
  return {
    ...workout,
    entries: workout.entries.map((entry) =>
      entry.exerciseId === exerciseId ? { ...entry, sets: change(entry.sets) } : entry,
    ),
  }
}

/**
 * Adds a set to an exercise. The exercise is added to the workout first if it isn't in it.
 *
 * @param {import('./model.js').WorkoutSession} workout
 * @param {string} exerciseId
 * @param {import('./model.js').WorkoutSet} set
 * @returns {import('./model.js').WorkoutSession}
 */
export function addSet(workout, exerciseId, set) {
  return updateSets(addEntry(workout, exerciseId), exerciseId, (sets) => [...sets, set])
}

/**
 * Changes the weight and/or reps of one set, keeping when it was logged.
 *
 * @param {import('./model.js').WorkoutSession} workout
 * @param {string} exerciseId
 * @param {number} index Position of the set, from 0.
 * @param {{ kg?: number, reps?: number }} changes
 * @returns {import('./model.js').WorkoutSession}
 */
export function updateSet(workout, exerciseId, index, changes) {
  return updateSets(workout, exerciseId, (sets) =>
    sets.map((set, i) => (i === index ? { ...set, ...changes } : set)),
  )
}

/**
 * Deletes one set.
 *
 * @param {import('./model.js').WorkoutSession} workout
 * @param {string} exerciseId
 * @param {number} index Position of the set, from 0.
 * @returns {import('./model.js').WorkoutSession}
 */
export function deleteSet(workout, exerciseId, index) {
  return updateSets(workout, exerciseId, (sets) => sets.filter((_, i) => i !== index))
}
