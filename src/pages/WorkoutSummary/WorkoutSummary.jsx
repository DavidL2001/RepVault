import { useParams } from 'react-router-dom'
import { ONE_REP_MAX_DECIMALS } from '../../constants/numbers.js'
import { ROUTES } from '../../constants/routes.js'
import { useWorkoutSummary } from '../../hooks/useWorkoutSummary.js'
import { formatDate, formatTime } from '../../lib/dates.js'
import { formatDuration, formatKg } from '../../lib/format.js'
import Button from '../../components/Button/Button.jsx'
import IncreaseMarker from '../../components/IncreaseMarker/IncreaseMarker.jsx'
import List from '../../components/List/List.jsx'
import ListItem from '../../components/ListItem/ListItem.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import PrBadge from '../../components/PrBadge/PrBadge.jsx'
import Section from '../../components/Section/Section.jsx'
import StatList from '../../components/StatList/StatList.jsx'
import StickyActionBar from '../../components/StickyActionBar/StickyActionBar.jsx'
import styles from './WorkoutSummary.module.scss'

/**
 * What a new record was, e.g. "Heaviest 47,5 kg · Best est. 1RM 60 kg".
 *
 * @param {import('../../lib/summary.js').WorkoutRecord} record
 */
function recordText({ heaviestKg, bestOneRepMax }) {
  const parts = []
  if (heaviestKg !== null) parts.push(`Heaviest ${formatKg(heaviestKg)}`)
  if (bestOneRepMax !== null) {
    parts.push(`Best est. 1RM ${formatKg(bestOneRepMax, undefined, ONE_REP_MAX_DECIMALS)}`)
  }
  return parts.join(' · ')
}

/** Shown after ending a workout: totals, new personal records and what to go heavier on next time. */
function WorkoutSummary() {
  const { workoutId } = useParams()
  const { workout, summary } = useWorkoutSummary(workoutId)

  const done = (
    <StickyActionBar>
      <Button to={ROUTES.home} size="lg" fullWidth>
        Done
      </Button>
    </StickyActionBar>
  )

  if (!workout) {
    return (
      <>
        <PageHeader title="Workout not found" />
        <p>This workout doesn’t exist (any more).</p>
        {done}
      </>
    )
  }

  return (
    <>
      <PageHeader title={workout.name} documentTitle={`Summary: ${workout.name}`} />
      <p className={styles.meta}>
        {formatDate(workout.startedAt)} · {formatTime(workout.startedAt)}–
        {formatTime(workout.endedAt)}
      </p>

      <StatList
        items={[
          { label: 'Duration', value: formatDuration(summary.durationMs) },
          { label: 'Exercises', value: summary.exerciseCount },
          { label: 'Sets', value: summary.setCount },
          { label: 'Volume', value: formatKg(summary.volume) },
        ]}
      />

      <Section title="New personal records">
        {summary.records.length > 0 ? (
          <List>
            {summary.records.map((record) => (
              <ListItem
                key={record.exercise.id}
                title={record.exercise.name}
                meta={recordText(record)}
                trailing={<PrBadge types={record.types} />}
              />
            ))}
          </List>
        ) : (
          <p className={styles.muted}>No new records this time.</p>
        )}
      </Section>

      <Section title="Next time">
        {summary.nextTime.length > 0 ? (
          <List>
            {summary.nextTime.map((exercise) => (
              <ListItem
                key={exercise.id}
                title={exercise.name}
                meta="Go heavier"
                trailing={<IncreaseMarker />}
              />
            ))}
          </List>
        ) : (
          <p className={styles.muted}>No exercise is due for a heavier weight yet.</p>
        )}
      </Section>

      {done}
    </>
  )
}

export default WorkoutSummary
