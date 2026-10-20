/** Number base for the fallback id parts (digits + lowercase letters). */
const ID_RADIX = 36
/** Random values in the fallback id. */
const RANDOM_PARTS = 2

/**
 * Creates a unique id for exercises, templates and workouts.
 * Uses `crypto.randomUUID()`, which only exists on https and localhost. The fallback
 * covers testing on a phone over plain http (`npm run dev -- --host`).
 *
 * @param {Crypto} [cryptoApi] For tests.
 * @returns {string}
 */
export function createId(cryptoApi = globalThis.crypto) {
  if (typeof cryptoApi.randomUUID === 'function') return cryptoApi.randomUUID()

  const random = cryptoApi.getRandomValues(new Uint32Array(RANDOM_PARTS))
  return [Date.now(), ...random].map((part) => part.toString(ID_RADIX)).join('-')
}
