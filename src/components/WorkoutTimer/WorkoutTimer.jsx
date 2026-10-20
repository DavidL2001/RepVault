import { useElapsedTime } from '../../hooks/useElapsedTime.js'
import { formatElapsed } from '../../lib/format.js'
import VisuallyHidden from '../VisuallyHidden/VisuallyHidden.jsx'
import styles from './WorkoutTimer.module.scss'

/**
 * Running time since the workout started. `role="timer"` is not a live region,
 * so screen readers read the current value when they reach it instead of every second.
 *
 * @param {object} props
 * @param {string} props.startedAt ISO date.
 */
function WorkoutTimer({ startedAt }) {
  const elapsed = useElapsedTime(startedAt)

  return (
    <span className={styles.timer}>
      <VisuallyHidden>Elapsed time: </VisuallyHidden>
      <span role="timer">{formatElapsed(elapsed)}</span>
    </span>
  )
}

export default WorkoutTimer
