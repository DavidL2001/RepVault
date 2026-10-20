import { useMemo } from 'react'
import { exerciseSummary } from '../lib/exercises.js'
import { searchByName, sortByName } from '../lib/names.js'
import { useAppState } from './useAppState.js'

/**
 * The user's exercises, alphabetical and filtered by a search text, each with
 * its best set from last time and whether it's due for a weight increase.
 *
 * @param {string} query Search text; empty shows all.
 * @returns {{
 *   items: { exercise: import('../lib/model.js').Exercise, bestSet: object|null, dueForIncrease: boolean }[],
 *   total: number,
 * }} `total` counts all exercises, ignoring the search.
 */
export function useExerciseList(query) {
  const { state } = useAppState()
  const { exercises, workouts } = state

  return useMemo(
    () => ({
      items: searchByName(sortByName(exercises), query).map((exercise) => ({
        exercise,
        ...exerciseSummary(exercise, workouts),
      })),
      total: exercises.length,
    }),
    [exercises, workouts, query],
  )
}
