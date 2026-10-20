import Icon from '../Icon/Icon.jsx'
import VisuallyHidden from '../VisuallyHidden/VisuallyHidden.jsx'
import styles from './IncreaseMarker.module.scss'

/**
 * ⬆ marker for an exercise that is due for a weight increase. The arrow is
 * decorative; screen readers get the text instead, so it isn't shown by color or icon alone.
 *
 * @param {object} props
 * @param {string} [props.label='Due for a weight increase']
 */
function IncreaseMarker({ label = 'Due for a weight increase' }) {
  return (
    <span className={styles.marker}>
      <Icon name="arrowUp" />
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  )
}

export default IncreaseMarker
