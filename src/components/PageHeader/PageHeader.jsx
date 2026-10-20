import { useRef } from 'react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { useFocusOnRouteChange } from '../../hooks/useFocusOnRouteChange.js'
import IconButton from '../IconButton/IconButton.jsx'
import styles from './PageHeader.module.scss'

/**
 * Top of every page: the page's only `<h1>`, an optional back link and optional actions.
 * Also sets `document.title` and moves focus to the heading when the route changes,
 * so every page gets both just by using this component.
 *
 * @param {object} props
 * @param {string} props.title Page heading.
 * @param {string} [props.documentTitle] Browser tab title, if it should differ from `title`.
 * @param {string} [props.backTo] Route for the back link. No back link when left out.
 * @param {string} [props.backLabel='Back'] Accessible name of the back link, e.g. "Back to workout".
 * @param {import('react').ReactNode} [props.actions] Buttons on the right, e.g. an edit IconButton.
 */
function PageHeader({ title, documentTitle, backTo, backLabel = 'Back', actions }) {
  const headingRef = useRef(null)
  useDocumentTitle(documentTitle ?? title)
  useFocusOnRouteChange(headingRef)

  return (
    <header className={styles.header}>
      {backTo && (
        <IconButton icon="arrowLeft" label={backLabel} to={backTo} className={styles.back} />
      )}
      <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
        {title}
      </h1>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}

export default PageHeader
