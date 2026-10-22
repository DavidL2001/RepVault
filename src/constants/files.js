/** MIME types for files the app lets the user download. */
export const MIME_TYPES = {
  text: 'text/plain',
  json: 'application/json',
}

/** File name start for backups, before the date: "repvault-backup-2026-10-22.json". */
export const BACKUP_FILENAME_PREFIX = 'repvault-backup'

/** Files the import picker offers. The extension is listed too, for phones that don't know the MIME type. */
export const BACKUP_FILE_ACCEPT = `${MIME_TYPES.json},.json`

/** Spaces per indent level in backup files, so they stay readable in a text editor. */
export const BACKUP_JSON_INDENT = 2
