import { cx } from '../../lib/classNames.js'
import Button from '../Button/Button.jsx'
import styles from './IconButton.module.scss'

/**
 * Square button with only an icon. `label` is required: it becomes the
 * accessible name (`aria-label`), since there is no visible text.
 * Accepts the other Button props too (`variant`, `to`, `onClick`, `ref`, …).
 *
 * @param {object} props
 * @param {string} props.icon Icon name.
 * @param {string} props.label What the button does, e.g. "Decrease weight".
 * @param {'primary'|'secondary'|'danger'|'ghost'} [props.variant='ghost']
 * @param {string} [props.className]
 */
function IconButton({ icon, label, variant = 'ghost', className, ...rest }) {
  return (
    <Button
      icon={icon}
      variant={variant}
      aria-label={label}
      className={cx(styles.iconButton, className)}
      {...rest}
    />
  )
}

export default IconButton
