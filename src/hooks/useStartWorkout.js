import { useNavigate } from 'react-router-dom'
import { DEFAULT_WORKOUT_NAME } from '../constants/defaults.js'
import { ROUTES } from '../constants/routes.js'
import { existingExerciseIds } from '../lib/templates.js'
import { addTemplate, startWorkout } from '../state/actions.js'
import { useAppState } from './useAppState.js'

/**
 * Ways to start a workout. Each one records the start time and opens Active Workout.
 * Starting does nothing while another workout is in progress (check `activeWorkout`).
 */
export function useStartWorkout() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()

  function start(fields) {
    dispatch(startWorkout(fields))
    navigate(ROUTES.activeWorkout)
  }

  /** Starts a workout from a template, with the template's exercises pre-listed. */
  function startFromTemplate(template) {
    start({
      name: template.name,
      templateId: template.id,
      exerciseIds: existingExerciseIds(template, state.exercises),
    })
  }

  return {
    /** The workout in progress, or `null`. */
    activeWorkout: state.activeWorkout,
    startFromTemplate,
    /** Starts a workout without a template. */
    startEmpty: () => start({ name: DEFAULT_WORKOUT_NAME }),
    /** Creates an empty template with this name and starts a workout from it. */
    createTemplateAndStart(name) {
      const action = addTemplate(name)
      dispatch(action)
      startFromTemplate(action.template)
    },
  }
}
