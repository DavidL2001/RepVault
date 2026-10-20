/** The one localStorage key that holds all app data. */
export const STORAGE_KEY = 'repvault:data'

/**
 * Version of the saved data shape. Bump it whenever the shape changes,
 * and add a migration for the old version in `lib/migrations.js`.
 */
export const SCHEMA_VERSION = 2

/** Result of reading saved data. */
export const STORAGE_STATUS = {
  /** Loaded fine, or nothing saved yet. Changes are saved. */
  ok: 'ok',
  /** Saved data exists but can't be read. Nothing is saved until the user decides. */
  corrupted: 'corrupted',
  /** Saved by a newer app version than this one. Nothing is saved, so it isn't overwritten. */
  newerVersion: 'newerVersion',
}

/** File name start for downloading unreadable saved data, before the date. */
export const RAW_DATA_FILENAME_PREFIX = 'repvault-unreadable-data'
