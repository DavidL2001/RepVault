import { PR_TYPES } from '../../constants/calculations.js'
import Icon from '../Icon/Icon.jsx'
import VisuallyHidden from '../VisuallyHidden/VisuallyHidden.jsx'
import styles from './PrBadge.module.scss'

/** What each record means, for screen readers. */
const RECORD_LABELS = {
  [PR_TYPES.heaviest]: 'heaviest weight',
  [PR_TYPES.oneRepMax]: 'best estimated 1RM',
}

/**
 * "PR" badge for a set that set a personal record: a trophy icon and visible
 * text (never color alone), plus which record it was for screen readers.
 *
 * @param {object} props
 * @param {string[]} props.types `PR_TYPES` values the set broke (at least one).
 */
function PrBadge({ types }) {
  return (
    <span className={styles.badge}>
      <Icon name="trophy" size="sm" className={styles.icon} />
      PR
      <VisuallyHidden>
        {`: new ${types.map((type) => RECORD_LABELS[type]).join(' and ')}`}
      </VisuallyHidden>
    </span>
  )
}

export default PrBadge
