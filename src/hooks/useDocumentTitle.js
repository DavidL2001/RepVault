import { useEffect } from 'react'
import { APP_NAME, DOCUMENT_TITLE_SEPARATOR } from '../constants/app.js'

/**
 * Sets `document.title` to "<title> – RepVault", so each page has its own title
 * in the browser tab and for screen readers.
 *
 * @param {string} title Page name.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title}${DOCUMENT_TITLE_SEPARATOR}${APP_NAME}` : APP_NAME
  }, [title])
}
