import { useId, useRef } from 'react'
import Button from '../Button/Button.jsx'
import Modal from '../Modal/Modal.jsx'
import NameForm from '../NameForm/NameForm.jsx'

/**
 * Modal that asks for a name (create or rename), with focus in the field on open.
 * The form starts fresh every time it opens.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.title Dialog heading, e.g. "New template".
 * @param {string} [props.label='Name']
 * @param {string} [props.initialValue=''] Current name when renaming.
 * @param {string} props.submitLabel E.g. "Create and start", "Save".
 * @param {(name: string) => string|null} props.validate Error message, or `null` when valid.
 * @param {(name: string) => void} props.onSubmit Called with the cleaned-up name.
 * @param {() => void} props.onClose Cancel, Escape or backdrop.
 * @param {import('react').ReactNode} [props.extraAction] Extra footer button, e.g. "Delete".
 */
function NameDialog({
  open,
  title,
  label,
  initialValue,
  submitLabel,
  validate,
  onSubmit,
  onClose,
  extraAction,
}) {
  const formId = useId()
  const inputRef = useRef(null)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      initialFocusRef={inputRef}
      footer={
        <>
          {extraAction}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <NameForm
        id={formId}
        label={label}
        initialValue={initialValue}
        validate={validate}
        onSubmit={onSubmit}
        inputRef={inputRef}
      />
    </Modal>
  )
}

export default NameDialog
