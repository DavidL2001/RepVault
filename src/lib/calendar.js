import { CALENDAR_WEEKS } from '../constants/defaults.js'
import { addDays, formatDate, startOfDay, startOfWeek, toDateKey } from './dates.js'
import { pluralize } from './format.js'

const DAYS_PER_WEEK = 7

// The History page: workouts grouped by month, and the training calendar.

/**
 * One day in the training calendar.
 * @typedef {object} CalendarDay
 * @property {string} key Local date as "YYYY-MM-DD".
 * @property {Date} date Midnight, local time.
 * @property {number} count Workouts started that day.
 * @property {boolean} isToday
 * @property {boolean} isFuture Later this week; drawn faded.
 */

/**
 * The last weeks as a calendar (Monday–Sunday columns), with the workouts per day.
 *
 * @param {import('./model.js').WorkoutSession[]} workouts
 * @param {{ weeks?: number, now?: Date }} [options]
 * @returns {{
 *   weeks: CalendarDay[][],
 *   trainedDays: number,
 *   workoutCount: number,
 *   lastTrained: Date|null,
 * }} Counts only include the days shown; `weeks` is oldest week first.
 */
export function trainingCalendar(workouts, { weeks = CALENDAR_WEEKS, now = new Date() } = {}) {
  const counts = new Map()
  for (const workout of workouts) {
    const key = toDateKey(workout.startedAt)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const today = startOfDay(now)
  const firstDay = addDays(startOfWeek(now), -(weeks - 1) * DAYS_PER_WEEK)
  const days = Array.from({ length: weeks * DAYS_PER_WEEK }, (_, index) => {
    const date = addDays(firstDay, index)
    const key = toDateKey(date)
    return {
      key,
      date,
      count: counts.get(key) ?? 0,
      isToday: key === toDateKey(today),
      isFuture: date > today,
    }
  })
  const trained = days.filter((day) => day.count > 0)

  return {
    weeks: Array.from({ length: weeks }, (_, week) =>
      days.slice(week * DAYS_PER_WEEK, (week + 1) * DAYS_PER_WEEK),
    ),
    trainedDays: trained.length,
    workoutCount: trained.reduce((sum, day) => sum + day.count, 0),
    lastTrained: trained.at(-1)?.date ?? null,
  }
}

/**
 * The calendar in a sentence, for people who can't see it:
 * "You trained on 10 days in the last 12 weeks (12 workouts). Last time: Tue 20 Oct 2026."
 *
 * @param {ReturnType<typeof trainingCalendar>} calendar
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {string}
 */
export function calendarSummary({ weeks, trainedDays, workoutCount, lastTrained }, locale) {
  const period = `the last ${pluralize(weeks.length, 'week')}`
  if (trainedDays === 0) return `No workouts in ${period}.`
  return `You trained on ${pluralize(trainedDays, 'day')} in ${period} (${pluralize(workoutCount, 'workout')}). Last time: ${formatDate(lastTrained, locale)}.`
}

/**
 * Finished workouts grouped by calendar month (local time), newest month and workout first.
 *
 * @param {import('./model.js').WorkoutSession[]} workouts
 * @returns {{ key: string, date: string, workouts: import('./model.js').WorkoutSession[] }[]}
 *   `key` is "YYYY-MM"; `date` is a start date inside the month, for its heading.
 */
export function groupByMonth(workouts) {
  const sorted = [...workouts].sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
  const groups = []
  for (const workout of sorted) {
    const key = toDateKey(workout.startedAt).slice(0, 7)
    const last = groups.at(-1)
    if (last?.key === key) last.workouts.push(workout)
    else groups.push({ key, date: workout.startedAt, workouts: [workout] })
  }
  return groups
}
