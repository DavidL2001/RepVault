/**
 * Every route path in the app, in one place.
 * Build links to routes with params using react-router's `generatePath`,
 * e.g. `generatePath(ROUTES.exerciseDetail, { id })`.
 */
export const ROUTES = {
  home: '/',
  startWorkout: '/start',
  activeWorkout: '/workout',
  setLogger: '/workout/log/:exerciseId',
  workoutSummary: '/summary/:workoutId',
  exercises: '/exercises',
  exerciseDetail: '/exercise/:id',
  history: '/history',
  workoutDetails: '/history/:id',
  settings: '/settings',
  // Dev only: not registered in production builds.
  designPreview: '/dev/design',
}
