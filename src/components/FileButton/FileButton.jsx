import { useRef } from 'react'
import Button from '../Button/Button.jsx'

/**
 * Button that opens the file picker. The native file input stays hidden: it can't be
 * styled reliably and looks different in every browser, so the Button is what users
 * see, focus and tap. Extra props (`variant`, `icon`, `fullWidth`, …) go to the Button.
 *
 * @param {object} props
 * @param {string} [props.accept] File types to offer, e.g. ".json".
 * @param {(file: File) => void} props.onSelect Called with the chosen file.
 * @param {import('react').ReactNode} props.children Button text, e.g. "Import backup".
 */
function FileButton({ accept, onSelect, children, ...buttonProps }) {
  const inputRef = useRef(null)

  function handleChange(event) {
    const file = event.target.files?.[0]
    // Cleared, so choosing the same file again (e.g. after cancelling) still fires `change`.
    event.target.value = ''
    if (file) onSelect(file)
  }

  return (
    <>
      <Button {...buttonProps} onClick={() => inputRef.current?.click()}>
        {children}
      </Button>
      <input ref={inputRef} type="file" accept={accept} hidden onChange={handleChange} />
    </>
  )
}

export default FileButton
