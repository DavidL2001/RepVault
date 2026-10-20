import { useRef, useState } from 'react'
import { DEFAULT_PROGRESSION } from '../constants/defaults.js'
import { parseProgressionFields } from '../lib/exercises.js'
import { formatNumberInput } from '../lib/format.js'

/**
 * State and validation for editing a progression rule on its own (Exercise Detail).
 * The error shows after a failed submit, which also focuses the field.
 *
 * @param {object} options
 * @param {import('../lib/model.js').Progression|null} options.rule Current rule; `null` starts from the defaults.
 * @param {(rule: import('../lib/model.js').Progression) => void} options.onSubmit Called with a valid rule.
 */
export function useProgressionForm({ rule, onSubmit }) {
  const start = rule ?? DEFAULT_PROGRESSION
  const [values, setValues] = useState(() => ({
    targetReps: formatNumberInput(start.targetReps),
    mode: start.mode,
  }))
  const [submitted, setSubmitted] = useState(false)
  const targetRepsRef = useRef(null)
  const { progression, errors } = parseProgressionFields(values)

  /** Returns a setter for one field: `setField('mode')(value)`. */
  function setField(field) {
    return (value) => setValues((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    if (!progression) {
      targetRepsRef.current?.focus()
      return
    }
    onSubmit(progression)
  }

  return { values, errors: submitted ? errors : {}, setField, handleSubmit, targetRepsRef }
}
