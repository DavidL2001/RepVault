import { useState } from 'react'
import { generatePath } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'
import { THEMES, DEFAULT_THEME } from '../../constants/themes.js'
import { useDocumentTheme } from '../../hooks/useDocumentTheme.js'
import Banner from '../../components/Banner/Banner.jsx'
import Button from '../../components/Button/Button.jsx'
import Card from '../../components/Card/Card.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import IconButton from '../../components/IconButton/IconButton.jsx'
import List from '../../components/List/List.jsx'
import ListItem from '../../components/ListItem/ListItem.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import NumberField from '../../components/NumberField/NumberField.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import StickyActionBar from '../../components/StickyActionBar/StickyActionBar.jsx'
import Stepper from '../../components/Stepper/Stepper.jsx'
import TextField from '../../components/TextField/TextField.jsx'
import styles from './DesignPreview.module.scss'

const BUTTON_VARIANTS = ['primary', 'secondary', 'danger', 'ghost']
const BANNER_VARIANTS = ['info', 'success', 'warning', 'danger']

/** Example id used to reach routes with params until real data exists. */
const EXAMPLE_ID = 'example'

const ALL_ROUTES = [
  { label: 'Home', to: ROUTES.home },
  { label: 'Start workout', to: ROUTES.startWorkout },
  { label: 'Active workout', to: ROUTES.activeWorkout },
  { label: 'Set logger', to: generatePath(ROUTES.setLogger, { exerciseId: EXAMPLE_ID }) },
  { label: 'Workout summary', to: generatePath(ROUTES.workoutSummary, { workoutId: EXAMPLE_ID }) },
  { label: 'Exercises', to: ROUTES.exercises },
  { label: 'Exercise detail', to: generatePath(ROUTES.exerciseDetail, { id: EXAMPLE_ID }) },
  { label: 'History', to: ROUTES.history },
  { label: 'Workout details', to: generatePath(ROUTES.workoutDetails, { id: EXAMPLE_ID }) },
  { label: 'Settings', to: ROUTES.settings },
]

/**
 * DEV ONLY: every UI component in its variants, with a theme switch,
 * to check both themes, keyboard use and 320px width in one place.
 */
