import { dateBadgeParts } from '../../lib/dates.js'
import styles from './DateBadge.module.scss'

/**
 * Calendar-style date marker ("20" over "Tue") for a list row.
 * Decorative: hidden from screen readers, so the row must also show the full date as text.
 *
 * @param {object} props
 * @param {string} props.date ISO date.
 */
function DateBadge({ date }) {
  const { day, weekday } = dateBadgeParts(date)

  return (
    <span className={styles.badge} aria-hidden="true">
      <span className={styles.day}>{day}</span>
      <span className={styles.weekday}>{weekday}</span>
    </span>
  )
}

export default DateBadge
