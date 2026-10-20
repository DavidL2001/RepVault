import { useState } from 'react'
import { STORAGE_STATUS } from '../../constants/storage.js'
import { useAppState } from '../../hooks/useAppState.js'
import { downloadFile } from '../../lib/download.js'
import { rawDataFilename } from '../../lib/storage.js'
import Banner from '../../components/Banner/Banner.jsx'
import Button from '../../components/Button/Button.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import styles from './StorageRecovery.module.scss'

/** Text per problem. Both make clear nothing has been changed yet. */
const MESSAGES = {
  [STORAGE_STATUS.corrupted]: {
    title: "Saved data can't be read",
    text: "The data saved in this browser is damaged, so RepVault can't open it. Nothing has been changed or deleted. Download a copy first if you want to keep it, then start fresh.",
  },
  [STORAGE_STATUS.newerVersion]: {
    title: 'Saved by a newer version',
    text: 'Your data was saved by a newer version of RepVault. Reload the page to get the latest version. Nothing has been changed or deleted.',
  },
}

/**
 * Shown instead of the app when the saved data can't be used.
 * Offers to download the raw data before deleting it, so nothing is lost by accident.
 */
function StorageRecovery() {
  const { storage } = useAppState()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { title, text } = MESSAGES[storage.status]

  return (
    <>
      <PageHeader title={title} />
      <Banner variant="warning">{text}</Banner>

      <div className={styles.actions}>
        {storage.status === STORAGE_STATUS.newerVersion && (
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        )}
        <Button variant="secondary" onClick={() => downloadFile(rawDataFilename(), storage.raw)}>
          Download saved data
        </Button>
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          Delete saved data and start fresh
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete saved data?"
        message="This deletes everything saved in this browser and can't be undone. Download a copy first if you want to keep it."
        confirmLabel="Delete and start fresh"
        variant="danger"
        onConfirm={storage.discardStoredData}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}

export default StorageRecovery
