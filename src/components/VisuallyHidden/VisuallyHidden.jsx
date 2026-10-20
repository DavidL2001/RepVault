import styles from './VisuallyHidden.module.scss'

/**
 * Text that only screen readers get, e.g. "Warning:" before a banner message.
 * Extra props (like `aria-live`) are passed to the `<span>`.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 */
function VisuallyHidden({ children, ...rest }) {
  return (
    <span className={styles.hidden} {...rest}>
      {children}
    </span>
  )
}

export default VisuallyHidden
