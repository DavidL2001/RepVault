import { useMemo } from 'react'
import { groupByMonth, trainingCalendar } from '../lib/calendar.js'
import { useAppState } from './useAppState.js'

/** The History page data: the training calendar and finished workouts grouped by month. */
export function useHistory() {
  const { state } = useAppState()
  const { workouts } = state

  return useMemo(
    () => ({
      calendar: trainingCalendar(workouts),
      months: groupByMonth(workouts),
      total: workouts.length,
    }),
    [workouts],
  )
}
