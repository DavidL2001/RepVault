import { useProgressionForm } from '../../hooks/useProgressionForm.js'
import ProgressionFields from '../ProgressionFields/ProgressionFields.jsx'

/**
 * Form to add or edit a progression rule. Has no buttons of its own: put a
 * submit Button with `form={id}` wherever it fits (ProgressionRuleDialog does this).
 *
 * @param {object} props
 * @param {string} props.id Form id, for the submit button's `form` attribute.
 * @param {import('../../lib/model.js').Progression|null} props.rule Current rule, or `null` to add one.
 * @param {(rule: import('../../lib/model.js').Progression) => void} props.onSubmit Called with a valid rule.
 */
function ProgressionRuleForm({ id, rule, onSubmit }) {
  const { values, errors, setField, handleSubmit, targetRepsRef } = useProgressionForm({
    rule,
    onSubmit,
  })

  return (
    <form id={id} onSubmit={handleSubmit} noValidate>
      <ProgressionFields
        values={values}
        errors={errors}
        setField={setField}
        targetRepsRef={targetRepsRef}
      />
    </form>
  )
}

export default ProgressionRuleForm
