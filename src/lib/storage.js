import {
  RAW_DATA_FILENAME_PREFIX,
  SCHEMA_VERSION,
  STORAGE_KEY,
  STORAGE_STATUS,
} from '../constants/storage.js'
import { toDateKey } from './dates.js'
import { MIGRATIONS } from './migrations.js'
import { isPlainObject, isValidData } from './model.js'

// Reading and writing app data in localStorage. Every access is wrapped in try/catch:
// storage can be missing (blocked cookies), full (quota) or hold damaged data.
// Only the state layer calls these; components never touch localStorage.

/**
 * @typedef {object} LoadResult
 * @property {string} status One of `STORAGE_STATUS`.
 * @property {import('./model.js').AppData|null} data Usable data, or `null` (nothing saved / unreadable).
 * @property {string|null} raw The saved text as found, so unreadable data can still be downloaded.
 */

/**
 * Upgrades data from an older schema version, one version at a time.
 *
 * @param {{ schemaVersion: number }} data
 * @param {Record<number, (data: object) => object>} [migrations]
 * @param {number} [targetVersion]
 * @returns {object} Data at `targetVersion`.
 * @throws When a migration is missing or fails.
 */
export function migrate(data, migrations = MIGRATIONS, targetVersion = SCHEMA_VERSION) {
  let current = data
  while (current.schemaVersion < targetVersion) {
    const upgrade = migrations[current.schemaVersion]
    if (!upgrade) throw new Error(`No migration from schema version ${current.schemaVersion}`)
    current = { ...upgrade(current), schemaVersion: current.schemaVersion + 1 }
  }
  return current
}

/**
 * Turns saved text into app data: parse, check the version, migrate, validate.
 *
 * @param {string} raw
 * @param {object} [options] For tests.
 * @param {Record<number, (data: object) => object>} [options.migrations]
 * @param {number} [options.version]
 * @returns {LoadResult}
 */
export function parseStoredData(raw, { migrations = MIGRATIONS, version = SCHEMA_VERSION } = {}) {
  const unreadable = { status: STORAGE_STATUS.corrupted, data: null, raw }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return unreadable
  }
  if (!isPlainObject(parsed) || !Number.isInteger(parsed.schemaVersion)) return unreadable
  if (parsed.schemaVersion > version)
    return { status: STORAGE_STATUS.newerVersion, data: null, raw }

  let migrated
  try {
    migrated = migrate(parsed, migrations, version)
  } catch {
    return unreadable
  }
  if (!isValidData(migrated)) return unreadable

  return { status: STORAGE_STATUS.ok, data: migrated, raw }
}

/**
 * Reads the saved app data.
 *
 * @param {Storage} [storage] For tests.
 * @returns {LoadResult} `data` is `null` on a first visit or when storage is unavailable.
 */
export function loadData(storage = globalThis.localStorage) {
  let raw
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    // Storage is blocked: start empty. Saving will fail too, and the app says so.
    return { status: STORAGE_STATUS.ok, data: null, raw: null }
  }
  if (raw === null) return { status: STORAGE_STATUS.ok, data: null, raw: null }
  return parseStoredData(raw)
}

/**
 * Saves the app data.
 *
 * @param {import('./model.js').AppData} data
 * @param {Storage} [storage] For tests.
 * @returns {boolean} `false` if it couldn't be saved (storage full or blocked).
 */
export function saveData(data, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

/**
 * Asks the browser not to clear the saved data when space runs low.
 * Browsers may say no (or ask the user); the app works either way.
 *
 * @param {StorageManager} [storageManager] For tests.
 * @returns {Promise<boolean>} Whether storage is persistent.
 */
export async function requestPersistentStorage(storageManager = globalThis.navigator?.storage) {
  if (typeof storageManager?.persist !== 'function') return false
  try {
    if (await storageManager.persisted()) return true
    return await storageManager.persist()
  } catch {
    return false
  }
}

/**
 * File name for downloading unreadable saved data, e.g. "repvault-unreadable-data-2026-10-20.txt".
 *
 * @param {Date} [date]
 * @returns {string}
 */
export function rawDataFilename(date = new Date()) {
  return `${RAW_DATA_FILENAME_PREFIX}-${toDateKey(date)}.txt`
}
