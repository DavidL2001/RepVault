import styles from './StickyActionBar.module.scss'

/**
 * Bar that sticks to the bottom of the screen, within thumb reach, for a page's
 * main actions ("Log set", "End workout"). Place it last on the page.
 * Pages using it should hide the BottomNav, so the two bars don't overlap.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children Usually one or two full-width Buttons.
 */
function StickyActionBar({ children }) {
  // The data attribute lets AppShell drop its bottom padding, so the bar sits flush at the bottom.
  return (
    <div className={styles.bar} data-sticky-action-bar>
      {children}
    </div>
  )
}

export default StickyActionBar
