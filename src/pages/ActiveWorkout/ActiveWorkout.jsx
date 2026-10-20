import { useRef, useState } from 'react'
import { generatePath } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'
import { useActiveWorkout } from '../../hooks/useActiveWorkout.js'
import { useAppState } from '../../hooks/useAppState.js'
import { formatDate } from '../../lib/dates.js'
import { formatSetSummary, pluralize } from '../../lib/format.js'
import Button from '../../components/Button/Button.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import ExercisePicker from '../../components/ExercisePicker/ExercisePicker.jsx'
import List from '../../components/List/List.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import StickyActionBar from '../../components/StickyActionBar/StickyActionBar.jsx'
import VisuallyHidden from '../../components/VisuallyHidden/VisuallyHidden.jsx'
import WorkoutExerciseRow from '../../components/WorkoutExerciseRow/WorkoutExerciseRow.jsx'
import WorkoutTimer from '../../components/WorkoutTimer/WorkoutTimer.jsx'
import styles from './ActiveWorkout.module.scss'

/** Steps of ending a workout: confirm, then maybe offer to update the template. */
const END_STEPS = { confirm: 'confirm', template: 'template' }

/** The workout in progress: its exercises, adding/reordering/removing them, and ending it. */
function ActiveWorkout() {
  const { state } = useAppState()
  const active = useActiveWorkout()
  const { workout, template, rows, setCount } = active

  const [pickerOpen, setPickerOpen] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [endStep, setEndStep] = useState(null)
  const [focusRequest, setFocusRequest] = useState(null)
  const [message, setMessage] = useState('')
  const addButtonRef = useRef(null)

  if (!workout) {
    return (
      <>
        <PageHeader title="No workout in progress" />
        <Button to={ROUTES.startWorkout} size="lg" fullWidth>
          Start workout
        </Button>
      </>
    )
  }

  function move(row, offset) {
    const index = rows.indexOf(row) + offset
    active.moveExercise(row.exercise.id, offset)
    setFocusRequest({ exerciseId: row.exercise.id, action: offset < 0 ? 'up' : 'down' })
    setMessage(`${row.exercise.name} moved to position ${index + 1} of ${rows.length}.`)
  }

  function remove(row) {
    active.removeExercise(row.exercise.id)
    setRemoving(null)
    setMessage(`${row.exercise.name} removed.`)
    // Without a dialog this moves focus right away; after the confirm dialog, its fallbackFocusRef does.
    addButtonRef.current?.focus()
  }

  function confirmEnd() {
    if (setCount === 0) active.discard()
    else if (active.templateNeedsUpdate) setEndStep(END_STEPS.template)
    else active.end({ updateTemplate: false })
  }

  const exercisesWithSets = rows.filter((row) => row.sets.length > 0).length

  return (
    <>
      <PageHeader title={workout.name} />
      <p className={styles.meta}>
        {formatDate(workout.startedAt)} · <WorkoutTimer startedAt={workout.startedAt} />
      </p>

      {rows.length > 0 ? (
        <List>
          {rows.map((row, index) => (
            <WorkoutExerciseRow
              key={row.exercise.id}
              name={row.exercise.name}
              summary={formatSetSummary(row.sets)}
              dueForIncrease={row.dueForIncrease}
              to={generatePath(ROUTES.setLogger, { exerciseId: row.exercise.id })}
              isFirst={index === 0}
              isLast={index === rows.length - 1}
              onMoveUp={() => move(row, -1)}
              onMoveDown={() => move(row, 1)}
              onRemove={() => (row.sets.length > 0 ? setRemoving(row) : remove(row))}
              focusRequest={focusRequest?.exerciseId === row.exercise.id ? focusRequest : null}
            />
          ))}
        </List>
      ) : (
        <EmptyState title="No exercises yet">Add the exercises you’re doing today.</EmptyState>
      )}

      <Button
        ref={addButtonRef}
        variant="secondary"
        icon="plus"
        fullWidth
        onClick={() => setPickerOpen(true)}
      >
        Add exercise
      </Button>

      <VisuallyHidden aria-live="polite">{message}</VisuallyHidden>

      <StickyActionBar>
        <Button size="lg" fullWidth onClick={() => setEndStep(END_STEPS.confirm)}>
          End workout
        </Button>
      </StickyActionBar>

      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        exercises={state.exercises}
        excludeIds={workout.entries.map((entry) => entry.exerciseId)}
        onPick={(exerciseId) => {
          active.addExercise(exerciseId)
          const name = state.exercises.find((exercise) => exercise.id === exerciseId)?.name
          setMessage(`${name} added.`)
        }}
        onCreate={(fields) => {
          active.createAndAddExercise(fields)
          setMessage(`${fields.name} created and added.`)
        }}
      />

      <ConfirmDialog
        open={Boolean(removing)}
        title={`Remove ${removing?.exercise.name}?`}
        message={`Its ${pluralize(removing?.sets.length ?? 0, 'set')} from this workout will be deleted.`}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => remove(removing)}
        fallbackFocusRef={addButtonRef}
        onCancel={() => setRemoving(null)}
      />

      <ConfirmDialog
        open={endStep === END_STEPS.confirm}
        title="End workout?"
        message={
          setCount > 0
            ? `You logged ${pluralize(setCount, 'set')} in ${pluralize(exercisesWithSets, 'exercise')}.`
            : 'No sets were logged, so this workout won’t be saved.'
        }
        cancelLabel="Keep going"
        confirmLabel={setCount > 0 ? 'End workout' : 'Discard workout'}
        variant={setCount > 0 ? 'primary' : 'danger'}
        onConfirm={confirmEnd}
        onCancel={() => setEndStep(null)}
      />

      <ConfirmDialog
        open={endStep === END_STEPS.template}
        title={`Update ${template?.name}?`}
        message="You changed the exercises in this workout. Save them to the template for next time?"
        cancelLabel="Keep template as is"
        confirmLabel="Update template"
        onConfirm={() => active.end({ updateTemplate: true })}
        onCancel={() => active.end({ updateTemplate: false })}
      />
    </>
  )
}

export default ActiveWorkout
