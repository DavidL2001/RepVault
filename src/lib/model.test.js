import { describe, expect, it } from 'vitest'
import { SCHEMA_VERSION } from '../constants/storage.js'
import { makeSet, makeWorkout } from '../test/factories.js'
import { createInitialData, hasValidRecords, isPlainObject, isValidData } from './model.js'

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

describe('hasValidRecords', () => {
  const exercise = {
    id: 'e1',
    name: 'Squat',
    createdAt: '2026-10-01T10:00:00.000Z',
    progression: { targetReps: 8, mode: 'all' },
  }
  const valid = () => ({
    ...createInitialData(),
    exercises: [exercise, { ...exercise, id: 'e2', name: 'Curl', progression: null }],
    templates: [{ id: 't1', name: 'Leg day', exerciseIds: ['e1'] }],
    workouts: [
      makeWorkout({ id: 'w1', startedAt: '2026-10-20T17:00:00.000Z', entries: { e1: [[40, 8]] } }),
    ],
    activeWorkout: {
      ...makeWorkout({ id: 'w2', startedAt: '2026-10-22T17:00:00.000Z' }),
      endedAt: null,
    },
  })

  it('accepts complete data, and initial data', () => {
    expect(hasValidRecords(valid())).toBe(true)
    expect(hasValidRecords(createInitialData())).toBe(true)
  })

  it('rejects data that fails the top-level check', () => {
    expect(hasValidRecords({ ...valid(), schemaVersion: SCHEMA_VERSION + 1 })).toBe(false)
  })

  it('rejects broken exercises', () => {
    const withExercise = (changes) => ({ ...valid(), exercises: [{ ...exercise, ...changes }] })
    expect(hasValidRecords(withExercise({ name: ' ' }))).toBe(false)
    expect(hasValidRecords(withExercise({ createdAt: 'yesterday' }))).toBe(false)
    expect(hasValidRecords(withExercise({ progression: { targetReps: 0, mode: 'all' } }))).toBe(
      false,
    )
    expect(hasValidRecords(withExercise({ progression: { targetReps: 8, mode: 'most' } }))).toBe(
      false,
    )
  })

  it('rejects broken templates', () => {
    expect(hasValidRecords({ ...valid(), templates: [{ id: 't1', name: 'Legs' }] })).toBe(false)
    expect(
      hasValidRecords({ ...valid(), templates: [{ id: 't1', name: 'Legs', exerciseIds: [1] }] }),
    ).toBe(false)
  })

  it('rejects broken sets', () => {
    const withSet = (set) => {
      const data = valid()
      data.workouts[0].entries[0].sets = [{ ...makeSet(40, 8), ...set }]
      return data
    }
    expect(hasValidRecords(withSet({}))).toBe(true)
    expect(hasValidRecords(withSet({ kg: -5 }))).toBe(false)
    expect(hasValidRecords(withSet({ kg: '40' }))).toBe(false)
    expect(hasValidRecords(withSet({ reps: 0 }))).toBe(false)
    expect(hasValidRecords(withSet({ reps: 7.5 }))).toBe(false)
    expect(hasValidRecords(withSet({ timestamp: null }))).toBe(false)
  })

  it('requires finished workouts to have ended, and the workout in progress not to', () => {
    const data = valid()
    data.workouts[0].endedAt = null
    expect(hasValidRecords(data)).toBe(false)
    expect(
      hasValidRecords({
        ...valid(),
        activeWorkout: { ...valid().activeWorkout, endedAt: data.workouts[0].startedAt },
      }),
    ).toBe(false)
  })

  it('rejects duplicate ids', () => {
    expect(hasValidRecords({ ...valid(), exercises: [exercise, exercise] })).toBe(false)
  })

  it('rejects unknown themes and broken dates in settings', () => {
    const withSettings = (changes) => ({
      ...valid(),
      settings: { ...valid().settings, ...changes },
    })
    expect(hasValidRecords(withSettings({ theme: 'pink' }))).toBe(false)
    expect(hasValidRecords(withSettings({ lastExportAt: 'soon' }))).toBe(false)
  })
})
