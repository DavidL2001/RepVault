import { SET_STEPPER } from '../../constants/defaults.js'
import { useSetForm } from '../../hooks/useSetForm.js'
import Stepper from '../Stepper/Stepper.jsx'
import styles from './SetForm.module.scss'

/**
 * Weight and reps fields with large − / + buttons, for logging or editing a set.
 * Has no buttons of its own: put a submit Button with `form={id}` wherever it
 * fits (a sticky bar, a Modal footer). Enter in a field submits too.
 *
 * @param {object} props
 * @param {string} props.id Form id, for the submit button's `form` attribute.
 * @param {{ kg: string, reps: string }} props.initialValues As text, e.g. "42,5".
 * @param {(values: { kg: number, reps: number }) => void} props.onSubmit Called with valid numbers.
 * @param {import('react').RefObject<HTMLInputElement>} props.kgRef Ref for the kg input,
 *   e.g. for `Modal initialFocusRef`.
 */
function SetForm({ id, initialValues, onSubmit, kgRef }) {
  const { values, errors, setField, handleSubmit, repsRef } = useSetForm({
    initialValues,
    onSubmit,
    kgRef,
  })

  return (
    <form id={id} className={styles.form} onSubmit={handleSubmit} noValidate>
      <Stepper
        ref={kgRef}
        label="Weight (kg)"
        decreaseLabel="Decrease weight"
        increaseLabel="Increase weight"
        inputMode="decimal"
        value={values.kg}
        onChange={setField('kg')}
        error={errors.kg}
        {...SET_STEPPER.kg}
      />
      <Stepper
        ref={repsRef}
        label="Reps"
        decreaseLabel="Decrease reps"
        increaseLabel="Increase reps"
        inputMode="numeric"
        value={values.reps}
        onChange={setField('reps')}
        error={errors.reps}
        {...SET_STEPPER.reps}
      />
    </form>
  )
}

export default SetForm
