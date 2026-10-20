import { describe, expect, it } from 'vitest'
import { createValueStore } from './valueStore.js'

describe('createValueStore', () => {
  it('returns the initial value, then the latest set value', () => {
    const store = createValueStore(true)
    expect(store.get()).toBe(true)
    store.set(false)
    expect(store.get()).toBe(false)
  })

  it('notifies subscribers only when the value changes', () => {
    const store = createValueStore(1)
    let calls = 0
    store.subscribe(() => calls++)

    store.set(1)
    expect(calls).toBe(0)
    store.set(2)
    expect(calls).toBe(1)
  })

  it('stops notifying after unsubscribing', () => {
    const store = createValueStore(1)
    let calls = 0
    const unsubscribe = store.subscribe(() => calls++)

    unsubscribe()
    store.set(2)
    expect(calls).toBe(0)
  })
})
