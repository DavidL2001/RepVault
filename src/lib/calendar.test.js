import { describe, expect, it } from 'vitest'
import { makeWorkout } from '../test/factories.js'
import { calendarSummary, groupByMonth, trainingCalendar } from './calendar.js'
import { formatDate } from './dates.js'

// Local dates (month is 0-based), so the tests pass in any timezone.
const local = (month, day, hour = 18) => new Date(2026, month, day, hour).toISOString()
const workout = (id, startedAt) => makeWorkout({ id, startedAt })

// "Now" is Wednesday 21 Oct 2026.
const now = new Date(2026, 9, 21, 12)
const workouts = [
  workout('a', local(9, 20)), // Tue this week
  workout('b', local(9, 20, 7)), // Tue this week, morning
  workout('c', local(9, 13)), // Tue last week
  workout('d', local(8, 30)), // Wed 30 Sep
  workout('old', local(6, 1)), // 1 Jul: outside a 4-week calendar
]

describe('trainingCalendar', () => {
  const calendar = trainingCalendar(workouts, { weeks: 4, now })
  const days = calendar.weeks.flat()

  it('has full Monday–Sunday weeks, ending with the current week', () => {
    expect(calendar.weeks).toHaveLength(4)
    expect(calendar.weeks.every((week) => week.length === 7)).toBe(true)
    expect(days[0].key).toBe('2026-09-28') // Monday three weeks back
    expect(days.at(-1).key).toBe('2026-10-25') // Sunday this week
    expect(
      days.every((day) => day.date.getDay() === [1, 2, 3, 4, 5, 6, 0][days.indexOf(day) % 7]),
    ).toBe(true)
  })

  it('counts workouts per day', () => {
    const count = (key) => days.find((day) => day.key === key).count
    expect(count('2026-10-20')).toBe(2)
    expect(count('2026-10-13')).toBe(1)
    expect(count('2026-10-14')).toBe(0)
  })

  it('marks today and the days still to come', () => {
    expect(days.filter((day) => day.isToday).map((day) => day.key)).toEqual(['2026-10-21'])
    expect(days.filter((day) => day.isFuture).map((day) => day.key)).toEqual([
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-25',
    ])
  })

  it('totals only the days shown', () => {
    expect(calendar).toMatchObject({ trainedDays: 3, workoutCount: 4 })
    expect(calendar.lastTrained.getDate()).toBe(20)
  })

  it('is empty without workouts', () => {
    expect(trainingCalendar([], { weeks: 4, now })).toMatchObject({
      trainedDays: 0,
      workoutCount: 0,
      lastTrained: null,
    })
  })
})

describe('calendarSummary', () => {
  it('describes the calendar in a sentence', () => {
    expect(calendarSummary(trainingCalendar(workouts, { weeks: 4, now }), 'en-GB')).toBe(
      `You trained on 3 days in the last 4 weeks (4 workouts). Last time: ${formatDate(local(9, 20), 'en-GB')}.`,
    )
  })

  it('says when there were no workouts', () => {
    expect(calendarSummary(trainingCalendar([], { weeks: 12, now }))).toBe(
      'No workouts in the last 12 weeks.',
    )
  })
})

describe('groupByMonth', () => {
  it('groups by month, newest month and newest workout first', () => {
    const groups = groupByMonth(workouts)
    expect(groups.map((group) => group.key)).toEqual(['2026-10', '2026-09', '2026-07'])
    expect(groups[0].workouts.map((item) => item.id)).toEqual(['a', 'b', 'c'])
  })

  it('does not change the original list', () => {
    const list = [workout('x', local(0, 1)), workout('y', local(1, 1))]
    groupByMonth(list)
    expect(list.map((item) => item.id)).toEqual(['x', 'y'])
  })

  it('is empty without workouts', () => {
    expect(groupByMonth([])).toEqual([])
  })
})
