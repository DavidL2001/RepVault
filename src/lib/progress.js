import { CHART_METRIC_LABELS, CHART_METRICS } from '../constants/charts.js'
import { ONE_REP_MAX_DECIMALS } from '../constants/numbers.js'
import { setOneRepMax, totalVolume } from './calculations.js'
import { formatDate } from './dates.js'
import { formatKg, pluralize } from './format.js'

// Progress over time for one exercise: one point per session, and the words that
// describe it (the chart's text alternative).

/**
 * One session on a progress chart.
 * @typedef {object} ProgressPoint
 * @property {string} workoutId
 * @property {string} date ISO date the workout started.
 * @property {number} heaviest Heaviest weight in kg.
 * @property {number} oneRepMax Best estimated 1RM in kg.
 * @property {number} volume Total kg × reps.
 */

/**
 * Chart points from an exercise's sessions.
 *
 * @param {{ workoutId: string, startedAt: string, sets: import('./model.js').WorkoutSet[] }[]} sessions
 *   In any order; sessions without sets are skipped.
 * @returns {ProgressPoint[]} Oldest first.
 */
export function progressPoints(sessions) {
  return sessions
    .filter((session) => session.sets.length > 0)
    .map(({ workoutId, startedAt, sets }) => ({
      workoutId,
      date: startedAt,
      heaviest: Math.max(...sets.map((set) => set.kg)),
      oneRepMax: Math.max(...sets.map(setOneRepMax)),
      volume: totalVolume(sets),
    }))
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
}

/**
 * A metric value for display: "47,5 kg"; an estimated 1RM gets one decimal.
 *
 * @param {string} metric One of `CHART_METRICS`.
 * @param {number} value
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {string}
 */
export function formatMetric(metric, value, locale) {
  return metric === CHART_METRICS.oneRepMax
    ? formatKg(value, locale, ONE_REP_MAX_DECIMALS)
    : formatKg(value, locale)
}

/**
 * The chart in one or two sentences, for people who can't see it, e.g.
 * "Heaviest weight went up from 40 kg to 47,5 kg over 3 sessions, from … to ….
 * Best: 47,5 kg on …."
 *
 * @param {ProgressPoint[]} points Oldest first.
 * @param {string} metric One of `CHART_METRICS`.
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {string}
 */
export function progressSummary(points, metric, locale) {
  const label = CHART_METRIC_LABELS[metric]
  const format = (value) => formatMetric(metric, value, locale)
  const date = (point) => formatDate(point.date, locale)

  if (points.length === 0) return 'No sessions yet.'
  if (points.length === 1) {
    return `${label}: ${format(points[0][metric])} in 1 session, on ${date(points[0])}.`
  }

  const first = points[0]
  const last = points.at(-1)
  const best = points.reduce((top, point) => (point[metric] > top[metric] ? point : top))
  const sessions = pluralize(points.length, 'session')
  const period = `from ${date(first)} to ${date(last)}`

  let change
  if (last[metric] > first[metric]) {
    change = `went up from ${format(first[metric])} to ${format(last[metric])}`
  } else if (last[metric] < first[metric]) {
    change = `went down from ${format(first[metric])} to ${format(last[metric])}`
  } else {
    change = `stayed at ${format(first[metric])}`
  }

  return `${label} ${change} over ${sessions}, ${period}. Best: ${format(best[metric])} on ${date(best)}.`
}
