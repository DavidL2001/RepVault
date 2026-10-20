import { generatePath } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'
import { workoutVolume } from '../../lib/calculations.js'
import { formatDate } from '../../lib/dates.js'
import { formatKg, pluralize } from '../../lib/format.js'
import DateBadge from '../DateBadge/DateBadge.jsx'
import ListItem from '../ListItem/ListItem.jsx'

/**
 * A finished workout as a list row linking to its details: date badge, name,
 * and "mån 19 okt. 2026 · 2 exercises · 1 345 kg". Used on Home and History.
 * Render it inside a List.
 *
 * @param {object} props
 * @param {import('../../lib/model.js').WorkoutSession} props.workout
 */
function WorkoutListItem({ workout }) {
  const exercises = pluralize(workout.entries.length, 'exercise')

  return (
    <ListItem
      leading={<DateBadge date={workout.startedAt} />}
      title={workout.name}
      meta={`${formatDate(workout.startedAt)} · ${exercises} · ${formatKg(workoutVolume(workout))}`}
      to={generatePath(ROUTES.workoutDetails, { id: workout.id })}
    />
  )
}

export default WorkoutListItem
