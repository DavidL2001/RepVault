import { createId } from './ids.js'
import { normalizeName, validateName } from './names.js'

// Rules for workout templates ("Leg day"): a name and an ordered list of exercises.

/**
 * A new template.
 *
 * @param {string} name
 * @param {{ id?: string, exerciseIds?: string[] }} [options]
 * @returns {import('./model.js').Template}
 */
export function createTemplate(name, { id = createId(), exerciseIds = [] } = {}) {
  return { id, name: normalizeName(name), exerciseIds }
}

/**
 * Error message for a template name, or `null` when it is fine.
 *
 * @param {string} name
 * @param {import('./model.js').Template[]} templates
 * @param {string} [ignoreId] Template being renamed.
 * @returns {string|null}
 */
export function validateTemplateName(name, templates, ignoreId) {
  return validateName(name, templates, 'a template', ignoreId)
}

/**
 * The template's exercises that still exist (an exercise may have been deleted since).
 *
 * @param {import('./model.js').Template} template
 * @param {import('./model.js').Exercise[]} exercises
 * @returns {string[]} Exercise ids, in the template's order.
 */
export function existingExerciseIds(template, exercises) {
  const ids = new Set(exercises.map((exercise) => exercise.id))
  return template.exerciseIds.filter((id) => ids.has(id))
}

/**
 * What a template card shows: how many exercises, and when it was last used.
 *
 * @param {import('./model.js').Template} template
 * @param {import('./model.js').Exercise[]} exercises
 * @param {import('./model.js').WorkoutSession[]} workouts Finished workouts.
 * @returns {{ exerciseCount: number, lastUsedAt: string|null }}
 */
export function templateSummary(template, exercises, workouts) {
  const lastUsed = workouts
    .filter((workout) => workout.templateId === template.id)
    .reduce(
      (latest, workout) =>
        !latest || Date.parse(workout.startedAt) > Date.parse(latest) ? workout.startedAt : latest,
      null,
    )
  return { exerciseCount: existingExerciseIds(template, exercises).length, lastUsedAt: lastUsed }
}
