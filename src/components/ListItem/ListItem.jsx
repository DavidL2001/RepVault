import { Link } from 'react-router-dom'
import { cx } from '../../lib/classNames.js'
import Icon from '../Icon/Icon.jsx'
import styles from './ListItem.module.scss'

/**
 * Row inside a List: title (cut off with an ellipsis if too long), optional
 * details below it and optional content on the right.
 * With `to` the whole row is a link; with `onClick` it is a button.
 * When the row is a link or button, `trailing` must not contain buttons or links.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.title
 * @param {import('react').ReactNode} [props.meta] Secondary line, e.g. "3 sets · best 40 kg × 8".
 * @param {import('react').ReactNode} [props.trailing] Content on the right, e.g. a badge or buttons.
 * @param {string} [props.to] Route the row links to.
 * @param {() => void} [props.onClick] Action when the row is pressed.
 */
function ListItem({ title, meta, trailing, to, onClick }) {
  const content = (
    <>
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {meta && <span className={styles.meta}>{meta}</span>}
      </span>
      {trailing}
      {(to || onClick) && <Icon name="chevronRight" className={styles.chevron} />}
    </>
  )

  let row
  if (to) {
    row = (
      <Link to={to} className={cx(styles.row, styles.interactive)}>
        {content}
      </Link>
    )
  } else if (onClick) {
    row = (
      <button type="button" onClick={onClick} className={cx(styles.row, styles.interactive)}>
        {content}
      </button>
    )
  } else {
    row = <div className={styles.row}>{content}</div>
  }

  return <li className={styles.item}>{row}</li>
}

export default ListItem
