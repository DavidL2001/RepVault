import { useRef, useState } from 'react'
import { parseSetFields } from '../lib/sets.js'

/** Fields in screen order, so focus goes to the first one with an error. */
const FIELD_ORDER = ['kg', 'reps']

/**
 * State and validation for the kg + reps fields. Errors show after a failed
 * submit and update while typing; the failed field gets focus. After a valid
 * submit the values stay, so the next set starts from the one just logged.
 *
 * @param {object} options
 * @param {{ kg: string, reps: string }} options.initialValues As text, e.g. "42,5".
 * @param {(values: { kg: number, reps: number }) => void} options.onSubmit
 * @param {import('react').RefObject<HTMLInputElement>} options.kgRef Ref for the kg input.
 */
export function useSetForm({ initialValues, onSubmit, kgRef }) {
  const [values, setValues] = useState(initialValues)
  const [submitted, setSubmitted] = useState(false)
  const repsRef = useRef(null)
  const { values: parsed, errors } = parseSetFields(values)

  /** Returns a setter for one field: `setField('kg')(value)`. */
  function setField(field) {
    return (value) => setValues((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!parsed) {
      setSubmitted(true)
      const refs = { kg: kgRef, reps: repsRef }
      refs[FIELD_ORDER.find((field) => errors[field])].current?.focus()
      return
    }
    setSubmitted(false)
    onSubmit(parsed)
  }

  return { values, errors: submitted ? errors : {}, setField, handleSubmit, repsRef }
}
