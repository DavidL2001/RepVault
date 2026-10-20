import { MIME_TYPES } from '../constants/files.js'

/**
 * Makes the browser download text as a file. Used for backups and for
 * rescuing unreadable saved data.
 *
 * @param {string} filename
 * @param {string} content
 * @param {string} [type] MIME type.
 */
export function downloadFile(filename, content, type = MIME_TYPES.text) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  // Revoke after the click has been handled; Safari can cancel the download otherwise.
  setTimeout(() => URL.revokeObjectURL(url))
}
