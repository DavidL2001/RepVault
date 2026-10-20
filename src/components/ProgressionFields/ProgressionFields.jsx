import { PROGRESSION_MODES, PROGRESSION_STEPPER } from '../../constants/defaults.js'
import RadioGroup from '../RadioGroup/RadioGroup.jsx'
import Stepper from '../Stepper/Stepper.jsx'
import styles from './ProgressionFields.module.scss'

const MODE_OPTIONS = [
  { value: PROGRESSION_MODES.all, label: 'All sets at the heaviest weight' },
  { value: PROGRESSION_MODES.any, label: 'Any set at the heaviest weight' },
]

/**
 * The fields of a progression rule: target reps and which sets count.
 * Only the fields: the form around them owns the state and validation
 * (ExerciseForm, ProgressionRuleForm).
 *
 * @param {object} props
 * @param {{ targetReps: string, mode: 'all'|'any' }} props.values
 * @param {{ targetReps?: string }} props.errors
 * @param {(field: 'targetReps'|'mode') => (value: string) => void} props.setField
 * @param {import('react').RefObject<HTMLInputElement>} props.targetRepsRef
 */
function ProgressionFields({ values, errors, setField, targetRepsRef }) {
  return (
    <div className={styles.fields}>
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
  )
}

export default ProgressionFields
