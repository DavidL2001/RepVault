import { describe, expect, it } from 'vitest'
import { SCHEMA_VERSION } from '../constants/storage.js'
import { createInitialData, isPlainObject, isValidData } from './model.js'

describe('createInitialData', () => {
  it('starts empty, with no preset exercises or templates', () => {
    const data = createInitialData()
    expect(data.schemaVersion).toBe(SCHEMA_VERSION)
    expect(data.exercises).toEqual([])
    expect(data.templates).toEqual([])
    expect(data.workouts).toEqual([])
    expect(data.activeWorkout).toBeNull()
  })

  it('returns a new object each time', () => {
    expect(createInitialData()).not.toBe(createInitialData())
  })
})

describe('isPlainObject', () => {
  it('is true only for objects that are not arrays or null', () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject('text')).toBe(false)
  })
})

describe('isValidData', () => {
  it('accepts initial data', () => {
    expect(isValidData(createInitialData())).toBe(true)
  })

  it('accepts an in-progress workout', () => {
    const data = { ...createInitialData(), activeWorkout: { id: 'w1', entries: [] } }
    expect(isValidData(data)).toBe(true)
  })

  it('rejects other schema versions', () => {
    expect(isValidData({ ...createInitialData(), schemaVersion: SCHEMA_VERSION + 1 })).toBe(false)
  })

  it('rejects missing or wrongly typed fields', () => {
    expect(isValidData({ ...createInitialData(), exercises: undefined })).toBe(false)
    expect(isValidData({ ...createInitialData(), workouts: {} })).toBe(false)
    expect(isValidData({ ...createInitialData(), activeWorkout: [] })).toBe(false)
    expect(isValidData({ ...createInitialData(), settings: null })).toBe(false)
    expect(isValidData(null)).toBe(false)
  })
})
