import { useMemo } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes.js'
import { exerciseProgression } from '../lib/progression.js'
import { countSets, templateNeedsUpdate, workoutExerciseIds } from '../lib/workouts.js'
import {
  addExercise,
  addWorkoutExercise,
  discardWorkout,
  endWorkout,
  moveWorkoutExercise,
  removeWorkoutExercise,
  updateTemplateExercises,
} from '../state/actions.js'
import { useAppState } from './useAppState.js'

/**
 * The workout in progress and everything that can be done to it.
 *
 * @returns {{
 *   workout: import('../lib/model.js').WorkoutSession|null,
 *   template: import('../lib/model.js').Template|null,
 *   rows: { exercise: import('../lib/model.js').Exercise, sets: object[], dueForIncrease: boolean }[],
 *   setCount: number,
 *   templateNeedsUpdate: boolean,
 *   addExercise: (exerciseId: string) => void,
 *   createAndAddExercise: (fields: object) => void,
 *   removeExercise: (exerciseId: string) => void,
 *   moveExercise: (exerciseId: string, offset: -1|1) => void,
 *   end: (options: { updateTemplate: boolean }) => void,
 *   discard: () => void,
 * }}
 */
export function useActiveWorkout() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const { activeWorkout: workout, exercises, templates, workouts } = state

  // The template may have been deleted since the workout started.
  const template = templates.find((item) => item.id === workout?.templateId) ?? null

  const rows = useMemo(() => {
    if (!workout) return []
    const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]))
    return workout.entries
      .filter((entry) => byId.has(entry.exerciseId))
      .map((entry) => {
        const exercise = byId.get(entry.exerciseId)
        return {
          exercise,
          sets: entry.sets,
          dueForIncrease: exerciseProgression(exercise, workouts)?.shouldIncrease ?? false,
        }
      })
  }, [workout, exercises, workouts])

  return {
    workout,
    template,
    rows,
    setCount: workout ? countSets(workout) : 0,
    templateNeedsUpdate: workout ? templateNeedsUpdate(template, workout) : false,

    addExercise: (exerciseId) => dispatch(addWorkoutExercise(exerciseId)),

    /** Creates a new exercise and adds it to the workout. */
    createAndAddExercise(fields) {
      const action = addExercise(fields)
      dispatch(action)
      dispatch(addWorkoutExercise(action.exercise.id))
    },

    removeExercise: (exerciseId) => dispatch(removeWorkoutExercise(exerciseId)),
    moveExercise: (exerciseId, offset) => dispatch(moveWorkoutExercise(exerciseId, offset)),

    /** Saves the workout (optionally its exercises to the template too) and opens the summary. */
    end({ updateTemplate }) {
      if (updateTemplate && template) {
        dispatch(updateTemplateExercises(template.id, workoutExerciseIds(workout)))
      }
      dispatch(endWorkout())
      // Replace, so Back from the summary doesn't return to an empty workout page.
      navigate(generatePath(ROUTES.workoutSummary, { workoutId: workout.id }), { replace: true })
    },

    /** Throws the workout away and goes Home. */
    discard() {
      dispatch(discardWorkout())
      navigate(ROUTES.home, { replace: true })
    },
  }
}
