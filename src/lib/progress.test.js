import { describe, expect, it } from 'vitest'
import { CHART_METRICS } from '../constants/charts.js'
import { makeSet } from '../test/factories.js'
import { formatDate } from './dates.js'
import { formatMetric, progressPoints, progressSummary } from './progress.js'

const session = (workoutId, startedAt, sets) => ({ workoutId, startedAt, sets })
const sessions = [
  // Newest first on purpose: points must come out oldest first.
  session('c', '2026-10-20T17:00:00.000Z', [makeSet(47.5, 6), makeSet(45, 8)]),
  session('b', '2026-10-13T17:00:00.000Z', [makeSet(45, 8)]),
  session('a', '2026-10-06T17:00:00.000Z', [makeSet(40, 8), makeSet(40, 8)]),
  session('empty', '2026-10-01T17:00:00.000Z', []),
]
const points = progressPoints(sessions)
const day = (iso) => formatDate(iso, 'en-GB')

describe('progressPoints', () => {
  it('makes one point per session, oldest first, skipping empty sessions', () => {
    expect(points.map((point) => point.workoutId)).toEqual(['a', 'b', 'c'])
  })

  it('works out heaviest weight, best 1RM and volume per session', () => {
    expect(points[2]).toEqual({
      workoutId: 'c',
      date: '2026-10-20T17:00:00.000Z',
      heaviest: 47.5,
      oneRepMax: 57,
      volume: 645,
    })
  })
})

describe('formatMetric', () => {
  it('shows kg, with one decimal for estimated 1RM', () => {
    expect(formatMetric(CHART_METRICS.heaviest, 47.5, 'sv-SE')).toBe('47,5 kg')
    expect(formatMetric(CHART_METRICS.oneRepMax, 53.333, 'en-GB')).toBe('53.3 kg')
  })
})

describe('progressSummary', () => {
  it('describes the change, the period and the best session', () => {
    expect(progressSummary(points, CHART_METRICS.heaviest, 'en-GB')).toBe(
      `Heaviest weight went up from 40 kg to 47.5 kg over 3 sessions, from ${day('2026-10-06T17:00:00.000Z')} to ${day('2026-10-20T17:00:00.000Z')}. Best: 47.5 kg on ${day('2026-10-20T17:00:00.000Z')}.`,
    )
  })

  it('says when it went down', () => {
    const down = progressPoints([
      sessions[1],
      session('d', '2026-10-27T17:00:00.000Z', [makeSet(40, 5)]),
    ])
    expect(progressSummary(down, CHART_METRICS.volume, 'en-GB')).toMatch(
      /^Volume went down from 360 kg to 200 kg over 2 sessions/,
    )
  })

  it('says when it stayed the same', () => {
    const same = progressPoints([
      sessions[1],
      session('d', '2026-10-27T17:00:00.000Z', [makeSet(45, 3)]),
    ])
    expect(progressSummary(same, CHART_METRICS.heaviest, 'en-GB')).toMatch(
      /^Heaviest weight stayed at 45 kg over 2 sessions/,
    )
  })

  it('handles a single session', () => {
    expect(progressSummary(points.slice(0, 1), CHART_METRICS.oneRepMax, 'en-GB')).toBe(
      `Estimated 1RM: 50.7 kg in 1 session, on ${day('2026-10-06T17:00:00.000Z')}.`,
    )
  })

  it('handles no sessions', () => {
    expect(progressSummary([], CHART_METRICS.heaviest)).toBe('No sessions yet.')
  })
})
