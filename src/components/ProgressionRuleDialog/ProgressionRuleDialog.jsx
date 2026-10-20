import { useId } from 'react'
import Button from '../Button/Button.jsx'
import Modal from '../Modal/Modal.jsx'
import ProgressionRuleForm from '../ProgressionRuleForm/ProgressionRuleForm.jsx'

/**
 * Modal to add, edit or remove an exercise's progression rule.
 * The form starts fresh (from the current rule) every time it opens.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {import('../../lib/model.js').Progression|null} props.rule Current rule, or `null` to add one.
 * @param {(rule: import('../../lib/model.js').Progression) => void} props.onSave
 * @param {() => void} props.onRemove Only offered when there is a rule.
 * @param {() => void} props.onClose
 * @param {import('react').RefObject<HTMLElement>} [props.fallbackFocusRef] See Modal.
 */
function ProgressionRuleDialog({ open, rule, onSave, onRemove, onClose, fallbackFocusRef }) {
  const formId = useId()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={rule ? 'Edit progression rule' : 'Add progression rule'}
      fallbackFocusRef={fallbackFocusRef}
      footer={
        <>
          {rule && (
            <Button variant="danger" onClick={onRemove}>
              Remove rule
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId}>
            Save
          </Button>
        </>
      }
    >
      <p>Tells you when to go heavier, based on your last workout. You pick the new weight.</p>
      <ProgressionRuleForm id={formId} rule={rule} onSubmit={onSave} />
    </Modal>
  )
}

export default ProgressionRuleDialog
