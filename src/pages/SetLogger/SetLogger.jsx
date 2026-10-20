import { useId, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CHART_METRICS } from '../../constants/charts.js'
import { ROUTES } from '../../constants/routes.js'
import { useSetLogger } from '../../hooks/useSetLogger.js'
import { formatDate } from '../../lib/dates.js'
import { formatNumberInput, formatSet, formatSetsShort } from '../../lib/format.js'
import { progressionMessage } from '../../lib/progression.js'
import Banner from '../../components/Banner/Banner.jsx'
import Button from '../../components/Button/Button.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import List from '../../components/List/List.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import ProgressChart from '../../components/ProgressChart/ProgressChart.jsx'
import SetForm from '../../components/SetForm/SetForm.jsx'
import SetRow from '../../components/SetRow/SetRow.jsx'
import StickyActionBar from '../../components/StickyActionBar/StickyActionBar.jsx'
import VisuallyHidden from '../../components/VisuallyHidden/VisuallyHidden.jsx'
import styles from './SetLogger.module.scss'

/** Log sets for one exercise of the workout in progress, with last time and the progression hint. */
function SetLogger() {
  const { exerciseId } = useParams()
  const logger = useSetLogger(exerciseId)
  const { workout, exercise, sessionSets, records, lastSession, progression } = logger

  const [editingIndex, setEditingIndex] = useState(null)
  const [deletingIndex, setDeletingIndex] = useState(null)
  const [message, setMessage] = useState('')
  const formId = useId()
  const editFormId = useId()
  const kgRef = useRef(null)
  const editKgRef = useRef(null)
  const logButtonRef = useRef(null)

  if (!workout || !exercise) {
    return (
      <>
        <PageHeader
          title={workout ? 'Exercise not found' : 'No workout in progress'}
          backTo={ROUTES.activeWorkout}
          backLabel="Back to workout"
        />
        <Button to={workout ? ROUTES.activeWorkout : ROUTES.startWorkout} size="lg" fullWidth>
          {workout ? 'Back to workout' : 'Start workout'}
        </Button>
      </>
    )
  }

  function handleLog(fields) {
    const logged = logger.log(fields)
    const record = logged.records.length > 0 ? ' New personal record!' : ''
    setMessage(`Set ${logged.number} logged: ${formatSet(fields)}.${record}`)
  }

  function handleEdit(fields) {
    logger.edit(editingIndex, fields)
    setMessage(`Set ${editingIndex + 1} changed to ${formatSet(fields)}.`)
    setEditingIndex(null)
  }

  function handleDelete() {
    logger.remove(deletingIndex)
    setMessage(`Set ${deletingIndex + 1} deleted.`)
    setDeletingIndex(null)
  }

  const editingSet = editingIndex === null ? null : sessionSets[editingIndex]
  const deletingSet = deletingIndex === null ? null : sessionSets[deletingIndex]

  return (
    <>
      <PageHeader title={exercise.name} backTo={ROUTES.activeWorkout} backLabel="Back to workout" />

      {progression && (
        <Banner
          variant={progression.shouldIncrease ? 'success' : 'info'}
          icon={progression.shouldIncrease ? 'arrowUp' : 'info'}
          srLabel="Progression"
        >
          {progressionMessage(progression)}
        </Banner>
      )}

      <p className={styles.lastTime}>
        {lastSession
          ? `Last time: ${formatSetsShort(lastSession.sets)} (${formatDate(lastSession.startedAt)})`
          : 'First time doing this exercise.'}
      </p>

      <SetForm
        key={exerciseId}
        id={formId}
        initialValues={logger.initialFields}
        onSubmit={handleLog}
        kgRef={kgRef}
      />

      <section className={styles.section} aria-labelledby="sets-heading">
        <h2 id="sets-heading" className={styles.heading}>
          This workout
        </h2>
        {sessionSets.length > 0 ? (
          <List>
            {sessionSets.map((set, index) => (
              <SetRow
                key={`${set.timestamp}-${index}`}
                number={index + 1}
                set={set}
                records={records[index]}
                onEdit={() => setEditingIndex(index)}
                onDelete={() => setDeletingIndex(index)}
              />
            ))}
          </List>
        ) : (
          <p className={styles.muted}>No sets yet.</p>
        )}
      </section>

      {logger.points.length > 0 && (
        <section className={styles.section} aria-labelledby="progress-heading">
          <h2 id="progress-heading" className={styles.heading}>
            Progress
          </h2>
          <ProgressChart points={logger.points} metric={CHART_METRICS.heaviest} size="sm" />
        </section>
      )}

      <VisuallyHidden aria-live="polite">{message}</VisuallyHidden>

      <StickyActionBar>
        <Button ref={logButtonRef} type="submit" form={formId} size="lg" fullWidth>
          Log set
        </Button>
      </StickyActionBar>

      <Modal
        open={Boolean(editingSet)}
        onClose={() => setEditingIndex(null)}
        title={`Edit set ${editingIndex + 1}`}
        initialFocusRef={editKgRef}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingIndex(null)}>
              Cancel
            </Button>
            <Button type="submit" form={editFormId}>
              Save
            </Button>
          </>
        }
      >
        {editingSet && (
          <SetForm
            id={editFormId}
            initialValues={{
              kg: formatNumberInput(editingSet.kg),
              reps: formatNumberInput(editingSet.reps),
            }}
            onSubmit={handleEdit}
            kgRef={editKgRef}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingSet)}
        title={`Delete set ${deletingIndex + 1}?`}
        message={deletingSet && `${formatSet(deletingSet)} will be removed from this workout.`}
        confirmLabel="Delete set"
        variant="danger"
        onConfirm={handleDelete}
        fallbackFocusRef={logButtonRef}
        onCancel={() => setDeletingIndex(null)}
      />
    </>
  )
}

export default SetLogger
