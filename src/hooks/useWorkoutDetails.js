import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes.js'
import { sessionRecords } from '../lib/calculations.js'
import { exerciseSets, workoutsBefore } from '../lib/history.js'
import { workoutSummary } from '../lib/summary.js'
import { deletePastWorkout, editPastSet, removePastSet } from '../state/actions.js'
import { useAppState } from './useAppState.js'

/**
 * One finished workout: its summary, every exercise with its sets (and the records
 * they set at the time), and fixing or deleting sets or the whole workout.
 *
 * @param {string} workoutId
 */
export function useWorkoutDetails(workoutId) {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const { workouts, exercises } = state

  const details = useMemo(() => {
    const workout = workouts.find((item) => item.id === workoutId) ?? null
    if (!workout) return { workout: null, summary: null, entries: [] }

    const earlier = workoutsBefore(workout, workouts)
    const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]))
    return {
      workout,
      summary: workoutSummary(workout, workouts, exercises),
      entries: workout.entries
        .filter((entry) => byId.has(entry.exerciseId))
        .map((entry) => ({
          exercise: byId.get(entry.exerciseId),
          sets: entry.sets,
          records: sessionRecords(entry.sets, exerciseSets(earlier, entry.exerciseId)),
        })),
    }
  }, [workouts, exercises, workoutId])

  const goToHistory = () => navigate(ROUTES.history, { replace: true })

  return {
    ...details,

    editSet: (exerciseId, index, fields) =>
      dispatch(editPastSet(workoutId, exerciseId, index, fields)),

    /** Deletes a set; when it was the workout's last set, the workout goes too. */
    removeSet(exerciseId, index) {
      const wasLastSet = details.summary?.setCount === 1
      dispatch(removePastSet(workoutId, exerciseId, index))
      if (wasLastSet) goToHistory()
    },

    /** Deletes the whole workout and goes back to History. */
    deleteWorkout() {
      dispatch(deletePastWorkout(workoutId))
      goToHistory()
    },
  }
}
