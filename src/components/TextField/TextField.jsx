import { useId } from 'react'
import { cx } from '../../lib/classNames.js'
import styles from './TextField.module.scss'

/**
 * Text input with a visible label, plus an optional hint and error message,
 * both linked to the input with `aria-describedby`. The error is announced when it appears.
 * Extra props (`value`, `onChange`, `inputMode`, `ref`, …) go to the `<input>`.
 *
 * @param {object} props
 * @param {string} props.label Visible label.
 * @param {string} [props.hint] Help text under the label.
 * @param {string} [props.error] Error message. Also marks the input as invalid.
 * @param {import('react').ReactNode} [props.before] Shown left of the input (e.g. a − button).
 * @param {import('react').ReactNode} [props.after] Shown right of the input (e.g. a + button).
 * @param {string} [props.className] Class for the wrapper.
 */
function TextField({ label, hint, error, before, after, className, id, type = 'text', ...rest }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const describedBy = cx(hint && hintId, error && errorId) || undefined

  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      <div className={styles.control}>
        {before}
        <input
          id={inputId}
          type={type}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {after}
      </div>
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default TextField
