import { useMemo } from 'react'
import { workoutVolume } from '../lib/calculations.js'
import { groupByMonth, trainingCalendar } from '../lib/calendar.js'
import { useAppState } from './useAppState.js'

/**
 * The History page data: the training calendar and finished workouts grouped by month,
 * each with its exercise count and volume.
 */
export function useHistory() {
  const { state } = useAppState()
  const { workouts } = state

  return useMemo(
    () => ({
      calendar: trainingCalendar(workouts),
      months: groupByMonth(workouts).map((month) => ({
        ...month,
        workouts: month.workouts.map((workout) => ({
          workout,
          exerciseCount: workout.entries.length,
          volume: workoutVolume(workout),
        })),
      })),
      total: workouts.length,
    }),
    [workouts],
  )
}
