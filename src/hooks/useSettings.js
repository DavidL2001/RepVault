import { useState } from 'react'
import { MIME_TYPES } from '../constants/files.js'
import { createBackup, formatLastBackup, parseBackup } from '../lib/backup.js'
import { downloadFile } from '../lib/download.js'
import { importData, resetData, updateSettings } from '../state/actions.js'
import { useAppState } from './useAppState.js'

/** Settings: theme, exporting and importing backups, and deleting all data. */
export function useSettings() {
  const { state, dispatch } = useAppState()
  const { settings, activeWorkout } = state
  // A checked backup waiting for the user to confirm the import.
  const [pendingImport, setPendingImport] = useState(null)

  return {
    theme: settings.theme,
    setTheme: (theme) => dispatch(updateSettings({ theme })),

    /** "today", "3 days ago" or "never". */
    lastBackup: formatLastBackup(settings.lastExportAt),

    /** Whether a workout is in progress (importing or deleting replaces it too). */
    hasActiveWorkout: Boolean(activeWorkout),

    /**
     * Downloads all data as a JSON file and remembers when.
     *
     * @returns {string} The file name.
     */
    exportBackup() {
      const backup = createBackup(state)
      downloadFile(backup.filename, backup.content, MIME_TYPES.json)
      dispatch(updateSettings({ lastExportAt: backup.exportedAt }))
      return backup.filename
    },

    /** The backup waiting to be imported, or `null`. */
    pendingImport,

    /**
     * Reads and checks a chosen backup file. When it's fine, it waits in `pendingImport`
     * for `confirmImport`; nothing is replaced yet.
     *
     * @param {File} file
     * @returns {Promise<string|null>} What's wrong with the file, or `null` when it's fine.
     */
    async chooseImportFile(file) {
      let text
      try {
        text = await file.text()
      } catch {
        return 'The file couldn’t be read.'
      }
      const { data, error } = parseBackup(text)
      if (error) return error
      setPendingImport(data)
      return null
    },

    /** Replaces all data with the pending backup. */
    confirmImport() {
      dispatch(importData(pendingImport))
      setPendingImport(null)
    },

    cancelImport: () => setPendingImport(null),

    /** Deletes everything and starts fresh, as on a first visit. */
    deleteAllData: () => dispatch(resetData()),
  }
}
