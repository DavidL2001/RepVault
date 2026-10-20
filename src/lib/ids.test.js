import { describe, expect, it } from 'vitest'
import { createId } from './ids.js'

describe('createId', () => {
  it('uses crypto.randomUUID when available', () => {
    expect(createId({ randomUUID: () => 'uuid-1' })).toBe('uuid-1')
  })

  it('falls back to random values when randomUUID is missing (plain http)', () => {
    const cryptoWithoutUuid = {
      getRandomValues: (array) => globalThis.crypto.getRandomValues(array),
    }
    const ids = new Set(Array.from({ length: 100 }, () => createId(cryptoWithoutUuid)))
    expect(ids.size).toBe(100)
  })

  it('creates unique ids by default', () => {
    expect(createId()).not.toBe(createId())
  })
})
