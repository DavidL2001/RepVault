import { useEffect, useEffectEvent, useId, useRef } from 'react'
import IconButton from '../IconButton/IconButton.jsx'
import styles from './Modal.module.scss'

/**
 * Modal dialog built on the native `<dialog>` element:
 * - opening moves focus into the dialog (to `initialFocusRef`, or the dialog itself)
 * - focus stays inside while it is open (the page behind is inert)
 * - Escape, the close button or tapping the backdrop calls `onClose`
 * - closing returns focus to the element that opened it
 * The content is only rendered while open, so forms inside start fresh each time.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose Called when the user closes it. Set `open` to false here.
 * @param {string} props.title Dialog heading (`<h2>`), also its accessible name.
 * @param {import('react').ReactNode} props.children
 * @param {import('react').ReactNode} [props.footer] Actions shown at the bottom, e.g. Buttons.
 * @param {import('react').RefObject<HTMLElement>} [props.initialFocusRef] Element to focus on open.
 * @param {boolean} [props.showCloseButton=true] Show the × button in the header.
 */
function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  initialFocusRef,
  showCloseButton = true,
}) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const handleClose = useEffectEvent(() => onClose())

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    const trigger = document.activeElement

    dialog.showModal()
    ;(initialFocusRef?.current ?? dialog).focus()

    // Escape closes the native dialog and fires `close`; keep React state in sync.
    const onNativeClose = () => handleClose()
    // A click on the dialog element itself (not its content) is a tap on the backdrop.
    const onClick = (event) => event.target === dialog && handleClose()
    dialog.addEventListener('close', onNativeClose)
    dialog.addEventListener('click', onClick)

    return () => {
      dialog.removeEventListener('close', onNativeClose)
      dialog.removeEventListener('click', onClick)
      dialog.close()
      if (trigger?.isConnected) trigger.focus()
    }
  }, [open, initialFocusRef])

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId} tabIndex={-1}>
      {open && (
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {showCloseButton && <IconButton icon="close" label="Close" onClick={onClose} />}
          </div>
          <div className={styles.body}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      )}
    </dialog>
  )
}

export default Modal
