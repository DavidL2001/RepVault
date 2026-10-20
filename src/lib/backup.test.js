import { describe, expect, it } from 'vitest'
import { makeWorkout } from '../test/factories.js'
import { backupReminder, backupReminderMessage } from './backup.js'

// Local dates (month is 0-based), so day counts don't depend on the timezone.
const local = (month, day) => new Date(2026, month, day, 12).toISOString()
const now = new Date(2026, 9, 21, 12) // 21 Oct
const workouts = [
  makeWorkout({ id: 'b', startedAt: local(9, 10) }),
  makeWorkout({ id: 'a', startedAt: local(9, 1) }), // first workout: 1 Oct (20 days ago)
]

describe('backupReminder', () => {
  it('is due when the last export is more than 14 days old', () => {
    expect(backupReminder({ lastExportAt: local(9, 6), dismissedAt: null, workouts }, now)).toEqual(
      { daysSinceExport: 15 },
    )
  })

  it('is not due within 14 days of the last export', () => {
    expect(
      backupReminder({ lastExportAt: local(9, 7), dismissedAt: null, workouts }, now),
    ).toBeNull()
  })

  it('counts from the first workout when there was never an export', () => {
    expect(backupReminder({ lastExportAt: null, dismissedAt: null, workouts }, now)).toEqual({
      daysSinceExport: null,
    })
    const recent = [makeWorkout({ id: 'new', startedAt: local(9, 15) })]
    expect(
      backupReminder({ lastExportAt: null, dismissedAt: null, workouts: recent }, now),
    ).toBeNull()
  })

  it('is never due without workouts', () => {
    expect(backupReminder({ lastExportAt: null, dismissedAt: null, workouts: [] }, now)).toBeNull()
  })

  it('stays hidden for 14 days after being dismissed, then comes back', () => {
    const options = { lastExportAt: null, workouts }
    expect(backupReminder({ ...options, dismissedAt: local(9, 8) }, now)).toBeNull()
    expect(backupReminder({ ...options, dismissedAt: local(9, 7) }, now)).toEqual({
      daysSinceExport: null,
    })
  })
})

describe('backupReminderMessage', () => {
  it('says how long ago the last backup was', () => {
    expect(backupReminderMessage({ daysSinceExport: 20 })).toBe('Your last backup was 20 days ago.')
  })

  it('says when there was never a backup', () => {
    expect(backupReminderMessage({ daysSinceExport: null })).toBe('You haven’t backed up yet.')
  })
})
