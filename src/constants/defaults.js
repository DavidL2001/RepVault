/** How a progression rule checks the sets at the heaviest weight of a session. */
export const PROGRESSION_MODES = {
  /** Every set at the heaviest weight hit the target reps. */
  all: 'all',
  /** At least one set at the heaviest weight hit the target reps. */
  any: 'any',
}

/** Values pre-filled when the user adds a progression rule to an exercise. */
export const DEFAULT_PROGRESSION = {
  targetReps: 8,
  mode: PROGRESSION_MODES.all,
}

/** How much the − / + buttons change the progression rule fields. */
export const PROGRESSION_STEPPER = {
  targetReps: { step: 1, min: 1 },
}

/** Name of a workout started without a template. */
export const DEFAULT_WORKOUT_NAME = 'Workout'

/** Show the backup reminder when the last export is older than this. */
export const BACKUP_REMINDER_DAYS = 14

/** Finished workouts listed under "Recent workouts" on Home. */
export const RECENT_WORKOUTS_COUNT = 5

/** Weeks shown in the History training calendar (fits 320px: one column per week). */
export const CALENDAR_WEEKS = 12

/** First day of the week for "this week" counts: 1 = Monday (ISO 8601). */
export const WEEK_STARTS_ON = 1

/** How often the workout timer updates. */
export const TIMER_TICK_MS = 1000

/** How much the − / + buttons change the set fields, and their lowest values. */
export const SET_STEPPER = {
  kg: { step: 2.5, min: 0 },
  reps: { step: 1, min: 1 },
}
