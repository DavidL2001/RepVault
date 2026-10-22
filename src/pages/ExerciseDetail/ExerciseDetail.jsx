import { useRef, useState } from 'react'
import { generatePath, useParams } from 'react-router-dom'
import { CHART_METRIC_SHORT_LABELS, CHART_METRICS } from '../../constants/charts.js'
import { ONE_REP_MAX_DECIMALS } from '../../constants/numbers.js'
import { ROUTES } from '../../constants/routes.js'
import { useExerciseDetail } from '../../hooks/useExerciseDetail.js'
import { formatDate } from '../../lib/dates.js'
import { describeProgression, validateExerciseName } from '../../lib/exercises.js'
import { formatKg, formatSetsShort, pluralize } from '../../lib/format.js'
import { progressionMessage } from '../../lib/progression.js'
import Button from '../../components/Button/Button.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import DataTable from '../../components/DataTable/DataTable.jsx'
import List from '../../components/List/List.jsx'
import ListItem from '../../components/ListItem/ListItem.jsx'
import NameDialog from '../../components/NameDialog/NameDialog.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import ProgressChart from '../../components/ProgressChart/ProgressChart.jsx'
import ProgressionRuleDialog from '../../components/ProgressionRuleDialog/ProgressionRuleDialog.jsx'
import RadioGroup from '../../components/RadioGroup/RadioGroup.jsx'
import Section from '../../components/Section/Section.jsx'
import StatList from '../../components/StatList/StatList.jsx'
import VisuallyHidden from '../../components/VisuallyHidden/VisuallyHidden.jsx'
import styles from './ExerciseDetail.module.scss'

const METRIC_OPTIONS = Object.values(CHART_METRICS).map((metric) => ({
  value: metric,
  label: CHART_METRIC_SHORT_LABELS[metric],
}))

/** One exercise: progress chart, personal bests, progression rule, history, rename and delete. */
function ExerciseDetail() {
  const { id } = useParams()
  const detail = useExerciseDetail(id)
  const { exercise, sessions, points, bests, progression } = detail

  const [metric, setMetric] = useState(CHART_METRICS.heaviest)
  const [isRenaming, setIsRenaming] = useState(false)
  const [isEditingRule, setIsEditingRule] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const ruleButtonRef = useRef(null)

  if (!exercise) {
    return (
      <>
        <PageHeader
          title="Exercise not found"
          backTo={ROUTES.exercises}
          backLabel="Back to exercises"
        />
        <Button to={ROUTES.exercises} size="lg" fullWidth>
          Go to exercises
        </Button>
      </>
    )
  }

  function handleRename(name) {
    detail.rename(name)
    setIsRenaming(false)
    setMessage(`Renamed to ${name}.`)
  }

  function handleSaveRule(rule) {
    detail.saveRule(rule)
    setIsEditingRule(false)
    setMessage('Progression rule saved.')
  }

  function handleRemoveRule() {
    detail.removeRule()
    setIsEditingRule(false)
    setMessage('Progression rule removed.')
  }

  const deleteMessage = [
    sessions.length > 0
      ? `Its history (${pluralize(sessions.length, 'workout')}) is deleted too.`
      : 'It has no history yet.',
    detail.inActiveWorkout ? 'It is also removed from the workout in progress.' : '',
    'This can’t be undone.',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <PageHeader title={exercise.name} backTo={ROUTES.exercises} backLabel="Back to exercises" />

      <Section title="Progress">
        {points.length > 1 && (
          <RadioGroup
            legend="Show"
            variant="segmented"
            options={METRIC_OPTIONS}
            value={metric}
            onChange={setMetric}
          />
        )}
        <ProgressChart points={points} metric={metric} />
      </Section>

      <Section title="Personal bests">
        {bests.heaviestKg === null ? (
          <p className={styles.muted}>No sets logged yet.</p>
        ) : (
          <>
            <StatList
              items={[
                { label: 'Heaviest weight', value: formatKg(bests.heaviestKg) },
                {
                  label: 'Best est. 1RM',
                  value: formatKg(bests.bestOneRepMax, undefined, ONE_REP_MAX_DECIMALS),
                },
              ]}
            />
            <DataTable
              caption="Most reps at each weight"
              columns={[
                { key: 'kg', label: 'Weight', numeric: true },
                { key: 'reps', label: 'Most reps', numeric: true },
              ]}
              rows={bests.mostRepsByWeight.map(({ kg, reps }) => ({ kg: formatKg(kg), reps }))}
              rowKey={(_, index) => bests.mostRepsByWeight[index].kg}
            />
          </>
        )}
      </Section>

      <Section title="Progression rule">
        <p>
          {exercise.progression
            ? describeProgression(exercise.progression)
            : 'No rule yet. Add one to get a hint when it’s time to go heavier.'}
        </p>
        {progression && (
          <p className={styles.muted}>Next time: {progressionMessage(progression)}</p>
        )}
        <Button
          ref={ruleButtonRef}
          variant="secondary"
          icon={exercise.progression ? 'edit' : 'plus'}
          onClick={() => setIsEditingRule(true)}
        >
          {exercise.progression ? 'Edit rule' : 'Add rule'}
        </Button>
      </Section>

      <Section title="History">
        {sessions.length > 0 ? (
          <List>
            {sessions.map((session) => (
              <ListItem
                key={session.workoutId}
                title={formatDate(session.startedAt)}
                meta={formatSetsShort(session.sets)}
                to={generatePath(ROUTES.workoutDetails, { id: session.workoutId })}
              />
            ))}
          </List>
        ) : (
          <p className={styles.muted}>Not done in a finished workout yet.</p>
        )}
      </Section>

      <Section title="Manage">
        <div className={styles.actions}>
          <Button variant="secondary" icon="edit" onClick={() => setIsRenaming(true)}>
            Rename
          </Button>
          <Button variant="danger" icon="trash" onClick={() => setIsDeleting(true)}>
            Delete exercise
          </Button>
        </div>
      </Section>

      <VisuallyHidden aria-live="polite">{message}</VisuallyHidden>

      <NameDialog
        open={isRenaming}
        title="Rename exercise"
        initialValue={exercise.name}
        submitLabel="Save"
        validate={(name) => validateExerciseName(name, detail.exercises, exercise.id)}
        onSubmit={handleRename}
        onClose={() => setIsRenaming(false)}
      />

      <ProgressionRuleDialog
        open={isEditingRule}
        rule={exercise.progression}
        onSave={handleSaveRule}
        onRemove={handleRemoveRule}
        onClose={() => setIsEditingRule(false)}
        fallbackFocusRef={ruleButtonRef}
      />

      <ConfirmDialog
        open={isDeleting}
        title={`Delete ${exercise.name}?`}
        message={deleteMessage}
        confirmLabel="Delete exercise"
        variant="danger"
        onConfirm={detail.remove}
        onCancel={() => setIsDeleting(false)}
      />
    </>
  )
}

export default ExerciseDetail
