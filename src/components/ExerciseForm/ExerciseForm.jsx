import { PROGRESSION_MODES, PROGRESSION_STEPPER } from '../../constants/defaults.js'
import { useExerciseForm } from '../../hooks/useExerciseForm.js'
import Checkbox from '../Checkbox/Checkbox.jsx'
import RadioGroup from '../RadioGroup/RadioGroup.jsx'
import Stepper from '../Stepper/Stepper.jsx'
import TextField from '../TextField/TextField.jsx'
import styles from './ExerciseForm.module.scss'

const MODE_OPTIONS = [
  { value: PROGRESSION_MODES.all, label: 'All sets at the heaviest weight' },
  { value: PROGRESSION_MODES.any, label: 'Any set at the heaviest weight' },
]

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
          <Stepper
            ref={targetRepsRef}
            label="Target reps"
            hint="Go heavier once you hit this many reps."
            inputMode="numeric"
            value={values.targetReps}
            onChange={setField('targetReps')}
            error={errors.targetReps}
            {...PROGRESSION_STEPPER.targetReps}
          />
          <RadioGroup
            legend="Applies to"
            options={MODE_OPTIONS}
            value={values.mode}
            onChange={setField('mode')}
          />
        </div>
      )}
    </form>
  )
}

export default ExerciseForm
