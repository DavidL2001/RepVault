import { createId } from './ids.js'

// Rules for workout sessions.

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