function DesignPreview() {
  const [theme, setTheme] = useState(DEFAULT_THEME)
  useDocumentTheme(theme)
  const nextTheme = theme === THEMES.dark ? THEMES.light : THEMES.dark

  const [name, setName] = useState('')
  const [kg, setKg] = useState('40')
  const [reps, setReps] = useState('8')
  const [showBanner, setShowBanner] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [dialogResult, setDialogResult] = useState('')

  function closeConfirm(result) {
    setConfirmOpen(false)
    setDialogResult(result)
  }

  return (
    <>
      <PageHeader
        title="Design preview"
        backTo={ROUTES.home}
        backLabel="Back to home"
        actions={<IconButton icon="plus" label="Example header action" onClick={() => {}} />}
      />

      <Button variant="secondary" onClick={() => setTheme(nextTheme)}>
        Switch to {nextTheme} theme
      </Button>

      <section className={styles.section} aria-labelledby="preview-text">
        <h2 id="preview-text">Text</h2>
        <h3>Heading level 3</h3>
        <p>
          Body text at the base size. <a href="#preview-text">A link inside text</a>.
        </p>
        <p className={styles.muted}>Muted text for secondary details, like dates.</p>
        <p className={styles.small}>Small text for captions.</p>
        <p className={styles.truncate}>
          A very long single-line name that is cut off with an ellipsis instead of overflowing
        </p>
      </section>

      <section className={styles.section} aria-labelledby="preview-buttons">
        <h2 id="preview-buttons">Buttons</h2>
        <div className={styles.row}>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
          <Button disabled>disabled</Button>
        </div>
        <Button size="lg" icon="plus" fullWidth>
          Large, full width, with icon
        </Button>
        <Button variant="secondary" to={ROUTES.exercises}>
          Link styled as a button
        </Button>
        <div className={styles.row}>
          <IconButton icon="minus" label="Decrease (ghost)" />
          <IconButton icon="plus" label="Increase (secondary)" variant="secondary" />
          <IconButton icon="check" label="Confirm (primary)" variant="primary" />
          <IconButton icon="close" label="Remove (danger)" variant="danger" />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="preview-fields">
        <h2 id="preview-fields">Fields</h2>
        <TextField
          label="Exercise name"
          hint="Leave it empty to see the error."
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={name.trim() ? undefined : 'Enter a name.'}
        />
        <NumberField label="Reps (numeric keypad)" inputMode="numeric" defaultValue="10" />
        <Stepper
          label="Weight (kg)"
          decreaseLabel="Decrease weight"
          increaseLabel="Increase weight"
          value={kg}
          onChange={setKg}
          step={2.5}
          min={0}
        />
        <Stepper
          label="Reps"
          inputMode="numeric"
          decreaseLabel="Decrease reps"
          increaseLabel="Increase reps"
          value={reps}
          onChange={setReps}
          min={0}
        />
      </section>

      <section className={styles.section} aria-labelledby="preview-banners">
        <h2 id="preview-banners">Banners</h2>
        {BANNER_VARIANTS.map((variant) => (
          <Banner key={variant} variant={variant} title={`A ${variant} banner`}>
            Icon, colored edge and a hidden “{variant}” label for screen readers.
          </Banner>
        ))}
        {showBanner && (
          <Banner variant="warning" onDismiss={() => setShowBanner(false)}>
            A dismissible banner without a title.
          </Banner>
        )}
      </section>

      <section className={styles.section} aria-labelledby="preview-cards">
        <h2 id="preview-cards">Cards and lists</h2>
        <Card>
          <h3>Card</h3>
          <p className={styles.muted}>Raised surface with a subtle border and shadow.</p>
        </Card>
        <List>
          <ListItem title="Row that links somewhere" meta="Uses `to`" to={ROUTES.exercises} />
          <ListItem
            title="Row that is a button"
            meta="Uses `onClick`"
            onClick={() => setDialogResult('List row pressed')}
          />
          <ListItem title="Plain row with trailing content" trailing={<span>12 kg</span>} />
          <ListItem
            title="A really long title that does not fit on one line at 320 pixels wide"
            meta="Truncated with an ellipsis"
          />
        </List>
      </section>

      <section className={styles.section} aria-labelledby="preview-empty">
        <h2 id="preview-empty">Empty state</h2>
        <EmptyState
          icon="exercises"
          title="Nothing here yet"
          headingLevel={3}
          action={<Button icon="plus">Create something</Button>}
        >
          Explains what will show up here and how to add it.
        </EmptyState>
      </section>

      <section className={styles.section} aria-labelledby="preview-dialogs">
        <h2 id="preview-dialogs">Dialogs</h2>
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Open confirm dialog
          </Button>
        </div>
        <p aria-live="polite" className={styles.muted}>
          {dialogResult && `Last result: ${dialogResult}`}
        </p>
      </section>

      <section className={styles.section} aria-labelledby="preview-routes">
        <h2 id="preview-routes">All routes</h2>
        <List>
          {ALL_ROUTES.map(({ label, to }) => (
            <ListItem key={to} title={label} meta={to} to={to} />
          ))}
        </List>
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Example modal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setModalOpen(false)
                setDialogResult('Modal saved')
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <p>Focus is trapped here. Escape, × or the backdrop closes it.</p>
        <TextField label="Field inside a modal" />
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete everything?"
        message="Example of a destructive confirm. Focus starts on Cancel."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => closeConfirm('Confirmed')}
        onCancel={() => closeConfirm('Cancelled')}
      />

      <StickyActionBar>
        <Button size="lg" fullWidth>
          Sticky action
        </Button>
      </StickyActionBar>
    </>
  )
}

export default DesignPreview
