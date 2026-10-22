import { ROUTES } from '../../constants/routes.js'
import { useHistory } from '../../hooks/useHistory.js'
import { formatMonth } from '../../lib/dates.js'
import { pluralize } from '../../lib/format.js'
import Button from '../../components/Button/Button.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import List from '../../components/List/List.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import Section from '../../components/Section/Section.jsx'
import TrainingCalendar from '../../components/TrainingCalendar/TrainingCalendar.jsx'
import WorkoutListItem from '../../components/WorkoutListItem/WorkoutListItem.jsx'
import styles from './History.module.scss'

/** Every finished workout, by month, with a calendar of training days on top. */
function History() {
  const { calendar, months, total } = useHistory()

  return (
    <>
      <PageHeader title="History" />

      <Section title="Training days">
        <TrainingCalendar calendar={calendar} />
      </Section>

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
          <Section
            key={month.key}
            title={
              <>
                {formatMonth(month.date)}
                <span className={styles.count}>
                  {' '}
                  · {pluralize(month.workouts.length, 'workout')}
                </span>
              </>
            }
          >
            <List>
              {month.workouts.map((workout) => (
                <WorkoutListItem key={workout.id} workout={workout} />
              ))}
            </List>
          </Section>
        ))
      )}
    </>
  )
}

export default History
