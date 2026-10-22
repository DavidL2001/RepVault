import { describe, expect, it } from 'vitest'
import { makeWorkout } from '../test/factories.js'
import { SCHEMA_VERSION } from '../constants/storage.js'
import {
  backupReminder,
  backupReminderMessage,
  createBackup,
  describeBackup,
  formatLastBackup,
  parseBackup,
} from './backup.js'
import { createInitialData } from './model.js'

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

describe('formatLastBackup', () => {
  it('says how long ago the last export was, or never', () => {
    expect(formatLastBackup(local(9, 21), now)).toBe('today')
    expect(formatLastBackup(local(9, 18), now)).toBe('3 days ago')
    expect(formatLastBackup(null, now)).toBe('never')
  })
})

describe('createBackup and parseBackup', () => {
  const data = () => ({
    ...createInitialData(),
    exercises: [{ id: 'e1', name: 'Squat', createdAt: local(9, 1), progression: null }],
    workouts: [makeWorkout({ id: 'w1', startedAt: local(9, 10), entries: { e1: [[60, 5]] } })],
  })

  it('names the file after the local date and records the export time', () => {
    const backup = createBackup(data(), now)
    expect(backup.filename).toBe('repvault-backup-2026-10-21.json')
    expect(backup.exportedAt).toBe(now.toISOString())
    expect(JSON.parse(backup.content).settings.lastExportAt).toBe(now.toISOString())
  })

  it('reads back exactly what was exported', () => {
    const backup = createBackup(data(), now)
    const expected = {
      ...data(),
      settings: { ...data().settings, lastExportAt: now.toISOString() },
    }
    expect(parseBackup(backup.content)).toEqual({ data: expected, error: null })
  })

  it('upgrades backups from older versions', () => {
    const old = { ...data(), schemaVersion: SCHEMA_VERSION - 1 }
    delete old.settings.backupReminderDismissedAt
    expect(parseBackup(JSON.stringify(old)).data).toEqual(data())
  })

  it('rejects files that are not backups or are damaged', () => {
    const notBackup = 'This file isn’t a RepVault backup, or it is damaged.'
    expect(parseBackup('')).toEqual({ data: null, error: notBackup })
    expect(parseBackup('{"hello": "world"}').error).toBe(notBackup)
    expect(parseBackup(createBackup(data(), now).content.slice(0, -10)).error).toBe(notBackup)

    const brokenSet = data()
    brokenSet.workouts[0].entries[0].sets[0].reps = -1
    expect(parseBackup(JSON.stringify(brokenSet)).error).toBe(notBackup)
  })

  it('rejects backups from a newer version', () => {
    const newer = JSON.stringify({ ...data(), schemaVersion: SCHEMA_VERSION + 1 })
    expect(parseBackup(newer).error).toMatch(/newer version/)
  })
})

describe('describeBackup', () => {
  it('lists what the backup holds and when it was made', () => {
    const data = {
      ...createInitialData(),
      exercises: [{}, {}],
      workouts: [{}],
      settings: { ...createInitialData().settings, lastExportAt: local(9, 20) },
    }
    expect(describeBackup(data, 'en-GB')).toBe(
      'Backup from Tue, 20 Oct 2026: 2 exercises, 0 templates and 1 workout.',
    )
  })

  it('leaves out the date when the backup has none', () => {
    expect(describeBackup(createInitialData())).toBe(
      'Backup: 0 exercises, 0 templates and 0 workouts.',
    )
  })
})
