import { Link } from 'react-router-dom'
import { cx } from '../../lib/classNames.js'
import Icon from '../Icon/Icon.jsx'
import styles from './Button.module.scss'

/**
 * Button for actions, or a router link styled as a button when `to` is set
 * (use `to` for navigation, so it stays a real link).
 * Extra props (`onClick`, `disabled`, `aria-*`, `ref`, …) go to the element.
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'danger'|'ghost'} [props.variant='primary']
 * @param {'md'|'lg'} [props.size='md'] `lg` for the main action on a page.
 * @param {boolean} [props.fullWidth=false]
 * @param {string} [props.icon] Icon name shown before the text.
 * @param {string} [props.to] Route to link to. Renders a `<Link>` instead of a `<button>`.
 * @param {'button'|'submit'|'reset'} [props.type='button']
 * @param {string} [props.className]
 * @param {import('react').ReactNode} [props.children]
 */
function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  to,
  type = 'button',
  className,
  children,
  ...rest
}) {
  const classes = cx(
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    className,
  )
  const content = (
    <>
      {icon && <Icon name={icon} />}
      {children}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  )
}

export default Button
