import { generatePath, NavLink } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'

/** Example id used to reach routes with params until real data exists. */
const EXAMPLE_ID = 'example'

const LINKS = [
  { label: 'Home', to: ROUTES.home },
  { label: 'Start workout', to: ROUTES.startWorkout },
  { label: 'Active workout', to: ROUTES.activeWorkout },
  { label: 'Set logger', to: generatePath(ROUTES.setLogger, { exerciseId: EXAMPLE_ID }) },
  { label: 'Workout summary', to: generatePath(ROUTES.workoutSummary, { workoutId: EXAMPLE_ID }) },
  { label: 'Exercises', to: ROUTES.exercises },
  { label: 'Exercise detail', to: generatePath(ROUTES.exerciseDetail, { id: EXAMPLE_ID }) },
  { label: 'History', to: ROUTES.history },
  { label: 'Workout details', to: generatePath(ROUTES.workoutDetails, { id: EXAMPLE_ID }) },
  { label: 'Settings', to: ROUTES.settings },
  ...(import.meta.env.DEV ? [{ label: 'Design preview (dev)', to: ROUTES.designPreview }] : []),
]

/**
 * TEMPORARY scaffold navigation linking to every route.
 * Replaced by BottomNav in `feature/ui-components` (roadmap step 4).
 */
function PlaceholderNav() {
  return (
    <nav aria-label="All pages (placeholder)">
      <ul>
        {LINKS.map(({ label, to }) => (
          <li key={to}>
            {/* `end` stops Home ("/") from matching every route. */}
            <NavLink to={to} end>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default PlaceholderNav
