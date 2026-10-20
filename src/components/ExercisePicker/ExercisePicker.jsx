import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { searchByName, sortByName } from '../../lib/names.js'
import Button from '../Button/Button.jsx'
import ExerciseForm from '../ExerciseForm/ExerciseForm.jsx'
import List from '../List/List.jsx'
import ListItem from '../ListItem/ListItem.jsx'
import Modal from '../Modal/Modal.jsx'
import TextField from '../TextField/TextField.jsx'
import styles from './ExercisePicker.module.scss'

const MODES = { pick: 'pick', create: 'create' }

/**
 * Modal to add an exercise to a workout: search the user's own exercises and
 * pick one, or switch to creating a new one. Exercises already in the workout
 * are left out. It starts fresh (search cleared, pick mode) every time it opens.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {import('../../lib/model.js').Exercise[]} props.exercises All of the user's exercises.
 * @param {string[]} props.excludeIds Exercises already in the workout.
 * @param {(exerciseId: string) => void} props.onPick
 * @param {(fields: { name: string, progression: object|null }) => void} props.onCreate
 */
function ExercisePicker({ open, onClose, exercises, excludeIds, onPick, onCreate }) {
  const [mode, setMode] = useState(MODES.pick)
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)
  const nameRef = useRef(null)
  const formId = useId()

  const available = useMemo(
    () => sortByName(exercises.filter((exercise) => !excludeIds.includes(exercise.id))),
    [exercises, excludeIds],
  )
  const matches = searchByName(available, query)

  // Switching between picking and creating swaps the content, so move focus along.
  useEffect(() => {
    const target = mode === MODES.create ? nameRef : searchRef
    target.current?.focus()
  }, [mode])

  function close() {
    setMode(MODES.pick)
    setQuery('')
    onClose()
  }

  function pick(exerciseId) {
    onPick(exerciseId)
    close()
  }

  function create(fields) {
    onCreate(fields)
    close()
  }

  const isCreating = mode === MODES.create

  return (
    <Modal
      open={open}
      onClose={close}
      title={isCreating ? 'New exercise' : 'Add exercise'}
      initialFocusRef={searchRef}
      footer={
        isCreating ? (
          <>
            <Button variant="secondary" onClick={() => setMode(MODES.pick)}>
              Back
            </Button>
            <Button type="submit" form={formId}>
              Create and add
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
        )
      }
    >
      {isCreating ? (
        <ExerciseForm id={formId} exercises={exercises} onSubmit={create} nameRef={nameRef} />
      ) : (
        <>
          {available.length > 0 ? (
            <>
              <TextField
                ref={searchRef}
                type="search"
                label="Search your exercises"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
              />
              {matches.length > 0 ? (
                <List>
                  {matches.map((exercise) => (
                    <ListItem
                      key={exercise.id}
                      title={exercise.name}
                      onClick={() => pick(exercise.id)}
                    />
                  ))}
                </List>
              ) : (
                <p className={styles.muted}>No exercises match “{query.trim()}”.</p>
              )}
            </>
          ) : (
            <p className={styles.muted}>
              {exercises.length > 0
                ? 'All your exercises are already in this workout.'
                : 'You haven’t created any exercises yet.'}
            </p>
          )}
          <Button variant="secondary" icon="plus" fullWidth onClick={() => setMode(MODES.create)}>
            Create new exercise
          </Button>
        </>
      )}
    </Modal>
  )
}

export default ExercisePicker
