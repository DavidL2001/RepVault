import { BACKUP_REMINDER_DAYS } from '../constants/defaults.js'
import { daysBetween } from './dates.js'

/**
 * Whether Home should remind the user to export a backup, and what to say.
 * The data only lives in this browser, so a lost or cleared browser loses it.
 *
 * - Shown when more than `BACKUP_REMINDER_DAYS` have passed since the last export,
 *   or, if there was never an export, since the first workout.
 * - Never shown without any workouts (nothing to lose yet).
 * - Dismissing hides it for `BACKUP_REMINDER_DAYS`.
 *
 * @param {object} options
 * @param {string|null} options.lastExportAt
 * @param {string|null} options.dismissedAt
 * @param {import('./model.js').WorkoutSession[]} options.workouts Finished workouts.
 * @param {Date} [now]
 * @returns {{ daysSinceExport: number|null }|null} `null` when no reminder is due.
 *   `daysSinceExport` is `null` when there was never an export.
 */
export function backupReminder({ lastExportAt, dismissedAt, workouts }, now = new Date()) {
  if (workouts.length === 0) return null
  if (dismissedAt && daysBetween(dismissedAt, now) < BACKUP_REMINDER_DAYS) return null

  const firstWorkoutAt = workouts.reduce(
    (first, workout) =>
      Date.parse(workout.startedAt) < Date.parse(first) ? workout.startedAt : first,
    workouts[0].startedAt,
  )
  const since = daysBetween(lastExportAt ?? firstWorkoutAt, now)
  if (since <= BACKUP_REMINDER_DAYS) return null

  return { daysSinceExport: lastExportAt ? since : null }
}

/**
 * Reminder text: "Your last backup was 20 days ago." or, never exported,
 * "You haven't backed up yet."
 *
 * @param {{ daysSinceExport: number|null }} reminder
 * @returns {string}
 */
export function backupReminderMessage({ daysSinceExport }) {
  return daysSinceExport === null
    ? 'You haven’t backed up yet.'
    : `Your last backup was ${daysSinceExport} days ago.`
}
