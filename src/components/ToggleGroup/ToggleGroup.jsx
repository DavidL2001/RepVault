import { useId } from 'react'
import styles from './ToggleGroup.module.scss'

/**
 * A few options side by side as toggle buttons, one of them pressed (e.g. Dark | Light).
 * Every option is its own Tab stop and switches with Enter or Space, and screen readers
 * announce it as "pressed" or "not pressed". Looks like RadioGroup's `segmented` variant;
 * use that one inside forms, where Enter should submit.
 *
 * @param {object} props
 * @param {string} props.label Visible name of the group, e.g. "Theme".
 * @param {{ value: string, label: string }[]} props.options
 * @param {string} props.value The pressed option.
 * @param {(value: string) => void} props.onChange
 */
function ToggleGroup({ label, options, value, onChange }) {
  const labelId = useId()

  return (
    <div role="group" aria-labelledby={labelId} className={styles.group}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div className={styles.segments}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={styles.segment}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ToggleGroup
