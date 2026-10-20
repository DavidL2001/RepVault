import { cx } from '../../lib/classNames.js'
import styles from './List.module.scss'

/**
 * Unstyled vertical list for ListItems (or Cards with `as="li"`).
 * Keeps `role="list"` so Safari still announces it as a list without bullets.
 *
 * @param {object} props
 * @param {'ul'|'ol'} [props.as='ul']
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 */
function List({ as: Element = 'ul', className, children, ...rest }) {
  return (
    <Element role="list" className={cx(styles.list, className)} {...rest}>
      {children}
    </Element>
  )
}

export default List
