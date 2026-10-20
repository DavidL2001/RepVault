import { useRef } from 'react'
import { cx } from '../../lib/classNames.js'
import BottomNav from '../BottomNav/BottomNav.jsx'
import styles from './AppShell.module.scss'

const MAIN_ID = 'main'

/**
 * App layout: skip link, the `<main>` column (max ~600px, centered, respecting
 * safe areas) and the BottomNav.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children The current page.
 * @param {boolean} [props.showNav=true] Hide the BottomNav, e.g. during a workout.
 */
function AppShell({ children, showNav = true }) {
  const mainRef = useRef(null)

  // With HashRouter, a plain `#main` link would change the route, so move focus by hand.
  function skipToMain(event) {
    event.preventDefault()
    mainRef.current?.focus()
  }

  return (
    <div className={styles.shell}>
      <a href={`#${MAIN_ID}`} className={styles.skipLink} onClick={skipToMain}>
        Skip to main content
      </a>
      <main
        id={MAIN_ID}
        ref={mainRef}
        tabIndex={-1}
        className={cx(styles.main, !showNav && styles.withoutNav)}
      >
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}

export default AppShell
