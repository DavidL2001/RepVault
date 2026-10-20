import { generatePath } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'
import { useHistory } from '../../hooks/useHistory.js'
import { formatDate, formatMonth } from '../../lib/dates.js'
import { formatKg, pluralize } from '../../lib/format.js'
import Button from '../../components/Button/Button.jsx'
import DateBadge from '../../components/DateBadge/DateBadge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import List from '../../components/List/List.jsx'
import ListItem from '../../components/ListItem/ListItem.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import TrainingCalendar from '../../components/TrainingCalendar/TrainingCalendar.jsx'
import styles from './History.module.scss'

/** Every finished workout, by month, with a calendar of training days on top. */
function History() {
  const { calendar, months, total } = useHistory()

  return (
    <>
      <PageHeader title="History" />

      <section className={styles.section} aria-labelledby="calendar-heading">
        <h2 id="calendar-heading" className={styles.heading}>
          Training days
        </h2>
        <TrainingCalendar calendar={calendar} />
      </section>

      {total === 0 ? (
        <EmptyState
          icon="history"
          title="No workouts yet"
          action={
            <Button to={ROUTES.startWorkout} icon="plus">
              Start workout
            </Button>
          }
        >
          Finished workouts show up here, newest first.
        </EmptyState>
      ) : (
        months.map((month) => (
          <section
            key={month.key}
            className={styles.section}
            aria-labelledby={`month-${month.key}`}
          >
            <h2 id={`month-${month.key}`} className={styles.heading}>
              {formatMonth(month.date)}
              <span className={styles.count}> · {pluralize(month.workouts.length, 'workout')}</span>
            </h2>
            <List>
              {month.workouts.map(({ workout, exerciseCount, volume }) => (
                <ListItem
                  key={workout.id}
                  leading={<DateBadge date={workout.startedAt} />}
                  title={workout.name}
                  meta={`${formatDate(workout.startedAt)} · ${pluralize(exerciseCount, 'exercise')} · ${formatKg(volume)}`}
                  to={generatePath(ROUTES.workoutDetails, { id: workout.id })}
                />
              ))}
            </List>
          </section>
        ))
      )}
    </>
  )
}

export default History
