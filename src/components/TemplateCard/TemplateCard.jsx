import Card from '../Card/Card.jsx'
import IconButton from '../IconButton/IconButton.jsx'
import VisuallyHidden from '../VisuallyHidden/VisuallyHidden.jsx'
import styles from './TemplateCard.module.scss'

/**
 * Large tappable card that starts a workout from a template, with a separate
 * edit button next to it (never nested inside the start button). Render it inside a List.
 *
 * @param {object} props
 * @param {string} props.name Template name.
 * @param {string} props.meta E.g. "3 exercises · Last used Tue 20 Oct 2026".
 * @param {() => void} props.onStart
 * @param {() => void} props.onEdit
 * @param {boolean} [props.startDisabled=false] E.g. while another workout is in progress.
 */
function TemplateCard({ name, meta, onStart, onEdit, startDisabled = false }) {
  return (
    <Card as="li" className={styles.card}>
      <button type="button" className={styles.start} onClick={onStart} disabled={startDisabled}>
        <VisuallyHidden>Start </VisuallyHidden>
        <span className={styles.name}>{name}</span>
        <span className={styles.meta}>{meta}</span>
      </button>
      <IconButton icon="edit" label={`Edit ${name}`} onClick={onEdit} />
    </Card>
  )
}

export default TemplateCard
