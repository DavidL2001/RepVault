/**
 * A single value that can be watched, for reading the outcome of a side effect
 * (like "did the last save work?") with React's `useSyncExternalStore`.
 *
 * @template T
 * @param {T} initialValue
 * @returns {{ get: () => T, set: (value: T) => void, subscribe: (listener: () => void) => () => void }}
 */
export function createValueStore(initialValue) {
  let value = initialValue
  const listeners = new Set()

  return {
    get: () => value,
    set(nextValue) {
      if (Object.is(nextValue, value)) return
      value = nextValue
      listeners.forEach((listener) => listener())
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
