import { createInitialData } from '../lib/model.js'
import {
  addEntry,
  addSet,
  countSets,
  deleteSet,
  finishWorkout,
  moveEntry,
  removeEntry,
  updateSet,
} from '../lib/workouts.js'
import { ACTION_TYPES } from './actions.js'

/**
 * Applies changes to one template.
 *
 * @param {import('../lib/model.js').AppData} state
 * @param {string} id
 * @param {Partial<import('../lib/model.js').Template>} changes
 */
function updateTemplate(state, id, changes) {
  return {
    ...state,
    templates: state.templates.map((template) =>
      template.id === id ? { ...template, ...changes } : template,
    ),
  }
}

/**
 * Changes the workout in progress. Does nothing when there is none.
 *
 * @param {import('../lib/model.js').AppData} state
 * @param {(workout: import('../lib/model.js').WorkoutSession) => import('../lib/model.js').WorkoutSession} change
 */
function updateActiveWorkout(state, change) {
  if (!state.activeWorkout) return state
  return { ...state, activeWorkout: change(state.activeWorkout) }
}

/**
 * The app reducer: returns the next state for an action, without changing the old one.
 *
 * @param {import('../lib/model.js').AppData} state
 * @param {{ type: string }} action Created with the helpers in `actions.js`.
 * @returns {import('../lib/model.js').AppData}
 */
export function appReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.exerciseAdded:
      return { ...state, exercises: [...state.exercises, action.exercise] }

    case ACTION_TYPES.templateAdded:
      return { ...state, templates: [...state.templates, action.template] }

    case ACTION_TYPES.templateRenamed:
      return updateTemplate(state, action.id, { name: action.name })

    case ACTION_TYPES.templateExercisesUpdated:
      return updateTemplate(state, action.id, { exerciseIds: action.exerciseIds })

    case ACTION_TYPES.templateDeleted:
      return {
        ...state,
        templates: state.templates.filter((template) => template.id !== action.id),
      }

    case ACTION_TYPES.workoutStarted:
      // Never replace a workout in progress: it would be lost.
      if (state.activeWorkout) return state
      return { ...state, activeWorkout: action.workout }

    case ACTION_TYPES.workoutExerciseAdded:
      return updateActiveWorkout(state, (workout) => addEntry(workout, action.exerciseId))

    case ACTION_TYPES.workoutExerciseRemoved:
      return updateActiveWorkout(state, (workout) => removeEntry(workout, action.exerciseId))

    case ACTION_TYPES.workoutExerciseMoved:
      return updateActiveWorkout(state, (workout) =>
        moveEntry(workout, action.exerciseId, action.offset),
      )

    case ACTION_TYPES.setLogged:
      return updateActiveWorkout(state, (workout) => addSet(workout, action.exerciseId, action.set))

    case ACTION_TYPES.setUpdated:
      return updateActiveWorkout(state, (workout) =>
        updateSet(workout, action.exerciseId, action.index, action.changes),
      )

    case ACTION_TYPES.setDeleted:
      return updateActiveWorkout(state, (workout) =>
        deleteSet(workout, action.exerciseId, action.index),
      )

    case ACTION_TYPES.workoutEnded: {
      if (!state.activeWorkout) return state
      // A workout without sets isn't worth keeping in the history.
      if (countSets(state.activeWorkout) === 0) return { ...state, activeWorkout: null }
      const finished = finishWorkout(state.activeWorkout, action.endedAt)
      return { ...state, activeWorkout: null, workouts: [...state.workouts, finished] }
    }

    case ACTION_TYPES.workoutDiscarded:
      return { ...state, activeWorkout: null }

    case ACTION_TYPES.settingsUpdated:
      return { ...state, settings: { ...state.settings, ...action.changes } }

    case ACTION_TYPES.dataReset:
      return createInitialData()

    default:
      // Fail loudly: a typo in an action type would otherwise silently do nothing.
      throw new Error(`Unknown action type: ${action.type}`)
  }
}
