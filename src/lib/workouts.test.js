import { describe, expect, it } from 'vitest'
import { createWorkout } from './workouts.js'

describe('createWorkout', () => {
  const now = new Date('2026-10-20T17:05:00.000Z')

  it('records the start time and lists the exercises without sets', () => {
    expect(
      createWorkout(
        { name: 'Leg day', templateId: 't1', exerciseIds: ['e1', 'e2'] },
        { id: 'w1', now },
      ),
    ).toEqual({
      id: 'w1',
      templateId: 't1',
      name: 'Leg day',
      startedAt: '2026-10-20T17:05:00.000Z',
      endedAt: null,
      entries: [
        { exerciseId: 'e1', sets: [] },
        { exerciseId: 'e2', sets: [] },
      ],
    })
  })

  it('can start empty, without a template', () => {
    expect(createWorkout({ name: 'Workout' }, { id: 'w1', now })).toMatchObject({
      templateId: null,
      entries: [],
    })
  })
})
