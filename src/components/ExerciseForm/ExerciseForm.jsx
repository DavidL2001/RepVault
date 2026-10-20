import { useExerciseForm } from '../../hooks/useExerciseForm.js'
import Checkbox from '../Checkbox/Checkbox.jsx'
import ProgressionFields from '../ProgressionFields/ProgressionFields.jsx'
import TextField from '../TextField/TextField.jsx'
import styles from './ExerciseForm.module.scss'

/**
 * Form to create an exercise: a name, plus an optional progression rule that
 * opens when its checkbox is ticked. Has no buttons of its own: put a submit
 * Button with `form={id}` wherever it fits (e.g. a Modal footer).
 *
 * @param {object} props
 * @param {string} props.id Form id, for the submit button's `form` attribute.
 * @param {import('../../lib/model.js').Exercise[]} props.exercises Existing exercises (duplicate check).
 * @param {(fields: { name: string, progression: object|null }) => void} props.onSubmit
 *   Called with clean values when the form is valid.
 * @param {import('react').RefObject<HTMLInputElement>} props.nameRef Ref for the name input,
 *   e.g. for `Modal initialFocusRef` so typing can start right away.
 */
function ExerciseForm({ id, exercises, onSubmit, nameRef }) {
  const { values, errors, setField, handleSubmit, targetRepsRef } = useExerciseForm({
    exercises,
    onSubmit,
    nameRef,
  })

  return (
    <form id={id} className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        ref={nameRef}
        label="Name"
        value={values.name}
        onChange={(event) => setField('name')(event.target.value)}
        error={errors.name}
        autoComplete="off"
        autoCapitalize="sentences"
      />

      <Checkbox
        label="Add a progression rule"
        hint="Tells you when to go heavier, based on your last workout. You pick the new weight."
        checked={values.hasRule}
        onChange={setField('hasRule')}
      />

      {values.hasRule && (
        <div className={styles.rule}>
          <ProgressionFields
            values={values}
            errors={errors}
            setField={setField}
            targetRepsRef={targetRepsRef}
          />
        </div>
      )}
    </form>
  )
}

export default ExerciseForm
