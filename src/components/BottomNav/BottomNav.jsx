import { Link, matchPath, useLocation } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'
import { cx } from '../../lib/classNames.js'
import Icon from '../Icon/Icon.jsx'
import styles from './BottomNav.module.scss'

/** Each item is active on its own route and on the detail pages under it. */
const ITEMS = [
  { label: 'Home', icon: 'home', to: ROUTES.home, activeOn: [ROUTES.home, ROUTES.startWorkout] },
  {
    label: 'History',
    icon: 'history',
    to: ROUTES.history,
    activeOn: [ROUTES.history, ROUTES.workoutDetails],
  },
  {
    label: 'Exercises',
    icon: 'exercises',
    to: ROUTES.exercises,
    activeOn: [ROUTES.exercises, ROUTES.exerciseDetail],
  },
  { label: 'Settings', icon: 'settings', to: ROUTES.settings, activeOn: [ROUTES.settings] },
]

/**
 * Main navigation bar at the bottom of the screen, within thumb reach.
 * The active item gets `aria-current="page"`, plus a bold label and a top line,
 * so it isn't shown by color alone.
 */
function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav aria-label="Main" className={styles.nav}>
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari drops list semantics without it */}
      <ul role="list" className={styles.list}>
        {ITEMS.map(({ label, icon, to, activeOn }) => {
          const isActive = activeOn.some((path) => matchPath(path, pathname))
          return (
            <li key={to} className={styles.item}>
              <Link
                to={to}
                className={cx(styles.link, isActive && styles.active)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon name={icon} />
                <span className={styles.label}>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNav
