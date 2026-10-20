import { lazy, Suspense, useCallback, useMemo } from 'react'
import { CHART_METRIC_LABELS } from '../../constants/charts.js'
import { cx } from '../../lib/classNames.js'
import { formatDate, formatShortDate } from '../../lib/dates.js'
import { formatMetric, progressSummary } from '../../lib/progress.js'
import DataTable from '../DataTable/DataTable.jsx'
import styles from './ProgressChart.module.scss'

// Chart.js is big; load it only when a chart is shown. The text below doesn't wait for it.
const LineChart = lazy(() => import('../LineChart/LineChart.jsx'))

/**
 * Line chart of one metric over an exercise's sessions (x axis = workout date),
 * with its text alternative built in: a summary sentence under the chart and the
 * numbers in a "Show data" table. The canvas itself is hidden from screen readers.
 *
 * @param {object} props
 * @param {import('../../lib/progress.js').ProgressPoint[]} props.points Oldest first.
 * @param {string} props.metric One of `CHART_METRICS`.
 * @param {'md'|'sm'} [props.size='md'] `sm` for the small chart in the Set Logger.
 */
function ProgressChart({ points, metric, size = 'md' }) {
  const label = CHART_METRIC_LABELS[metric]
  const labels = useMemo(() => points.map((point) => formatShortDate(point.date)), [points])
  const values = useMemo(() => points.map((point) => point[metric]), [points, metric])
  const tooltipTitle = useCallback((index) => formatDate(points[index].date), [points])
  const formatValue = useCallback((value) => formatMetric(metric, value), [metric])

  return (
    <figure className={styles.figure}>
      {points.length > 0 && (
        // The box keeps its height while Chart.js loads, so nothing jumps.
        <div className={cx(styles.canvas, styles[size])} aria-hidden="true">
          <Suspense>
            <LineChart
              labels={labels}
              values={values}
              tooltipTitle={tooltipTitle}
              formatValue={formatValue}
              size={size}
            />
          </Suspense>
        </div>
      )}
      <figcaption className={styles.summary}>{progressSummary(points, metric)}</figcaption>
      {points.length > 0 && (
        <details className={styles.details}>
          <summary className={styles.toggle}>Show data</summary>
          <DataTable
            caption={`${label} per session`}
            hideCaption
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'value', label, numeric: true },
            ]}
            rows={points.map((point) => ({
              date: formatDate(point.date),
              value: formatValue(point[metric]),
            }))}
            rowKey={(_, index) => points[index].workoutId}
          />
        </details>
      )}
    </figure>
  )
}

export default ProgressChart
