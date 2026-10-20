import Icon from '../Icon/Icon.jsx'
import styles from './EmptyState.module.scss'

/**
 * Shown when a list has nothing in it yet, with a hint on what to do next.
 *
 * @param {object} props
 * @param {string} props.title E.g. "No exercises yet".
 * @param {import('react').ReactNode} [props.children] Explanation text.
 * @param {string} [props.icon] Icon name shown above the title.
 * @param {import('react').ReactNode} [props.action] Usually a Button, e.g. "Create exercise".
 * @param {2|3} [props.headingLevel=2] Pick the level that fits the page's heading order.
 */
function EmptyState({ title, children, icon, action, headingLevel = 2 }) {
  const Heading = `h${headingLevel}`

  return (
    <div className={styles.empty}>
      {icon && <Icon name={icon} size="lg" className={styles.icon} />}
      <Heading className={styles.title}>{title}</Heading>
      {children && <div className={styles.text}>{children}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}

export default EmptyState
