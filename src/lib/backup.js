import { BACKUP_REMINDER_DAYS } from '../constants/defaults.js'
import { BACKUP_FILENAME_PREFIX, BACKUP_JSON_INDENT } from '../constants/files.js'
import { STORAGE_STATUS } from '../constants/storage.js'
import { daysBetween, formatDate, toDateKey } from './dates.js'
import { formatDaysAgo, pluralize } from './format.js'
import { hasValidRecords } from './model.js'
import { parseStoredData } from './storage.js'

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
    : `Your last backup was ${formatDaysAgo(daysSinceExport)}.`
}

/**
 * When the last backup was, for Settings: "today", "3 days ago", or "never".
 *
 * @param {string|null} lastExportAt
 * @param {Date} [now]
 * @returns {string}
 */
export function formatLastBackup(lastExportAt, now = new Date()) {
  return lastExportAt ? formatDaysAgo(daysBetween(lastExportAt, now)) : 'never'
}

/**
 * The backup file for all app data, as readable JSON. Its `lastExportAt` is set to
 * the export time, so after importing it Settings shows when it was made.
 *
 * @param {import('./model.js').AppData} data
 * @param {Date} [now]
 * @returns {{ filename: string, content: string, exportedAt: string }}
 */
export function createBackup(data, now = new Date()) {
  const exportedAt = now.toISOString()
  const backup = { ...data, settings: { ...data.settings, lastExportAt: exportedAt } }
  return {
    filename: `${BACKUP_FILENAME_PREFIX}-${toDateKey(now)}.json`,
    content: JSON.stringify(backup, null, BACKUP_JSON_INDENT),
    exportedAt,
  }
}

/**
 * Reads a backup file's text into app data, the same way saved data is read
 * (parse, check the version, migrate), and then checks every record in it.
 *
 * @param {string} text
 * @returns {{ data: import('./model.js').AppData, error: null }|{ data: null, error: string }}
 *   `error` says what's wrong, for showing to the user.
 */
export function parseBackup(text) {
  const { status, data } = parseStoredData(text)
  if (status === STORAGE_STATUS.newerVersion) {
    return {
      data: null,
      error:
        'This backup was made by a newer version of RepVault. Reload the page to get the latest version, then try again.',
    }
  }
  if (status !== STORAGE_STATUS.ok || !hasValidRecords(data)) {
    return {
      data: null,
      error: 'This file isn’t a RepVault backup, or it is damaged.',
    }
  }
  return { data, error: null }
}

/**
 * What a backup holds, for the import confirmation:
 * "Backup from Tue, 20 Oct 2026: 12 exercises, 3 templates and 25 workouts."
 *
 * @param {import('./model.js').AppData} data
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {string}
 */
export function describeBackup(data, locale) {
  const contents = [
    pluralize(data.exercises.length, 'exercise'),
    pluralize(data.templates.length, 'template'),
    pluralize(data.workouts.length, 'workout'),
  ]
  const { lastExportAt } = data.settings
  const from = lastExportAt ? ` from ${formatDate(lastExportAt, locale)}` : ''
  return `Backup${from}: ${contents.slice(0, -1).join(', ')} and ${contents.at(-1)}.`
}
