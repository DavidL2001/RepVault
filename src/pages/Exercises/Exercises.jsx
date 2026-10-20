import { useId, useRef, useState } from 'react'
import { generatePath } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'
import { useAppState } from '../../hooks/useAppState.js'
import { useExerciseList } from '../../hooks/useExerciseList.js'
import { formatSet, pluralize } from '../../lib/format.js'
import { addExercise } from '../../state/actions.js'
import Button from '../../components/Button/Button.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import ExerciseForm from '../../components/ExerciseForm/ExerciseForm.jsx'
import IncreaseMarker from '../../components/IncreaseMarker/IncreaseMarker.jsx'
import List from '../../components/List/List.jsx'
import ListItem from '../../components/ListItem/ListItem.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import TextField from '../../components/TextField/TextField.jsx'
import VisuallyHidden from '../../components/VisuallyHidden/VisuallyHidden.jsx'
import styles from './Exercises.module.scss'

/** All the user's exercises: create, search, and open one for its details. */
function Exercises() {
  const { state, dispatch } = useAppState()
  const [query, setQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createdMessage, setCreatedMessage] = useState('')
  const { items, total } = useExerciseList(query)
  const formId = useId()
  const nameRef = useRef(null)

  function handleCreate(fields) {
    dispatch(addExercise(fields))
    setIsCreating(false)
    setCreatedMessage(`${fields.name} created.`)
  }

  // Search results are announced while searching; otherwise the last "created" message.
  const liveMessage = query.trim()
    ? `${pluralize(items.length, 'exercise')} found.`
    : createdMessage

  return (
    <>
      <PageHeader title="Exercises" />

      <Button icon="plus" fullWidth onClick={() => setIsCreating(true)}>
        New exercise
      </Button>

      {total === 0 ? (
        <EmptyState icon="exercises" title="No exercises yet">
          Create the exercises you do at the gym. They show up here with your best set from last
          time.
        </EmptyState>
      ) : (
        <>
          <TextField
            type="search"
            label="Search exercises"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
          {items.length > 0 ? (
            <List>
              {items.map(({ exercise, bestSet, dueForIncrease }) => (
                <ListItem
                  key={exercise.id}
                  title={exercise.name}
                  meta={bestSet ? `Last best: ${formatSet(bestSet)}` : 'Not done yet'}
                  trailing={dueForIncrease && <IncreaseMarker />}
                  to={generatePath(ROUTES.exerciseDetail, { id: exercise.id })}
                />
              ))}
            </List>
          ) : (
            <p className={styles.noResults}>No exercises match “{query.trim()}”.</p>
          )}
        </>
      )}

      <VisuallyHidden aria-live="polite">{liveMessage}</VisuallyHidden>

      <Modal
        open={isCreating}
        onClose={() => setIsCreating(false)}
        title="New exercise"
        initialFocusRef={nameRef}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button type="submit" form={formId}>
              Create exercise
            </Button>
          </>
        }
      >
        <ExerciseForm
          id={formId}
          exercises={state.exercises}
          onSubmit={handleCreate}
          nameRef={nameRef}
        />
      </Modal>
    </>
  )
}

export default Exercises
