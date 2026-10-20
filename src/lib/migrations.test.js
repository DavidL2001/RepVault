import { describe, expect, it } from 'vitest'
import { SCHEMA_VERSION, STORAGE_STATUS } from '../constants/storage.js'
import { MIGRATIONS } from './migrations.js'
import { createInitialData } from './model.js'
import { migrate, parseStoredData } from './storage.js'

describe('migration 1 → 2: no weight step in progression rules', () => {
  const v1 = {
    ...createInitialData(),
    schemaVersion: 1,
    exercises: [
      {
        id: 'lat',
        name: 'Lat pulldown',
        createdAt: '',
        progression: { targetReps: 8, stepKg: 90, mode: 'all' },
      },
      { id: 'curl', name: 'Curl', createdAt: '', progression: null },
    ],
  }

  it('drops stepKg and keeps the rest of the rule', () => {
    expect(MIGRATIONS[1](v1).exercises).toEqual([
      {
        id: 'lat',
        name: 'Lat pulldown',
        createdAt: '',
        progression: { targetReps: 8, mode: 'all' },
      },
      { id: 'curl', name: 'Curl', createdAt: '', progression: null },
    ])
  })

  it('does not change the original data', () => {
    MIGRATIONS[1](v1)
    expect(v1.exercises[0].progression.stepKg).toBe(90)
  })

  it('leaves odd data for the shape check instead of throwing', () => {
    expect(MIGRATIONS[1]({ schemaVersion: 1, exercises: 'nope' }).exercises).toBe('nope')
  })

  it('loads saved v1 data as the current version', () => {
    const result = parseStoredData(JSON.stringify(v1))
    expect(result.status).toBe(STORAGE_STATUS.ok)
    expect(result.data.schemaVersion).toBe(SCHEMA_VERSION)
    expect(result.data.exercises[0].progression).toEqual({ targetReps: 8, mode: 'all' })
  })

  it('is part of the chain to the current version', () => {
    expect(migrate(v1).schemaVersion).toBe(SCHEMA_VERSION)
  })
})

describe('migration 2 → 3: backup reminder dismissal', () => {
  const v2 = {
    ...createInitialData(),
    schemaVersion: 2,
    settings: { theme: 'light', lastExportAt: '2026-10-01T10:00:00.000Z' },
  }

  it('adds backupReminderDismissedAt and keeps the other settings', () => {
    expect(MIGRATIONS[2](v2).settings).toEqual({
      theme: 'light',
      lastExportAt: '2026-10-01T10:00:00.000Z',
      backupReminderDismissedAt: null,
    })
  })

  it('loads saved v2 data as the current version', () => {
    const result = parseStoredData(JSON.stringify(v2))
    expect(result.status).toBe(STORAGE_STATUS.ok)
    expect(result.data.settings.backupReminderDismissedAt).toBeNull()
  })
})
