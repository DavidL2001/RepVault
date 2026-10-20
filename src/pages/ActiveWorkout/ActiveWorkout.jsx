import { ROUTES } from '../../constants/routes.js'
import { useAppState } from '../../hooks/useAppState.js'
import { formatDate, formatTime } from '../../lib/dates.js'
import { pluralize } from '../../lib/format.js'
import Button from '../../components/Button/Button.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'

/**
 * Active workout page. Placeholder until roadmap step 9: for now it only shows
 * that the started workout exists, with its start time.
 */
function ActiveWorkout() {
  const { state } = useAppState()
  const workout = state.activeWorkout

  if (!workout) {
    return (
      <>
        <PageHeader title="Active workout" />
        <p>No workout in progress.</p>
        <Button to={ROUTES.startWorkout}>Start workout</Button>
      </>
    )
  }

  return (
    <>
      <PageHeader title={workout.name} />
      <p>
        Started {formatDate(workout.startedAt)} at {formatTime(workout.startedAt)} ·{' '}
        {pluralize(workout.entries.length, 'exercise')}
      </p>
      <p>The full workout screen comes in roadmap step 9.</p>
    </>
  )
}

export default ActiveWorkout
