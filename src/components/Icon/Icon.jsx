import { cx } from '../../lib/classNames.js'
import { ICONS } from './icons.jsx'
import styles from './Icon.module.scss'

/**
 * Decorative inline SVG icon. Always hidden from screen readers: the surrounding
 * element must provide the meaning (visible text, or `aria-label` on an IconButton).
 * Takes the current text color.
 *
 * @param {object} props
 * @param {keyof typeof ICONS} props.name Icon to show (see `icons.jsx`).
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.className]
 */
function Icon({ name, size = 'md', className }) {
  return (
    <svg
      className={cx(styles.icon, styles[size], className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  )
}

export default Icon
