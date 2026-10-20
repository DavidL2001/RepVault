/**
 * Migrations from one schema version to the next, keyed by the version they upgrade FROM.
 * When the data shape changes:
 * 1. bump `SCHEMA_VERSION` in `constants/storage.js`
 * 2. add an entry here that turns old data into the new shape
 * 3. add a test for it in `migrations.test.js`
 * The entry doesn't need to set `schemaVersion`; `migrate` does that.
 * Old data may be odd, so entries only change what they can and leave the rest
 * to the shape check that runs after migrating.
 *
 * @type {Record<number, (data: object) => object>}
 */
export const MIGRATIONS = {
  /**
   * v1 → v2: progression rules no longer suggest a weight, so `stepKg` is dropped.
   * `{ targetReps, stepKg, mode }` becomes `{ targetReps, mode }`.
   */
  1: (data) => ({
    ...data,
    exercises: Array.isArray(data.exercises)
      ? data.exercises.map((exercise) =>
          exercise?.progression
            ? {
                ...exercise,
                progression: {
                  targetReps: exercise.progression.targetReps,
                  mode: exercise.progression.mode,
                },
              }
            : exercise,
        )
      : data.exercises,
  }),

  /** v2 → v3: remember when the backup reminder was dismissed (never, for old data). */
  2: (data) => ({
    ...data,
    settings: { ...data.settings, backupReminderDismissedAt: null },
  }),
}
