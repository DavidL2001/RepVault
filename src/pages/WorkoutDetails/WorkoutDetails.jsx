import { useId, useRef, useState } from 'react'
import { generatePath, Link, useParams } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'
import { useWorkoutDetails } from '../../hooks/useWorkoutDetails.js'
import { formatDate, formatTime } from '../../lib/dates.js'
import {
  formatDuration,
  formatKg,
  formatNumberInput,
  formatSet,
  pluralize,
} from '../../lib/format.js'
import Button from '../../components/Button/Button.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import List from '../../components/List/List.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import SetForm from '../../components/SetForm/SetForm.jsx'
import SetRow from '../../components/SetRow/SetRow.jsx'
import StatList from '../../components/StatList/StatList.jsx'
import VisuallyHidden from '../../components/VisuallyHidden/VisuallyHidden.jsx'
import styles from './WorkoutDetails.module.scss'

/** A finished workout: times and totals, every exercise with its sets, fixing sets and deleting. */
function WorkoutDetails() {
  const { id } = useParams()
  const details = useWorkoutDetails(id)
  const { workout, summary, entries } = details

  // The set being edited or deleted: `{ exercise, index, set }`.
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [isDeletingWorkout, setIsDeletingWorkout] = useState(false)
  const [message, setMessage] = useState('')
  const editFormId = useId()
  const editKgRef = useRef(null)
  // Focus goes here after deleting a set, since its row (and the button that opened the dialog) is gone.
  const setsHeadingRef = useRef(null)

  if (!workout) {
    return (
      <>
        <PageHeader title="Workout not found" backTo={ROUTES.history} backLabel="Back to history" />
        <Button to={ROUTES.history} size="lg" fullWidth>
          Go to history
        </Button>
      </>
    )
  }

  function handleEdit(fields) {
    details.editSet(editing.exercise.id, editing.index, fields)
    setMessage(
      `${editing.exercise.name}, set ${editing.index + 1} changed to ${formatSet(fields)}.`,
    )
    setEditing(null)
  }

  function handleDeleteSet() {
    details.removeSet(deleting.exercise.id, deleting.index)
    setMessage(`${deleting.exercise.name}, set ${deleting.index + 1} deleted.`)
    setDeleting(null)
  }

  const isOnlySet = summary.setCount === 1

  return (
    <>
      <PageHeader title={workout.name} backTo={ROUTES.history} backLabel="Back to history" />
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

      <section className={styles.section} aria-labelledby="sets-heading">
        <h2 id="sets-heading" ref={setsHeadingRef} tabIndex={-1} className={styles.heading}>
          Sets
        </h2>
        {entries.map(({ exercise, sets, records }) => (
          <div key={exercise.id} className={styles.exercise}>
            <h3 className={styles.exerciseName}>
              <Link to={generatePath(ROUTES.exerciseDetail, { id: exercise.id })}>
                {exercise.name}
              </Link>
            </h3>
            <List>
              {sets.map((set, index) => (
                <SetRow
                  key={`${set.timestamp}-${index}`}
                  number={index + 1}
                  set={set}
                  records={records[index]}
                  onEdit={() => setEditing({ exercise, index, set })}
                  onDelete={() => setDeleting({ exercise, index, set })}
                />
              ))}
            </List>
          </div>
        ))}
      </section>

      <Button variant="danger" icon="trash" onClick={() => setIsDeletingWorkout(true)}>
        Delete workout
      </Button>

      <VisuallyHidden aria-live="polite">{message}</VisuallyHidden>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.exercise.name}, set ${editing.index + 1}` : ''}
        initialFocusRef={editKgRef}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form={editFormId}>
              Save
            </Button>
          </>
        }
      >
        {editing && (
          <SetForm
            id={editFormId}
            initialValues={{
              kg: formatNumberInput(editing.set.kg),
              reps: formatNumberInput(editing.set.reps),
            }}
            onSubmit={handleEdit}
            kgRef={editKgRef}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting ? `Delete set ${deleting.index + 1} of ${deleting.exercise.name}?` : ''}
        message={
          deleting &&
          (isOnlySet
            ? `${formatSet(deleting.set)} is the only set in this workout, so the whole workout is deleted.`
            : `${formatSet(deleting.set)} is removed from this workout.`)
        }
        confirmLabel={isOnlySet ? 'Delete workout' : 'Delete set'}
        variant="danger"
        onConfirm={handleDeleteSet}
        onCancel={() => setDeleting(null)}
        fallbackFocusRef={setsHeadingRef}
      />

      <ConfirmDialog
        open={isDeletingWorkout}
        title={`Delete ${workout.name}?`}
        message={`The workout from ${formatDate(workout.startedAt)} and its ${pluralize(summary.setCount, 'set')} are removed from your history and records. This can’t be undone.`}
        confirmLabel="Delete workout"
        variant="danger"
        onConfirm={details.deleteWorkout}
        onCancel={() => setIsDeletingWorkout(false)}
      />
    </>
  )
}

export default WorkoutDetails
