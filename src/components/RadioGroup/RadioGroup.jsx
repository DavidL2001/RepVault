import { useId } from 'react'
import styles from './RadioGroup.module.scss'

/**
 * A group of radio buttons in a `<fieldset>` with a visible `<legend>`.
 * Arrow keys move between options (native radio behaviour).
 *
 * @param {object} props
 * @param {string} props.legend Question the options answer, e.g. "Applies to".
 * @param {{ value: string, label: string }[]} props.options
 * @param {string} props.value The selected value.
 * @param {(value: string) => void} props.onChange
 */
function RadioGroup({ legend, options, value, onChange }) {
  const name = useId()

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      {options.map((option) => {
        const id = `${name}-${option.value}`
        return (
          <label key={option.value} htmlFor={id} className={styles.row}>
            <input
              id={id}
              type="radio"
              name={name}
              className={styles.input}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        )
      })}
    </fieldset>
  )
}

export default RadioGroup
