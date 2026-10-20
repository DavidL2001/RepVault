import { useMemo } from 'react'
import { sessionRecords } from '../lib/calculations.js'
import { formatNumberInput } from '../lib/format.js'
import { exerciseSets, lastSession } from '../lib/history.js'
import { evaluateProgression } from '../lib/progression.js'
import { initialSetValues } from '../lib/sets.js'
import { editSet, logSet, removeSet } from '../state/actions.js'
import { useAppState } from './useAppState.js'

/** @param {number|null} value */
const toField = (value) => (value === null ? '' : formatNumberInput(value))

/**
 * Everything the Set Logger shows and does for one exercise in the workout in progress.
 *
 * @param {string} exerciseId
 */
export function useSetLogger(exerciseId) {
  const { state, dispatch } = useAppState()
  const { activeWorkout: workout, exercises, workouts } = state
  const exercise = exercises.find((item) => item.id === exerciseId) ?? null

  const sessionSets = useMemo(
    () => workout?.entries.find((entry) => entry.exerciseId === exerciseId)?.sets ?? [],
    [workout, exerciseId],
  )
  const history = useMemo(
    () => ({
      last: lastSession(workouts, exerciseId),
      sets: exerciseSets(workouts, exerciseId),
    }),
    [workouts, exerciseId],
  )
  const records = useMemo(
    () => sessionRecords(sessionSets, history.sets),
    [sessionSets, history.sets],
  )

  const lastSets = history.last?.sets ?? []
  const progression = exercise ? evaluateProgression(exercise.progression, lastSets) : null
  const initial = initialSetValues({ sessionSets, lastSessionSets: lastSets, progression })

  return {
    workout,
    exercise,
    sessionSets,
    /** Record types per set of this session (see `sessionRecords`). */
    records,
    /** The last finished workout with this exercise, or `null`. */
    lastSession: history.last,
    progression,
    /** Pre-filled field values, as text. */
    initialFields: { kg: toField(initial.kg), reps: toField(initial.reps) },

    /**
     * Logs a set now. Returns its number and the records it breaks, for the announcement.
     *
     * @param {{ kg: number, reps: number }} fields
     */
    log(fields) {
      const action = logSet(exerciseId, fields)
      dispatch(action)
      return {
        number: sessionSets.length + 1,
        records: sessionRecords([...sessionSets, action.set], history.sets).at(-1),
      }
    },
    edit: (index, fields) => dispatch(editSet(exerciseId, index, fields)),
    remove: (index) => dispatch(removeSet(exerciseId, index)),
  }
}
