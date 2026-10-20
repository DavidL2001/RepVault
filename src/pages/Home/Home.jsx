import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BACKUP_REMINDER_DAYS } from '../../constants/defaults.js'
import { ROUTES } from '../../constants/routes.js'
import { useHome } from '../../hooks/useHome.js'
import { backupReminderMessage } from '../../lib/backup.js'
import { pluralize } from '../../lib/format.js'
import Banner from '../../components/Banner/Banner.jsx'
import Button from '../../components/Button/Button.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import List from '../../components/List/List.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import VisuallyHidden from '../../components/VisuallyHidden/VisuallyHidden.jsx'
import WorkoutListItem from '../../components/WorkoutListItem/WorkoutListItem.jsx'
import WorkoutTimer from '../../components/WorkoutTimer/WorkoutTimer.jsx'
import styles from './Home.module.scss'

/** Start (or resume) a workout, this week's count, recent workouts and the backup reminder. */
function Home() {
  const { activeWorkout, weekCount, recent, reminder, total, dismissReminder } = useHome()
  const [message, setMessage] = useState('')
  const mainActionRef = useRef(null)

  function handleDismiss() {
    dismissReminder()
    setMessage(`Backup reminder hidden for ${BACKUP_REMINDER_DAYS} days.`)
    // The dismiss button disappears with the banner; keep focus on the page.
    mainActionRef.current?.focus()
  }

  return (
    <>
      <PageHeader title="Home" />

      {activeWorkout ? (
        <Button ref={mainActionRef} to={ROUTES.activeWorkout} size="lg" fullWidth>
          <span className={styles.resume}>
            <span>Resume workout</span>
            <span className={styles.resumeMeta}>
              {activeWorkout.name} · <WorkoutTimer startedAt={activeWorkout.startedAt} />
            </span>
          </span>
        </Button>
      ) : (
        <Button ref={mainActionRef} to={ROUTES.startWorkout} size="lg" icon="plus" fullWidth>
          Start workout
        </Button>
      )}

      <p className={styles.week}>
        <strong>{pluralize(weekCount, 'workout')}</strong> this week
      </p>

      {reminder && (
        <Banner
          variant="warning"
          title="Back up your data"
          onDismiss={handleDismiss}
          dismissLabel="Dismiss backup reminder"
        >
          <p className={styles.reminderText}>
            {backupReminderMessage(reminder)} Your workouts only live in this browser.
          </p>
          <Button to={ROUTES.settings} variant="secondary">
            Export a backup in Settings
          </Button>
        </Banner>
      )}

      <section className={styles.section} aria-labelledby="recent-heading">
        <div className={styles.sectionHeader}>
          <h2 id="recent-heading" className={styles.heading}>
            Recent workouts
          </h2>
          {total > recent.length && (
            <Link to={ROUTES.history} className={styles.seeAll}>
              See all
            </Link>
          )}
        </div>
        {recent.length > 0 ? (
          <List>
            {recent.map((workout) => (
              <WorkoutListItem key={workout.id} workout={workout} />
            ))}
          </List>
        ) : (
          <EmptyState title="No workouts yet" headingLevel={3}>
            Finished workouts show up here.
          </EmptyState>
        )}
      </section>

      <VisuallyHidden aria-live="polite">{message}</VisuallyHidden>
    </>
  )
}

export default Home
