import { useState } from 'react'
import { normalizeName } from '../lib/names.js'

/**
 * State for a form with a single name field. The error shows after the first
 * submit attempt and then updates while typing; a failed submit focuses the field.
 *
 * @param {object} options
 * @param {string} [options.initialValue='']
 * @param {(name: string) => string|null} options.validate Error message, or `null` when valid.
 * @param {(name: string) => void} options.onSubmit Called with the cleaned-up name.
 * @param {import('react').RefObject<HTMLInputElement>} options.inputRef
 */
export function useNameForm({ initialValue = '', validate, onSubmit, inputRef }) {
  const [value, setValue] = useState(initialValue)
  const [submitted, setSubmitted] = useState(false)
  const error = validate(value)

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    if (error) {
      inputRef.current?.focus()
      return
    }
    onSubmit(normalizeName(value))
  }

  return { value, setValue, error: submitted ? error : null, handleSubmit }
}
