import { useState } from 'react'
import { BACKUP_FILE_ACCEPT } from '../../constants/files.js'
import { THEME_LABELS, THEMES } from '../../constants/themes.js'
import { useSettings } from '../../hooks/useSettings.js'
import { describeBackup } from '../../lib/backup.js'
import Banner from '../../components/Banner/Banner.jsx'
import Button from '../../components/Button/Button.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import FileButton from '../../components/FileButton/FileButton.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import RadioGroup from '../../components/RadioGroup/RadioGroup.jsx'
import styles from './Settings.module.scss'

const THEME_OPTIONS = Object.values(THEMES).map((theme) => ({
  value: theme,
  label: THEME_LABELS[theme],
}))

/** Where a notice is shown: next to the action it is about. */
const SECTIONS = {
  backup: 'backup',
  delete: 'delete',
}

/** Theme, backup export and import, deleting all data, and where the data lives. */
function Settings() {
  const settings = useSettings()
  const { pendingImport, hasActiveWorkout } = settings

  // Feedback on the last action: `{ section, variant, title, text }`.
  const [notice, setNotice] = useState(null)
  // Deleting asks twice: 1 = first question, 2 = "Are you sure?".
  const [deleteStep, setDeleteStep] = useState(0)

  const workoutInProgressNote = hasActiveWorkout ? ', including the workout in progress' : ''

  function handleExport() {
    const filename = settings.exportBackup()
    setNotice({
      section: SECTIONS.backup,
      variant: 'success',
      title: 'Backup exported',
      text: `Saved as ${filename}. Keep it somewhere outside this browser, like cloud storage or email.`,
    })
  }

  async function handleImportFile(file) {
    setNotice(null)
    const error = await settings.chooseImportFile(file)
    if (error) {
      setNotice({
        section: SECTIONS.backup,
        variant: 'danger',
        title: 'Couldn’t import',
        text: `${error} Nothing was changed.`,
      })
    }
  }

  function handleConfirmImport() {
    const text = describeBackup(pendingImport)
    settings.confirmImport()
    setNotice({ section: SECTIONS.backup, variant: 'success', title: 'Backup imported', text })
  }

  function handleDelete() {
    settings.deleteAllData()
    setDeleteStep(0)
    setNotice({
      section: SECTIONS.delete,
      variant: 'success',
      title: 'All data deleted',
      text: 'RepVault is empty again, as on a first visit.',
    })
  }

  /** The notice for a section, in a live region so it is announced when it appears. */
  const noticeFor = (section) => (
    <div aria-live="polite">
      {notice?.section === section && (
        <Banner variant={notice.variant} title={notice.title}>
          {notice.text}
        </Banner>
      )}
    </div>
  )

  return (
    <>
      <PageHeader title="Settings" />

      <section className={styles.section} aria-labelledby="appearance-heading">
        <h2 id="appearance-heading" className={styles.heading}>
          Appearance
        </h2>
        <RadioGroup
          legend="Theme"
          variant="segmented"
          options={THEME_OPTIONS}
          value={settings.theme}
          onChange={settings.setTheme}
        />
      </section>

      <section className={styles.section} aria-labelledby="backup-heading">
        <h2 id="backup-heading" className={styles.heading}>
          Backup
        </h2>
        <Banner title="Your data stays on this device">
          RepVault saves everything in this browser only. Clearing browser data, or switching phones
          or browsers, loses it, so export a backup regularly.
        </Banner>
        <p>
          Last backup: <strong>{settings.lastBackup}</strong>
        </p>
        <div className={styles.actions}>
          <Button icon="download" onClick={handleExport} fullWidth>
            Export backup
          </Button>
          <FileButton
            variant="secondary"
            icon="upload"
            accept={BACKUP_FILE_ACCEPT}
            onSelect={handleImportFile}
            fullWidth
          >
            Import backup
          </FileButton>
        </div>
        {noticeFor(SECTIONS.backup)}
      </section>

      <section className={styles.section} aria-labelledby="delete-heading">
        <h2 id="delete-heading" className={styles.heading}>
          Delete data
        </h2>
        <p className={styles.muted}>
          Deletes every exercise, template and workout from this browser. Export a backup first if
          you want to keep them.
        </p>
        <Button
          variant="danger"
          icon="trash"
          onClick={() => {
            setNotice(null)
            setDeleteStep(1)
          }}
          fullWidth
        >
          Delete all data
        </Button>
        {noticeFor(SECTIONS.delete)}
      </section>

      <ConfirmDialog
        open={Boolean(pendingImport)}
        title="Replace all data?"
        message={
          pendingImport &&
          `${describeBackup(pendingImport)} Importing replaces everything in this browser${workoutInProgressNote}. This can’t be undone.`
        }
        confirmLabel="Import and replace"
        variant="danger"
        onConfirm={handleConfirmImport}
        onCancel={settings.cancelImport}
      />

      <ConfirmDialog
        open={deleteStep === 1}
        title="Delete all data?"
        message={`Every exercise, template and workout is deleted from this browser${workoutInProgressNote}.`}
        confirmLabel="Delete all data"
        variant="danger"
        onConfirm={() => setDeleteStep(2)}
        onCancel={() => setDeleteStep(0)}
      />

      <ConfirmDialog
        open={deleteStep === 2}
        title="Are you sure?"
        message="This can’t be undone. Without a backup, your data is gone for good."
        confirmLabel="Yes, delete everything"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteStep(0)}
      />
    </>
  )
}

export default Settings
