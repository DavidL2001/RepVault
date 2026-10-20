import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes.js'
import { personalBests } from '../lib/calculations.js'
import { exerciseSessions } from '../lib/history.js'
import { progressPoints } from '../lib/progress.js'
import { evaluateProgression } from '../lib/progression.js'
import { deleteExercise, renameExercise, updateExerciseProgression } from '../state/actions.js'
import { useAppState } from './useAppState.js'

/**
 * One exercise with its history, progress, personal bests and the things that can be changed.
 *
 * @param {string} exerciseId
 */
export function useExerciseDetail(exerciseId) {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const { exercises, workouts, activeWorkout } = state
  const exercise = exercises.find((item) => item.id === exerciseId) ?? null

  const sessions = useMemo(() => exerciseSessions(workouts, exerciseId), [workouts, exerciseId])
  const points = useMemo(() => progressPoints(sessions), [sessions])
  const bests = useMemo(
    () => personalBests(sessions.flatMap((session) => session.sets)),
    [sessions],
  )

  return {
    exercise,
    /** All of the user's exercises, for the rename duplicate check. */
    exercises,
    /** Finished workouts with this exercise, newest first. */
    sessions,
    /** Chart points, oldest first. */
    points,
    bests,
    /** What the rule says about the last session, or `null` without a rule or history. */
    progression: exercise
      ? evaluateProgression(exercise.progression, sessions[0]?.sets ?? [])
      : null,
    inActiveWorkout:
      activeWorkout?.entries.some((entry) => entry.exerciseId === exerciseId) ?? false,

    rename: (name) => dispatch(renameExercise(exerciseId, name)),
    saveRule: (rule) => dispatch(updateExerciseProgression(exerciseId, rule)),
    removeRule: () => dispatch(updateExerciseProgression(exerciseId, null)),

    /** Deletes the exercise with its history and goes back to the list. */
    remove() {
      dispatch(deleteExercise(exerciseId))
      navigate(ROUTES.exercises, { replace: true })
    },
  }
}
