import { useState } from 'react'
import { ROUTES } from '../../constants/routes.js'
import { useAppState } from '../../hooks/useAppState.js'
import { useStartWorkout } from '../../hooks/useStartWorkout.js'
import { useTemplateList } from '../../hooks/useTemplateList.js'
import { formatDate } from '../../lib/dates.js'
import { pluralize } from '../../lib/format.js'
import { validateTemplateName } from '../../lib/templates.js'
import { deleteTemplate, renameTemplate } from '../../state/actions.js'
import Banner from '../../components/Banner/Banner.jsx'
import Button from '../../components/Button/Button.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import List from '../../components/List/List.jsx'
import NameDialog from '../../components/NameDialog/NameDialog.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import Section from '../../components/Section/Section.jsx'
import TemplateCard from '../../components/TemplateCard/TemplateCard.jsx'
import VisuallyHidden from '../../components/VisuallyHidden/VisuallyHidden.jsx'
import styles from './StartWorkout.module.scss'

/**
 * @param {number} exerciseCount
 * @param {string|null} lastUsedAt
 */
function templateMeta(exerciseCount, lastUsedAt) {
  const lastUsed = lastUsedAt ? `Last used ${formatDate(lastUsedAt)}` : 'Not used yet'
  return `${pluralize(exerciseCount, 'exercise')} · ${lastUsed}`
}

/** Pick a template, start an empty workout, or create a template and start it. */
function StartWorkout() {
  const { state, dispatch } = useAppState()
  const templates = useTemplateList()
  const { activeWorkout, startFromTemplate, startEmpty, createTemplateAndStart } = useStartWorkout()

  const [isCreating, setIsCreating] = useState(false)
  const [editing, setEditing] = useState(null)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [message, setMessage] = useState('')
  const inProgress = Boolean(activeWorkout)

  function handleRename(name) {
    dispatch(renameTemplate(editing.id, name))
    setEditing(null)
    setMessage(`Template renamed to ${name}.`)
  }

  function handleDelete() {
    dispatch(deleteTemplate(editing.id))
    setIsConfirmingDelete(false)
    setEditing(null)
    setMessage(`${editing.name} deleted.`)
  }

  return (
    <>
      <PageHeader title="Start workout" backTo={ROUTES.home} backLabel="Back to home" />

      {inProgress && (
        <Banner
          variant="warning"
          title={`${activeWorkout.name} is in progress`}
          action={<Button to={ROUTES.activeWorkout}>Resume workout</Button>}
        >
          End it before you start a new workout.
        </Banner>
      )}

      <Section title="Templates">
        {templates.length > 0 ? (
          <List>
            {templates.map(({ template, exerciseCount, lastUsedAt }) => (
              <TemplateCard
                key={template.id}
                name={template.name}
                meta={templateMeta(exerciseCount, lastUsedAt)}
                onStart={() => startFromTemplate(template)}
                onEdit={() => setEditing(template)}
                startDisabled={inProgress}
              />
            ))}
          </List>
        ) : (
          <p className={styles.muted}>
            No templates yet. Create one for a workout you repeat, and its exercises are listed for
            you next time.
          </p>
        )}
        <Button
          variant="secondary"
          icon="plus"
          fullWidth
          disabled={inProgress}
          onClick={() => setIsCreating(true)}
        >
          New template
        </Button>
      </Section>

      <Button variant="secondary" fullWidth disabled={inProgress} onClick={startEmpty}>
        Empty workout
      </Button>

      <VisuallyHidden aria-live="polite">{message}</VisuallyHidden>

      <NameDialog
        open={isCreating}
        title="New template"
        submitLabel="Create and start"
        validate={(name) => validateTemplateName(name, state.templates)}
        onSubmit={createTemplateAndStart}
        onClose={() => setIsCreating(false)}
      />

      <NameDialog
        open={Boolean(editing)}
        title="Edit template"
        initialValue={editing?.name}
        submitLabel="Save"
        validate={(name) => validateTemplateName(name, state.templates, editing?.id)}
        onSubmit={handleRename}
        onClose={() => setEditing(null)}
        extraAction={
          <Button variant="danger" onClick={() => setIsConfirmingDelete(true)}>
            Delete
          </Button>
        }
      />

      <ConfirmDialog
        open={isConfirmingDelete}
        title={`Delete ${editing?.name}?`}
        message="The template is removed. Workouts you did with it stay in your history."
        confirmLabel="Delete template"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmingDelete(false)}
      />
    </>
  )
}

export default StartWorkout
