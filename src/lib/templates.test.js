import { describe, expect, it } from 'vitest'
import { makeWorkout } from '../test/factories.js'
import {
  createTemplate,
  existingExerciseIds,
  templateSummary,
  validateTemplateName,
} from './templates.js'

const exercises = [
  { id: 'e1', name: 'Squat', createdAt: '', progression: null },
  { id: 'e2', name: 'Leg extension', createdAt: '', progression: null },
]

describe('createTemplate', () => {
  it('starts without exercises and with a clean name', () => {
    expect(createTemplate('  Leg   day ', { id: 't1' })).toEqual({
      id: 't1',
      name: 'Leg day',
      exerciseIds: [],
    })
  })

  it('creates an id by default', () => {
    expect(createTemplate('Leg day').id).toBeTruthy()
  })
})

describe('validateTemplateName', () => {
  const templates = [createTemplate('Leg day', { id: 't1' })]

  it('rejects duplicates, ignoring case', () => {
    expect(validateTemplateName('LEG DAY', templates)).toBe(
      'You already have a template called “Leg day”.',
    )
  })

  it('allows keeping the name when renaming', () => {
    expect(validateTemplateName('Leg day', templates, 't1')).toBeNull()
  })
})

describe('existingExerciseIds', () => {
  it('keeps the order and skips deleted exercises', () => {
    const template = createTemplate('Legs', { exerciseIds: ['e2', 'deleted', 'e1'] })
    expect(existingExerciseIds(template, exercises)).toEqual(['e2', 'e1'])
  })
})

describe('templateSummary', () => {
  const template = createTemplate('Legs', { id: 't1', exerciseIds: ['e1', 'e2', 'deleted'] })

  it('counts existing exercises and finds the last use', () => {
    const workouts = [
      { ...makeWorkout({ id: 'a', startedAt: '2026-10-08T17:00:00.000Z' }), templateId: 't1' },
      { ...makeWorkout({ id: 'b', startedAt: '2026-10-15T17:00:00.000Z' }), templateId: 't1' },
      { ...makeWorkout({ id: 'c', startedAt: '2026-10-19T17:00:00.000Z' }), templateId: 'other' },
    ]
    expect(templateSummary(template, exercises, workouts)).toEqual({
      exerciseCount: 2,
      lastUsedAt: '2026-10-15T17:00:00.000Z',
    })
  })

  it('has no last use for a new template', () => {
    expect(templateSummary(template, exercises, []).lastUsedAt).toBeNull()
  })
})
