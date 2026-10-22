import { useId } from 'react'
import { cx } from '../../lib/classNames.js'
import styles from './Section.module.scss'

/**
 * A titled part of a page: a `<section>` named by its `<h2>`, so screen reader users
 * can jump between parts by heading or by region.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.title Heading text.
 * @param {import('react').ReactNode} props.children
 * @param {import('react').ReactNode} [props.action] Shown next to the heading, e.g. a "See all" link.
 * @param {import('react').RefObject<HTMLHeadingElement>} [props.headingRef] Makes the heading a
 *   focus target (e.g. after deleting the row that had focus).
 * @param {'md'|'lg'} [props.spacing='md'] Space between the children; `lg` for groups of lists.
 */
function Section({ title, children, action, headingRef, spacing = 'md' }) {
  const headingId = useId()
  const heading = (
    <h2
      id={headingId}
      ref={headingRef}
      tabIndex={headingRef ? -1 : undefined}
      className={styles.heading}
    >
      {title}
    </h2>
  )

  return (
    <section className={cx(styles.section, styles[spacing])} aria-labelledby={headingId}>
      {action ? (
        <div className={styles.header}>
          {heading}
          {action}
        </div>
      ) : (
        heading
      )}
      {children}
    </section>
  )
}

export default Section
