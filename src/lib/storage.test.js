import { describe, expect, it } from 'vitest'
import { SCHEMA_VERSION, STORAGE_KEY, STORAGE_STATUS } from '../constants/storage.js'
import { createInitialData } from './model.js'
import {
  loadData,
  migrate,
  parseStoredData,
  rawDataFilename,
  requestPersistentStorage,
  saveData,
} from './storage.js'

/** In-memory stand-in for localStorage. */
function createFakeStorage(initial = {}) {
  const items = new Map(Object.entries(initial))
  return {
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
  }
}

const brokenStorage = {
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
}

describe('migrate', () => {
  const migrations = {
    1: (data) => ({ ...data, added: 'in v2' }),
    2: (data) => ({ ...data, renamed: data.added, added: undefined }),
  }

  it('runs each migration in order up to the target version', () => {
    const result = migrate({ schemaVersion: 1 }, migrations, 3)
    expect(result).toEqual({ schemaVersion: 3, renamed: 'in v2', added: undefined })
  })

  it('leaves current data unchanged', () => {
    const data = { schemaVersion: 3 }
    expect(migrate(data, migrations, 3)).toBe(data)
  })

  it('throws when a migration is missing', () => {
    expect(() => migrate({ schemaVersion: 1 }, {}, 2)).toThrow('No migration from schema version 1')
  })
})

describe('parseStoredData', () => {
  it('loads valid data', () => {
    const data = createInitialData()
    expect(parseStoredData(JSON.stringify(data))).toEqual({
      status: STORAGE_STATUS.ok,
      data,
      raw: JSON.stringify(data),
    })
  })

  it('flags text that is not JSON as corrupted and keeps the raw text', () => {
    expect(parseStoredData('{oops')).toEqual({
      status: STORAGE_STATUS.corrupted,
      data: null,
      raw: '{oops',
    })
  })

  it('flags JSON without a schema version as corrupted', () => {
    expect(parseStoredData('[]').status).toBe(STORAGE_STATUS.corrupted)
    expect(parseStoredData('{"exercises":[]}').status).toBe(STORAGE_STATUS.corrupted)
  })

  it('flags data with the wrong shape as corrupted', () => {
    const data = { ...createInitialData(), exercises: 'nope' }
    expect(parseStoredData(JSON.stringify(data)).status).toBe(STORAGE_STATUS.corrupted)
  })

  it('flags data from a newer app version without touching it', () => {
    const raw = JSON.stringify({ ...createInitialData(), schemaVersion: SCHEMA_VERSION + 1 })
    expect(parseStoredData(raw)).toEqual({ status: STORAGE_STATUS.newerVersion, data: null, raw })
  })

  it('migrates data from an older version', () => {
    const current = createInitialData()
    // An imagined older shape that had no settings yet.
    const { settings, ...withoutSettings } = current
    const old = { ...withoutSettings, schemaVersion: SCHEMA_VERSION - 1 }
    const migrations = { [SCHEMA_VERSION - 1]: (data) => ({ ...data, settings }) }

    expect(parseStoredData(JSON.stringify(old), { migrations })).toMatchObject({
      status: STORAGE_STATUS.ok,
      data: current,
    })
  })

  it('flags data as corrupted when a migration fails', () => {
    const migrations = {
      [SCHEMA_VERSION - 1]: () => {
        throw new Error('bad data')
      },
    }
    const raw = JSON.stringify({ ...createInitialData(), schemaVersion: SCHEMA_VERSION - 1 })
    expect(parseStoredData(raw, { migrations }).status).toBe(STORAGE_STATUS.corrupted)
  })
})

describe('loadData', () => {
  it('returns no data on a first visit', () => {
    expect(loadData(createFakeStorage())).toEqual({
      status: STORAGE_STATUS.ok,
      data: null,
      raw: null,
    })
  })

  it('returns no data when storage is blocked', () => {
    expect(loadData(brokenStorage)).toEqual({ status: STORAGE_STATUS.ok, data: null, raw: null })
  })

  it('reads data under the storage key', () => {
    const data = createInitialData()
    const storage = createFakeStorage({ [STORAGE_KEY]: JSON.stringify(data) })
    expect(loadData(storage).data).toEqual(data)
  })
})

describe('saveData', () => {
  it('saves data that loads back the same, including an in-progress workout', () => {
    const storage = createFakeStorage()
    const data = {
      ...createInitialData(),
      activeWorkout: {
        id: 'w1',
        templateId: null,
        name: 'Workout',
        startedAt: '2026-10-20T17:00:00.000Z',
        endedAt: null,
        entries: [
          { exerciseId: 'e1', sets: [{ reps: 8, kg: 40, timestamp: '2026-10-20T17:05:00.000Z' }] },
        ],
      },
    }

    expect(saveData(data, storage)).toBe(true)
    expect(loadData(storage)).toMatchObject({ status: STORAGE_STATUS.ok, data })
  })

  it('returns false instead of throwing when storage fails', () => {
    expect(saveData(createInitialData(), brokenStorage)).toBe(false)
  })
})

describe('requestPersistentStorage', () => {
  it('returns false when the browser has no storage API', async () => {
    expect(await requestPersistentStorage(undefined)).toBe(false)
  })

  it('does not ask again when storage is already persistent', async () => {
    let asked = false
    const manager = {
      persisted: async () => true,
      persist: async () => {
        asked = true
        return true
      },
    }
    expect(await requestPersistentStorage(manager)).toBe(true)
    expect(asked).toBe(false)
  })

  it('asks when not yet persistent and returns the answer', async () => {
    const manager = { persisted: async () => false, persist: async () => false }
    expect(await requestPersistentStorage(manager)).toBe(false)
  })

  it('returns false when the browser throws', async () => {
    const manager = {
      persisted: async () => {
        throw new Error('not allowed')
      },
      persist: async () => true,
    }
    expect(await requestPersistentStorage(manager)).toBe(false)
  })
})

describe('rawDataFilename', () => {
  it('includes the local date', () => {
    expect(rawDataFilename(new Date(2026, 9, 20))).toBe('repvault-unreadable-data-2026-10-20.txt')
  })
})
