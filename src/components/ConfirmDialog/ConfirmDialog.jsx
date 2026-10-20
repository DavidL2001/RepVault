import { useRef } from 'react'
import Button from '../Button/Button.jsx'
import Modal from '../Modal/Modal.jsx'

/**
 * Asks the user to confirm an action. Focus starts on Cancel, so a stray
 * Enter press never confirms something destructive.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.title The question, e.g. "End workout?".
 * @param {import('react').ReactNode} [props.message] More detail under the title.
 * @param {string} [props.confirmLabel='Confirm'] Say what happens, e.g. "Delete exercise".
 * @param {string} [props.cancelLabel='Cancel']
 * @param {'primary'|'danger'} [props.variant='primary'] Use `danger` for destructive actions.
 * @param {() => void} props.onConfirm
 * @param {() => void} props.onCancel Also called on Escape or a backdrop tap.
 */
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null)

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      initialFocusRef={cancelRef}
      showCloseButton={false}
      footer={
        <>
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && <p>{message}</p>}
    </Modal>
  )
}

export default ConfirmDialog
