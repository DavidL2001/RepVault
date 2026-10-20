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
  stepKg: 2.5,
  mode: PROGRESSION_MODES.all,
}

/** Show the backup reminder when the last export is older than this. */
export const BACKUP_REMINDER_DAYS = 14

/** First day of the week for "this week" counts: 1 = Monday (ISO 8601). */
export const WEEK_STARTS_ON = 1
