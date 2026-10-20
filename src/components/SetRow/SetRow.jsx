import { formatSet } from '../../lib/format.js'
import Card from '../Card/Card.jsx'
import IconButton from '../IconButton/IconButton.jsx'
import PrBadge from '../PrBadge/PrBadge.jsx'
import styles from './SetRow.module.scss'

/**
 * One logged set: weight × reps, its number, a PR badge if it set a record,
 * and buttons to edit or delete it. Render it inside a List.
 *
 * @param {object} props
 * @param {number} props.number Set number, from 1.
 * @param {import('../../lib/model.js').WorkoutSet} props.set
 * @param {string[]} props.records `PR_TYPES` the set broke; empty for none.
 * @param {() => void} props.onEdit
 * @param {() => void} props.onDelete
 */
function SetRow({ number, set, records, onEdit, onDelete }) {
  return (
    <Card as="li" className={styles.row}>
      <span className={styles.text}>
        <span className={styles.value}>{formatSet(set)}</span>
        <span className={styles.meta}>
          Set {number}
          {records.length > 0 && <PrBadge types={records} />}
        </span>
      </span>
      <IconButton icon="edit" label={`Edit set ${number}`} onClick={onEdit} />
      <IconButton icon="trash" label={`Delete set ${number}`} onClick={onDelete} />
    </Card>
  )
}

export default SetRow
