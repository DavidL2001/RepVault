import { useId } from 'react'
import { cx } from '../../lib/classNames.js'
import styles from './RadioGroup.module.scss'

/**
 * A group of radio buttons in a `<fieldset>` with a visible `<legend>`.
 * Arrow keys move between options (native radio behaviour), in both variants.
 *
 * @param {object} props
 * @param {string} props.legend Question the options answer, e.g. "Applies to".
 * @param {{ value: string, label: string }[]} props.options
 * @param {string} props.value The selected value.
 * @param {(value: string) => void} props.onChange
 * @param {'list'|'segmented'} [props.variant='list'] `segmented`: options side by side as a
 *   toggle bar (for a few short options, e.g. a chart metric). The selected one is filled and bold.
 */
function RadioGroup({ legend, options, value, onChange, variant = 'list' }) {
  const name = useId()
  const isSegmented = variant === 'segmented'

  return (
    <fieldset className={cx(styles.group, isSegmented && styles.segmentedGroup)}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={cx(isSegmented && styles.segments)}>
        {options.map((option) => {
          const id = `${name}-${option.value}`
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={isSegmented ? styles.segment : styles.row}
            >
              <input
                id={id}
                type="radio"
                name={name}
                className={isSegmented ? styles.segmentInput : styles.input}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
              />
              <span className={cx(isSegmented && styles.segmentLabel)}>{option.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export default RadioGroup
