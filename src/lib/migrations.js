/**
 * Migrations from one schema version to the next, keyed by the version they upgrade FROM.
 * When the data shape changes:
 * 1. bump `SCHEMA_VERSION` in `constants/storage.js`
 * 2. add an entry here that turns old data into the new shape, e.g.
 *    `1: (data) => ({ ...data, settings: { ...data.settings, newSetting: null } })`
 * 3. add a test for it
 * The entry doesn't need to set `schemaVersion`; `migrate` does that.
 *
 * @type {Record<number, (data: object) => object>}
 */
export const MIGRATIONS = {}
