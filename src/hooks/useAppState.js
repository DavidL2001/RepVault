import { useContext } from 'react'
import { AppStateContext } from '../state/AppStateContext.js'

/**
 * Reads the app state from any component inside `AppStateProvider`.
 *
 * @returns {{
 *   state: import('../lib/model.js').AppData,
 *   dispatch: (action: object) => void,
 *   storage: { status: string, raw: string|null, saveFailed: boolean, discardStoredData: () => void },
 * }}
 */
export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) throw new Error('useAppState must be used inside AppStateProvider')
  return context
}
