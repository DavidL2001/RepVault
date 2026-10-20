import { useNameForm } from '../../hooks/useNameForm.js'
import TextField from '../TextField/TextField.jsx'

/**
 * Form with one name field and validation. Has no buttons of its own: put a
 * submit Button with `form={id}` wherever it fits (NameDialog does this).
 *
 * @param {object} props
 * @param {string} props.id Form id, for the submit button's `form` attribute.
 * @param {string} [props.label='Name']
 * @param {string} [props.initialValue='']
 * @param {(name: string) => string|null} props.validate Error message, or `null` when valid.
 * @param {(name: string) => void} props.onSubmit Called with the cleaned-up name.
 * @param {import('react').RefObject<HTMLInputElement>} props.inputRef Ref for the input.
 */
function NameForm({ id, label = 'Name', initialValue = '', validate, onSubmit, inputRef }) {
  const { value, setValue, error, handleSubmit } = useNameForm({
    initialValue,
    validate,
    onSubmit,
    inputRef,
  })

  return (
    <form id={id} onSubmit={handleSubmit} noValidate>
      <TextField
        ref={inputRef}
        label={label}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        error={error ?? undefined}
        autoComplete="off"
        autoCapitalize="sentences"
      />
    </form>
  )
}

export default NameForm
