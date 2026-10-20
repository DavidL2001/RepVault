import { useState } from 'react'
import { formatNumberInput } from '../../lib/format.js'
import { stepNumber } from '../../lib/numbers.js'
import IconButton from '../IconButton/IconButton.jsx'
import NumberField from '../NumberField/NumberField.jsx'
import VisuallyHidden from '../VisuallyHidden/VisuallyHidden.jsx'

/**
 * NumberField with large − / + buttons, for adjusting kg and reps without typing.
 * The value is a string so partly typed numbers ("42,") don't get lost;
 * parse it with `parseDecimal` from `lib/numbers.js`.
 * Accepts all NumberField props (`hint`, `error`, `inputMode`, …).
 *
 * @param {object} props
 * @param {string} props.label Visible label, e.g. "Weight (kg)".
 * @param {string} props.value Current value, as typed.
 * @param {(value: string) => void} props.onChange Called with the new value.
 * @param {number} [props.step=1] Amount the buttons add or remove.
 * @param {number} [props.min] Lowest value the buttons go to.
 * @param {number} [props.max] Highest value the buttons go to.
 * @param {string} [props.decreaseLabel] Defaults to "Decrease <label>".
 * @param {string} [props.increaseLabel] Defaults to "Increase <label>".
 */
function Stepper({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  decreaseLabel = `Decrease ${label}`,
  increaseLabel = `Increase ${label}`,
  ...rest
}) {
  // Only button presses are announced; typing is already read by screen readers.
  const [announcement, setAnnouncement] = useState('')

  function stepBy(delta) {
    const next = formatNumberInput(stepNumber(value, delta, { min, max }))
    onChange(next)
    setAnnouncement(`${label}: ${next}`)
  }

  return (
    <>
      <NumberField
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        before={
          <IconButton
            icon="minus"
            label={decreaseLabel}
            variant="secondary"
            onClick={() => stepBy(-step)}
          />
        }
        after={
          <IconButton
            icon="plus"
            label={increaseLabel}
            variant="secondary"
            onClick={() => stepBy(step)}
          />
        }
        {...rest}
      />
      <VisuallyHidden aria-live="polite">{announcement}</VisuallyHidden>
    </>
  )
}

export default Stepper
