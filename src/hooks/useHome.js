import { useMemo } from 'react'
import { backupReminder } from '../lib/backup.js'
import { recentWorkouts, workoutsThisWeek } from '../lib/history.js'
import { updateSettings } from '../state/actions.js'
import { useAppState } from './useAppState.js'

/** What Home shows: the workout in progress, this week's count, recent workouts and the backup reminder. */
export function useHome() {
  const { state, dispatch } = useAppState()
  const { activeWorkout, workouts, settings } = state

  const home = useMemo(
    () => ({
      weekCount: workoutsThisWeek(workouts),
      recent: recentWorkouts(workouts),
      reminder: backupReminder({
        lastExportAt: settings.lastExportAt,
        dismissedAt: settings.backupReminderDismissedAt,
        workouts,
      }),
    }),
    [workouts, settings.lastExportAt, settings.backupReminderDismissedAt],
  )

  return {
    ...home,
    /** The workout in progress, or `null`. */
    activeWorkout,
    total: workouts.length,
    /** Hides the backup reminder for `BACKUP_REMINDER_DAYS`. */
    dismissReminder: () =>
      dispatch(updateSettings({ backupReminderDismissedAt: new Date().toISOString() })),
  }
}
