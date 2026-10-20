import { cx } from '../../lib/classNames.js'
import styles from './Card.module.scss'

/**
 * Raised surface that groups related content.
 * Extra props go to the element.
 *
 * @param {object} props
 * @param {import('react').ElementType} [props.as='div'] Element to render, e.g. `section` or `li`.
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 */
function Card({ as: Element = 'div', className, children, ...rest }) {
  return (
    <Element className={cx(styles.card, className)} {...rest}>
      {children}
    </Element>
  )
}

export default Card
