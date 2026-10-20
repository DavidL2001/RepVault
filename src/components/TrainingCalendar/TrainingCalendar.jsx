import { calendarSummary } from '../../lib/calendar.js'
import { cx } from '../../lib/classNames.js'
import { formatShortDate, formatWeekdayInitial } from '../../lib/dates.js'
import styles from './TrainingCalendar.module.scss'

/**
 * Heatmap of the last weeks: one column per week (Monday at the top), a filled
 * square for every day with a workout. The grid is visual only; screen readers
 * get the same information as a sentence, and a visible legend explains the squares.
 * Fits a 320px screen without scrolling.
 *
 * @param {object} props
 * @param {ReturnType<typeof import('../../lib/calendar.js').trainingCalendar>} props.calendar
 */
function TrainingCalendar({ calendar }) {
  const firstWeek = calendar.weeks[0]
  const lastDay = calendar.weeks.at(-1).at(-1)

  return (
    <figure className={styles.figure}>
      <div className={styles.calendar} aria-hidden="true">
        <div className={styles.weekdays}>
          {firstWeek.map((day) => (
            <span key={day.key} className={styles.weekday}>
              {formatWeekdayInitial(day.date)}
            </span>
          ))}
        </div>
        <div className={styles.grid}>
          {calendar.weeks.flat().map((day) => (
            <span
              key={day.key}
              className={cx(
                styles.day,
                day.count > 0 && styles.trained,
                day.isToday && styles.today,
                day.isFuture && styles.future,
              )}
            />
          ))}
        </div>
        <div className={styles.range}>
          <span>{formatShortDate(firstWeek[0].date)}</span>
          <span>{formatShortDate(lastDay.date)}</span>
        </div>
      </div>
      <figcaption className={styles.summary}>{calendarSummary(calendar)}</figcaption>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}>
          <span className={cx(styles.day, styles.swatch)} /> No workout
        </span>
        <span className={styles.legendItem}>
          <span className={cx(styles.day, styles.trained, styles.swatch)} /> Workout
        </span>
        <span className={styles.legendItem}>
          <span className={cx(styles.day, styles.today, styles.swatch)} /> Today
        </span>
      </div>
    </figure>
  )
}

export default TrainingCalendar
