import { useRef, useState } from 'react'
import { DEFAULT_PROGRESSION } from '../constants/defaults.js'
import { validateExerciseForm } from '../lib/exercises.js'
import { formatNumberInput } from '../lib/format.js'

/** Fields in screen order, so focus goes to the first one with an error. */
const FIELD_ORDER = ['name', 'targetReps']

/** @returns {import('../lib/exercises.js').ExerciseFormValues} */
function initialValues() {
  return {
    name: '',
    hasRule: false,
    targetReps: formatNumberInput(DEFAULT_PROGRESSION.targetReps),
    mode: DEFAULT_PROGRESSION.mode,
  }
}

/**
 * State and validation for the exercise form. Errors show after the first submit
 * attempt and then update while typing; a failed submit moves focus to the first error.
 *
 * @param {object} options
 * @param {import('../lib/model.js').Exercise[]} options.exercises Existing exercises (duplicate check).
 * @param {(fields: { name: string, progression: object|null }) => void} options.onSubmit
 *   Called with clean values when the form is valid.
 * @param {import('react').RefObject<HTMLInputElement>} options.nameRef Ref for the name input:
 *   focused on a failed submit, and usable to focus it on open (e.g. by a Modal).
 */
export function useExerciseForm({ exercises, onSubmit, nameRef }) {
  const [values, setValues] = useState(initialValues)
  const [submitted, setSubmitted] = useState(false)

  const targetRepsRef = useRef(null)

  const { errors, fields } = validateExerciseForm(values, exercises)

  /** Returns a setter for one field: `setField('name')(value)`. */
  function setField(field) {
    return (value) => setValues((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    const firstError = FIELD_ORDER.find((field) => errors[field])
    if (firstError) {
      const refs = { name: nameRef, targetReps: targetRepsRef }
      refs[firstError].current?.focus()
      return
    }
    onSubmit(fields)
  }

  return {
    values,
    errors: submitted ? errors : {},
    setField,
    handleSubmit,
    targetRepsRef,
  }
}
