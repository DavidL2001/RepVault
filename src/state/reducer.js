import { removeExerciseEverywhere } from '../lib/exercises.js'
import { createInitialData } from '../lib/model.js'
import {
  addEntry,
  addSet,
  countSets,
  deleteSet,
  finishWorkout,
  moveEntry,
  removeEmptyEntries,
  removeEntry,
  updateSet,
} from '../lib/workouts.js'
import { ACTION_TYPES } from './actions.js'

/**
 * Applies changes to the item with this id, in a new list.
 *
 * @template {{ id: string }} T
 * @param {T[]} items
 * @param {string} id
 * @param {Partial<T>} changes
 * @returns {T[]}
 */
function updateById(items, id, changes) {
  return items.map((item) => (item.id === id ? { ...item, ...changes } : item))
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
 * Changes one finished workout. A workout left without exercises is deleted,
 * like a workout that ends without sets.
 *
 * @param {import('../lib/model.js').AppData} state
 * @param {string} workoutId
 * @param {(workout: import('../lib/model.js').WorkoutSession) => import('../lib/model.js').WorkoutSession} change
 */
function updatePastWorkout(state, workoutId, change) {
  return {
    ...state,
    workouts: state.workouts
      .map((workout) => (workout.id === workoutId ? change(workout) : workout))
      .filter((workout) => workout.entries.length > 0),
  }
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

    case ACTION_TYPES.exerciseRenamed:
      return { ...state, exercises: updateById(state.exercises, action.id, { name: action.name }) }

    case ACTION_TYPES.exerciseProgressionUpdated:
      return {
        ...state,
        exercises: updateById(state.exercises, action.id, { progression: action.progression }),
      }

    case ACTION_TYPES.exerciseDeleted:
      return removeExerciseEverywhere(state, action.id)

    case ACTION_TYPES.templateAdded:
      return { ...state, templates: [...state.templates, action.template] }

    case ACTION_TYPES.templateRenamed:
      return { ...state, templates: updateById(state.templates, action.id, { name: action.name }) }

    case ACTION_TYPES.templateExercisesUpdated:
      return {
        ...state,
        templates: updateById(state.templates, action.id, { exerciseIds: action.exerciseIds }),
      }

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

    case ACTION_TYPES.pastSetUpdated:
      return updatePastWorkout(state, action.workoutId, (workout) =>
        updateSet(workout, action.exerciseId, action.index, action.changes),
      )

    case ACTION_TYPES.pastSetDeleted:
      return updatePastWorkout(state, action.workoutId, (workout) =>
        removeEmptyEntries(deleteSet(workout, action.exerciseId, action.index)),
      )

    case ACTION_TYPES.pastWorkoutDeleted:
      return {
        ...state,
        workouts: state.workouts.filter((workout) => workout.id !== action.workoutId),
      }

    case ACTION_TYPES.settingsUpdated:
      return { ...state, settings: { ...state.settings, ...action.changes } }

    case ACTION_TYPES.dataReset:
      return createInitialData()

    case ACTION_TYPES.dataImported:
      return action.data

    default:
      // Fail loudly: a typo in an action type would otherwise silently do nothing.
      throw new Error(`Unknown action type: ${action.type}`)
  }
}
