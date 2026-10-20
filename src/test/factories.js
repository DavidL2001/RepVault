// Builders for test data in the shapes from `lib/model.js`. Only used by tests.

/**
 * @param {number} kg
 * @param {number} reps
 * @returns {import('../lib/model.js').WorkoutSet}
 */
export function makeSet(kg, reps) {
  return { kg, reps, timestamp: '2026-10-20T17:00:00.000Z' }
}

/**
 * A finished workout. `entries` maps exercise ids to `[kg, reps]` pairs.
 *
 * @param {object} options
 * @param {string} options.id
 * @param {string} options.startedAt ISO date.
 * @param {Record<string, [number, number][]>} [options.entries]
 * @returns {import('../lib/model.js').WorkoutSession}
 */
export function makeWorkout({ id, startedAt, entries = {} }) {
  return {
    id,
    templateId: null,
    name: `Workout ${id}`,
    startedAt,
    endedAt: startedAt,
    entries: Object.entries(entries).map(([exerciseId, sets]) => ({
      exerciseId,
      sets: sets.map(([kg, reps]) => makeSet(kg, reps)),
    })),
  }
}
