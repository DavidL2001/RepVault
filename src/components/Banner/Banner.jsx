import { cx } from '../../lib/classNames.js'
import Icon from '../Icon/Icon.jsx'
import IconButton from '../IconButton/IconButton.jsx'
import VisuallyHidden from '../VisuallyHidden/VisuallyHidden.jsx'
import styles from './Banner.module.scss'

/** Screen reader prefix per variant, so the meaning never relies on color or icon alone. */
const VARIANT_LABELS = {
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  danger: 'Error',
}

/**
 * Message box for hints and feedback, with an icon and colored edge per variant.
 * Not a live region: to announce a change, put it inside an `aria-live` container.
 *
 * @param {object} props
 * @param {'info'|'success'|'warning'|'danger'} [props.variant='info']
 * @param {import('react').ReactNode} [props.title] Bold first line.
 * @param {import('react').ReactNode} [props.children] Message text, links, etc.
 * @param {import('react').ReactNode} [props.action] A Button under the message, e.g. "Resume workout".
 * @param {() => void} [props.onDismiss] Shows a dismiss button when set.
 * @param {string} [props.dismissLabel='Dismiss']
 * @param {string} [props.icon] Icon name, instead of the variant's icon.
 * @param {string} [props.srLabel] Screen reader prefix, instead of the variant's ("Warning", …).
 * @param {string} [props.className]
 */
function Banner({
  variant = 'info',
  title,
  children,
  action,
  onDismiss,
  dismissLabel = 'Dismiss',
  icon = variant,
  srLabel = VARIANT_LABELS[variant],
  className,
}) {
  return (
    <div className={cx(styles.banner, styles[variant], className)}>
      <Icon name={icon} className={styles.icon} />
      <div className={styles.text}>
        <VisuallyHidden>{srLabel}: </VisuallyHidden>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div>{children}</div>}
        {action && <div className={styles.action}>{action}</div>}
      </div>
      {onDismiss && (
        <IconButton
          icon="close"
          label={dismissLabel}
          onClick={onDismiss}
          className={styles.dismiss}
        />
      )}
    </div>
  )
}

export default Banner
