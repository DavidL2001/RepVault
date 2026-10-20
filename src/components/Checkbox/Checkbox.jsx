import { useId } from 'react'
import styles from './Checkbox.module.scss'

/**
 * Checkbox with its label on the same row; the whole row can be tapped.
 * Extra props (`aria-controls`, `name`, …) go to the `<input>`.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {boolean} props.checked
 * @param {(checked: boolean) => void} props.onChange
 * @param {string} [props.hint] Help text under the row.
 */
function Checkbox({ label, checked, onChange, hint, ...rest }) {
  const id = useId()
  const hintId = `${id}-hint`

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.row}>
        <input
          id={id}
          type="checkbox"
          className={styles.input}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby={hint ? hintId : undefined}
          {...rest}
        />
        <span>{label}</span>
      </label>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  )
}

export default Checkbox
