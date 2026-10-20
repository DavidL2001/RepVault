import { useMemo } from 'react'
import { workoutSummary } from '../lib/summary.js'
import { useAppState } from './useAppState.js'

/**
 * A finished workout and its summary (duration, totals, new records, next time).
 *
 * @param {string} workoutId
 * @returns {{ workout: import('../lib/model.js').WorkoutSession|null, summary: ReturnType<typeof workoutSummary>|null }}
 *   Both `null` when there is no finished workout with that id.
 */
export function useWorkoutSummary(workoutId) {
  const { state } = useAppState()
  const { workouts, exercises } = state

  return useMemo(() => {
    const workout = workouts.find((item) => item.id === workoutId) ?? null
    return { workout, summary: workout ? workoutSummary(workout, workouts, exercises) : null }
  }, [workouts, exercises, workoutId])
}
