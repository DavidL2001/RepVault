import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Card from '../Card/Card.jsx'
import Icon from '../Icon/Icon.jsx'
import IconButton from '../IconButton/IconButton.jsx'
import IncreaseMarker from '../IncreaseMarker/IncreaseMarker.jsx'
import styles from './WorkoutExerciseRow.module.scss'

/**
 * One exercise in the workout in progress: a link to log its sets, plus buttons
 * to move it up or down and to remove it. Render it inside a List.
 *
 * Moving a row in the DOM drops keyboard focus, so the parent passes `focusRequest`
 * after a move and the row puts focus back on the button that was pressed (or the
 * other one, if the pressed one is now disabled at the top or bottom).
 *
 * @param {object} props
 * @param {string} props.name
 * @param {string} props.summary E.g. "3 sets · best 40 kg × 8".
 * @param {boolean} props.dueForIncrease Shows the ⬆ marker.
 * @param {string} props.to Set Logger route for this exercise.
 * @param {boolean} props.isFirst
 * @param {boolean} props.isLast
 * @param {() => void} props.onMoveUp
 * @param {() => void} props.onMoveDown
 * @param {() => void} props.onRemove
 * @param {{ action: 'up'|'down' }|null} [props.focusRequest] New object each time focus should move here.
 */
function WorkoutExerciseRow({
  name,
  summary,
  dueForIncrease,
  to,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
  focusRequest,
}) {
  const linkRef = useRef(null)
  const upRef = useRef(null)
  const downRef = useRef(null)

  useEffect(() => {
    if (!focusRequest) return
    const wanted = focusRequest.action === 'up' ? upRef.current : downRef.current
    const other = focusRequest.action === 'up' ? downRef.current : upRef.current
    const target = [wanted, other].find((button) => button && !button.disabled) ?? linkRef.current
    target?.focus()
  }, [focusRequest])

  return (
    <Card as="li" className={styles.row}>
      <Link ref={linkRef} to={to} className={styles.link}>
        <span className={styles.text}>
          <span className={styles.name}>{name}</span>
          <span className={styles.summary}>{summary}</span>
        </span>
        {dueForIncrease && <IncreaseMarker />}
        <Icon name="chevronRight" className={styles.chevron} />
      </Link>
      <div className={styles.controls}>
        <IconButton
          ref={upRef}
          icon="chevronUp"
          label={`Move ${name} up`}
          onClick={onMoveUp}
          disabled={isFirst}
        />
        <IconButton
          ref={downRef}
          icon="chevronDown"
          label={`Move ${name} down`}
          onClick={onMoveDown}
          disabled={isLast}
        />
        <IconButton icon="trash" label={`Remove ${name}`} onClick={onRemove} />
      </div>
    </Card>
  )
}

export default WorkoutExerciseRow
