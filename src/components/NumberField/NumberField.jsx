import TextField from '../TextField/TextField.jsx'

/**
 * TextField for numbers. Uses a text input with `inputMode` (not `type="number"`),
 * so phones show the right keypad and typing "42,5" works. Parse the value with
 * `parseDecimal` from `lib/numbers.js`.
 * Accepts all TextField props.
 *
 * @param {object} props
 * @param {'decimal'|'numeric'} [props.inputMode='decimal'] `decimal` for kg, `numeric` for reps.
 */
function NumberField({ inputMode = 'decimal', ...rest }) {
  return <TextField inputMode={inputMode} autoComplete="off" {...rest} />
}

export default NumberField
